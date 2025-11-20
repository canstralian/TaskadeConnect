import type { Workflow } from "@shared/schema";
import type { WebhookEvent } from "@shared/webhooks";
import { db } from "../db";
import { workflows, connections } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as github from "../integrations/github";
import * as taskade from "../integrations/taskade";

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
    await executeGitHubAction(action, context, workflow);
  } else if (targetService === "taskade") {
    await executeTaskadeAction(action, context, workflow);
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
async function executeGitHubAction(
  action: Record<string, any>,
  context: any,
  workflow: Workflow
): Promise<void> {
  // Get the specific GitHub connection associated with this workflow
  if (!workflow.targetConnectionId) {
    throw new Error("Workflow missing targetConnectionId for GitHub action");
  }

  const githubConnections = await db
    .select()
    .from(connections)
    .where(eq(connections.id, workflow.targetConnectionId));

  if (githubConnections.length === 0) {
    throw new Error(`GitHub connection ${workflow.targetConnectionId} not found`);
  }

  const connection = githubConnections[0];
  const params = action.params || {};

  // Interpolate template strings in action parameters
  const interpolatedParams = interpolateParams(params, context);

  // Parse repository from connection config
  const repositories = connection.config?.repositories || [];
  const repository = repositories[0] || "";
  const { owner, repo } = github.parseRepository(repository);

  const config = {
    token: connection.apiKey || "",
    owner,
    repo,
  };

  // Route to specific GitHub action
  switch (action.type) {
    case "create_issue":
      await github.createIssue(config, {
        title: interpolatedParams.title,
        body: interpolatedParams.body,
        labels: interpolatedParams.labels,
        assignees: interpolatedParams.assignees,
      });
      console.log("Created GitHub issue:", interpolatedParams.title);
      break;

    case "add_comment":
      await github.addComment(config, {
        issueNumber: interpolatedParams.issueNumber,
        body: interpolatedParams.body,
      });
      console.log("Added GitHub comment to issue:", interpolatedParams.issueNumber);
      break;

    default:
      console.warn(`Unknown GitHub action type: ${action.type}`);
  }
}

/**
 * Execute Taskade actions (create task, update task, etc.)
 */
async function executeTaskadeAction(
  action: Record<string, any>,
  context: any,
  workflow: Workflow
): Promise<void> {
  // Get the specific Taskade connection associated with this workflow
  if (!workflow.targetConnectionId) {
    throw new Error("Workflow missing targetConnectionId for Taskade action");
  }

  const taskadeConnections = await db
    .select()
    .from(connections)
    .where(eq(connections.id, workflow.targetConnectionId));

  if (taskadeConnections.length === 0) {
    throw new Error(`Taskade connection ${workflow.targetConnectionId} not found`);
  }

  const connection = taskadeConnections[0];
  const params = action.params || {};

  // Interpolate template strings in action parameters
  const interpolatedParams = interpolateParams(params, context);

  const config = {
    token: connection.apiKey || "",
    projectId: connection.config?.projectId,
  };

  // Route to specific Taskade action
  switch (action.type) {
    case "create_task":
      await taskade.createTask(config, {
        title: interpolatedParams.title,
        description: interpolatedParams.description,
        project: interpolatedParams.project,
        priority: interpolatedParams.priority,
        dueDate: interpolatedParams.dueDate,
      });
      console.log("Created Taskade task:", interpolatedParams.title);
      break;

    case "update_task":
      await taskade.updateTask(config, {
        taskId: interpolatedParams.taskId,
        title: interpolatedParams.title,
        description: interpolatedParams.description,
        completed: interpolatedParams.completed,
        priority: interpolatedParams.priority,
      });
      console.log("Updated Taskade task:", interpolatedParams.taskId);
      break;

    default:
      console.warn(`Unknown Taskade action type: ${action.type}`);
  }
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

/**
 * Interpolate all string values in action parameters
 */
function interpolateParams(params: Record<string, any>, context: any): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      result[key] = interpolateTemplate(value, context);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === "string" ? interpolateTemplate(item, context) : item
      );
    } else {
      result[key] = value;
    }
  }
  
  return result;
}
