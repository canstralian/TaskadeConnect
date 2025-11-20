/**
 * Taskade integration - Implements outbound actions to Taskade API
 */

interface TaskadeConfig {
  token: string;
  projectId?: string;
}

interface CreateTaskParams {
  title: string;
  description?: string;
  project?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

interface UpdateTaskParams {
  taskId: string;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
}

interface CreateTaskResponse {
  id: string;
  name: string;
  projectId: string;
}

interface UpdateTaskResponse {
  id: string;
  name: string;
  completed: boolean;
}

/**
 * Create a new task in Taskade
 */
export async function createTask(
  config: TaskadeConfig,
  params: CreateTaskParams
): Promise<CreateTaskResponse> {
  const { token, projectId } = config;
  const targetProjectId = params.project || projectId;

  if (!targetProjectId) {
    throw new Error("Taskade project ID is required");
  }

  const url = `https://www.taskade.com/api/v1/projects/${targetProjectId}/tasks`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.title,
      content: params.description || "",
      priority: params.priority || "medium",
      dueDate: params.dueDate,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Taskade API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Update an existing task in Taskade
 */
export async function updateTask(
  config: TaskadeConfig,
  params: UpdateTaskParams
): Promise<UpdateTaskResponse> {
  const { token, projectId } = config;

  if (!projectId) {
    throw new Error("Taskade project ID is required");
  }

  const url = `https://www.taskade.com/api/v1/projects/${projectId}/tasks/${params.taskId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.title,
      content: params.description,
      completed: params.completed,
      priority: params.priority,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Taskade API error: ${response.status} - ${error}`);
  }

  return await response.json();
}
