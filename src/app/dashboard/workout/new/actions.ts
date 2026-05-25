'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createWorkoutForUser } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().optional(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date(),
})

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createWorkout(input: CreateWorkoutInput): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const parsed = CreateWorkoutSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid input' }

  await createWorkoutForUser(userId, parsed.data)
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}
