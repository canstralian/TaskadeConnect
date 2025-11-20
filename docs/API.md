
# API Documentation

## Base URL

All API endpoints are prefixed with `/api`

## Authentication

Currently, the API does not implement user authentication. API keys for external services are stored securely in the database.

## Endpoints

### Connections

#### List All Connections
```
GET /api/connections
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Taskade",
    "service": "taskade",
    "status": "connected",
    "apiKey": "task_live_abc123xyz",
    "config": {},
    "lastSync": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Connection
```
POST /api/connections
```

**Request Body**:
```json
{
  "name": "My Notion Workspace",
  "service": "notion",
  "apiKey": "notion_secret_xyz",
  "config": {
    "workspace": "my-workspace"
  }
}
```

**Response**: `201 Created`

#### Update Connection
```
PATCH /api/connections/:id
```

**Request Body**: Partial connection object

**Response**: `200 OK`

#### Delete Connection
```
DELETE /api/connections/:id
```

**Response**: `204 No Content`

### Workflows

#### List All Workflows
```
GET /api/workflows
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Sync Tasks to Notion",
    "description": "Automatically sync completed tasks from Taskade to Notion",
    "sourceService": "taskade",
    "targetService": "notion",
    "schedule": "0 */2 * * *",
    "enabled": true,
    "lastRun": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Workflow
```
GET /api/workflows/:id
```

**Response**: `200 OK`

#### Create Workflow
```
POST /api/workflows
```

**Request Body**:
```json
{
  "title": "New Workflow",
  "description": "Workflow description",
  "sourceService": "taskade",
  "targetService": "notion",
  "schedule": "0 */4 * * *",
  "config": {}
}
```

**Response**: `201 Created`

#### Update Workflow
```
PATCH /api/workflows/:id
```

**Request Body**: Partial workflow object

**Response**: `200 OK`

#### Delete Workflow
```
DELETE /api/workflows/:id
```

**Response**: `204 No Content`

### Sync Logs

#### List Sync History
```
GET /api/sync-logs
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "workflowId": 1,
    "workflowName": "Sync Tasks to Notion",
    "status": "success",
    "message": "Synced 15 tasks",
    "syncedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Dashboard

#### Get Statistics
```
GET /api/dashboard/stats
```

**Response**: `200 OK`
```json
{
  "activeSyncs": 2,
  "tasksSynced": 150,
  "apiCalls": 1250,
  "lastSync": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently not implemented. Future versions will include rate limiting to prevent abuse.
