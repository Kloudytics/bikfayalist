# Next.js 13 to 15 Migration Guide

This document outlines all the issues encountered and fixes applied when upgrading a Next.js 13.5.1 application to Next.js 15.4.5, along with React 18 to React 19 and other related dependencies.

## Overview of Major Version Changes

- **Next.js**: 13.5.1 → 15.4.5
- **React**: 18.2.0 → 19.0.0  
- **NextAuth.js**: v4.24.5 → v5.0.0-beta.25 (Auth.js)
- **Prisma**: 5.7.1 → 6.13.0
- **TypeScript**: 5.2.2 → 5.7.2
- **All Radix UI components**: Updated to latest versions
- **react-day-picker**: v8 → v9
- **Various other dependencies**: Updated to 2025 latest versions

## Critical Breaking Changes & Fixes

### 1. Next.js Configuration Issues

**Problem**: Old configuration options causing build failures
```javascript
// ❌ Old config (next.config.js)
const nextConfig = {
  output: 'export',        // Incompatible with API routes
  experimental: {
    turbo: {},            // Deprecated property name
  },
  images: { unoptimized: true },
};
```

**Solution**: Update configuration for Next.js 15
```javascript
// ✅ New config (next.config.js)
const nextConfig = {
  // Remove 'output: export' if using API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},  // Moved from experimental.turbo
};
```

### 2. NextAuth.js v4 to v5 (Auth.js) Migration

**Problem**: Complete API change in NextAuth.js v5
```typescript
// ❌ Old NextAuth v4 (lib/auth.ts)
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // ... config
}
```

**Solution**: Migrate to NextAuth v5 API
```typescript
// ✅ New NextAuth v5 (lib/auth.ts)
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Remove signUp page option (doesn't exist in v5)
  pages: {
    signIn: "/auth/signin"  // signUp option removed
  },
  // ... rest of config
})
```

**API Route Changes**:
```typescript
// ❌ Old API route (app/api/auth/[...nextauth]/route.ts)
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// ✅ New API route
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

**Server Session Changes**:
```typescript
// ❌ Old server session usage
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
const session = await getServerSession(authOptions)

// ✅ New server session usage
import { auth } from '@/lib/auth'
const session = await auth()
```

**Package Changes**:
```json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4"  // Changed from @next-auth/prisma-adapter
  }
}
```

### 3. Dynamic Route Handler Parameter Changes

**Problem**: In Next.js 15, route parameters are now async (Promise-based)

```typescript
// ❌ Old route handler (app/api/listings/[id]/route.ts)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  })
}
```

**Solution**: Await the params Promise
```typescript
// ✅ New route handler
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
  })
}
```

### 4. useSearchParams Suspense Requirement

**Problem**: Next.js 15 requires `useSearchParams()` to be wrapped in Suspense boundary

```typescript
// ❌ Old component causing build error
'use client'
import { useSearchParams } from 'next/navigation'

export default function BrowsePage() {
  const searchParams = useSearchParams()  // Error: needs Suspense
  // ... component code
}
```

**Solution**: Wrap in Suspense boundary
```typescript
// ✅ New component with Suspense
'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function BrowseContent() {
  const searchParams = useSearchParams()
  // ... component code
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  )
}
```

### 5. react-day-picker v9 Breaking Changes

**Problem**: Component API changed in react-day-picker v9

```typescript
// ❌ Old calendar component (components/ui/calendar.tsx)
components={{
  IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
  IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
}}
```

**Solution**: Use new Chevron component API
```typescript
// ✅ New calendar component
components={{
  Chevron: ({ orientation, ...props }) => 
    orientation === 'left' ? 
      <ChevronLeft className="h-4 w-4" /> : 
      <ChevronRight className="h-4 w-4" />,
}}
```

### 6. React Hook Form Error Message Types

**Problem**: Stricter TypeScript types in React 19

```typescript
// ❌ Old error display
{errors.title && (
  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
)}
```

**Solution**: Cast to string type
```typescript
// ✅ New error display
{errors.title && (
  <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>
)}
```

### 7. TypeScript Configuration Updates

**Problem**: Old TypeScript target causing compatibility issues

```json
// ❌ Old tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    // ...
  }
}
```

**Solution**: Update target for better compatibility
```json
// ✅ New tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    // ...
  }
}
```

### 8. Prisma Client Generation Required

**Problem**: Build fails with Prisma client not initialized

```bash
# Error during build
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

**Solution**: Generate Prisma client before build
```bash
npx prisma generate
npm run build
```

### 9. Missing Type Definitions

**Problem**: Build fails due to missing type definitions

```typescript
// Error: Could not find declaration file for module 'bcryptjs'
import { compare } from "bcryptjs"
```

**Solution**: Install missing type definitions
```bash
npm install --save-dev @types/bcryptjs
```

### 10. NextAuth Session Type Extensions

**Problem**: Missing properties in session type

```typescript
// Error: Property 'image' does not exist on type
<AvatarImage src={session.user?.image || ''} />
```

**Solution**: Extend NextAuth types
```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role?: string
      image?: string  // Add missing properties
    }
  }
}
```

### 11. Prisma Enum Type Issues

**Problem**: String values not assignable to Prisma enum types

```typescript
// ❌ Old seed file (prisma/seed.ts)
const users = [
  {
    role: 'ADMIN',  // Error: string not assignable to Role
  }
]
```

**Solution**: Use Prisma enum types
```typescript
// ✅ New seed file
import { PrismaClient, Role } from '@prisma/client'

const users = [
  {
    role: Role.ADMIN,  // Use enum value
  }
]
```

### 12. Credentials Provider Type Safety

**Problem**: Credentials object has stricter typing

```typescript
// ❌ Old auth logic
const user = await prisma.user.findUnique({
  where: {
    email: credentials.email  // Error: Type '{}' not assignable to 'string'
  }
})
```

**Solution**: Add type assertions
```typescript
// ✅ New auth logic
const user = await prisma.user.findUnique({
  where: {
    email: credentials.email as string
  }
})
```

### 13. Component TypeScript Interface Issues

**Problem**: Using `any` types causing strict mode errors

```typescript
// ❌ Old component with any types
{categories.map((category: any) => (
  // Component code
))}
```

**Solution**: Define proper interfaces
```typescript
// ✅ New component with proper types
interface Category {
  id: string
  name: string
  slug: string
}

const [categories, setCategories] = useState<Category[]>([])

{categories.map((category) => (
  // Component code
))}
```

### 14. Runtime Array Method Errors

**Problem**: Runtime errors when API calls fail or return unexpected data

```javascript
// ❌ Runtime error: categories.slice is not a function
{categories.slice(0, 12).map((category) => (
  // Component code
))}
```

**Solution**: Add array safety checks and proper error handling
```typescript
// ✅ Safe array operations with error handling
const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    const data = await response.json()
    setCategories(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    setCategories([]) // Ensure it's always an array
  }
}

// Safe rendering with array check
{Array.isArray(categories) && categories.slice(0, 12).map((category) => (
  // Component code
))}
```

### 15. Component Interface Mismatch Issues

**Problem**: TypeScript errors due to mismatched interfaces between components

```typescript
// ❌ Interface mismatch error
// HomePage defines: { category: Category }
// ListingCard expects: { category: { name: string } }
```

**Solution**: Align interfaces with actual component requirements
```typescript
// ✅ Check what the receiving component actually expects
// components/ListingCard.tsx
interface ListingCardProps {
  listing: {
    id: string
    title: string
    // ... other props
    views: number  // Make sure this matches
    category: {
      name: string  // Match the exact structure needed
    }
    user: {
      name: string | null  // Handle nullable fields
      image: string | null
    }
  }
}

// Update the parent component interface to match
interface Listing {
  // Match exactly what ListingCard expects
  views: number
  category: { name: string }
  user: { name: string | null; image: string | null }
}
```

### 16. ChunkLoadError and Module Loading Issues

**Problem**: Runtime chunk loading errors in Next.js 15, especially in development

```javascript
// ❌ Runtime error
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

**Solution**: Multiple approaches to fix chunk loading issues

```javascript
// ✅ Update next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable turbopack if causing issues
  // turbopack: {},
  
  // Add webpack configuration for better chunk loading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Increase chunk timeout for development
      config.output.chunkLoadTimeout = 30000;
    }
    return config;
  },
  
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};
```

**SessionProvider Configuration**:
```typescript
// ✅ Add proper NextAuth v5 SessionProvider config
'use client'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
```

**Layout Restructuring**:
```typescript
// ✅ Move Providers inside the layout structure
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Providers>
            <Navbar />
            <main>{children}</main>
          </Providers>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
```

**Cache Clearing**:
```bash
# Clear Next.js cache if chunk loading issues persist
rm -rf .next
npm run build
```

### 17. Radix UI Select Empty Value Error

**Problem**: Radix UI Select components don't allow empty string values in newer versions

```javascript
// ❌ Runtime error
A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

**Solution**: Use non-empty default values and handle them in logic

```typescript
// ❌ Old Select with empty value
<SelectContent>
  <SelectItem value="">All categories</SelectItem>  // This causes the error
  {categories.map((cat) => (
    <SelectItem key={cat.id} value={cat.slug}>
      {cat.name}
    </SelectItem>
  ))}
</SelectContent>

// ✅ New Select with proper default value
<SelectContent>
  <SelectItem value="all">All categories</SelectItem>  // Use "all" instead of ""
  {categories.map((cat) => (
    <SelectItem key={cat.id} value={cat.slug}>
      {cat.name}
    </SelectItem>
  ))}
</SelectContent>
```

**Update Component Logic**:
```typescript
// ✅ Handle the "all" value in your logic
const [category, setCategory] = useState('all')  // Default to 'all' not ''

const handleSearch = () => {
  onFiltersChange({
    // Convert 'all' back to undefined for API
    category: category && category !== 'all' ? category : undefined,
    // ... other filters
  })
}

const handleReset = () => {
  setCategory('all')  // Reset to 'all' not ''
  // ... reset other fields
}
```

## Migration Checklist

### Before Starting Migration

- [ ] **Backup your project** and create a new git branch
- [ ] **Document current package versions** for rollback reference
- [ ] **Test current functionality** to establish baseline
- [ ] **Check for custom configurations** that might conflict

### Package Updates

- [ ] Update Next.js to latest version (15.4.5+)
- [ ] Update React and React-DOM to v19
- [ ] Update NextAuth.js to v5 (Auth.js)
- [ ] Update Prisma to v6+
- [ ] Update all Radix UI components
- [ ] Update TypeScript to latest
- [ ] Install missing type definitions

### Configuration Updates

- [ ] Update `next.config.js` (remove deprecated options)
- [ ] Update `tsconfig.json` target
- [ ] Check Tailwind and PostCSS configurations
- [ ] Update environment variables if needed

### Code Changes

- [ ] Migrate NextAuth v4 to v5 API
- [ ] Update dynamic route handlers for async params
- [ ] Wrap `useSearchParams()` in Suspense boundaries
- [ ] Fix react-day-picker component usage
- [ ] Add type assertions for form error messages
- [ ] Update Prisma enum usage in seed files
- [ ] Fix TypeScript interfaces and remove `any` types

### Testing & Validation

- [ ] Run `npx prisma generate` before building
- [ ] Test build process: `npm run build`
- [ ] Test development server: `npm run dev`
- [ ] Verify authentication flows work
- [ ] Test API endpoints functionality
- [ ] Check database operations
- [ ] Validate form submissions
- [ ] Test static page generation

### Post-Migration

- [ ] Update documentation (README, API docs)
- [ ] Update deployment configurations
- [ ] Test in production environment
- [ ] Monitor for runtime errors
- [ ] Update team on breaking changes

## Common Pitfalls to Avoid

1. **Don't skip Prisma generation** - Always run `npx prisma generate` after updating Prisma
2. **Test incrementally** - Don't update everything at once; update major packages one by one
3. **Check peer dependencies** - Use `--legacy-peer-deps` if needed during installation
4. **Backup before major changes** - NextAuth v5 migration is particularly breaking
5. **Update types consistently** - Don't mix old and new type patterns
6. **Test authentication thoroughly** - Auth changes can break user sessions
7. **Watch for console warnings** - Address deprecation warnings early

## Useful Commands for Migration

```bash
# Clean install with legacy peer deps (handles conflicts)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Check for outdated packages
npm outdated

# Build and test
npm run build
npm run dev

# Lint and type check
npm run lint
npx tsc --noEmit
```

## Expected Timeline

For a medium-sized Next.js application:
- **Planning & Backup**: 1-2 hours
- **Package Updates**: 2-4 hours
- **NextAuth Migration**: 4-6 hours
- **Route Handler Updates**: 1-2 hours
- **Component Fixes**: 2-4 hours
- **Testing & Debugging**: 4-8 hours
- **Total**: 14-26 hours

This guide should help streamline future migrations and avoid the common pitfalls we encountered in this upgrade process.