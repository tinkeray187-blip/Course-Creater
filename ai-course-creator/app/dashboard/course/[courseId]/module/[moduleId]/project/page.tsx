import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ExerciseInterface from "@/components/exercise-interface"

export default async function ModuleProjectPage({ params }: { params: { courseId: string; moduleId: string } }) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: module } = await supabase
    .from("modules")
    .select(
      `
      *,
      courses!inner(
        id,
        title,
        user_id
      )
    `,
    )
    .eq("id", params.moduleId)
    .single()

  if (!module || module.courses.user_id !== user.id) {
    notFound()
  }

  const { data: exercise } = await supabase.from("exercises").select("*").eq("module_id", params.moduleId).single()

  if (!exercise) {
    notFound()
  }

  const { data: submissions } = await supabase
    .from("exercise_submissions")
    .select("*")
    .eq("user_id", user.id)
    .eq("exercise_id", exercise.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href={`/dashboard/course/${params.courseId}`}>
            <Button variant="ghost" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <div>
            <div className="text-sm text-slate-600">{module.title}</div>
            <h1 className="text-2xl font-bold text-slate-900">Module Portfolio Project</h1>
            <p className="text-slate-600">{exercise.title}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 p-4 py-8">
        <ExerciseInterface
          exercise={exercise}
          userId={user.id}
          courseId={params.courseId}
          lessonId={null}
          previousSubmissions={submissions}
        />
      </div>
    </div>
  )
}
