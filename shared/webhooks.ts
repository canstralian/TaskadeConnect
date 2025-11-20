// Webhook event type definitions

export interface WebhookEvent {
  service: string;
  event: string;
  payload: any;
  timestamp: Date;
}

// GitHub event types
export namespace GitHub {
  export interface PushEvent {
    ref: string;
    before: string;
    after: string;
    repository: {
      id: number;
      name: string;
      full_name: string;
      owner: {
        name: string;
        email: string;
      };
    };
    pusher: {
      name: string;
      email: string;
    };
    commits: Array<{
      id: string;
      message: string;
      timestamp: string;
      url: string;
      author: {
        name: string;
        email: string;
      };
    }>;
  }

  export interface PullRequestEvent {
    action: 'opened' | 'closed' | 'reopened' | 'synchronize' | 'edited';
    number: number;
    pull_request: {
      id: number;
      number: number;
      state: 'open' | 'closed';
      title: string;
      body: string;
      created_at: string;
      updated_at: string;
      merged: boolean;
      merged_at: string | null;
      head: {
        ref: string;
        sha: string;
      };
      base: {
        ref: string;
        sha: string;
      };
      user: {
        login: string;
        id: number;
      };
    };
    repository: {
      id: number;
      name: string;
      full_name: string;
    };
  }

  export interface IssuesEvent {
    action: 'opened' | 'closed' | 'reopened' | 'edited' | 'labeled' | 'assigned';
    issue: {
      id: number;
      number: number;
      title: string;
      body: string;
      state: 'open' | 'closed';
      created_at: string;
      updated_at: string;
      user: {
        login: string;
        id: number;
      };
      assignees: Array<{
        login: string;
        id: number;
      }>;
      labels: Array<{
        id: number;
        name: string;
        color: string;
      }>;
    };
    repository: {
      id: number;
      name: string;
      full_name: string;
    };
  }

  export type EventPayload = PushEvent | PullRequestEvent | IssuesEvent;
}

// Taskade event types
export namespace Taskade {
  export interface TaskCreatedEvent {
    task_id: string;
    task_name: string;
    project_id: string;
    project_name: string;
    created_by: string;
    created_at: string;
    priority?: string;
    due_date?: string;
    assignees?: string[];
  }

  export interface TaskCompletedEvent {
    task_id: string;
    task_name: string;
    project_id: string;
    project_name: string;
    completed_by: string;
    completed_at: string;
  }

  export interface TaskDueEvent {
    task_id: string;
    task_name: string;
    project_id: string;
    project_name: string;
    due_date: string;
    assignees?: string[];
  }

  export type EventPayload = TaskCreatedEvent | TaskCompletedEvent | TaskDueEvent;
}

// Event type mapping
export const EVENT_TYPES = {
  GITHUB: {
    PUSH: 'github.push',
    PULL_REQUEST: 'github.pull_request',
    ISSUES: 'github.issues',
  },
  TASKADE: {
    TASK_CREATED: 'taskade.task.created',
    TASK_COMPLETED: 'taskade.task.completed',
    TASK_DUE: 'taskade.task.due',
  },
} as const;

// Webhook verification result
export interface VerificationResult {
  valid: boolean;
  error?: string;
}
