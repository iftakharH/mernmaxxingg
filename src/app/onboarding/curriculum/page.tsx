'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, BookOpen, Target, Sparkles, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/marketing/Logo'

interface CurriculumLesson {
  id: string
  title: string
  description: string
  type: 'reading' | 'video' | 'coding' | 'quiz' | 'project'
  estimatedTime: number
  order: number
  resources?: string[]
}

interface CurriculumTopic {
  id: string
  title: string
  description: string
  lessons: CurriculumLesson[]
  order: number
}

interface CurriculumLanguage {
  id: string
  name: string
  description: string
  topics: CurriculumTopic[]
  order: number
}

interface GeneratedCurriculum {
  languages: CurriculumLanguage[]
  totalEstimatedHours: number
  weeklySchedule: {
    week: number
    focus: string
    hours: number
    topics: string[]
  }[]
}

interface CurriculumData {
  curriculum: GeneratedCurriculum | null
  onboardingCompleted: boolean
  questionnaireCompleted: boolean
  isLoading: boolean
  error: string | null
}

function getLanguageAbbrev(name: string) {
  const map: Record<string, string> = {
    'JavaScript': 'JS', 'TypeScript': 'TS', 'React': 'React',
    'Next.js': 'NX', 'Node.js': 'Node', 'Express.js': 'Exp',
    'MongoDB': 'DB', 'Prisma ORM': 'Pri', 'Tailwind CSS': 'TW',
  }
  for (const [key, val] of Object.entries(map)) {
    if (name.includes(key)) return val
  }
  return name.slice(0, 3).toUpperCase()
}

export default function CurriculumPreviewPage() {
  const router = useRouter()
  const [data, setData] = useState<CurriculumData>({
    curriculum: null,
    onboardingCompleted: false,
    questionnaireCompleted: false,
    isLoading: true,
    error: null,
  })
  const [isStarting, setIsStarting] = useState(false)
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(new Set())

  useEffect(() => {
    let isActive = true

    const loadCurriculum = async () => {
      try {
        const response = await fetch('/api/onboarding/curriculum')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch curriculum')
        }
        const result = await response.json()
        if (!isActive) return
        setData({
          curriculum: result.curriculum,
          onboardingCompleted: Boolean(result.onboardingCompleted),
          questionnaireCompleted: Boolean(result.questionnaireCompleted),
          isLoading: false,
          error: null,
        })
      } catch {
        if (!isActive) return
        setData({
          curriculum: null,
          onboardingCompleted: false,
          questionnaireCompleted: false,
          isLoading: false,
          error: 'Failed to load curriculum',
        })
      }
    }

    void loadCurriculum()

    return () => {
      isActive = false
    }
  }, [router])

  const handleStartLearning = async () => {
    if (data.onboardingCompleted) {
      router.push('/dashboard')
      return
    }

    setIsStarting(true)
    try {
      const response = await fetch('/api/onboarding/curriculum', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to start')
      toast.success('Welcome to MERNMaxxingg! Your learning journey begins now.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Failed to start learning')
    } finally {
      setIsStarting(false)
    }
  }

  const toggleLanguage = (languageId: string) => {
    setExpandedLanguages(prev => {
      const next = new Set(prev)
      if (next.has(languageId)) {
        next.delete(languageId)
      } else {
        next.add(languageId)
      }
      return next
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getTotalLessons = (curriculum: GeneratedCurriculum) => {
    return curriculum.languages.reduce((acc, lang) =>
      acc + lang.topics.reduce((tAcc, topic) => tAcc + topic.lessons.length, 0), 0)
  }

  const getTotalTopics = (curriculum: GeneratedCurriculum) => {
    return curriculum.languages.reduce((acc, lang) => acc + lang.topics.length, 0)
  }

  if (data.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="border-b border-border px-6 py-4">
          <div className="max-w-5xl mx-auto"><Logo size="sm" /></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--primary)]/10 mb-4">
              <Loader2 className="w-7 h-7 text-[var(--primary)] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Generating Your Curriculum</h2>
            <p className="text-muted-foreground mt-1 text-sm">AI is creating your personalized learning path...</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.error || !data.curriculum) {
    if (!data.questionnaireCompleted && !data.error) {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <div className="border-b border-border px-6 py-4">
            <div className="max-w-md mx-auto"><Logo size="sm" /></div>
          </div>
          <div className="flex-1 flex items-center justify-center px-6">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2">Complete questionnaire first</h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Tell us about your goals and schedule, then we will generate your personalized curriculum.
                  </p>
                  <Link href="/onboarding/questionnaire">
                    <Button className="w-full">Go to Questionnaire</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (!data.curriculum && data.questionnaireCompleted && !data.error) {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <div className="border-b border-border px-6 py-4">
            <div className="max-w-md mx-auto"><Logo size="sm" /></div>
          </div>
          <div className="flex-1 flex items-center justify-center px-6">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--primary)]/10 mb-4">
                    <Sparkles className="w-7 h-7 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Generate your curriculum</h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Your profile is saved. Generate your AI learning path to start the platform setup.
                  </p>
                  <Button onClick={handleStartLearning} className="w-full" disabled={isStarting}>
                    {isStarting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Curriculum
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="border-b border-border px-6 py-4">
          <div className="max-w-md mx-auto"><Logo size="sm" /></div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-2">Unable to Load Curriculum</h2>
                <p className="text-muted-foreground mb-6 text-sm">{data.error || 'No curriculum found'}</p>
                <Button onClick={() => window.location.reload()} className="w-full">Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const curriculum = data.curriculum
  if (!curriculum) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-sm text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            <span>AI-Generated</span>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Your Personalized Curriculum</h1>
            <p className="text-muted-foreground text-sm">Generated by AI based on your profile and goals</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, value: curriculum.languages.length, label: 'Technologies', color: 'text-[var(--primary)]' },
              { icon: Target, value: getTotalTopics(curriculum), label: 'Topics', color: 'text-green-600' },
              { icon: BookOpen, value: getTotalLessons(curriculum), label: 'Lessons', color: 'text-blue-600' },
              { icon: Clock, value: `${curriculum.totalEstimatedHours}h`, label: 'Total Hours', color: 'text-[var(--primary)]' },
            ].map(({ icon: Icon, value, label, color }) => (
              <Card key={label} className="border-border">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-[var(--primary)]/10`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-[var(--primary)]" />
                Weekly Learning Schedule
              </CardTitle>
              <CardDescription>{curriculum.weeklySchedule.length} weeks to mastery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {curriculum.weeklySchedule.map((week) => (
                  <div key={week.week} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm shrink-0">
                      W{week.week}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{week.focus}</p>
                      <p className="text-xs text-muted-foreground truncate">{week.topics.join(' · ')}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{week.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Curriculum Breakdown</h2>

            {curriculum.languages.map((language) => {
              const isExpanded = expandedLanguages.has(language.id)
              const totalLessons = language.topics.reduce((acc, topic) => acc + topic.lessons.length, 0)
              const totalTime = language.topics.reduce((acc, topic) =>
                acc + topic.lessons.reduce((lAcc, lesson) => lAcc + lesson.estimatedTime, 0), 0)

              return (
                <Card key={language.id} className="border-border overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-secondary/30 transition-colors py-4"
                    onClick={() => toggleLanguage(language.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm shrink-0">
                          {getLanguageAbbrev(language.name)}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base">{language.name}</CardTitle>
                          <CardDescription className="text-xs">{language.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <BookOpen className="h-3 w-3" />
                          {totalLessons}
                        </Badge>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {formatTime(totalTime)}
                        </Badge>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Target className="h-3 w-3" />
                          {language.topics.length}
                        </Badge>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {language.topics.map((topic) => (
                          <div key={topic.id} className="border-t border-border pt-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm">{topic.title}</h4>
                                <p className="text-xs text-muted-foreground">{topic.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                <Badge variant="outline" className="text-xs">{topic.lessons.length} lessons</Badge>
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(topic.lessons.reduce((acc, l) => acc + l.estimatedTime, 0))}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-1.5 ml-1">
                              {topic.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-md bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-3.5 w-3.5 text-[var(--primary)]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-xs">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0 capitalize">
                                    {lesson.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatTime(lesson.estimatedTime)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Card className="border-[var(--primary)]/30 bg-[var(--primary)]/5">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Ready to start your MERN journey?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
                  Your personalized curriculum is ready. Begin with Week 1 and track your progress
                  with assignments, grades, and streaks.
                </p>
                <Button
                  onClick={handleStartLearning}
                  size="lg"
                  className="gap-2 px-8"
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      {data.onboardingCompleted ? 'Continue to Dashboard' : 'Start Learning Now'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
