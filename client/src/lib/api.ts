import type { Connection, Workflow, SyncLog, InsertConnection, InsertWorkflow, InsertSyncLog } from "@shared/schema";

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
