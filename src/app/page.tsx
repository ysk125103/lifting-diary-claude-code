import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-linear-to-b from-[#6c47ff]/10 to-transparent">
        <span className="inline-block mb-4 rounded-full bg-[#6c47ff]/10 px-4 py-1 text-sm font-medium text-[#6c47ff]">
          Your personal lifting companion
        </span>
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          Track Every Rep. <br />
          Own Every PR.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Lifting Diary makes it effortless to log workouts, track your
          progress, and see exactly how far you&apos;ve come — one set at a time.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {process.env.NODE_ENV === "development" && (
            <SignUpButton>
              <Button size="lg" className="bg-[#6c47ff] hover:bg-[#5535e0] text-white px-8 h-12 text-base">
                Get Started Free
              </Button>
            </SignUpButton>
          )}
          <SignInButton>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 py-8">
          {[
            { value: "10,000+", label: "Workouts Logged" },
            { value: "500+", label: "Exercises in Library" },
            { value: "100%", label: "Free to Use" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4">
              <span className="text-3xl font-bold text-[#6c47ff]">{value}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Everything you need to train smarter
          </h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mb-14 max-w-xl mx-auto">
            Built for lifters who care about progress, not just showing up.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: "🏋️",
                title: "Log Any Workout",
                body: "Quickly add exercises, sets, reps, and weight. Log from your phone between sets — it's that fast.",
              },
              {
                icon: "📚",
                title: "Huge Exercise Library",
                body: "Search from hundreds of exercises or add your own. Never wonder what to log next.",
              },
              {
                icon: "📈",
                title: "Track Your Progress",
                body: "See your volume, PRs, and consistency at a glance. Know when you're improving.",
              },
              {
                icon: "⚡",
                title: "Built for Speed",
                body: "Designed to get out of your way. Log a full workout in under a minute.",
              },
            ].map(({ icon, title, body }) => (
              <Card key={title} className="border border-zinc-200 dark:border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-14">
            Up and running in 60 seconds
          </h2>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            {[
              { step: "1", title: "Create your account", body: "Sign up free — no credit card required." },
              { step: "2", title: "Start a workout", body: "Pick exercises from the library or search for your own." },
              { step: "3", title: "Watch yourself improve", body: "Your history and PRs are tracked automatically." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c47ff] text-white font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Join lifters who are serious about their progress. It&apos;s free, forever.
          </p>
          {process.env.NODE_ENV === "development" && (
            <SignUpButton>
              <Button size="lg" className="bg-[#6c47ff] hover:bg-[#5535e0] text-white px-10 h-12 text-base">
                Create Your Free Account
              </Button>
            </SignUpButton>
          )}
          {process.env.NODE_ENV !== "development" && (
            <SignInButton>
              <Button size="lg" className="bg-[#6c47ff] hover:bg-[#5535e0] text-white px-10 h-12 text-base">
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} Lifting Diary. All rights reserved.
      </footer>
    </div>
  );
}
