import { db } from "./db";
import { connections, workflows, syncLogs } from "@shared/schema";

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
