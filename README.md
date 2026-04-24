# Project Overview

This is a full-stack Next.js web application bootstrapped with the [T3 Stack](https://create.t3.gg/). It is an e-commerce platform named "eezy" (inferred from `package.json` and directory structures like `/product`, `/checkout`, `/orders`).

**Key Technologies:**
*   **Framework:** Next.js (App Router, indicated by `src/app/`)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with Radix UI primitives (likely via Shadcn UI components in `src/components/ui/`)
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM
*   **API:** tRPC for end-to-end typesafe APIs
*   **Authentication:** Better Auth
*   **Other Services:** 
    *   UploadThing (for file/image uploads)
    *   Ably (for real-time features/chat)
    *   Resend (for sending emails, invoices, etc.)
    *   React-pdf (for invoice generation)

## Architecture

The project is structured within the `src/` directory:
*   `src/app/`: Next.js App Router containing pages for the main storefront `(app)`, authentication `(auth)`, and an admin dashboard `admin`. API routes are in `src/app/api/`.
*   `src/components/`: Reusable React components, organized by domain (e.g., `admin`, `chat`, `home-page-components`) and UI primitives (`ui/`).
*   `src/context/`: React context providers (e.g., `cart-context.tsx`).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and client configurations (Ably, Auth, UploadThing).
*   `src/server/`: Backend logic including tRPC routers (`api/`), database schema and connection (`db/`), authentication config (`auth/`), and external service integrations (`services/`).
*   `src/trpc/`: tRPC client and server setup.

## Building and Running

The project uses `pnpm` as its package manager.

**Development:**
```bash
# Start the development server (uses Turbopack)
pnpm dev
```

**Database Commands (Drizzle):**
```bash
# Generate migrations based on schema changes
pnpm db:generate

# Apply migrations to the database
pnpm db:migrate

# Push schema changes directly to the database (useful in dev)
pnpm db:push

# Open Drizzle Studio to view/edit data
pnpm db:studio
```

**Building & Production:**
```bash
# Build the application
pnpm build

# Start the built application
pnpm start

# Build and start
pnpm preview
```

**Testing:**
```bash
# Run tests using Vitest
pnpm test

# Run tests with UI
pnpm test:ui
```

**Linting & Formatting:**
```bash
# Run Next.js linting
pnpm lint
pnpm lint:fix

# Check types
pnpm typecheck

# Check and fix formatting (Prettier)
pnpm format:check
pnpm format:write
```

## Development Conventions

*   **Type Safety:** The project heavily relies on TypeScript and tRPC to ensure end-to-end type safety from the database (Drizzle) to the frontend components.
*   **Component Structure:** UI components are primarily located in `src/components/ui/` and follow a modular approach, likely based on Shadcn UI. Domain-specific components are grouped into subfolders.
*   **Database Schema:** The database schema is defined in `src/server/db/schema.ts` using Drizzle ORM.
*   **Testing:** Vitest is used for testing, as configured in `vitest.config.ts`.
