import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle, Circle, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.courseId)
    .eq("user_id", user.id)
    .single()

  if (!course) {
    notFound()
  }

  const { data: modules } = await supabase
    .from("modules")
    .select(
      `
      *,
      lessons(
        id,
        title,
        order_index,
        estimated_duration_minutes
      )
    `,
    )
    .eq("course_id", params.courseId)
    .order("order_index", { ascending: true })

  const { data: progressData } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.courseId)

  const completedLessons = new Set(progressData?.filter((p) => p.completed).map((p) => p.lesson_id) || [])

  const totalLessons = modules?.reduce((acc, module: any) => acc + (module.lessons?.length || 0), 0) || 0
  const completedCount = completedLessons.size
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 p-4 py-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900">{course.title}</h1>
          <p className="text-lg text-slate-600">{course.description}</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>
              {completedCount} of {totalLessons} lessons completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{progressPercentage}% Complete</span>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <span className="capitalize">{course.difficulty_level}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Course Modules</h2>
          {modules?.map((module: any, moduleIndex: number) => {
            const moduleLessons = module.lessons || []
            const moduleCompletedCount = moduleLessons.filter((lesson: any) => completedLessons.has(lesson.id)).length
            const moduleProgress =
              moduleLessons.length > 0 ? Math.round((moduleCompletedCount / moduleLessons.length) * 100) : 0

            const isModuleUnlocked = moduleIndex === 0 || moduleProgress === 100
            const previousModuleCompleted =
              moduleIndex === 0 ||
              (modules[moduleIndex - 1]?.lessons || []).every((l: any) => completedLessons.has(l.id))

            return (
              <Card key={module.id} className={previousModuleCompleted ? "border-2" : "border-2 opacity-60"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Module {module.order_index + 1}</span>
                        {!previousModuleCompleted && <Lock className="h-4 w-4 text-slate-400" />}
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{moduleProgress}%</div>
                      <div className="text-xs text-slate-600">
                        {moduleCompletedCount}/{moduleLessons.length}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {moduleLessons
                      .sort((a: any, b: any) => a.order_index - b.order_index)
                      .map((lesson: any, lessonIndex: number) => {
                        const isCompleted = completedLessons.has(lesson.id)
                        const previousLessonCompleted =
                          lessonIndex === 0 || completedLessons.has(moduleLessons[lessonIndex - 1].id)
                        const isLessonUnlocked = previousModuleCompleted && previousLessonCompleted

                        return (
                          <Link
                            key={lesson.id}
                            href={isLessonUnlocked ? `/dashboard/course/${params.courseId}/lesson/${lesson.id}` : "#"}
                            className={!isLessonUnlocked ? "pointer-events-none" : ""}
                          >
                            <div
                              className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                                isLessonUnlocked
                                  ? "hover:border-blue-300 hover:bg-blue-50"
                                  : "cursor-not-allowed opacity-50"
                              } ${isCompleted ? "border-emerald-200 bg-emerald-50" : "bg-white"}`}
                            >
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                                ) : isLessonUnlocked ? (
                                  <Circle className="h-5 w-5 flex-shrink-0 text-slate-400" />
                                ) : (
                                  <Lock className="h-5 w-5 flex-shrink-0 text-slate-400" />
                                )}
                                <div>
                                  <div className="font-medium text-slate-900">
                                    Lesson {lesson.order_index + 1}: {lesson.title}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-slate-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{lesson.estimated_duration_minutes} min</span>
                                  </div>
                                </div>
                              </div>
                              {isLessonUnlocked && (
                                <Button variant={isCompleted ? "outline" : "default"} size="sm">
                                  {isCompleted ? "Review" : "Start"}
                                </Button>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                  </div>

                  {moduleProgress === 100 && (
                    <div className="mt-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-900">Module Complete!</span>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/dashboard/course/${params.courseId}/module/${module.id}/test`}>
                          <Button variant="outline" size="sm">
                            Take Module Test
                          </Button>
                        </Link>
                        <Link href={`/dashboard/course/${params.courseId}/module/${module.id}/project`}>
                          <Button size="sm">View Module Project</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {progressPercentage === 100 && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Ready for Certification
              </CardTitle>
              <CardDescription>
                You've completed all lessons! Take the final assessment to earn your certificate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/course/${params.courseId}/certify`}>
                <Button size="lg">Earn Your Certificate</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
