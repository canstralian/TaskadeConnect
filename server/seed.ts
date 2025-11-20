import { db } from "./db";
import { connections, workflows, syncLogs } from "@shared/schema";
import crypto from "crypto";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(syncLogs);
  await db.delete(workflows);
  await db.delete(connections);

  // Insert connections
  const taskadeConn = await db.insert(connections).values({
    name: "Taskade",
    service: "taskade",
    status: "connected",
    apiKey: "task_live_abc123xyz",
    config: {},
    lastSync: new Date(),
  }).returning();

  const notionConn = await db.insert(connections).values({
    name: "Notion",
    service: "notion",
    status: "connected",
    apiKey: "notion_secret_abc123xyz",
    config: { workspace: "my-workspace" },
    lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
  }).returning();

  const replitConn = await db.insert(connections).values({
    name: "Replit DB",
    service: "replit",
    status: "error",
    apiKey: null,
    config: {},
    lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  }).returning();

  await db.insert(connections).values({
    name: "Slack",
    service: "slack",
    status: "disconnected",
    apiKey: null,
    config: {},
    lastSync: null,
  });

  // Add GitHub connection with webhook
  const githubConn = await db.insert(connections).values({
    name: "GitHub",
    service: "github",
    status: "connected",
    apiKey: "ghp_mock_token_abc123",
    config: { 
      repositories: ["myorg/myrepo"],
      events: ["push", "pull_request", "issues"]
    },
    webhookSecret: crypto.randomBytes(32).toString("hex"),
    webhookUrl: "http://localhost:5000/api/webhooks/github/5", // Will be updated by storage
    lastSync: new Date(),
  }).returning();

  // Add Taskade connection with webhook (for receiving events)
  const taskadeWebhookConn = await db.insert(connections).values({
    name: "Taskade Workspace",
    service: "taskade",
    status: "connected",
    apiKey: "task_webhook_token_xyz789",
    config: {
      workspace_id: "workspace-123",
      projectId: "default-project-123",
      events: ["task_created", "task_completed"]
    },
    webhookSecret: crypto.randomBytes(32).toString("hex"),
    webhookUrl: "http://localhost:5000/api/webhooks/taskade/6",
    lastSync: new Date(),
  }).returning();

  // Insert workflows
  const workflow1 = await db.insert(workflows).values({
    title: "Sync Notion Projects to Taskade",
    description: "Automatically create Taskade projects when a Notion page is added to 'Projects' database.",
    sourceService: "notion",
    targetService: "taskade",
    status: "active",
    schedule: "Real-time",
    trigger: { type: "database_item_created", database_id: "projects" },
    actions: [{ type: "create_task", project_id: "main" }],
    config: {},
    lastRun: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
  }).returning();

  const workflow2 = await db.insert(workflows).values({
    title: "Replit DB Users → Taskade Team",
    description: "Sync user roles and details from Replit PostgreSQL to Taskade Workspace members.",
    sourceService: "replit",
    targetService: "taskade",
    status: "active",
    schedule: "Hourly",
    trigger: { type: "schedule", interval: "hourly" },
    actions: [{ type: "update_team_members" }],
    config: {},
    lastRun: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  }).returning();

  await db.insert(workflows).values({
    title: "Taskade Tasks → Notion Board",
    description: "Bi-directional sync of task status between Taskade and Notion Kanban.",
    sourceService: "taskade",
    targetService: "notion",
    status: "paused",
    schedule: "Every 15 mins",
    trigger: { type: "schedule", interval: "15m" },
    actions: [{ type: "sync_status" }],
    config: {},
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  });

  await db.insert(workflows).values({
    title: "New Client Onboarding",
    description: "Create client folder in Taskade when new record in Notion CRM.",
    sourceService: "notion",
    targetService: "taskade",
    status: "draft",
    schedule: "Real-time",
    trigger: { type: "database_item_created", database_id: "crm" },
    actions: [{ type: "create_project" }],
    config: {},
    lastRun: null,
  });

  // Add webhook-based workflows
  await db.insert(workflows).values({
    title: "GitHub Push → Taskade Task",
    description: "Create a Taskade task when code is pushed to main branch.",
    sourceService: "github",
    targetService: "taskade",
    sourceConnectionId: githubConn[0].id,
    targetConnectionId: taskadeWebhookConn[0].id,
    status: "active",
    schedule: "Webhook",
    config: {
      trigger: {
        type: "webhook",
        event: "github.push",
      },
      filters: [
        { field: "ref", operator: "equals", value: "refs/heads/main" }
      ],
      actions: [
        {
          type: "create_task",
          params: {
            title: "New commit: ${payload.commits[0].message}",
            description: "by ${payload.commits[0].author.name}",
            project: "Development"
          }
        }
      ],
    },
    lastRun: null,
  });

  await db.insert(workflows).values({
    title: "Taskade Task Created → GitHub Issue",
    description: "Create GitHub issue when a high-priority task is created in Taskade.",
    sourceService: "taskade",
    targetService: "github",
    sourceConnectionId: taskadeWebhookConn[0].id,
    targetConnectionId: githubConn[0].id,
    status: "active",
    schedule: "Webhook",
    config: {
      trigger: {
        type: "webhook",
        event: "taskade.task.created",
      },
      filters: [
        { field: "priority", operator: "equals", value: "high" }
      ],
      actions: [
        {
          type: "create_issue",
          params: {
            title: "${payload.task_name}",
            body: "Created from Taskade project: ${payload.project_name}",
            labels: ["taskade", "high-priority"]
          }
        }
      ],
    },
    lastRun: null,
  });

  // Insert sync logs
  await db.insert(syncLogs).values({
    workflowId: workflow1[0].id,
    workflowName: workflow1[0].title,
    status: "success",
    itemsProcessed: 12,
    duration: 1200,
    errorMessage: null,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  });

  await db.insert(syncLogs).values({
    workflowId: workflow2[0].id,
    workflowName: workflow2[0].title,
    status: "success",
    itemsProcessed: 5,
    duration: 800,
    errorMessage: null,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  });

  await db.insert(syncLogs).values({
    workflowId: workflow1[0].id,
    workflowName: workflow1[0].title,
    status: "error",
    itemsProcessed: 0,
    duration: 5000,
    errorMessage: "API Rate Limit Exceeded",
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  });

  await db.insert(syncLogs).values({
    workflowId: workflow1[0].id,
    workflowName: workflow1[0].title,
    status: "success",
    itemsProcessed: 3,
    duration: 1100,
    errorMessage: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  console.log("✓ Database seeded successfully!");
}

seed().catch(console.error);
