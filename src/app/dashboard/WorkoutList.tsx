import { Dumbbell } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

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
      <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-dashed bg-background text-center">
        <div className="rounded-full bg-muted p-3">
          <Dumbbell className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">No workouts logged</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(new Date(date + "T00:00:00"))} is empty
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="rounded-xl border bg-background shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b bg-muted/40">
            <h3 className="font-semibold">{workout.name ?? "Untitled Workout"}</h3>
            {workout.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">{workout.notes}</p>
            )}
          </div>

          <div className="divide-y">
            {workout.exercises.map((ex) => (
              <div key={ex.id} className="px-5 py-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                  {ex.name}
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left font-medium pb-2 w-12">Set</th>
                      <th className="text-left font-medium pb-2">Reps</th>
                      <th className="text-left font-medium pb-2">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {ex.sets.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 text-muted-foreground text-xs">{s.setNumber}</td>
                        <td className="py-1.5 font-medium">{s.reps ?? "—"}</td>
                        <td className="py-1.5 font-medium">
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
