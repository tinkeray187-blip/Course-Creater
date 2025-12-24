"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passing_score: number
}

export default function QuizInterface({
  quiz,
  userId,
  courseId,
  lessonId,
  attemptNumber,
}: {
  quiz: Quiz
  userId: string
  courseId: string
  lessonId: string | null
  attemptNumber: number
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let correctCount = 0
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++
        }
      })

      const score = Math.round((correctCount / quiz.questions.length) * 100)
      const passed = score >= quiz.passing_score

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          score,
          passed,
          attemptNumber,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      setResults({ score, passed, correctCount, total: quiz.questions.length })
      setSubmitted(true)
      router.refresh()
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Failed to submit quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted && results) {
    return (
      <Card
        className={`border-2 ${results.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {results.passed ? (
              <>
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                Congratulations! You Passed!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-amber-600" />
                Keep Practicing
              </>
            )}
          </CardTitle>
          <CardDescription>
            You scored {results.score}% ({results.correctCount} out of {results.total} correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              {results.passed
                ? `Great job! You passed with a score of ${results.score}%. The passing score is ${quiz.passing_score}%.`
                : `You scored ${results.score}%. You need ${quiz.passing_score}% to pass. Review the lesson and try again!`}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Review Your Answers</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <Card key={index} className={isCorrect ? "border-emerald-200" : "border-red-200"}>
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Question {index + 1}: {question.question}
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 space-y-2">
                      <p className="text-sm text-slate-600">
                        Your answer:{" "}
                        <span className={isCorrect ? "text-emerald-700" : "text-red-700"}>
                          {question.options[userAnswer]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-slate-600">
                          Correct answer:{" "}
                          <span className="text-emerald-700">{question.options[question.correctAnswer]}</span>
                        </p>
                      )}
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-3">
            {lessonId ? (
              <Button onClick={() => router.push(`/dashboard/course/${courseId}/lesson/${lessonId}`)}>
                Back to Lesson
              </Button>
            ) : (
              <Button onClick={() => router.push(`/dashboard/course/${courseId}`)}>Back to Course</Button>
            )}
            {!results.passed && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{question.question}</h3>
          <RadioGroup
            value={String(answers[currentQuestion] ?? "")}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, Number.parseInt(value))}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-slate-50">
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-slate-900">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === undefined}
            >
              Next
            </Button>
          )}
        </div>

        {Object.keys(answers).length !== quiz.questions.length && currentQuestion === quiz.questions.length - 1 && (
          <Alert>
            <AlertDescription>Please answer all questions before submitting.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
