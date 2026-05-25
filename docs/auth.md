# Authentication Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com) for all authentication.** Do not implement custom auth, use NextAuth, or any other auth library.

## Reading the Current User

### In Server Components and Server Actions

Use `auth()` from `@clerk/nextjs/server` to get the current session:

```ts
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    // handle unauthenticated state
  }
}
```

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`:

```tsx
"use client";

import { useAuth } from "@clerk/nextjs";

export function MyComponent() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return null;
  // ...
}
```

## Protecting Routes

Route protection is handled via Clerk middleware (`src/middleware.ts`). Do not manually redirect unauthenticated users inside page components — configure protected routes in the middleware instead.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth.protect();
});
```

## UI Components

Use Clerk's built-in components for sign-in, sign-up, and user profile UI. Do not build custom auth forms.

- `<SignIn />` — sign-in form
- `<SignUp />` — sign-up form
- `<UserButton />` — signed-in user avatar/menu
- `<SignedIn>` / `<SignedOut>` — conditional rendering wrappers

```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

<SignedOut>
  <SignInButton />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

## Rules

- **Never** trust a `userId` from URL params, query strings, or request bodies — always read it from `auth()` or `useAuth()`
- **Never** store auth tokens manually; Clerk manages sessions
- **Never** write middleware auth logic by hand; use `clerkMiddleware`
- The `userId` from Clerk is the canonical user identifier throughout the app — use it as the foreign key in all database tables
