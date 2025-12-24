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

    const { quizId, answers, score, passed, attemptNumber } = await req.json()

    if (!quizId || answers === undefined || score === undefined || passed === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        answers,
        passed,
        attempt_number: attemptNumber || 1,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving quiz attempt:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, attempt: data })
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    return Response.json({ error: error.message || "Failed to submit quiz" }, { status: 500 })
  }
}
