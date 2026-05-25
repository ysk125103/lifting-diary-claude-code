# Data Fetching

## Rule: Server Components Only

**ALL data fetching MUST be done via Server Components.** This is a hard rule with no exceptions.

- **DO NOT** fetch data in Route Handlers (`app/api/*/route.ts`)
- **DO NOT** fetch data in Client Components (`"use client"`)
- **DO NOT** use `useEffect` + `fetch` patterns
- **DO NOT** use SWR, React Query, or similar client-side fetching libraries

Server Components fetch data directly by calling helper functions from the `/data` directory. This is the only approved pattern.

References:

- Fetching Data: https://nextjs.org/docs/app/getting-started/fetching-data
- Mutating Data: https://nextjs.org/docs/app/getting-started/mutating-data

## Rule: Database Queries via /data Helpers

All database queries MUST be written as helper functions inside the `/data` directory. These functions use **Drizzle ORM** — never raw SQL.

```
src/
  data/
    workouts.ts    # e.g. getWorkouts(), getWorkoutById()
    exercises.ts
    ...
```

### Correct pattern

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// src/app/dashboard/page.tsx  (Server Component)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = await getWorkoutsForUser(userId!);
  // ...
}
```

## Rule: Users Can Only Access Their Own Data

Every `/data` helper that returns user-specific data **MUST** filter by `userId`. A logged-in user must never be able to read or modify another user's records.

- Always obtain `userId` from the auth session (e.g. Clerk's `auth()`), never from user-supplied input
- Always include a `where(eq(table.userId, userId))` clause (or equivalent) in every query
- Never expose a helper that returns all rows across all users
