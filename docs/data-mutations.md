# Data Mutations Coding Standards

Reference: https://nextjs.org/docs/app/getting-started/mutating-data

## Architecture: Three-Tier Mutation Layer

All data mutations follow a strict three-tier architecture. Each layer has a single responsibility and must not reach across layers:

| Layer | Location | Responsibility |
|---|---|---|
| **UI / Client** | `src/app/**/page.tsx`, Client Components | Collects user input, calls Server Actions with typed args |
| **Server Actions** | `src/app/**/actions.ts` | Auth check, input validation (Zod), orchestration, cache revalidation |
| **Data helpers** | `src/data/*.ts` | All `db` calls via Drizzle ORM — no auth or business logic here |

**Rule:** The UI never touches the database. Server Actions never import `db` directly. Data helpers never call `auth()` or `revalidatePath`.

---

## Rule: Server Actions Only

**ALL data mutations MUST be performed via Server Actions.** No other mutation pattern is permitted.

- **DO NOT** mutate data in Route Handlers (`app/api/*/route.ts`)
- **DO NOT** mutate data directly in Client Components
- **DO NOT** use `fetch` with `POST`/`PUT`/`DELETE` from the client

## Rule: Colocated `actions.ts` Files

Server Actions MUST live in a file named `actions.ts`, colocated with the route or feature they belong to. Do not put all actions in a single global file.

```
src/app/
  dashboard/
    page.tsx
    actions.ts       # Server Actions for dashboard
  workouts/
    [id]/
      page.tsx
      actions.ts     # Server Actions for a single workout
```

Every `actions.ts` file MUST have `'use server'` at the top of the file:

```ts
// src/app/dashboard/actions.ts
'use server'

// exports are all Server Actions
export async function createWorkout(...) { ... }
export async function deleteWorkout(...) { ... }
```

## Rule: Typed Parameters — No `FormData`

> **Note:** The Next.js reference docs use `FormData` as the default parameter type for Server Actions wired to `<form action={...}>`. This project intentionally diverges from that pattern. The native `<form action={serverAction}>` approach is **not used here**. All actions are called directly with typed arguments from event handlers, so `FormData` is never needed.

Server Action parameters MUST be explicitly typed. **Do NOT use `FormData` as a parameter type.**

```ts
// WRONG
export async function createWorkout(formData: FormData) { ... }

// CORRECT
export async function createWorkout(input: CreateWorkoutInput) { ... }
```

Call actions directly with typed arguments from event handlers or Client Components:

```tsx
// src/app/dashboard/workouts/new/page.tsx (Client Component)
'use client'

import { createWorkout } from '../actions'

export function NewWorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await createWorkout({ name: 'Push Day', date: new Date() })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Rule: Validate All Inputs with Zod

Every Server Action MUST validate its arguments with **Zod** before touching the database. Never trust the caller.

```ts
// src/app/dashboard/actions.ts
'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createWorkoutForUser } from '@/data/workouts'
import { revalidatePath } from 'next/cache'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
})

export async function createWorkout(input: z.infer<typeof CreateWorkoutSchema>) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = CreateWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkoutForUser(userId, parsed.data)
  revalidatePath('/dashboard')
}
```

## Rule: Database Mutations via `/data` Helpers

Server Actions MUST NOT call the database directly. All `db` calls MUST go through helper functions in the `/data` directory, which use **Drizzle ORM**.

```
src/
  data/
    workouts.ts     # createWorkoutForUser(), deleteWorkout(), etc.
    exercises.ts
```

```ts
// src/data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'

export async function createWorkoutForUser(
  userId: string,
  data: { name: string; date: Date }
) {
  return db.insert(workouts).values({ ...data, userId })
}
```

## Rule: Always Verify Ownership Before Mutating

Before updating or deleting a record, confirm the authenticated user owns it. Never rely solely on the record ID passed by the caller.

```ts
export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await deleteWorkoutForUser(userId, workoutId) // /data helper enforces userId filter
}
```

## After a Mutation: Revalidate or Redirect

After mutating data, always either revalidate the affected path or redirect:

```ts
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Option A — stay on the page, refresh data
revalidatePath('/dashboard')

// Option B — send user elsewhere after the mutation
revalidatePath('/workouts')
redirect('/workouts')
```

`redirect()` throws a control-flow exception — always call `revalidatePath` before it if needed. No code after `redirect()` will execute.
