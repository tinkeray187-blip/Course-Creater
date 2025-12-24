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

    const { exerciseId, submissionContent, completed } = await req.json()

    if (!exerciseId || !submissionContent) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("exercise_submissions")
      .insert({
        user_id: user.id,
        exercise_id: exerciseId,
        submission_content: submissionContent,
        completed: completed ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving exercise submission:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, submission: data })
  } catch (error: any) {
    console.error("Error submitting exercise:", error)
    return Response.json({ error: error.message || "Failed to submit exercise" }, { status: 500 })
  }
}
