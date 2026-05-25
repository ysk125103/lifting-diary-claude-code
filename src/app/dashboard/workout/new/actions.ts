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

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const parsed = CreateWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkoutForUser(userId, parsed.data)
  revalidatePath('/dashboard')
}
