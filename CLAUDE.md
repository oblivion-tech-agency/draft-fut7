# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack monorepo boilerplate combining Next.js 14 (frontend) and NestJS (backend) with MongoDB. Uses pnpm workspaces for package management.

## Commands

### Development

```bash
pnpm dev                    # Run both frontend and backend concurrently
pnpm dev:frontend           # Next.js dev server only (port 3000)
pnpm dev:backend            # NestJS dev server with watch mode (port 3001)
```

### Building & Testing

```bash
pnpm build                  # Build all apps
pnpm test                   # Run Jest unit tests across all packages
pnpm test:e2e               # Run Playwright E2E tests
pnpm --filter backend test:watch  # Run backend tests in watch mode
pnpm --filter backend test:cov    # Run backend tests with coverage
```

### Code Quality

```bash
pnpm lint                   # Lint all packages
pnpm typecheck              # Type check all apps
pnpm format                 # Format all files with Prettier
pnpm format:check           # Check formatting without fixing
```

### Targeting Specific Apps

```bash
pnpm --filter frontend <command>   # Run command in frontend only
pnpm --filter backend <command>    # Run command in backend only
pnpm --filter e2e-tests <command>  # Run command in E2E tests only
```

## Architecture

```
apps/
├── frontend/           # Next.js 14 with App Router
│   └── src/
│       ├── app/        # App Router pages
│       ├── components/ # React components
│       └── lib/        # Utilities
└── backend/            # NestJS application
    └── src/
        ├── main.ts     # Entry point
        └── *.module.ts # Feature modules

tests/
└── e2e/                # Playwright tests with Page Object Model
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS 10, Mongoose 8, class-validator for DTOs
- **Testing**: Jest (unit), Playwright (E2E)
- **Node**: >= 20.0.0, pnpm >= 9.0.0

## Environment Setup

**Frontend** (`apps/frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`apps/backend/.env`):

```
MONGODB_URI=mongodb://localhost:27017/your-database
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Code Quality Automation

Pre-commit hooks (via Husky + lint-staged) automatically:

- Run ESLint with auto-fix on staged files
- Format with Prettier
- Type check modified app files

## AI Agent Patterns (from AGENTS.md)

The project defines specialized agent roles. Use the pattern: "As the [agent name], [task description]"

- **Architect Agent**: System design, API contracts, scalability
- **Frontend Developer Agent**: React/Next.js components, styling
- **Backend Developer Agent**: NestJS APIs, database design
- **QA Testing Agent**: Unit/integration tests, coverage
- **E2E Testing Agent**: Playwright tests, Page Object Model
- **Code Review Agent**: Code quality, best practices, security

## Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```
