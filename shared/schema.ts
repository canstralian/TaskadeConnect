import { pgTable, text, serial, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  service: text("service").notNull(), // "taskade", "notion", "replit", "github", etc.
  description: text("description"),
  apiKey: text("api_key"),
  config: jsonb("config").$type<Record<string, any>>().default({}),
  status: text("status").notNull().default("disconnected"), // "connected", "disconnected", "error"
  lastSync: timestamp("last_sync"),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  sourceService: text("source_service").notNull(),
  targetService: text("target_service").notNull(),
  status: text("status").notNull().default("draft"), // "active", "paused", "draft"
  schedule: text("schedule").default("manual"), // "real-time", "hourly", "daily", "manual"
  config: jsonb("config").$type<{
    trigger?: Record<string, any>;
    actions?: Array<Record<string, any>>;
    filters?: Array<Record<string, any>>;
  }>().default({}),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflows.id),
  workflowName: text("workflow_name").notNull(),
  status: text("status").notNull(), // "success", "error", "warning"
  itemsProcessed: integer("items_processed").default(0),
  duration: integer("duration"), // in milliseconds
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type SyncLog = typeof syncLogs.$inferSelect;
