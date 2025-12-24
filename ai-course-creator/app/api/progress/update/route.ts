import { createSupabaseServer } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, lessonId, completed, progressPercentage } = await req.json()

    if (!courseId || !lessonId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed: completed ?? false,
          progress_percentage: progressPercentage ?? 0,
          last_accessed: new Date().toISOString(),
        },
        {
          onConflict: "user_id,course_id,lesson_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating progress:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, progress: data })
  } catch (error: any) {
    console.error("Error updating progress:", error)
    return Response.json({ error: error.message || "Failed to update progress" }, { status: 500 })
  }
}
