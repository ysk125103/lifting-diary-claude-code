"use server";

import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();
  if (!userId) return [];

  console.log(
    `[dashboard] fetching workouts for date: ${date}, userId: ${userId}`,
  );

  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.finishedAt, start),
        lt(workouts.finishedAt, end),
      ),
    )
    .orderBy(workouts.finishedAt, workoutExercises.order, sets.setNumber);

  // Group into workout → exercises → sets
  const workoutMap = new Map<
    string,
    {
      id: string;
      name: string | null;
      notes: string | null;
      startedAt: Date | null;
      finishedAt: Date | null;
      exercises: Map<
        string,
        {
          id: string;
          name: string;
          order: number;
          sets: {
            id: string;
            setNumber: number;
            reps: number | null;
            weight: string | null;
            completed: boolean;
          }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    const w = row.workout;
    if (!workoutMap.has(w.id)) {
      workoutMap.set(w.id, {
        id: w.id,
        name: w.name,
        notes: w.notes,
        startedAt: w.startedAt,
        finishedAt: w.finishedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(w.id)!;

    if (row.workoutExercise && row.exercise) {
      const we = row.workoutExercise;
      const ex = row.exercise;
      if (!workout.exercises.has(we.id)) {
        workout.exercises.set(we.id, {
          id: we.id,
          name: ex.name,
          order: we.order,
          sets: [],
        });
      }
      if (row.set) {
        const s = row.set;
        workout.exercises.get(we.id)!.sets.push({
          id: s.id,
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed,
        });
      }
    }
  }

  console.log(
    `[dashboard] fetched ${workoutMap.size} workout(s) for date: ${date}`,
  );

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()).sort(
      (a, b) => a.order - b.order,
    ),
  }));
}
