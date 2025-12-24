import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, BookOpen, Clock, Award } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      modules(count)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: certifications } = await supabase
    .from("certifications")
    .select("*, courses(title)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Course Creator</h1>
            <p className="text-sm text-slate-600">Welcome back, {profile?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/progress">
              <Button variant="outline">View Progress</Button>
            </Link>
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 p-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">My Learning Path</h2>
            <p className="text-slate-600">Create custom certification courses powered by AI</p>
          </div>
          <Link href="/dashboard/create-course">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Course
            </Button>
          </Link>
        </div>

        {certifications && certifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">My Certifications</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certifications.map((cert: any) => (
                <Card key={cert.id} className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Award className="h-8 w-8 text-emerald-600" />
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Certified
                      </span>
                    </div>
                    <CardTitle className="text-lg">{cert.courses?.title}</CardTitle>
                    <CardDescription>
                      Issued {new Date(cert.issued_at).toLocaleDateString()}
                      <br />
                      Certificate #{cert.certificate_number}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">My Courses</h3>
          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/dashboard/course/${course.id}`}>
                  <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">{course.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.modules?.[0]?.count || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_weeks} weeks</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {course.difficulty_level}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No courses yet</h3>
                <p className="mb-4 text-center text-slate-600">
                  Create your first AI-powered course to start your learning journey
                </p>
                <Link href="/dashboard/create-course">
                  <Button>Create Your First Course</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
