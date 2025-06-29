# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Table Tennis League - A web application for managing table tennis leagues with ELO-based rankings, match recording, and player statistics.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router (TypeScript)
- **UI**: React 19.0.0, shadcn/ui components, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth.js v4 (GitHub, Google OAuth)
- **Forms**: React Hook Form with Zod validation
- **State Management**: Server actions with next-safe-action

## Development Commands

```bash
# Start development server (includes Docker PostgreSQL setup and migrations)
pnpm dev

# Stop Docker containers
pnpm dev:stop

# Fresh development environment (removes Docker volumes)
pnpm dev:new

# Database operations
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations

# Code quality
pnpm check:lint   # Run ESLint
pnpm fix:lint     # Fix ESLint issues
pnpm check:format # Check formatting with Biome
pnpm fix:format   # Fix formatting with Biome
pnpm check:types  # TypeScript type checking

# Production
pnpm build        # Build for production
pnpm start        # Start production server
```

## Architecture

### Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - React components (UI components in `/ui/`)
- `/src/db/` - Database schema and configuration
- `/src/lib/` - Utilities and server actions
- `/src/features/` - Feature-specific business logic
- `/drizzle/` - Database migrations
- `/ADRs/` - Architecture Decision Records / docs

### Key Patterns

1. **Event Sourcing**: All mutations follow event sourcing pattern

   - Commands: `inputData -> state -> Either<Error, List<Event>>`
   - Events stored in database for audit trail
   - Checkpoint system for ELO calculations

2. **Server Actions**: Type-safe mutations using next-safe-action

   - Located in `/src/lib/actions/`
   - Follow pattern: validate input → execute command → handle events

3. **Database Schema**:
   - Users, Leagues, Players, Matches tables
   - Event sourcing tables for audit trail
   - Drizzle ORM for type-safe queries

### Authentication

- NextAuth configuration in `/src/app/api/auth/[...nextauth]/route.ts`
- Providers: GitHub, Google, and development credentials
- Session management with JWT strategy

## Development Guidelines

- **TypeScript**: Strict mode enabled, avoid `any` types
- **Imports**: Use `@/` alias for absolute imports
- **Formatting**: Biome formatter (2 spaces, double quotes)
- **Components**: Follow shadcn/ui patterns for consistency
- **Error Handling**: Use next-safe-action for server-side validation

## Environment Setup

Required environment variables:

- `POSTGRES_URL` - Database connection string
- `NEXTAUTH_URL` - NextAuth base URL
- `NEXTAUTH_SECRET` - NextAuth secret
- OAuth credentials for GitHub and Google providers

## Common Tasks

### Adding a New Feature

1. Create feature logic in `/src/features/[feature-name]/`
2. Add server actions in `/src/lib/actions/`
3. Create UI components following existing patterns
4. Update database schema if needed and generate migrations

### Modifying Database Schema

1. Edit schema in `/src/db/schema/`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply changes

### Working with Events

- All mutations create events stored in the database
- Events follow naming convention: `[Entity][Action]Event`
- Use event sourcing helpers in `/src/lib/event-sourcing/`

## Testing

Currently no testing framework is set up. When implementing tests, consider the event sourcing architecture and test command handlers separately from event handlers.
