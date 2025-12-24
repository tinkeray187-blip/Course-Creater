import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, BookOpen, Award, TrendingUp, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">AI Course Creator</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex rounded-full bg-blue-100 p-4">
            <Sparkles className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mb-4 text-balance text-5xl font-bold text-slate-900">
            Create Custom Certification Courses with AI
          </h2>
          <p className="text-balance mx-auto mb-8 max-w-2xl text-xl text-slate-600">
            Generate comprehensive, college-level courses tailored to your career goals. Learn through structured
            modules, hands-on exercises, and earn professional certifications.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Start Learning Free
            </Button>
          </Link>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <BookOpen className="mb-3 h-10 w-10 text-blue-600" />
              <CardTitle className="text-xl">AI-Generated Curriculum</CardTitle>
              <CardDescription className="text-base">
                Each course includes 4 modules with detailed lessons, quizzes, and hands-on exercises designed for
                career readiness
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <TrendingUp className="mb-3 h-10 w-10 text-blue-600" />
              <CardTitle className="text-xl">Track Your Progress</CardTitle>
              <CardDescription className="text-base">
                Monitor your learning journey with detailed progress tracking, quiz scores, and exercise completions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <Award className="mb-3 h-10 w-10 text-blue-600" />
              <CardTitle className="text-xl">Earn Certifications</CardTitle>
              <CardDescription className="text-base">
                Complete courses and earn professional certifications to showcase your skills and boost your career
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">What's Included in Every Course?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">8-Week Structured Program</h3>
                <p className="text-sm text-slate-600">Comprehensive curriculum designed for career advancement</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">20+ Detailed Lessons</h3>
                <p className="text-sm text-slate-600">College-level content with real-world applications</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Quizzes & Exercises</h3>
                <p className="text-sm text-slate-600">Test your knowledge and build practical skills</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Portfolio Projects</h3>
                <p className="text-sm text-slate-600">Build real projects to showcase to employers</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Module Tests</h3>
                <p className="text-sm text-slate-600">Comprehensive assessments to validate your learning</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Professional Certificate</h3>
                <p className="text-sm text-slate-600">Verified certification upon course completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
