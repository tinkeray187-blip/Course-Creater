"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Code2, Lightbulb, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Exercise {
  id: string
  title: string
  description: string
  instructions: {
    title: string
    description: string
    instructions: string[]
    hints: string[]
    starterCode?: string
    objectives?: string[]
  }
  solution_template?: string
}

export default function ExerciseInterface({
  exercise,
  userId,
  courseId,
  lessonId,
  previousSubmissions,
}: {
  exercise: Exercise
  userId: string
  courseId: string
  lessonId: string | null
  previousSubmissions: any[]
}) {
  const [code, setCode] = useState(exercise.solution_template || exercise.instructions.starterCode || "")
  const [showHints, setShowHints] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/exercise/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          submissionContent: code,
          completed: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit exercise")
      }

      setSubmitted(true)
      router.refresh()
    } catch (error) {
      console.error("Error submitting exercise:", error)
      alert("Failed to submit exercise. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {submitted && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900">
              Exercise submitted successfully! Great work on completing this hands-on practice.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-600" />
              {lessonId ? "Exercise Instructions" : "Portfolio Project"}
            </CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-slate-900">Steps to Complete:</h3>
              <ol className="list-inside list-decimal space-y-2 text-slate-700">
                {exercise.instructions.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Your Solution</CardTitle>
            <CardDescription>Write your code below to complete the exercise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="min-h-[400px] font-mono text-sm"
              disabled={submitting}
            />

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setShowHints(!showHints)}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {showHints ? "Hide" : "Show"} Hints
              </Button>

              <Button onClick={handleSubmit} disabled={!code.trim() || submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Exercise"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showHints && exercise.instructions.hints && exercise.instructions.hints.length > 0 && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                Hints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-slate-700">
                {exercise.instructions.hints.map((hint: string, index: number) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {previousSubmissions && previousSubmissions.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Previous Submissions</CardTitle>
              <CardDescription>Your exercise history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousSubmissions.slice(0, 5).map((submission: any, index: number) => (
                  <div
                    key={submission.id}
                    className={`rounded-lg border p-3 ${
                      submission.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        Submission {previousSubmissions.length - index}
                      </span>
                      {submission.completed && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-xs text-slate-600">{new Date(submission.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
              {exercise.instructions.objectives?.map((objective: string, index: number) => (
                <li key={index}>{objective}</li>
              )) || (
                <>
                  <li>Apply concepts from the lesson</li>
                  <li>Practice hands-on coding skills</li>
                  <li>Build confidence through repetition</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
