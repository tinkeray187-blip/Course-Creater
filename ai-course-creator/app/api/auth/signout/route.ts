import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect("/login")
}
