import { createSupabaseServer } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, completionPercentage, finalScore } = await req.json()

    if (!courseId || completionPercentage === undefined || finalScore === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: existingCert } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (existingCert) {
      return Response.json({ error: "Certificate already exists for this course" }, { status: 400 })
    }

    const certificateNumber = `CERT-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`

    const { data, error } = await supabase
      .from("certifications")
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certificateNumber,
        completion_percentage: completionPercentage,
        final_score: finalScore,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error generating certificate:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, certification: data })
  } catch (error: any) {
    console.error("Error generating certificate:", error)
    return Response.json({ error: error.message || "Failed to generate certificate" }, { status: 500 })
  }
}
