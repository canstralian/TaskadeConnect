
# SyncNode - Workflow Automation Platform

[![GitHub Stars](https://img.shields.io/github/stars/canstralian/TaskadeConnect?style=for-the-badge)](https://github.com/canstralian/TaskadeConnect/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/canstralian/TaskadeConnect?style=for-the-badge)](https://github.com/canstralian/TaskadeConnect/forks)
[![Issues](https://img.shields.io/github/issues/canstralian/TaskadeConnect?style=for-the-badge)](https://github.com/canstralian/TaskadeConnect/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/canstralian/TaskadeConnect?style=for-the-badge)](https://github.com/canstralian/TaskadeConnect/pulls)
[![License](https://img.shields.io/github/license/canstralian/TaskadeConnect?style=for-the-badge)](LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/canstralian/TaskadeConnect/ci.yml?style=for-the-badge&label=CI)](../../actions)

[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Join Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?style=for-the-badge)](../../discussions)

A modern workflow automation platform that enables seamless data synchronization between different services like Taskade, Notion, Replit, and Slack.

## Overview

SyncNode provides a visual interface for building automation workflows with triggers, actions, and filters, along with comprehensive monitoring and connection management capabilities.

## Features

- **Visual Workflow Builder**: Create automation workflows with an intuitive interface
- **Multi-Service Integration**: Connect with Taskade, Notion, Replit, Slack, and more
- **Real-time Monitoring**: Track sync history and workflow execution status
- **Connection Management**: Securely store and manage API credentials
- **Dashboard Analytics**: View aggregated statistics on active syncs and task completion

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Components**: Radix UI primitives with shadcn/ui (new-york theme)
- **Styling**: Tailwind CSS 4
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React

### Backend
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (Neon serverless recommended)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
DATABASE_URL=your_postgres_connection_string
```

4. Run database migrations:
```bash
npm run db:push
```

5. (Optional) Seed the database with sample data:
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions and API client
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── db.ts               # Database connection
│   └── seed.ts             # Database seeding script
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schemas
└── migrations/             # Database migrations
```

## API Endpoints

### Connections
- `GET /api/connections` - List all service connections
- `POST /api/connections` - Create a new connection
- `PATCH /api/connections/:id` - Update a connection
- `DELETE /api/connections/:id` - Delete a connection

### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get a specific workflow
- `POST /api/workflows` - Create a new workflow
- `PATCH /api/workflows/:id` - Update a workflow
- `DELETE /api/workflows/:id` - Delete a workflow

### Sync Logs
- `GET /api/sync-logs` - List synchronization history

### Dashboard
- `GET /api/dashboard/stats` - Get aggregated statistics

## Database Schema

### Connections Table
Stores external service connection configurations and API keys.

### Workflows Table
Defines automation workflows with source/target services and execution schedules.

### Sync Logs Table
Records workflow execution history with status and metadata.

## Development Tools

- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database migration management
- **ESBuild**: Fast server bundling
- **Replit Plugins**: Enhanced development experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For questions or issues, please open an issue on the repository.
