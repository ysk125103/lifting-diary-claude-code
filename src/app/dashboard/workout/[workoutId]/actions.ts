'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { workouts, workoutExercises, sets } from '@/db/schema'
import { eq, and, max } from 'drizzle-orm'
import { updateWorkoutForUser, getWorkoutById } from '@/data/workouts'
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  deleteSet as deleteSetHelper,
  searchExercises as searchExercisesHelper,
  createExercise as createExerciseHelper,
  getTopExercises as getTopExercisesHelper,
} from '@/data/exercises'

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

export async function searchExercises(query: string) {
  const { userId } = await auth()
  if (!userId) return []
  return searchExercisesHelper(query)
}

export async function getTopExercises() {
  const { userId } = await auth()
  if (!userId) return []
  return getTopExercisesHelper()
}

export async function createAndAddExercise(
  workoutId: string,
  name: string,
): Promise<ActionResult<{ workoutExerciseId: string; exerciseId: string; name: string }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const parsed = z.string().min(1).max(100).safeParse(name)
  if (!parsed.success) return { success: false, error: 'Invalid exercise name' }

  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) return { success: false, error: 'Workout not found' }

  const exercise = await createExerciseHelper(parsed.data)

  const maxOrderResult = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
  const nextOrder = (maxOrderResult[0].maxOrder ?? -1) + 1

  const we = await addExerciseToWorkout(workoutId, exercise.id, nextOrder)
  revalidatePath(`/dashboard/workout/${workoutId}`)
  return { success: true, data: { workoutExerciseId: we.id, exerciseId: exercise.id, name: exercise.name } }
}

export async function addExercise(
  workoutId: string,
  exerciseId: string,
): Promise<ActionResult<{ workoutExerciseId: string }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) return { success: false, error: 'Workout not found' }

  const maxOrderResult = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
  const nextOrder = (maxOrderResult[0].maxOrder ?? -1) + 1

  const we = await addExerciseToWorkout(workoutId, exerciseId, nextOrder)
  revalidatePath(`/dashboard/workout/${workoutId}`)
  return { success: true, data: { workoutExerciseId: we.id } }
}

export async function removeExercise(
  workoutExerciseId: string,
  workoutId: string,
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const rows = await db
    .select({ workoutUserId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId),
        eq(workouts.id, workoutId),
      ),
    )
  if (rows.length === 0) return { success: false, error: 'Not found' }

  await removeExerciseFromWorkout(workoutExerciseId)
  revalidatePath(`/dashboard/workout/${workoutId}`)
  return { success: true, data: undefined }
}

const LogSetSchema = z.object({
  reps: z.coerce.number().int().min(1).optional(),
  weight: z.string().optional(),
  completed: z.boolean(),
})

export async function logSet(
  workoutExerciseId: string,
  workoutId: string,
  input: z.infer<typeof LogSetSchema>,
): Promise<ActionResult<{ setId: string }>> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const parsed = LogSetSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid input' }

  const rows = await db
    .select({ workoutUserId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId),
        eq(workouts.id, workoutId),
      ),
    )
  if (rows.length === 0) return { success: false, error: 'Not found' }

  const set = await addSet(workoutExerciseId, parsed.data)
  revalidatePath(`/dashboard/workout/${workoutId}`)
  return { success: true, data: { setId: set.id } }
}

export async function deleteSet(
  setId: string,
  workoutId: string,
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const rows = await db
    .select({ workoutUserId: workouts.userId })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(sets.id, setId),
        eq(workouts.userId, userId),
        eq(workouts.id, workoutId),
      ),
    )
  if (rows.length === 0) return { success: false, error: 'Not found' }

  await deleteSetHelper(setId)
  revalidatePath(`/dashboard/workout/${workoutId}`)
  return { success: true, data: undefined }
}
