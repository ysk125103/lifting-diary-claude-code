'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { updateWorkoutForUser } from '@/data/workouts'

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().optional(),
  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date(),
})

export type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateWorkout(
  workoutId: string,
  input: UpdateWorkoutInput,
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const parsed = UpdateWorkoutSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid input' }

  await updateWorkoutForUser(userId, workoutId, parsed.data)
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}
