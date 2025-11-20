import type { Workflow } from "@shared/schema";
import type { WebhookEvent } from "@shared/webhooks";
import { db } from "../db";
import { workflows } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Execute a workflow triggered by a webhook event
 * This function processes the workflow's actions with the event payload as context
 */
export async function executeWorkflow(
  workflow: Workflow,
  event: WebhookEvent
): Promise<void> {
  const actions = workflow.config?.actions || [];

  // Create execution context with event payload
  const context = {
    trigger: {
      type: "webhook",
      service: event.service,
      event: event.event,
    },
    payload: event.payload,
    timestamp: event.timestamp,
  };

  // Execute actions sequentially (could be parallelized based on dependencies)
  for (const action of actions) {
    await executeAction(action, context, workflow);
  }

  // Update workflow's lastRun timestamp
  await db
    .update(workflows)
    .set({ lastRun: new Date() })
    .where(eq(workflows.id, workflow.id));
}

/**
 * Execute a single action with the given context
 */
async function executeAction(
  action: Record<string, any>,
  context: any,
  workflow: Workflow
): Promise<void> {
  const actionType = action.type;
  const targetService = workflow.targetService;

  console.log(`Executing action: ${actionType} for service: ${targetService}`);

  // Route to appropriate action handler based on service
  if (targetService === "github") {
    await executeGitHubAction(action, context);
  } else if (targetService === "taskade") {
    await executeTaskadeAction(action, context);
  } else if (targetService === "slack") {
    await executeSlackAction(action, context);
  } else if (targetService === "notion") {
    await executeNotionAction(action, context);
  } else {
    console.warn(`Unsupported target service: ${targetService}`);
  }
}

/**
 * Execute GitHub actions (create issue, add comment, etc.)
 */
async function executeGitHubAction(action: Record<string, any>, context: any): Promise<void> {
  // Placeholder for GitHub API calls
  // Will be implemented with actual GitHub API integration
  console.log("GitHub action:", action.type, "with context:", context);
  
  // Example: create_issue action would call GitHub API here
  // const octokit = new Octokit({ auth: apiToken });
  // await octokit.rest.issues.create({ owner, repo, title, body });
}

/**
 * Execute Taskade actions (create task, update task, etc.)
 */
async function executeTaskadeAction(action: Record<string, any>, context: any): Promise<void> {
  // Placeholder for Taskade API calls
  // Will be implemented with actual Taskade API integration
  console.log("Taskade action:", action.type, "with context:", context);
  
  // Example: create_task action would call Taskade API here
  // await fetch(taskadeWebhookUrl, { method: 'POST', body: JSON.stringify(taskData) });
}

/**
 * Execute Slack actions (send message, etc.)
 */
async function executeSlackAction(action: Record<string, any>, context: any): Promise<void> {
  console.log("Slack action:", action.type, "with context:", context);
}

/**
 * Execute Notion actions (create page, update database, etc.)
 */
async function executeNotionAction(action: Record<string, any>, context: any): Promise<void> {
  console.log("Notion action:", action.type, "with context:", context);
}

/**
 * Interpolate template strings with context values
 * Example: "New commit: ${payload.commits[0].message}" -> "New commit: Fix login bug"
 */
export function interpolateTemplate(template: string, context: any): string {
  return template.replace(/\${([^}]+)}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    // Handle array indexing like commits[0]
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      return current?.[arrayName]?.[parseInt(index)];
    }
    return current?.[key];
  }, obj);
}
