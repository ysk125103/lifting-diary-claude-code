# Routing

## Route Structure

All application routes must be nested under `/dashboard`. There should be no top-level user-facing routes outside of `/dashboard` and its sub-pages.

```
/dashboard          → main dashboard page
/dashboard/[...]    → all other app pages
```

## Route Protection

All `/dashboard` routes are protected and require an authenticated user. Protection is enforced via Next.js middleware — do **not** add auth checks inside individual page components or layouts.

### Middleware

Route protection lives in `middleware.ts` at the project root. Use Clerk's `clerkMiddleware` with `createRouteMatcher` to protect the dashboard routes:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
```

### Rules

- Never use `redirect()` inside Server Actions for auth — middleware handles it.
- Never check session/auth state in page components to gate access — that is middleware's job.
- Public routes (sign-in, sign-up, marketing pages) must be explicitly excluded from the protected matcher, not the other way around.
