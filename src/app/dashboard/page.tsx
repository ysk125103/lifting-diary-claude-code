"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatDate";
import WorkoutList from "./WorkoutList";

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

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
          <Button>Log New Workout</Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-48 justify-start text-left font-normal bg-background shadow-sm",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {date ? formatDate(date) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-lg" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          </div>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {`${format(date, "EEEE")}, ${formatDate(date)}`}
          </h3>
          <WorkoutList date={date} />
        </section>
      </div>
    </main>
  );
}
