import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";

type Set = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
  completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  order: number;
  sets: Set[];
};

type Workout = {
  id: string;
  name: string | null;
  notes: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  exercises: Exercise[];
};

export default function WorkoutList({
  workouts,
  date,
}: {
  workouts: Workout[];
  date: string;
}) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6c47ff]/10">
          <Dumbbell className="h-6 w-6 text-[#6c47ff]" />
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">No workouts logged</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {formatDate(new Date(date + "T00:00:00"))} is wide open — make it count.
          </p>
        </div>
        <Button asChild className="bg-[#6c47ff] hover:bg-[#5535e0] text-white mt-2">
          <Link href="/dashboard/workout/new">Log a Workout</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
        >
          <Link
            href={`/dashboard/workout/${workout.id}?date=${date}`}
            className="block px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-[#6c47ff]/5 transition-colors"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{workout.name ?? "Untitled Workout"}</h3>
            {workout.notes && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{workout.notes}</p>
            )}
          </Link>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {workout.exercises.map((ex) => (
              <div key={ex.id} className="px-5 py-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                  <Dumbbell className="h-3.5 w-3.5 text-[#6c47ff]" />
                  {ex.name}
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 dark:text-zinc-400">
                      <th className="text-left font-medium pb-2 w-12">Set</th>
                      <th className="text-left font-medium pb-2">Reps</th>
                      <th className="text-left font-medium pb-2">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {ex.sets.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 text-zinc-400 text-xs">{s.setNumber}</td>
                        <td className="py-1.5 font-medium text-zinc-900 dark:text-zinc-50">{s.reps ?? "—"}</td>
                        <td className="py-1.5 font-medium text-zinc-900 dark:text-zinc-50">
                          {s.weight ? `${s.weight} kg` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
