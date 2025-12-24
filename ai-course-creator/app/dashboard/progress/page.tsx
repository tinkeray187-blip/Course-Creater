import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, TrendingUp, CheckCircle, Target, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProgressPage() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      modules(
        id,
        lessons(id)
      )
    `,
    )
    .eq("user_id", user.id)

  const { data: allProgress } = await supabase.from("user_progress").select("*").eq("user_id", user.id)

  const { data: allQuizAttempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: allExerciseSubmissions } = await supabase
    .from("exercise_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: certifications } = await supabase
    .from("certifications")
    .select("*, courses(title)")
    .eq("user_id", user.id)

  const coursesWithProgress = courses?.map((course: any) => {
    const totalLessons =
      course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0
    const completedLessons =
      allProgress?.filter((p) => {
        const lessonInCourse = course.modules?.some((m: any) => m.lessons?.some((l: any) => l.id === p.lesson_id))
        return lessonInCourse && p.completed
      }).length || 0

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      ...course,
      totalLessons,
      completedLessons,
      progressPercentage,
    }
  })

  const totalLessonsAllCourses = coursesWithProgress?.reduce((acc, c) => acc + c.totalLessons, 0) || 0
  const totalCompletedLessons = coursesWithProgress?.reduce((acc, c) => acc + c.completedLessons, 0) || 0
  const overallProgress =
    totalLessonsAllCourses > 0 ? Math.round((totalCompletedLessons / totalLessonsAllCourses) * 100) : 0

  const totalQuizzesTaken = allQuizAttempts?.length || 0
  const passedQuizzes = allQuizAttempts?.filter((attempt) => attempt.passed).length || 0
  const averageQuizScore =
    totalQuizzesTaken > 0
      ? Math.round(allQuizAttempts!.reduce((acc, attempt) => acc + attempt.score, 0) / totalQuizzesTaken)
      : 0

  const totalExercises = allExerciseSubmissions?.length || 0
  const completedExercises = allExerciseSubmissions?.filter((sub) => sub.completed).length || 0

  const recentActivity = [
    ...(allProgress
      ?.filter((p) => p.completed)
      .slice(0, 5)
      .map((p) => ({
        type: "lesson",
        date: p.last_accessed,
        description: "Completed a lesson",
      })) || []),
    ...(allQuizAttempts?.slice(0, 5).map((q) => ({
      type: "quiz",
      date: q.created_at,
      description: `Quiz ${q.passed ? "passed" : "attempted"} (${q.score}%)`,
    })) || []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

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
          <h1 className="text-2xl font-bold text-slate-900">Learning Progress</h1>
          <p className="text-slate-600">Track your journey and achievements</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 p-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">{overallProgress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overallProgress} className="h-2" />
              <p className="mt-2 text-sm text-slate-600">
                {totalCompletedLessons} of {totalLessonsAllCourses} lessons
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardDescription>Quizzes Passed</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600">
                {passedQuizzes}/{totalQuizzesTaken}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Target className="h-4 w-4" />
                <span>Avg Score: {averageQuizScore}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardDescription>Exercises Completed</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">
                {completedExercises}/{totalExercises}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4" />
                <span>Hands-on practice</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardDescription>Certifications</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">{certifications?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Award className="h-4 w-4" />
                <span>Earned certificates</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Progress
                </CardTitle>
                <CardDescription>Your progress across all enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {coursesWithProgress && coursesWithProgress.length > 0 ? (
                  coursesWithProgress.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{course.title}</h3>
                          <p className="text-sm text-slate-600">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{course.progressPercentage}%</span>
                      </div>
                      <Progress value={course.progressPercentage} className="h-2" />
                      <Link href={`/dashboard/course/${course.id}`}>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-600">No courses enrolled yet</div>
                )}
              </CardContent>
            </Card>

            {recentActivity.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest learning milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                        {activity.type === "lesson" ? (
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                        ) : (
                          <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(activity.date).toLocaleDateString()} at{" "}
                            {new Date(activity.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {certifications && certifications.length > 0 && (
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    My Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certifications.map((cert: any) => (
                    <div key={cert.id} className="rounded-lg border bg-white p-3">
                      <h3 className="font-semibold text-slate-900">{cert.courses?.title}</h3>
                      <p className="text-xs text-slate-600">Certificate #{cert.certificate_number.slice(0, 8)}...</p>
                      <p className="text-xs text-slate-600">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-2 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active Courses</span>
                  <span className="font-bold text-slate-900">{courses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Lessons</span>
                  <span className="font-bold text-slate-900">{totalLessonsAllCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-bold text-emerald-600">{totalCompletedLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">In Progress</span>
                  <span className="font-bold text-blue-600">{totalLessonsAllCourses - totalCompletedLessons}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
