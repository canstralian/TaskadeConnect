import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConnectionSchema, insertWorkflowSchema, insertSyncLogSchema } from "@shared/schema";
import { z } from "zod";
import { handleWebhook } from "./webhooks/handler";
import express from "express";
import { mcpService } from "./mcp-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // === WEBHOOKS ===
  // Webhook endpoint preserves raw body as Buffer for signature verification
  app.post(
    "/api/webhooks/:service/:connectionId",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      // Preserve original Buffer for exact byte-level signature verification
      if (Buffer.isBuffer(req.body)) {
        // Store raw Buffer for signature verification
        (req as any).rawBody = req.body;
        // Parse separately for business logic
        try {
          req.body = JSON.parse(req.body.toString("utf8"));
        } catch (e) {
          return res.status(400).json({ error: "Invalid JSON payload" });
        }
      }
      await handleWebhook(req, res);
    }
  );

  // Database connection test
  app.get("/api/db-test", async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const result = await db.execute(sql`SELECT 1 as test`);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("DB test error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // === CONNECTIONS ===
  app.get("/api/connections", async (_req, res) => {
    try {
      const connections = await storage.getConnections();
      // Don't send API keys to frontend
      const sanitized = connections.map(c => ({
        ...c,
        apiKey: c.apiKey ? "****" : null,
      }));
      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.get("/api/connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      // Don't send full API key to frontend
      res.json({
        ...connection,
        apiKey: connection.apiKey ? "****" : null,
      });
    } catch (error) {
      console.error("Error fetching connection:", error);
      res.status(500).json({ error: "Failed to fetch connection" });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const data = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(data);
      res.json({
        ...connection,
        apiKey: connection.apiKey ? "****" : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating connection:", error);
      res.status(500).json({ error: "Failed to create connection" });
    }
  });

  app.patch("/api/connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertConnectionSchema.partial().parse(req.body);
      const connection = await storage.updateConnection(id, data);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json({
        ...connection,
        apiKey: connection.apiKey ? "****" : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating connection:", error);
      res.status(500).json({ error: "Failed to update connection" });
    }
  });

  app.delete("/api/connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConnection(id);
      if (!success) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting connection:", error);
      res.status(500).json({ error: "Failed to delete connection" });
    }
  });

  // === WORKFLOWS ===
  app.get("/api/workflows", async (_req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const data = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(data);
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating workflow:", error);
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(id, data);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating workflow:", error);
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWorkflow(id);
      if (!success) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // === SYNC LOGS ===
  app.get("/api/sync-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getSyncLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching sync logs:", error);
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.post("/api/sync-logs", async (req, res) => {
    try {
      const data = insertSyncLogSchema.parse(req.body);
      const log = await storage.createSyncLog(data);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating sync log:", error);
      res.status(500).json({ error: "Failed to create sync log" });
    }
  });

  // === DASHBOARD ===
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // === MCP / AI AGENTS ===
  app.get("/api/mcp/messages/:connectionId", async (req, res) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await mcpService.getHistory(connectionId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching MCP messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/mcp/chat", async (req, res) => {
    try {
      const { connectionId, userMessage, model, systemPrompt } = req.body;
      
      if (!connectionId || !userMessage) {
        return res.status(400).json({ error: "connectionId and userMessage are required" });
      }

      const result = await mcpService.chat({
        connectionId: parseInt(connectionId),
        userMessage,
        model,
        systemPrompt,
      });

      res.json(result);
    } catch (error) {
      console.error("Error in MCP chat:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  app.post("/api/mcp/chat/stream", async (req, res) => {
    try {
      const { connectionId, userMessage, model, systemPrompt } = req.body;
      
      if (!connectionId || !userMessage) {
        return res.status(400).json({ error: "connectionId and userMessage are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await mcpService.streamChat({
        connectionId: parseInt(connectionId),
        userMessage,
        model,
        systemPrompt,
      });

      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      
      res.end();
    } catch (error) {
      console.error("Error in MCP streaming chat:", error);
      res.status(500).json({ error: "Failed to process streaming chat request" });
    }
  });

  app.delete("/api/mcp/messages/:connectionId", async (req, res) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      const success = await mcpService.clearHistory(connectionId);
      res.json({ success });
    } catch (error) {
      console.error("Error clearing MCP messages:", error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
