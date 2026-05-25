'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { createWorkout } from './actions'

const DURATION_PRESETS = [30, 45, 60] as const

const toLocalDatetimeValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const addMinutes = (d: Date, mins: number) => new Date(d.getTime() + mins * 60_000)

export default function NewWorkoutForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const [startedAt, setStartedAt] = useState(toLocalDatetimeValue(now))
  const [duration, setDuration] = useState<string>('45')
  const [customEnd, setCustomEnd] = useState<string | null>(null)

  const computedFinishedAt = customEnd ?? toLocalDatetimeValue(addMinutes(new Date(startedAt), Number(duration)))

  function handleDurationChange(val: string) {
    if (!val) return
    setDuration(val)
    setCustomEnd(null)
  }

  function handleCustomEndChange(val: string) {
    setCustomEnd(val)
    setDuration('')
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = e.currentTarget
    const data = new FormData(form)

    const result = await createWorkout({
      name: data.get('name') as string,
      notes: (data.get('notes') as string) || undefined,
      startedAt: new Date(startedAt),
      finishedAt: new Date(computedFinishedAt),
    })

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Workout name</Label>
            <Input id="name" name="name" placeholder="e.g. Push Day" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startedAt">Started at</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Duration</Label>
            <ToggleGroup
              type="single"
              value={duration}
              onValueChange={handleDurationChange}
              className="justify-start"
            >
              {DURATION_PRESETS.map((mins) => (
                <ToggleGroupItem key={mins} value={String(mins)}>
                  {mins} min
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">or set end time:</span>
              <Input
                type="datetime-local"
                value={customEnd ?? computedFinishedAt}
                onChange={(e) => handleCustomEndChange(e.target.value)}
                className="w-auto flex-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional notes" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save workout'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
