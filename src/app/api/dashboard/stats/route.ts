import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

interface LanguageTopic {
  id: string
  name: string
  lessons: LanguageLesson[]
}

interface LanguageLesson {
  id: string
  title: string
  completed?: boolean
}

interface LanguageData {
  name: string
  topics: LanguageTopic[]
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

    const userId = session.user.id

    // Fetch user with relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        projects: true,
        progress: true,
        streaks: true,
        curriculum: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const assignmentsDue = user.assignments.filter(a =>
      a.dueDate && a.dueDate >= now && a.dueDate <= endOfWeek && a.status !== 'GRADED'
    ).length

    const assignmentsSubmitted = user.assignments.filter(a =>
      a.status === 'SUBMITTED' || a.status === 'GRADED'
    ).length

    const gradedAssignments = user.assignments.filter(a => a.status === 'GRADED' && a.grade !== null)
    const averageGrade = gradedAssignments.length > 0
      ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length)
      : 0

    const completedLessons = user.progress.filter(p => p.status === 'COMPLETED').length
    const totalLessons = parseLessons(user.curriculum?.lessons).length

    // Generate progress data (last 14 weeks)
    const progressData = []
    for (let i = 13; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - i * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const lessonsThisWeek = user.progress.filter(p =>
        p.completedAt && p.completedAt >= weekStart && p.completedAt <= weekEnd
      ).length

      progressData.push({
        date: weekStart.toISOString().split('T')[0],
        lessonsCompleted: lessonsThisWeek,
        hoursStudied: lessonsThisWeek * 2, // Estimate
      })
    }

    // Grade data (last 6 graded assignments)
    const gradeData = gradedAssignments
      .slice(-6)
      .map(a => ({
        assignment: a.title,
        grade: a.grade || 0,
        maxGrade: 100,
      }))

    // Language progress from curriculum
    const curriculumLanguages = parseLanguages(user.curriculum?.languages)
    const languageProgress = curriculumLanguages.length > 0
      ? curriculumLanguages.map((lang: LanguageData) => {
          const langTopics = lang.topics || []
          const langLessons = langTopics.flatMap((t: LanguageTopic) => t.lessons || [])
          const completedLessons = langLessons.filter((l: LanguageLesson) =>
            user.progress.some(p => p.lessonId === l.id && p.status === 'COMPLETED')
          ).length
          const totalLessons = langLessons.length
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

          return {
            language: lang.name,
            progress,
            color: getLanguageColor(lang.name),
          }
        })
      : []

    const stats = {
      assignmentsDue,
      assignmentsSubmitted,
      averageGrade,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalProjects: user.projects.length,
      completedLessons,
      totalLessons,
    }

    function parseLessons(value: Prisma.JsonValue | null | undefined): LanguageLesson[] {
      if (!Array.isArray(value)) {
        return []
      }

      const lessons: LanguageLesson[] = []
      for (const item of value) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          continue
        }
        const lesson = item as Record<string, unknown>
        if (typeof lesson.id === 'string' && typeof lesson.title === 'string') {
          lessons.push({
            id: lesson.id as string,
            title: lesson.title as string,
            completed: lesson.completed as boolean | undefined,
          })
        }
      }
      return lessons
    }

    function parseLanguages(value: Prisma.JsonValue | null | undefined): LanguageData[] {
      if (!Array.isArray(value)) {
        return []
      }

      return value
        .filter((item): item is Prisma.JsonObject => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
        .map((item) => {
          const name = typeof item.name === 'string' ? item.name : 'Technology'
          const rawTopics = Array.isArray(item.topics) ? item.topics : []

          const topics: LanguageTopic[] = rawTopics
            .filter((topic): topic is Prisma.JsonObject => Boolean(topic && typeof topic === 'object' && !Array.isArray(topic)))
            .map((topic) => {
              const topicId = typeof topic.id === 'string' ? topic.id : crypto.randomUUID()
              const topicName = typeof topic.name === 'string'
                ? topic.name
                : typeof topic.title === 'string'
                  ? topic.title
                  : 'Topic'
              const rawLessons = Array.isArray(topic.lessons) ? topic.lessons : []
              const lessons: LanguageLesson[] = rawLessons
                .filter((lesson): lesson is Prisma.JsonObject => Boolean(lesson && typeof lesson === 'object' && !Array.isArray(lesson)))
                .map((lesson) => {
                  const lessonObj = lesson as Record<string, unknown>
                  return {
                    id: typeof lessonObj.id === 'string' ? lessonObj.id : crypto.randomUUID(),
                    title: typeof lessonObj.title === 'string' ? lessonObj.title : 'Lesson',
                    completed: false,
                  }
                })

              return {
                id: topicId,
                name: topicName,
                lessons,
              }
            })

          return { name, topics }
        })
    }

    return NextResponse.json({
      stats,
      progressData,
      gradeData,
      languageProgress,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

function getLanguageColor(name: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'React': '#61dafb',
    'Next.js': '#000000',
    'Node.js': '#68a063',
    'Express.js': '#000000',
    'MongoDB': '#47a248',
    'Prisma': '#2d3748',
    'Tailwind CSS': '#06b6d4',
    'Docker': '#2496ed',
    'GraphQL': '#e10098',
    'Testing': '#c21325',
  }
  return colors[name] || '#6366f1'
}