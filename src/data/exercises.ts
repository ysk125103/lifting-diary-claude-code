import { db } from '@/db'
import { exercises, workoutExercises, sets } from '@/db/schema'
import { eq, ilike, sql, asc } from 'drizzle-orm'

export async function searchExercises(query: string) {
  return db
    .select()
    .from(exercises)
    .where(ilike(exercises.name, `%${query}%`))
    .limit(10)
}

export async function getTopExercises() {
  return db
    .select()
    .from(exercises)
    .orderBy(asc(exercises.name))
    .limit(10)
}

export async function createExercise(name: string) {
  const rows = await db.insert(exercises).values({ name }).returning()
  return rows[0]
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  order: number,
) {
  const rows = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning()
  return rows[0]
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId))
}

export async function addSet(
  workoutExerciseId: string,
  data: { reps?: number; weight?: string; completed: boolean },
) {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
  const setNumber = Number(countResult[0].count) + 1

  const rows = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, ...data })
    .returning()
  return rows[0]
}

export async function deleteSet(setId: string) {
  await db.delete(sets).where(eq(sets.id, setId))
}
