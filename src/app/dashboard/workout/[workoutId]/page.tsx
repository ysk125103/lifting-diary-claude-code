import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getWorkoutById } from '@/data/workouts'
import EditWorkoutForm from './EditWorkoutForm'

interface Props {
  params: Promise<{ workoutId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function EditWorkoutPage({ params, searchParams }: Props) {
  const { workoutId } = await params
  const { date } = await searchParams
  const { userId } = await auth()
  if (!userId) return notFound()

  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) return notFound()

  return (
    <div className="flex justify-center p-8">
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name ?? ''}
        defaultNotes={workout.notes ?? ''}
        defaultStartedAt={workout.startedAt ?? new Date()}
        defaultFinishedAt={workout.finishedAt ?? new Date()}
        cancelHref={date ? `/dashboard?date=${date}` : '/dashboard'}
      />
    </div>
  )
}
