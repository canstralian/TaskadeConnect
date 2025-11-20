import { eq, desc, and, gte, sql } from "drizzle-orm";
import {
  connections,
  workflows,
  syncLogs,
  type Connection,
  type InsertConnection,
  type Workflow,
  type InsertWorkflow,
  type SyncLog,
  type InsertSyncLog,
} from "@shared/schema";
import { db } from "./db";

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
    const result = await db.insert(connections).values(data).returning();
    return result[0];
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
}

export const storage = new Storage();
