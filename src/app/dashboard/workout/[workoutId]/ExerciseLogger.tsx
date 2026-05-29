'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addExercise, removeExercise, logSet, deleteSet, searchExercises, createAndAddExercise } from './actions'
import type { ExerciseRow, SetRow } from '@/data/workouts'
import type { Exercise } from '@/db/schema'

interface Props {
  workoutId: string
  initialExercises: ExerciseRow[]
}

export default function ExerciseLogger({ workoutId, initialExercises }: Props) {
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Exercise[]>([])
  const [searchPending, setSearchPending] = useState(false)
  const [addPending, setAddPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      setSearchPending(true)
      const results = await searchExercises(searchQuery)
      setSearchResults(results)
      setSearchPending(false)
    }, searchQuery.trim() ? 300 : 0)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([])
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleAddExercise(exercise: Exercise) {
    setAddPending(true)
    setError(null)
    const result = await addExercise(workoutId, exercise.id)
    if (result.success) {
      setExercises((prev) => [
        ...prev,
        { id: result.data.workoutExerciseId, name: exercise.name, order: prev.length, sets: [] },
      ])
      setSearchQuery('')
      setSearchResults([])
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
      setSearchQuery('')
      setSearchResults([])
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
    <Card className="w-full max-w-lg overflow-visible">
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

        <div ref={searchRef} className="relative flex flex-col gap-1">
          <Input
            placeholder="Search exercises to add…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={addPending}
          />
          {searchPending && (
            <p className="text-xs text-muted-foreground px-1">Searching…</p>
          )}
          {(searchResults.length > 0 || (!searchPending && searchQuery.trim())) && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover shadow-md">
              {searchResults.map((ex) => (
                <button
                  key={ex.id}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleAddExercise(ex)}
                  disabled={addPending}
                >
                  {ex.name}
                </button>
              ))}
              {!searchPending && searchQuery.trim() && (
                <button
                  className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground border-t"
                  onClick={() => handleCreateAndAdd(searchQuery.trim())}
                  disabled={addPending}
                >
                  + Create &ldquo;{searchQuery.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>
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
