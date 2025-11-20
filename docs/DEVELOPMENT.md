
# Development Guide

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database (or Neon account)
- Git
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd syncnode
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development
```

For Neon PostgreSQL, the connection string format is:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 3. Database Setup

Run migrations:
```bash
npm run db:push
```

Seed sample data (optional):
```bash
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Seed database with sample data

## Code Structure

### Frontend (`/client`)

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
└── index.html            # HTML template
```

### Backend (`/server`)

```
server/
├── index.ts              # Server entry point
├── routes.ts             # API route definitions
├── db.ts                 # Database connection
├── seed.ts               # Database seeding
└── vite.ts               # Vite middleware setup
```

### Shared (`/shared`)

```
shared/
└── schema.ts             # Drizzle schemas and types
```

## Development Workflow

### Adding a New Feature

1. **Define Schema** (if needed)
   - Add/modify tables in `shared/schema.ts`
   - Run `npm run db:push` to apply changes

2. **Create API Endpoint**
   - Add route handler in `server/routes.ts`
   - Validate input with Zod schemas
   - Use Drizzle ORM for database operations

3. **Build Frontend**
   - Create/update page component
   - Add UI components as needed
   - Use React Query for data fetching
   - Style with Tailwind CSS

4. **Test**
   - Manual testing in browser
   - Check console for errors
   - Verify database changes

### Adding a UI Component

SyncNode uses shadcn/ui components. To add a new component:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add dialog
```

## Coding Standards

### TypeScript

- Use strict type checking
- Avoid `any` type
- Use interfaces for object shapes
- Export types for reusability

### React

- Functional components only
- Use hooks for state and effects
- Keep components small and focused
- Use custom hooks for shared logic

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui design patterns
- Use CSS variables for theming
- Maintain responsive design

### API Design

- RESTful conventions
- JSON request/response bodies
- Consistent error handling
- Descriptive HTTP status codes

## Debugging

### Frontend Debugging

1. Open browser DevTools
2. Check Console for errors
3. Use React DevTools extension
4. Inspect Network tab for API calls

### Backend Debugging

1. Check server console output
2. Add `console.log()` statements
3. Use VS Code debugger:
   - Set breakpoints
   - Run "Attach to Process"

### Database Debugging

Use Drizzle Studio to inspect database:
```bash
npm run db:studio
```

Or connect directly to PostgreSQL:
```bash
psql $DATABASE_URL
```

## Common Issues

### Port Already in Use

If port 5000 is occupied:
1. Find the process: `lsof -i :5000`
2. Kill it: `kill -9 [PID]`

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check network connectivity
- Ensure database server is running

### Build Errors

- Clear `dist/` directory
- Delete `node_modules/` and reinstall
- Check for TypeScript errors

## Testing (Future)

Currently, there are no automated tests. Recommended additions:

- **Unit Tests**: Vitest for components and utilities
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user flows

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Resources

- [React Documentation](https://react.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
