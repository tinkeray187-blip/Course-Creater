"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, BookOpen, Clock, Award, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateCoursePage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate course")
      }

      router.push(`/dashboard/course/${data.courseId}`)
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the course")
    } finally {
      setLoading(false)
    }
  }

  const exampleTopics = [
    "Full-Stack Web Development",
    "JavaScript Mastery",
    "AI Engineer",
    "ML Engineer",
    "React Development",
    "Python for Data Science",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-slate-900">AI-Powered Course Generation</h2>
          <p className="text-balance text-lg text-slate-600">
            Create a comprehensive 8-week certification course tailored to your learning goals
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What would you like to learn?</CardTitle>
            <CardDescription>
              Enter a topic and our AI will create a detailed, college-level course with modules, lessons, quizzes, and
              exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="topic">Course Topic</Label>
                <Input
                  id="topic"
                  type="text"
                  placeholder="e.g., Full-Stack Web Development, AI Engineer, JavaScript Mastery"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  disabled={loading}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Example Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {exampleTopics.map((example) => (
                    <Button
                      key={example}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTopic(example)}
                      disabled={loading}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Course... (This may take 30-60 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Course
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BookOpen className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle className="text-lg">4 Comprehensive Modules</CardTitle>
              <CardDescription>Each module contains 4-5 detailed lessons with exercises</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle className="text-lg">8-Week Program</CardTitle>
              <CardDescription>Structured timeline designed for real-world career readiness</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle className="text-lg">Professional Certificate</CardTitle>
              <CardDescription>Earn a certification upon successful course completion</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
