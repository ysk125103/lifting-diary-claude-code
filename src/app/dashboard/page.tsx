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
    <div className="flex flex-col flex-1">
      {/* Header */}
      <section className="px-6 py-12 bg-linear-to-b from-[#6c47ff]/10 to-transparent">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-4 rounded-full bg-[#6c47ff]/10 px-4 py-1 text-sm font-medium text-[#6c47ff]">
            Your workouts
          </span>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Training Log
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                View and manage your logged workouts by date
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild className="bg-[#6c47ff] hover:bg-[#5535e0] text-white">
                <Link href="/dashboard/workout/new">Log New Workout</Link>
              </Button>
              <DatePicker date={date} />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 px-6 py-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {`${format(dateObj, "EEEE")}, ${formatDate(dateObj)}`}
          </h2>
          <WorkoutList workouts={workouts} date={date} />
        </div>
      </section>
    </div>
  );
}
