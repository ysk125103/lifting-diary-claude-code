---
name: feedback_clerk_show_component
description: Use Clerk's <Show when=...> for conditional auth rendering, not <SignedIn>/<SignedOut>
metadata:
  type: feedback
---

Use `<Show when="signed-in">` and `<Show when="signed-out">` from `@clerk/nextjs` for conditional auth rendering. `<SignedIn>` and `<SignedOut>` throw errors in the version used by this project.

**Why:** The installed Clerk version has removed or doesn't export `SignedIn`/`SignedOut` components.

**How to apply:** Any time conditional auth-based rendering is needed in JSX, use `<Show when="signed-in">` / `<Show when="signed-out">` instead.
