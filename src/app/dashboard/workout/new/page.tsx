import NewWorkoutForm from './NewWorkoutForm'

export default function NewWorkoutPage() {
  return (
    <main className="flex-1 bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Log a Workout</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record a new workout session
          </p>
        </div>
        <NewWorkoutForm />
      </div>
    </main>
  )
}
