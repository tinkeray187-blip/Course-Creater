import { createSupabaseServer } from "@/lib/supabase/server"

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", params.courseId)

    if (progressError) {
      return Response.json({ error: progressError.message }, { status: 500 })
    }

    const { data: course, error: courseError } = await supabase
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
      .eq("id", params.courseId)
      .single()

    if (courseError) {
      return Response.json({ error: courseError.message }, { status: 500 })
    }

    const totalLessons =
      course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0
    const completedLessons = progressData?.filter((p) => p.completed).length || 0
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return Response.json({
      courseId: params.courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      progress: progressData,
    })
  } catch (error: any) {
    console.error("Error fetching progress:", error)
    return Response.json({ error: error.message || "Failed to fetch progress" }, { status: 500 })
  }
}
