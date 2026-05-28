# Routing

> **Reference:** [Next.js proxy.ts API docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

## Route Structure

All application routes must be nested under `/dashboard`. There should be no top-level user-facing routes outside of `/dashboard` and its sub-pages.

```
/dashboard          → main dashboard page
/dashboard/[...]    → all other app pages
```

## Route Protection

All `/dashboard` routes are protected and require an authenticated user. Protection is enforced via Next.js Proxy — do **not** add auth checks inside individual page components or layouts.

### Proxy

> **Note:** In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`. Use the codemod to migrate: `npx @next/codemod@canary middleware-to-proxy .`

Route protection lives in `proxy.ts` at the project root (or inside `src/` if applicable). Use Clerk's `clerkMiddleware` with `createRouteMatcher` to protect the dashboard routes:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export function proxy(req, event) {
  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  })(req, event);
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
```

### Rules

- Never use `redirect()` inside Server Actions for auth — Proxy handles it.
- Never check session/auth state in **page components** to gate access — that is Proxy's job.
- **Always verify auth inside each Server Action/Server Function.** Server Functions are handled as POST requests to their parent route, so a Proxy matcher that excludes or changes that route can silently remove Proxy coverage. Do not rely on Proxy alone for Server Function auth.
- Protected routes must be explicitly listed in `createRouteMatcher`. All other routes are implicitly public and do not need to be listed.
- The file must export a named `proxy` function (not `middleware`) and live in `proxy.ts`.
