
# Architecture Documentation

## System Overview

SyncNode is a full-stack TypeScript application built with a modern monorepo structure, enabling seamless workflow automation between different services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Dashboard │  │Workflows │  │Connection│             │
│  │  Page    │  │  Page    │  │   Page   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│         │              │              │                 │
│         └──────────────┴──────────────┘                │
│                      │                                  │
│              ┌───────▼───────┐                         │
│              │  React Query  │                         │
│              │ (State Mgmt)  │                         │
│              └───────┬───────┘                         │
│                      │                                  │
│              ┌───────▼───────┐                         │
│              │   API Client  │                         │
│              └───────┬───────┘                         │
└──────────────────────┼─────────────────────────────────┘
                       │ HTTP/JSON
┌──────────────────────▼─────────────────────────────────┐
│                 Server (Express)                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │              API Routes                          │ │
│  │  /api/connections  /api/workflows  /api/logs    │ │
│  └──────────────────┬───────────────────────────────┘ │
│                     │                                   │
│  ┌──────────────────▼───────────────────────────────┐ │
│  │           Business Logic Layer                   │ │
│  └──────────────────┬───────────────────────────────┘ │
│                     │                                   │
│  ┌──────────────────▼───────────────────────────────┐ │
│  │            Drizzle ORM                           │ │
│  └──────────────────┬───────────────────────────────┘ │
└────────────────────┼─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│           PostgreSQL Database (Neon)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │Connection│  │ Workflows│  │ SyncLogs │           │
│  │  Table   │  │  Table   │  │  Table   │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

## Key Components

### Frontend Layer

**Technology**: React 19 + TypeScript + Vite

**Responsibilities**:
- User interface rendering
- Client-side routing (Wouter)
- API communication via fetch
- State management with TanStack Query
- Form handling and validation

**Key Patterns**:
- Component-based architecture
- Custom hooks for shared logic
- Path aliases for clean imports (@/, @shared/)
- Radix UI primitives for accessibility

### Backend Layer

**Technology**: Express.js + TypeScript

**Responsibilities**:
- RESTful API endpoints
- Request validation
- Database operations via Drizzle ORM
- Error handling
- Development server with HMR

**Key Patterns**:
- Route-based API organization
- Middleware pattern for cross-cutting concerns
- Zod schema validation
- Type-safe database queries

### Data Layer

**Technology**: PostgreSQL (Neon) + Drizzle ORM

**Responsibilities**:
- Persistent data storage
- Schema management
- Query optimization
- Data integrity

**Schema Design**:
- Normalized relational structure
- Foreign key relationships
- Indexed fields for performance

## Data Flow

### Read Operation
1. User interacts with React component
2. Component triggers React Query hook
3. Query makes HTTP request to Express API
4. Express route handler processes request
5. Drizzle ORM queries PostgreSQL
6. Data flows back through the stack
7. React Query caches and provides data to component
8. Component re-renders with new data

### Write Operation
1. User submits form in React component
2. Component validates input and calls mutation
3. React Query mutation sends POST/PATCH request
4. Express validates request body with Zod
5. Drizzle ORM executes INSERT/UPDATE
6. PostgreSQL commits transaction
7. Success response flows back
8. React Query invalidates relevant queries
9. UI updates automatically

## Security Considerations

### Current State
- No user authentication implemented
- API keys stored in database
- No rate limiting
- No CORS restrictions

### Recommended Improvements
- Implement user authentication (Passport.js)
- Encrypt API keys at rest
- Add rate limiting middleware
- Configure CORS appropriately
- Add CSRF protection

## Scalability Considerations

### Current Architecture
- Monolithic Express server
- Direct database connections
- Server-side rendering in development

### Future Optimizations
- Add Redis caching layer
- Implement connection pooling
- Consider microservices for integrations
- Add job queue for background tasks
- Implement database read replicas

## Development Workflow

### Local Development
1. Vite dev server with HMR
2. Express server with tsx watch mode
3. Database migrations via Drizzle Kit
4. Type checking across full stack

### Production Build
1. Vite builds client to `dist/public`
2. ESBuild bundles server to `dist/index.js`
3. Drizzle migrations run automatically
4. Express serves static files and API

## Monitoring and Observability

### Current Implementation
- Console logging via custom logger
- Sync logs stored in database
- Dashboard statistics endpoint

### Recommended Additions
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (APM)
- Metrics collection (Prometheus)
