# SyncNode - Workflow Automation Platform

## Overview

SyncNode is a workflow automation platform that enables users to create, manage, and execute data synchronization workflows between different services (Taskade, Notion, Replit, Slack, etc.). The application provides a visual interface for building automation workflows with triggers, actions, and filters, along with comprehensive monitoring and connection management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Components**: Radix UI primitives with shadcn/ui component library, styled with Tailwind CSS (new-york theme variant)

**Routing**: Wouter for client-side routing

**State Management**: 
- TanStack Query (React Query) for server state management with infinite stale time
- Local component state with React hooks

**Key Design Patterns**:
- Component-based architecture with reusable UI primitives
- Custom hooks for shared logic (mobile detection, toast notifications)
- Path aliases for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API with JSON responses
- `/api/connections` - CRUD operations for service connections
- `/api/workflows` - CRUD operations for automation workflows  
- `/api/sync-logs` - Read operations for synchronization history
- `/api/dashboard/stats` - Aggregated statistics endpoint
- `/api/mcp/*` - MCP-based AI agent chat, streaming, and message history
- `/api/notion/*` - Notion database and page operations

**Development Server**: Custom Vite middleware integration for HMR and SSR during development

**Build Strategy**: 
- Client: Vite builds static assets to `dist/public`
- Server: esbuild bundles server code to `dist/index.js` (ESM format)

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver

**ORM**: Drizzle ORM with Zod schema validation

**Schema Design**:
- `connections` table: Stores external service connection configurations and API keys
- `workflows` table: Defines automation workflows with source/target services and execution schedules
- `syncLogs` table: Records workflow execution history with status and metadata
- `mcpMessages` table: Stores conversation history for MCP-based AI agent interactions

**Migration Strategy**: Drizzle Kit manages schema migrations in `./migrations` directory

### Authentication and Authorization

Currently not implemented - API endpoints are open. The application stores API keys for external services but does not implement user authentication.

### External Dependencies

**Database Service**: Neon PostgreSQL (serverless)
- Accessed via `@neondatabase/serverless` package
- Connection string provided via `DATABASE_URL` environment variable

**UI Component Library**: 
- Radix UI for accessible component primitives
- shadcn/ui configuration with custom theming
- Lucide React for icons

**Development Tools**:
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- TypeScript for type safety across the entire stack

**External Service Integrations**:
- **OpenAI AI Integration** (MCP-based): Fully integrated via Replit AI Integrations with chat and streaming capabilities
  - Service layer: `server/mcp-service.ts`
  - Frontend: `client/src/pages/AIAgent.tsx` (dedicated chat interface)
  - Features: Conversation history, model selection (GPT-4o Mini, GPT-4o, GPT-5 Mini, GPT-5), streaming responses
- **Notion API**: Fully integrated via Replit Notion Connection with OAuth managed automatically
  - Service layer: `server/integrations/notion.ts`
  - API routes: Database listing, querying, page creation/retrieval/updates
  - Frontend API: `client/src/lib/api.ts` (notionAPI)
  - Features: List databases, query databases, create/update pages
- **Taskade API**: Integration layer implemented (`server/integrations/taskade.ts`)
- **GitHub API**: Integration layer implemented (`server/integrations/github.ts`)
- **Replit Database/Storage**: In planning
- **Slack API**: In planning

The application uses a monorepo structure with shared types between client and server via the `@shared` path alias, enabling type-safe communication across the stack.