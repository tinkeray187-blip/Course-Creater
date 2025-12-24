import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import CertificationInterface from "@/components/certification-interface"

export default async function CertifyPage({ params }: { params: { courseId: string } }) {
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
      lessons(id)
    `,
    )
    .eq("course_id", params.courseId)
    .order("order_index", { ascending: true })

  const { data: progressData } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.courseId)

  const totalLessons = modules?.reduce((acc, module: any) => acc + (module.lessons?.length || 0), 0) || 0
  const completedLessons = progressData?.filter((p) => p.completed).length || 0
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const { data: existingCertification } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.courseId)
    .single()

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select(
      `
      *,
      quizzes!inner(
        lesson_id,
        module_id
      )
    `,
    )
    .eq("user_id", user.id)

  const courseQuizAttempts = quizAttempts?.filter((attempt: any) => {
    const lessonIds = modules?.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || [])
    return lessonIds?.includes(attempt.quizzes.lesson_id)
  })

  const averageQuizScore =
    courseQuizAttempts && courseQuizAttempts.length > 0
      ? Math.round(courseQuizAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / courseQuizAttempts.length)
      : 0

  const canCertify = progressPercentage === 100

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
            <h1 className="text-2xl font-bold text-slate-900">Course Certification</h1>
            <p className="text-slate-600">{course.title}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 p-4 py-8">
        {existingCertification ? (
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-6">
                  <Award className="h-16 w-16 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Certificate Earned!</CardTitle>
              <CardDescription className="text-center">
                You have successfully completed this course and earned your certification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border-2 border-emerald-200 bg-white p-6">
                <div className="text-center">
                  <p className="mb-2 text-sm text-slate-600">Certificate Number</p>
                  <p className="mb-4 font-mono text-lg font-bold text-slate-900">
                    {existingCertification.certificate_number}
                  </p>
                  <p className="mb-1 text-sm text-slate-600">Issued On</p>
                  <p className="mb-4 font-semibold text-slate-900">
                    {new Date(existingCertification.issued_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{existingCertification.completion_percentage}%</p>
                      <p className="text-sm text-slate-600">Completion</p>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{existingCertification.final_score}%</p>
                      <p className="text-sm text-slate-600">Final Score</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Link href={`/dashboard/course/${params.courseId}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  Earn Your Certification
                </CardTitle>
                <CardDescription>Complete all requirements to receive your professional certificate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      {progressPercentage === 100 ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">Complete All Lessons</p>
                        <p className="text-sm text-slate-600">
                          {completedLessons} of {totalLessons} lessons completed
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{progressPercentage}%</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-slate-900">Quiz Performance</p>
                        <p className="text-sm text-slate-600">Average score across all quizzes</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{averageQuizScore}%</span>
                  </div>
                </div>

                {!canCertify && (
                  <div className="rounded-lg bg-amber-50 p-4 text-amber-900">
                    <p className="font-medium">Requirements Not Met</p>
                    <p className="text-sm">
                      You must complete all lessons to earn your certification. Keep learning and come back when you're
                      ready!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {canCertify && (
              <CertificationInterface
                courseId={params.courseId}
                userId={user.id}
                courseTitle={course.title}
                completionPercentage={progressPercentage}
                finalScore={averageQuizScore}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
