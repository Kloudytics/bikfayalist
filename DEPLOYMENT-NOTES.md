# Deployment Notes & Important Reminders

## Critical Production Issues & Solutions

### ⚠️ Netlify Trailing Slash Redirect Loops

**Issue**: `/admin` page experiencing `ERR_TOO_MANY_REDIRECTS` in production (bikfayalist.com on Netlify)

**Root Cause**: Ping-pong redirects between Netlify's Pretty URLs and Next.js App Router
1. Netlify Pretty URLs: `/admin` → `/admin/` (301)
2. Next.js App Router: `/admin/` → `/admin` (308)
3. Infinite loop results

**Solution**: 
```toml
# netlify.toml
[build.processing]
  pretty_urls = false
```
And remove any manual redirect rules like:
```toml
# DON'T DO THIS - causes loops
[[redirects]]
  from = "/admin"
  to = "/admin/"
```

**Fixed in**: Commit `6e3dc09` - "fix: Resolve Netlify trailing slash redirect loops"

---

## Authentication Configuration

### NextAuth.js Production Issues

**Issue**: Users remained signed in after signout attempts

**Root Cause**: Complex JWT callbacks and cookie domain settings in production

**Solution**: Simplified NextAuth configuration by removing:
- Custom cookie domain settings
- Complex security callbacks that caused conflicts

**Files**: `/lib/auth.ts`

---

## Admin Page Authentication Patterns

**Critical**: All admin pages MUST use the same authentication pattern for consistency

**Correct Pattern** (used by working sub-pages):
```typescript
'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AdminPage() {
  const { data: session, status } = useSession()
  
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
    }
  }, [session, status])
  
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  // ... rest of component
}
```

**Avoid**: Server-side auth patterns like `const session = await auth()` in admin pages - causes inconsistency

---

## Environment Variables

### NextAuth URL Configuration
- Development: `NEXTAUTH_URL=http://localhost:3000`
- Production: `NEXTAUTH_URL=https://bikfayalist.com` (no trailing slash)

### Email Service (Resend) - REQUIRED
- `RESEND_API_KEY=re_your_actual_resend_api_key_here`
- `RESEND_FROM_EMAIL=no-reply@email.bikfayalist.com`

**Critical**: Email verification and password reset won't work without proper Resend configuration.

### Database
- Development: SQLite via `DATABASE_URL="file:./dev.db"`
- Production: PostgreSQL connection string

---

## Git Branch Strategy

- `main`: Stable production branch
- `v1-production-ready`: Current active development branch
- `v2-advanced-features`: Enhanced features branch (reference for restored functionality)

---

## Debugging Tips

### For Authentication Issues:
1. Check NextAuth configuration consistency between environments
2. Verify cookie settings aren't conflicting
3. Compare working vs non-working auth patterns

### For Netlify Redirect Issues:
1. Check `netlify.toml` redirect rules
2. Verify `pretty_urls` setting
3. Test with Network DevTools for redirect chains
4. Clear browser cache/cookies after deploys

### For Admin Panel Issues:
1. Ensure all admin pages use same authentication pattern
2. Check role-based access control
3. Verify API endpoint permissions

---

## Performance & SEO

- Static assets cached with `max-age=31536000, immutable`
- Security headers configured for production
- Domain redirects set up for bikfayalist.com migration

---

## Email Verification & Password Reset Features

### Features Added
- ✅ Email verification for new user registrations
- ✅ Password reset functionality 
- ✅ Beautiful email templates with proper branding
- ✅ Rate limiting for security (5 min cooldown for password reset)
- ✅ Token-based verification with expiry (24h verification, 1h reset)
- ✅ Comprehensive UI flows for all email scenarios

### API Endpoints
- `POST /api/auth/send-verification` - Send email verification
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Pages Added
- `/auth/verify-email` - Email verification page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - New password setup
- `/auth/resend-verification` - Resend verification email

### Database Schema Updates
- Added `User.passwordResetAt` field for rate limiting
- Utilizes existing `User.emailVerified` and `VerificationToken` model

---

## Future Deployment Checklist

1. ✅ Test authentication flows in production
2. ✅ Verify admin panel accessibility 
3. ✅ Check for redirect loops on key pages
4. ✅ Ensure environment variables are set
5. ✅ Test signout functionality
6. ✅ Clear browser cache after deployment
7. 🆕 Test email verification flow (registration → email → verification)
8. 🆕 Test password reset flow (forgot password → email → reset)
9. 🆕 Verify Resend email delivery in production
10. 🆕 Check email templates render correctly in email clients