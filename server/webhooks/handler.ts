import type { Request, Response } from "express";
import { db } from "../db";
import { connections, syncLogs } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  verifyGitHubSignature,
  verifyTaskadeWebhook,
  verifyNotionSignature,
  extractGitHubEvent,
  extractTaskadeEvent,
  extractNotionEvent,
} from "./verification";
import { findMatchingWorkflows, matchesFilters } from "./matcher";
import { executeWorkflow } from "./executor";

/**
 * Handle incoming webhook from external services
 */
export async function handleWebhook(req: Request, res: Response) {
  const { service, connectionId } = req.params;
  const connectionIdNum = parseInt(connectionId);

  try {
    // 1. Fetch connection to get webhook secret
    const connectionResults = await db
      .select()
      .from(connections)
      .where(eq(connections.id, connectionIdNum));

    if (connectionResults.length === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    const connection = connectionResults[0];

    // 2. Verify webhook signature based on service
    // Use the raw Buffer preserved by middleware for byte-exact signature verification
    const rawBodyBuffer = (req as any).rawBody as Buffer;
    const parsedBody = req.body; // Already parsed by middleware
    
    if (!rawBodyBuffer) {
      return res.status(400).json({ error: "Raw body required for verification" });
    }
    
    let verificationResult;
    let eventType: string | null = null;

    if (service === "github") {
      const signature = req.headers["x-hub-signature-256"] as string;
      const secret = connection.webhookSecret || "";
      
      verificationResult = verifyGitHubSignature(rawBodyBuffer, signature, secret);
      eventType = extractGitHubEvent(req.headers);
      
      // Handle GitHub ping event (webhook test)
      if (eventType === "github.ping") {
        return res.status(200).json({ message: "Webhook received successfully" });
      }
    } else if (service === "taskade") {
      const authHeader = req.headers.authorization as string;
      const secret = connection.apiKey || "";
      
      verificationResult = verifyTaskadeWebhook(parsedBody, authHeader, secret);
      eventType = extractTaskadeEvent(parsedBody);
    } else if (service === "notion") {
      const signature = req.headers["notion-signature"] as string;
      const secret = connection.webhookSecret || "";
      
      verificationResult = verifyNotionSignature(rawBodyBuffer, signature, secret);
      eventType = extractNotionEvent(parsedBody);
    } else {
      return res.status(400).json({ error: "Unsupported service" });
    }

    // 3. Check if verification passed
    if (!verificationResult.valid) {
      console.error(`Webhook verification failed for ${service}:`, verificationResult.error);
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    if (!eventType) {
      return res.status(400).json({ error: "Could not determine event type" });
    }

    // 4. Find matching workflows for this specific connection
    const workflows = await findMatchingWorkflows(service, eventType, connectionIdNum);

    if (workflows.length === 0) {
      // No workflows to execute, but webhook is valid
      return res.status(200).json({ 
        message: "Webhook received",
        matchedWorkflows: 0
      });
    }

    // 5. Execute matching workflows in parallel
    const executionPromises = workflows.map(async (workflow) => {
      // Check if workflow filters match
      if (!matchesFilters(workflow, parsedBody)) {
        return null;
      }

      try {
        const startTime = Date.now();
        await executeWorkflow(workflow, {
          service,
          event: eventType,
          payload: parsedBody,
          timestamp: new Date(),
        });
        const duration = Date.now() - startTime;

        // Log successful execution
        await db.insert(syncLogs).values({
          workflowId: workflow.id,
          workflowName: workflow.title,
          status: "success",
          itemsProcessed: 1,
          duration,
          errorMessage: null,
          metadata: {
            trigger: "webhook",
            event: eventType,
          },
        });

        return { workflowId: workflow.id, status: "success" };
      } catch (error: any) {
        console.error(`Error executing workflow ${workflow.id}:`, error);

        // Log failed execution
        await db.insert(syncLogs).values({
          workflowId: workflow.id,
          workflowName: workflow.title,
          status: "error",
          itemsProcessed: 0,
          duration: Date.now() - Date.now(),
          errorMessage: error.message,
          metadata: {
            trigger: "webhook",
            event: eventType,
          },
        });

        return { workflowId: workflow.id, status: "error", error: error.message };
      }
    });

    const results = await Promise.all(executionPromises);
    const successfulExecutions = results.filter(r => r && r.status === "success");

    // 6. Respond to webhook
    res.status(200).json({
      message: "Webhook processed",
      event: eventType,
      matchedWorkflows: workflows.length,
      executedWorkflows: successfulExecutions.length,
    });

  } catch (error: any) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
