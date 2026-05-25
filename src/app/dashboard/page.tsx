import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";
import { getWorkoutsForDate } from "@/data/workouts";
import WorkoutList from "./WorkoutList";
import DatePicker from "./DatePicker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? new Date().toISOString().split("T")[0];
  const workouts = await getWorkoutsForDate(date);
  const dateObj = new Date(date + "T00:00:00");

  return (
    <main className="flex-1 bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              View your logged workouts by date
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard/workout/new">Log New Workout</Link>
            </Button>
            <DatePicker date={date} />
          </div>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {`${format(dateObj, "EEEE")}, ${formatDate(dateObj)}`}
          </h3>
          <WorkoutList workouts={workouts} date={date} />
        </section>
      </div>
    </main>
  );
}
