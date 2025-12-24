"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Lesson {
  id: string
  title: string
  order_index: number
}

export default function LessonNavigation({
  courseId,
  previousLesson,
  nextLesson,
  currentLessonId,
  userId,
}: {
  courseId: string
  previousLesson: Lesson | null
  nextLesson: Lesson | null
  currentLessonId: string
  userId: string
}) {
  const [marking, setMarking] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleMarkComplete = async () => {
    setMarking(true)
    try {
      await supabase.from("user_progress").upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: currentLessonId,
        completed: true,
        progress_percentage: 100,
        last_accessed: new Date().toISOString(),
      })

      router.refresh()
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-6">
      <div>
        {previousLesson ? (
          <Link href={`/dashboard/course/${courseId}/lesson/${previousLesson.id}`}>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <Button onClick={handleMarkComplete} disabled={marking} variant="outline" className="gap-2 bg-transparent">
        <CheckCircle className="h-4 w-4" />
        {marking ? "Marking..." : "Mark Complete"}
      </Button>

      <div>
        {nextLesson ? (
          <Link href={`/dashboard/course/${courseId}/lesson/${nextLesson.id}`}>
            <Button className="gap-2">
              Next Lesson
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/course/${courseId}`}>
            <Button className="gap-2">
              Back to Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
