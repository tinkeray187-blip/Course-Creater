import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import QuizInterface from "@/components/quiz-interface"

export default async function ModuleTestPage({ params }: { params: { courseId: string; moduleId: string } }) {
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

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("module_id", params.moduleId).single()

  if (!quiz) {
    notFound()
  }

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quiz.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href={`/dashboard/course/${params.courseId}`}>
            <Button variant="ghost" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <div>
            <div className="text-sm text-slate-600">{module.title}</div>
            <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 p-4 py-8">
        {attempts && attempts.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Previous Attempts</CardTitle>
              <CardDescription>Your module test history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attempts.slice(0, 3).map((attempt: any, index: number) => (
                  <div
                    key={attempt.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      attempt.passed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div>
                      <span className="font-medium text-slate-900">Attempt {attempts.length - index}</span>
                      <span className="ml-2 text-sm text-slate-600">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${attempt.passed ? "text-emerald-600" : "text-slate-600"}`}>
                        {attempt.score}%
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          attempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <QuizInterface
          quiz={quiz}
          userId={user.id}
          courseId={params.courseId}
          lessonId={null}
          attemptNumber={(attempts?.length || 0) + 1}
        />
      </div>
    </div>
  )
}
