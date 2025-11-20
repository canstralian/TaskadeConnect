import { eq, desc, and, gte, sql } from "drizzle-orm";
import {
  connections,
  workflows,
  syncLogs,
  mcpMessages,
  type Connection,
  type InsertConnection,
  type Workflow,
  type InsertWorkflow,
  type SyncLog,
  type InsertSyncLog,
  type McpMessage,
  type InsertMcpMessage,
} from "@shared/schema";
import { db } from "./db";
import crypto from "crypto";

export interface IStorage {
  // Connections
  getConnections(): Promise<Connection[]>;
  getConnection(id: number): Promise<Connection | undefined>;
  createConnection(data: InsertConnection): Promise<Connection>;
  updateConnection(id: number, data: Partial<InsertConnection>): Promise<Connection | undefined>;
  deleteConnection(id: number): Promise<boolean>;

  // Workflows
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(data: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Sync Logs
  getSyncLogs(limit?: number): Promise<SyncLog[]>;
  getSyncLog(id: number): Promise<SyncLog | undefined>;
  createSyncLog(data: InsertSyncLog): Promise<SyncLog>;
  getDashboardStats(): Promise<{
    activeSyncs: number;
    tasksSynced: number;
    apiRequests: number;
    storageUsed: string;
  }>;

  // MCP Messages
  getMcpMessages(connectionId: number, limit?: number): Promise<McpMessage[]>;
  createMcpMessage(data: InsertMcpMessage): Promise<McpMessage>;
  deleteMcpMessages(connectionId: number): Promise<boolean>;
}

export class Storage implements IStorage {
  // Connections
  async getConnections(): Promise<Connection[]> {
    return await db.select().from(connections).orderBy(desc(connections.createdAt));
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    const result = await db.select().from(connections).where(eq(connections.id, id));
    return result[0];
  }

  async createConnection(data: InsertConnection): Promise<Connection> {
    // Generate webhook URL and secret for services that support webhooks
    const webhookServices = ["github", "taskade", "notion"];
    const needsWebhook = webhookServices.includes(data.service);
    
    const connectionData: any = { ...data };
    
    if (needsWebhook) {
      // Generate a random webhook secret (32 bytes hex = 64 characters)
      connectionData.webhookSecret = crypto.randomBytes(32).toString("hex");
      // webhookUrl will be generated based on connection ID
      // We'll update it after insertion
    }
    
    const result = await db.insert(connections).values(connectionData).returning();
    const connection = result[0];
    
    // Update with full webhook URL if needed
    if (needsWebhook && connection.id) {
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : "http://localhost:5000";
      
      const webhookUrl = `${baseUrl}/api/webhooks/${data.service}/${connection.id}`;
      
      await db
        .update(connections)
        .set({ webhookUrl })
        .where(eq(connections.id, connection.id));
      
      connection.webhookUrl = webhookUrl;
    }
    
    return connection;
  }

  async updateConnection(id: number, data: Partial<InsertConnection>): Promise<Connection | undefined> {
    const result = await db
      .update(connections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return result[0];
  }

  async deleteConnection(id: number): Promise<boolean> {
    const result = await db.delete(connections).where(eq(connections.id, id)).returning();
    return result.length > 0;
  }

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows).orderBy(desc(workflows.createdAt));
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const result = await db.select().from(workflows).where(eq(workflows.id, id));
    return result[0];
  }

  async createWorkflow(data: InsertWorkflow): Promise<Workflow> {
    const result = await db.insert(workflows).values(data as any).returning();
    return result[0];
  }

  async updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.config !== undefined) {
      updateData.config = data.config;
    }
    const result = await db
      .update(workflows)
      .set(updateData)
      .where(eq(workflows.id, id))
      .returning();
    return result[0];
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id)).returning();
    return result.length > 0;
  }

  // Sync Logs
  async getSyncLogs(limit: number = 50): Promise<SyncLog[]> {
    return await db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(limit);
  }

  async getSyncLog(id: number): Promise<SyncLog | undefined> {
    const result = await db.select().from(syncLogs).where(eq(syncLogs.id, id));
    return result[0];
  }

  async createSyncLog(data: InsertSyncLog): Promise<SyncLog> {
    const result = await db.insert(syncLogs).values(data).returning();
    return result[0];
  }

  async getDashboardStats() {
    // Count active workflows
    const activeWorkflows = await db
      .select({ count: sql<number>`count(*)` })
      .from(workflows)
      .where(eq(workflows.status, "active"));

    // Sum total items synced
    const totalItems = await db
      .select({ total: sql<number>`coalesce(sum(${syncLogs.itemsProcessed}), 0)` })
      .from(syncLogs);

    // Count total sync operations (as proxy for API requests)
    const totalRequests = await db
      .select({ count: sql<number>`count(*)` })
      .from(syncLogs);

    // Calculate "storage used" - for now just a percentage based on row counts
    const totalRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(syncLogs);
    
    const storagePercent = Math.min(Math.floor((totalRows[0].count / 1000) * 100), 100);

    return {
      activeSyncs: Number(activeWorkflows[0].count),
      tasksSynced: Number(totalItems[0].total),
      apiRequests: Number(totalRequests[0].count),
      storageUsed: `${storagePercent}%`,
    };
  }

  // MCP Messages
  async getMcpMessages(connectionId: number, limit: number = 100): Promise<McpMessage[]> {
    return await db
      .select()
      .from(mcpMessages)
      .where(eq(mcpMessages.connectionId, connectionId))
      .orderBy(mcpMessages.createdAt)
      .limit(limit);
  }

  async createMcpMessage(data: InsertMcpMessage): Promise<McpMessage> {
    const result = await db.insert(mcpMessages).values(data as any).returning();
    return result[0];
  }

  async deleteMcpMessages(connectionId: number): Promise<boolean> {
    const result = await db
      .delete(mcpMessages)
      .where(eq(mcpMessages.connectionId, connectionId))
      .returning();
    return result.length > 0;
  }
}

export const storage = new Storage();
