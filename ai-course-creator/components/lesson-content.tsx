"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Lightbulb, Code2, CheckCircle } from "lucide-react"

interface LessonSection {
  type: "concept" | "example" | "exercise" | "summary"
  title: string
  content: string
  codeExample?: string
}

interface LessonContentData {
  sections: LessonSection[]
}

export default function LessonContent({ content }: { content: LessonContentData }) {
  const getIconForType = (type: string) => {
    switch (type) {
      case "concept":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "example":
        return <Lightbulb className="h-5 w-5 text-amber-600" />
      case "exercise":
        return <Code2 className="h-5 w-5 text-emerald-600" />
      case "summary":
        return <CheckCircle className="h-5 w-5 text-slate-600" />
      default:
        return <BookOpen className="h-5 w-5 text-blue-600" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "concept":
        return "border-blue-200 bg-blue-50"
      case "example":
        return "border-amber-200 bg-amber-50"
      case "exercise":
        return "border-emerald-200 bg-emerald-50"
      case "summary":
        return "border-slate-200 bg-slate-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      {content.sections.map((section, index) => (
        <Card key={index} className={`border-2 ${getColorForType(section.type)}`}>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-2">
              {getIconForType(section.type)}
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{section.content}</p>
            </div>
            {section.codeExample && (
              <div className="mt-4">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                  <code>{section.codeExample}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
