"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CertificationInterface({
  courseId,
  userId,
  courseTitle,
  completionPercentage,
  finalScore,
}: {
  courseId: string
  userId: string
  courseTitle: string
  completionPercentage: number
  finalScore: number
}) {
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const handleGenerateCertificate = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/certification/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          completionPercentage,
          finalScore,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      router.refresh()
    } catch (error) {
      console.error("Error generating certificate:", error)
      alert("Failed to generate certificate. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 p-6">
            <Award className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl">Ready to Get Certified!</CardTitle>
        <CardDescription className="text-center">
          Congratulations on completing all course requirements. Generate your professional certificate now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
          <h3 className="mb-4 text-center text-lg font-semibold text-slate-900">Your Achievement Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Course:</span>
              <span className="font-semibold text-slate-900">{courseTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Completion Rate:</span>
              <span className="font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Average Score:</span>
              <span className="font-bold text-emerald-600">{finalScore}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleGenerateCertificate} disabled={generating} size="lg" className="w-full gap-2 text-lg">
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Certificate...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate My Certificate
              </>
            )}
          </Button>
          <p className="text-center text-xs text-slate-600">
            Your certificate will include a unique verification number and can be shared with employers
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
