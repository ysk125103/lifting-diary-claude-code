"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatDate";

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = new Date(date + "T00:00:00");
  const todayIso = new Date().toISOString().split("T")[0];
  const isToday = date === todayIso;

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    const iso = d.toISOString().split("T")[0];
    router.push(`?date=${iso}`);
    setOpen(false);
  }

  function shiftDate(days: number) {
    const d = new Date(selected);
    d.setDate(d.getDate() + days);
    router.push(`?date=${d.toISOString().split("T")[0]}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => shiftDate(-1)}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-48 justify-start text-left font-normal bg-background shadow-sm",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {formatDate(selected)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg" align="end">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={() => shiftDate(1)}
        disabled={isToday}
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isToday && (
        <Button variant="outline" size="sm" onClick={() => router.push("?")}>
          Today
        </Button>
      )}
    </div>
  );
}
