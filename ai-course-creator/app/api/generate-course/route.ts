import { generateObject } from "ai"
import { z } from "zod"
import { createSupabaseServer } from "@/lib/supabase/server"

export const maxDuration = 60

const lessonContentSchema = z.object({
  sections: z.array(
    z.object({
      type: z.enum(["concept", "example", "exercise", "summary"]),
      title: z.string(),
      content: z.string(),
      codeExample: z.string().optional(),
    }),
  ),
})

const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
})

const exerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  instructions: z.array(z.string()),
  starterCode: z.string().optional(),
  hints: z.array(z.string()),
})

const lessonSchema = z.object({
  title: z.string(),
  content: lessonContentSchema,
  estimatedDuration: z.number(),
  quiz: z.object({
    title: z.string(),
    questions: z.array(quizQuestionSchema),
  }),
  exercise: exerciseSchema,
})

const moduleSchema = z.object({
  title: z.string(),
  description: z.string(),
  lessons: z.array(lessonSchema),
  moduleTest: z.object({
    title: z.string(),
    questions: z.array(quizQuestionSchema),
  }),
  moduleProject: z.object({
    title: z.string(),
    description: z.string(),
    instructions: z.array(z.string()),
    objectives: z.array(z.string()),
  }),
})

const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  modules: z.array(moduleSchema),
})

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topic } = await req.json()

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 })
    }

    const prompt = `Create a comprehensive, college-level certification course on "${topic}".

This is an 8-week intensive program designed to take students from foundational knowledge to career-ready skills.

Requirements:
- Create 4 modules (2 weeks per module)
- Each module should have 4-5 detailed lessons
- Each lesson must include:
  * Detailed explanations of concepts with real-world context
  * Multiple worked examples with code (where applicable)
  * Practice exercises that reinforce the material
  * Progressive difficulty that builds confidence
  * College-level depth and rigor
- Each lesson must have a quiz with 5 questions to test understanding
- Each lesson must have a hands-on exercise with clear instructions
- Each module must have a comprehensive test (10 questions)
- Each module must have a portfolio project that integrates all lesson exercises

The course should prepare students for real-world career opportunities with practical, applicable skills.
Focus on teaching through repetition, exercises, and building confidence through progressive mastery.`

    console.log("[v0] Generating course structure for:", topic)

    const { object: courseData } = await generateObject({
      model: "openai/gpt-4o",
      schema: courseSchema,
      prompt,
      maxOutputTokens: 16000,
    })

    console.log("[v0] Course structure generated, saving to database")

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        user_id: user.id,
        title: courseData.title,
        description: courseData.description,
        topic,
        duration_weeks: 8,
        difficulty_level: courseData.difficultyLevel,
      })
      .select()
      .single()

    if (courseError) {
      console.error("[v0] Error creating course:", courseError)
      throw courseError
    }

    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const moduleData = courseData.modules[moduleIndex]

      const { data: module, error: moduleError } = await supabase
        .from("modules")
        .insert({
          course_id: course.id,
          title: moduleData.title,
          description: moduleData.description,
          order_index: moduleIndex,
        })
        .select()
        .single()

      if (moduleError) {
        console.error("[v0] Error creating module:", moduleError)
        throw moduleError
      }

      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex]

        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            module_id: module.id,
            title: lessonData.title,
            content: lessonData.content,
            order_index: lessonIndex,
            estimated_duration_minutes: lessonData.estimatedDuration,
          })
          .select()
          .single()

        if (lessonError) {
          console.error("[v0] Error creating lesson:", lessonError)
          throw lessonError
        }

        const { error: quizError } = await supabase.from("quizzes").insert({
          lesson_id: lesson.id,
          title: lessonData.quiz.title,
          questions: lessonData.quiz.questions,
          passing_score: 70,
        })

        if (quizError) {
          console.error("[v0] Error creating quiz:", quizError)
          throw quizError
        }

        const { error: exerciseError } = await supabase.from("exercises").insert({
          lesson_id: lesson.id,
          title: lessonData.exercise.title,
          description: lessonData.exercise.description,
          instructions: lessonData.exercise,
          solution_template: lessonData.exercise.starterCode,
        })

        if (exerciseError) {
          console.error("[v0] Error creating exercise:", exerciseError)
          throw exerciseError
        }
      }

      const { error: moduleTestError } = await supabase.from("quizzes").insert({
        module_id: module.id,
        title: moduleData.moduleTest.title,
        questions: moduleData.moduleTest.questions,
        passing_score: 70,
      })

      if (moduleTestError) {
        console.error("[v0] Error creating module test:", moduleTestError)
        throw moduleTestError
      }

      const { error: moduleProjectError } = await supabase.from("exercises").insert({
        module_id: module.id,
        title: moduleData.moduleProject.title,
        description: moduleData.moduleProject.description,
        instructions: moduleData.moduleProject,
      })

      if (moduleProjectError) {
        console.error("[v0] Error creating module project:", moduleProjectError)
        throw moduleProjectError
      }
    }

    console.log("[v0] Course saved successfully:", course.id)

    return Response.json({
      success: true,
      courseId: course.id,
      course: courseData,
    })
  } catch (error: any) {
    console.error("[v0] Error generating course:", error)
    return Response.json({ error: error.message || "Failed to generate course" }, { status: 500 })
  }
}
