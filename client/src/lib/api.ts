import type { Connection, Workflow, SyncLog, InsertConnection, InsertWorkflow, InsertSyncLog, McpMessage } from "@shared/schema";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

// Connections
export const connectionsAPI = {
  getAll: () => fetchJSON<Connection[]>(`${API_BASE}/connections`),
  
  get: (id: number) => fetchJSON<Connection>(`${API_BASE}/connections/${id}`),
  
  create: (data: InsertConnection) =>
    fetchJSON<Connection>(`${API_BASE}/connections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: Partial<InsertConnection>) =>
    fetchJSON<Connection>(`${API_BASE}/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    fetchJSON<{ success: boolean }>(`${API_BASE}/connections/${id}`, {
      method: "DELETE",
    }),
};

// Workflows
export const workflowsAPI = {
  getAll: () => fetchJSON<Workflow[]>(`${API_BASE}/workflows`),
  
  get: (id: number) => fetchJSON<Workflow>(`${API_BASE}/workflows/${id}`),
  
  create: (data: InsertWorkflow) =>
    fetchJSON<Workflow>(`${API_BASE}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: Partial<InsertWorkflow>) =>
    fetchJSON<Workflow>(`${API_BASE}/workflows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    fetchJSON<{ success: boolean }>(`${API_BASE}/workflows/${id}`, {
      method: "DELETE",
    }),
};

// Sync Logs
export const syncLogsAPI = {
  getAll: (limit?: number) => {
    const url = limit ? `${API_BASE}/sync-logs?limit=${limit}` : `${API_BASE}/sync-logs`;
    return fetchJSON<SyncLog[]>(url);
  },
  
  create: (data: InsertSyncLog) =>
    fetchJSON<SyncLog>(`${API_BASE}/sync-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};

// Dashboard
export const dashboardAPI = {
  getStats: () =>
    fetchJSON<{
      activeSyncs: number;
      tasksSynced: number;
      apiRequests: number;
      storageUsed: string;
    }>(`${API_BASE}/dashboard/stats`),
};

// MCP / AI Agents
export const mcpAPI = {
  getMessages: (connectionId: number, limit?: number) => {
    const url = limit 
      ? `${API_BASE}/mcp/messages/${connectionId}?limit=${limit}` 
      : `${API_BASE}/mcp/messages/${connectionId}`;
    return fetchJSON<McpMessage[]>(url);
  },

  chat: (data: { connectionId: number; userMessage: string; model?: string; systemPrompt?: string }) =>
    fetchJSON<{ message: McpMessage; assistantMessage: McpMessage }>(`${API_BASE}/mcp/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  clearMessages: (connectionId: number) =>
    fetchJSON<{ success: boolean }>(`${API_BASE}/mcp/messages/${connectionId}`, {
      method: "DELETE",
    }),
};

// Notion
export const notionAPI = {
  listDatabases: () => fetchJSON<any[]>(`${API_BASE}/notion/databases`),
  
  getDatabase: (id: string) => fetchJSON<any>(`${API_BASE}/notion/databases/${id}`),
  
  queryDatabase: (id: string, filter?: any) =>
    fetchJSON<any[]>(`${API_BASE}/notion/databases/${id}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filter }),
    }),
  
  createPage: (databaseId: string, properties: any) =>
    fetchJSON<any>(`${API_BASE}/notion/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ databaseId, properties }),
    }),
  
  getPage: (id: string) => fetchJSON<any>(`${API_BASE}/notion/pages/${id}`),
  
  updatePage: (id: string, properties: any) =>
    fetchJSON<any>(`${API_BASE}/notion/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ properties }),
    }),
};
