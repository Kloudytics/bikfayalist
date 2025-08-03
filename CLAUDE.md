# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint on the codebase
- `npm run db:push` - Push Prisma schema changes to the database
- `npm run db:seed` - Seed the database with sample data using `tsx prisma/seed.ts`
- `npm run db:studio` - Open Prisma Studio for database management

## Architecture Overview

**BikfayaList** is a Next.js 13+ classified listing platform using the App Router architecture.

### Core Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Backend**: Next.js API Routes (app/api/)
- **Database**: Prisma ORM v6 with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js v5 (Auth.js) with credentials provider
- **File Upload**: UploadThing integration ready

### Database Models (Prisma Schema)
- `User` - User accounts with roles (ADMIN/USER), profile info
- `Category` - Listing categories with slug-based routing
- `Listing` - Main classified ads with status management (ACTIVE/PENDING/ARCHIVED/FLAGGED)
- `Message` - User-to-user messaging system (basic implementation)
- `Account/Session` - NextAuth.js session management

### Key Directories
- `app/` - Next.js 13 App Router pages and API routes
  - `api/` - REST API endpoints organized by resource
  - `auth/` - Authentication pages (signin/signup)
  - `dashboard/` - User dashboard and listing management
  - `admin/` - Admin panel for user/listing moderation
- `components/` - Reusable React components
  - `ui/` - shadcn/ui components (auto-generated, avoid manual edits)
- `lib/` - Core utilities
  - `auth.ts` - NextAuth configuration
  - `db.ts` - Prisma client singleton
  - `utils.ts` - Common utilities (likely contains cn() for Tailwind)
- `prisma/` - Database schema and seeding

### Authentication System
- Uses NextAuth.js v5 (Auth.js) with JWT strategy
- New v5 exports: `auth()`, `signIn()`, `signOut()`, `handlers`
- Demo setup: all users use password "password123"
- Role-based access control (ADMIN/USER roles)
- Custom pages at `/auth/signin` and `/auth/signup`
- API routes use `auth()` instead of `getServerSession(authOptions)`

### API Structure
- RESTful endpoints under `app/api/`
- Protected routes use NextAuth session validation
- Admin endpoints require ADMIN role
- Main resources: listings, categories, users, admin stats

### State Management
- React Context via `app/providers.tsx`
- NextAuth session management
- Form state with react-hook-form + Zod validation

### Development Notes
- Database seeding available via `npm run db:seed` (uses tsx to run TypeScript)
- Demo credentials available in README.md
- Image upload system configured for UploadThing but may need API keys
- SQLite for development, designed for PostgreSQL in production