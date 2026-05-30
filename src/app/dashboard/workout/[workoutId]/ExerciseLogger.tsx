'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { addExercise, removeExercise, logSet, deleteSet, searchExercises, createAndAddExercise, getTopExercises } from './actions'
import type { ExerciseRow, SetRow } from '@/data/workouts'
import type { Exercise } from '@/db/schema'

interface Props {
  workoutId: string
  initialExercises: ExerciseRow[]
}

export default function ExerciseLogger({ workoutId, initialExercises }: Props) {
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Exercise[]>([])
  const [topExercises, setTopExercises] = useState<Exercise[]>([])
  const [searchPending, setSearchPending] = useState(false)
  const [addPending, setAddPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getTopExercises().then(setTopExercises)
  }, [open])

  useEffect(() => {
    if (searchQuery.length <= 3) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchPending(true)
      const results = await searchExercises(searchQuery)
      setSearchResults(results)
      setSearchPending(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const displayedItems = searchQuery.length > 3 ? searchResults : topExercises

  async function handleAddExercise(exercise: Exercise) {
    setAddPending(true)
    setError(null)
    const result = await addExercise(workoutId, exercise.id)
    if (result.success) {
      setExercises((prev) => [
        ...prev,
        { id: result.data.workoutExerciseId, name: exercise.name, order: prev.length, sets: [] },
      ])
      setOpen(false)
      setSearchQuery('')
    } else {
      setError(result.error)
    }
    setAddPending(false)
  }

  async function handleCreateAndAdd(name: string) {
    setAddPending(true)
    setError(null)
    const result = await createAndAddExercise(workoutId, name)
    if (result.success) {
      setExercises((prev) => [
        ...prev,
        { id: result.data.workoutExerciseId, name: result.data.name, order: prev.length, sets: [] },
      ])
      setOpen(false)
      setSearchQuery('')
    } else {
      setError(result.error)
    }
    setAddPending(false)
  }

  async function handleRemoveExercise(workoutExerciseId: string) {
    const result = await removeExercise(workoutExerciseId, workoutId)
    if (result.success) {
      setExercises((prev) => prev.filter((e) => e.id !== workoutExerciseId))
    } else {
      setError(result.error)
    }
  }

  async function handleLogSet(
    workoutExerciseId: string,
    data: { reps?: number; weight?: string; completed: boolean },
  ) {
    const result = await logSet(workoutExerciseId, workoutId, data)
    if (result.success) {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex
          const newSet: SetRow = {
            id: result.data.setId,
            setNumber: ex.sets.length + 1,
            reps: data.reps ?? null,
            weight: data.weight ?? null,
            completed: data.completed,
          }
          return { ...ex, sets: [...ex.sets, newSet] }
        }),
      )
    } else {
      setError(result.error)
    }
  }

  async function handleDeleteSet(setId: string, workoutExerciseId: string) {
    const result = await deleteSet(setId, workoutId)
    if (result.success) {
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
        }),
      )
    } else {
      setError(result.error)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Exercises</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">No exercises logged yet.</p>
        )}

        {exercises.map((exercise) => (
          <ExerciseBlock
            key={exercise.id}
            exercise={exercise}
            onRemove={() => handleRemoveExercise(exercise.id)}
            onLogSet={(data) => handleLogSet(exercise.id, data)}
            onDeleteSet={(setId) => handleDeleteSet(setId, exercise.id)}
          />
        ))}

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearchQuery('') }}>
          <DialogTrigger asChild>
            <Button variant="outline">+ Add Exercise</Button>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 max-w-md">
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search exercises…"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {searchPending ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
                ) : (
                  <>
                    {displayedItems.length === 0 && searchQuery.length <= 3 && (
                      <CommandEmpty>No exercises found.</CommandEmpty>
                    )}
                    {displayedItems.length === 0 && searchQuery.length > 3 && !searchPending && (
                      <CommandEmpty>No results for &ldquo;{searchQuery}&rdquo;.</CommandEmpty>
                    )}
                    <CommandGroup
                      heading={searchQuery.length > 3 ? 'Search results' : 'Top exercises'}
                    >
                      {displayedItems.map((ex) => (
                        <CommandItem
                          key={ex.id}
                          value={ex.name}
                          onSelect={() => handleAddExercise(ex)}
                          disabled={addPending}
                        >
                          {ex.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {searchQuery.trim() && (
                      <CommandGroup>
                        <CommandItem
                          value={`__create__${searchQuery}`}
                          onSelect={() => handleCreateAndAdd(searchQuery.trim())}
                          disabled={addPending}
                          className="text-muted-foreground"
                        >
                          + Create &ldquo;{searchQuery.trim()}&rdquo;
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

interface ExerciseBlockProps {
  exercise: ExerciseRow
  onRemove: () => void
  onLogSet: (data: { reps?: number; weight?: string; completed: boolean }) => Promise<void>
  onDeleteSet: (setId: string) => void
}

function ExerciseBlock({ exercise, onRemove, onLogSet, onDeleteSet }: ExerciseBlockProps) {
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [pending, setPending] = useState(false)

  async function handleLog() {
    setPending(true)
    await onLogSet({
      reps: reps ? Number(reps) : undefined,
      weight: weight || undefined,
      completed: true,
    })
    setReps('')
    setWeight('')
    setPending(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{exercise.name}</span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
          Remove
        </Button>
      </div>

      {exercise.sets.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs">
              <th className="text-left pb-1 w-8">#</th>
              <th className="text-left pb-1">Reps</th>
              <th className="text-left pb-1">Weight (kg)</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {exercise.sets.map((set) => (
              <tr key={set.id}>
                <td className="py-0.5 text-muted-foreground">{set.setNumber}</td>
                <td className="py-0.5">{set.reps ?? '—'}</td>
                <td className="py-0.5">{set.weight ?? '—'}</td>
                <td>
                  <button
                    className="text-muted-foreground hover:text-destructive text-xs px-1"
                    onClick={() => onDeleteSet(set.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-2 items-center">
        <Input
          placeholder="Reps"
          type="number"
          min={1}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-24"
          disabled={pending}
        />
        <Input
          placeholder="kg"
          type="number"
          min={0}
          step="0.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-24"
          disabled={pending}
        />
        <Button size="sm" onClick={handleLog} disabled={pending || (!reps && !weight)}>
          {pending ? 'Logging…' : 'Log set'}
        </Button>
      </div>
    </div>
  )
}
