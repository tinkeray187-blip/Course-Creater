import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Code } from "lucide-react"
import Link from "next/link"
import LessonContent from "@/components/lesson-content"
import LessonNavigation from "@/components/lesson-navigation"

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      *,
      modules!inner(
        id,
        title,
        course_id,
        courses!inner(
          id,
          title,
          user_id
        )
      )
    `,
    )
    .eq("id", params.lessonId)
    .single()

  if (!lesson || lesson.modules.courses.user_id !== user.id) {
    notFound()
  }

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index, module_id")
    .eq("module_id", lesson.module_id)
    .order("order_index", { ascending: true })

  const currentIndex = allLessons?.findIndex((l) => l.id === params.lessonId) ?? 0
  const previousLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
  const nextLesson = currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIndex + 1] : null

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", params.lessonId)
    .single()

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("lesson_id", params.lessonId).single()

  const { data: exercise } = await supabase.from("exercises").select("*").eq("lesson_id", params.lessonId).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link href={`/dashboard/course/${params.courseId}`}>
            <Button variant="ghost" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">{lesson.modules.title}</div>
              <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BookOpen className="h-4 w-4" />
              <span>{lesson.estimated_duration_minutes} min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-4 py-8">
        <LessonContent content={lesson.content} />

        {quiz && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Lesson Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-slate-600">Test your understanding of this lesson</p>
              <Link href={`/dashboard/course/${params.courseId}/lesson/${params.lessonId}/quiz`}>
                <Button>Take Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {exercise && (
          <Card className="border-2 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-emerald-600" />
                Hands-On Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-slate-600">{exercise.description}</p>
              <Link href={`/dashboard/course/${params.courseId}/lesson/${params.lessonId}/exercise`}>
                <Button>Start Exercise</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <LessonNavigation
          courseId={params.courseId}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
          currentLessonId={params.lessonId}
          userId={user.id}
        />
      </div>
    </div>
  )
}
