import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCurriculum, getDefaultCurriculum, QuestionnaireData, GeneratedCurriculum } from '@/lib/ai'
import { AssignmentType, Prisma } from '@/generated/prisma/client'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get questionnaire data
    const questionnaire = await prisma.questionnaireResponse.findUnique({
      where: { userId: session.user.id },
    })

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not completed' },
        { status: 400 }
      )
    }

    const questionnaireData: QuestionnaireData = {
      experienceLevel: questionnaire.experienceLevel,
      goals: questionnaire.goals,
      timeCommitment: questionnaire.timeCommitment,
      preferredLanguages: questionnaire.preferredLanguages,
      learningStyle: questionnaire.learningStyle,
      interests: questionnaire.interests,
    }

    // Generate curriculum using AI
    let curriculum: GeneratedCurriculum
    try {
      curriculum = await generateCurriculum(questionnaireData)
    } catch (aiError) {
      console.error('AI generation failed, using default:', aiError)
      curriculum = getDefaultCurriculum()
    }

    const topics = curriculum.languages.flatMap(language => language.topics)
    const lessons = topics.flatMap(topic => topic.lessons)

    // Save curriculum to database
    await prisma.curriculum.upsert({
      where: { userId: session.user.id },
      update: {
        generatedByAI: true,
        version: { increment: 1 },
        languages: JSON.parse(JSON.stringify(curriculum.languages)) as Prisma.JsonArray,
        topics: JSON.parse(JSON.stringify(topics)) as Prisma.JsonArray,
        lessons: JSON.parse(JSON.stringify(lessons)) as Prisma.JsonArray,
        totalEstimatedHours: curriculum.totalEstimatedHours,
        weeklySchedule: JSON.parse(JSON.stringify(curriculum.weeklySchedule)) as Prisma.JsonArray,
      },
      create: {
        userId: session.user.id,
        generatedByAI: true,
        version: 1,
        languages: JSON.parse(JSON.stringify(curriculum.languages)) as Prisma.JsonArray,
        topics: JSON.parse(JSON.stringify(topics)) as Prisma.JsonArray,
        lessons: JSON.parse(JSON.stringify(lessons)) as Prisma.JsonArray,
        totalEstimatedHours: curriculum.totalEstimatedHours,
        weeklySchedule: JSON.parse(JSON.stringify(curriculum.weeklySchedule)) as Prisma.JsonArray,
      },
    })

    // Create initial assignments from curriculum
    await createInitialAssignments(session.user.id, curriculum)

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    })

    return NextResponse.json({ curriculum })
  } catch (error) {
    console.error('Curriculum generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate curriculum' },
      { status: 500 }
    )
  }
}

async function createInitialAssignments(userId: string, curriculum: GeneratedCurriculum) {
  const existingAssignments = await prisma.assignment.findMany({
    where: { userId },
    select: { lessonId: true },
  })
  const existingLessonIds = new Set(existingAssignments.map(assignment => assignment.lessonId))

  const assignments: Array<{
    userId: string
    title: string
    description: string | null
    type: AssignmentType
    dueDate: Date
    language: string
    topic: string
    lessonId: string
    order: number
  }> = []
  let order = 1

  for (const language of curriculum.languages) {
    for (const topic of language.topics) {
      for (const lesson of topic.lessons) {
        // Create assignments for coding lessons and projects
        if (
          (lesson.type === 'coding' || lesson.type === 'project' || lesson.type === 'quiz') &&
          !existingLessonIds.has(lesson.id)
        ) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + order * 2) // Stagger due dates

          let assignmentType: AssignmentType = 'CODING_CHALLENGE'
          if (lesson.type === 'project') assignmentType = 'PROJECT'
          else if (lesson.type === 'quiz') assignmentType = 'QUIZ'

          assignments.push({
            userId,
            title: lesson.title,
            description: lesson.description,
            type: assignmentType,
            dueDate,
            language: language.name,
            topic: topic.title,
            lessonId: lesson.id,
            order: order++,
          })

          existingLessonIds.add(lesson.id)
        }
      }
    }
  }

  if (assignments.length > 0) {
    await prisma.assignment.createMany({
      data: assignments,
    })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        curriculum: true,
        questionnaire: {
          select: { id: true },
        },
      },
    })

    const stored = user?.curriculum
    const curriculum = stored
      ? {
          languages: (stored.languages as unknown as GeneratedCurriculum['languages']) ?? [],
          totalEstimatedHours: stored.totalEstimatedHours ?? 0,
          weeklySchedule:
            (stored.weeklySchedule as unknown as GeneratedCurriculum['weeklySchedule']) ?? [],
        }
      : null

    return NextResponse.json({
      curriculum,
      onboardingCompleted: user?.onboardingCompleted ?? false,
      questionnaireCompleted: Boolean(user?.questionnaire),
    })
  } catch (error) {
    console.error('Get curriculum error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}