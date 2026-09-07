'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  CheckCircle2,
  Award,
  Flame,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FolderKanban,
  BarChart3,
  User,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

interface DashboardStats {
  assignmentsDue: number
  assignmentsSubmitted: number
  averageGrade: number
  currentStreak: number
  longestStreak: number
  totalProjects: number
  completedLessons: number
  totalLessons: number
}

interface ProgressData {
  date: string
  lessonsCompleted: number
  hoursStudied: number
}

interface GradeData {
  assignment: string
  grade: number
  maxGrade: number
}

interface LanguageProgress {
  language: string
  progress: number
  color: string
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [gradeData, setGradeData] = useState<GradeData[]>([])
  const [languageProgress, setLanguageProgress] = useState<LanguageProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      setStats(data.stats)
      setProgressData(data.progressData)
      setGradeData(data.gradeData)
      setLanguageProgress(data.languageProgress)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-8 bg-secondary rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse"><CardContent className="pt-6 h-64" /></Card>
          <Card className="animate-pulse"><CardContent className="pt-6 h-64" /></Card>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  const completionRate = stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your learning progress overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            This Week
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assignments Due"
          value={stats.assignmentsDue}
          icon={<BookOpen className="h-5 w-5" />}
          colorClass="bg-blue-500/10 text-blue-600"
          trend={{ value: 2, label: 'due this week' }}
        />
        <StatCard
          title="Submitted"
          value={stats.assignmentsSubmitted}
          icon={<CheckCircle2 className="h-5 w-5" />}
          colorClass="bg-green-500/10 text-green-600"
          trend={{ value: 5, label: 'this month', positive: true }}
        />
        <StatCard
          title="Average Grade"
          value={`${stats.averageGrade}%`}
          icon={<Award className="h-5 w-5" />}
          colorClass="bg-purple-500/10 text-purple-600"
          trend={{ value: 3, label: 'improvement', positive: true }}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={<Flame className="h-5 w-5" />}
          colorClass="bg-orange-500/10 text-orange-600"
          trend={{ value: stats.longestStreak, label: `best: ${stats.longestStreak} days` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Lessons completed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64" style={{ minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData.length > 0 ? progressData : generateMockProgressData()}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => value.split('-').slice(1).join('-')}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lessonsCompleted"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Recent assignment grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64" style={{ minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData.length > 0 ? gradeData : generateMockGradeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="assignment"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Bar dataKey="grade" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {gradeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Language Progress</CardTitle>
            <CardDescription>Your progress across each technology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(languageProgress.length > 0 ? languageProgress : generateMockLanguageProgress()).map((lang) => (
                <div key={lang.language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${lang.color}20` }}>
                        <span style={{ color: lang.color }} className="font-bold text-sm">{lang.language.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{lang.language}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: lang.color }}>{lang.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${lang.progress}%`, backgroundColor: lang.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Activity Streak
            </CardTitle>
            <CardDescription>Current: {stats.currentStreak} days &bull; Best: {stats.longestStreak} days</CardDescription>
          </CardHeader>
          <CardContent>
            <StreakCalendar currentStreak={stats.currentStreak} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/assignments">
              <Button variant="outline" className="w-full justify-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">View Assignments</p>
                  <p className="text-xs text-muted-foreground">{stats.assignmentsDue} due, {stats.assignmentsSubmitted} submitted</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="w-full justify-start gap-3">
                <FolderKanban className="h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">My Projects</p>
                  <p className="text-xs text-muted-foreground">{stats.totalProjects} projects in portfolio</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/progress">
              <Button variant="outline" className="w-full justify-start gap-3">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">View Progress</p>
                  <p className="text-xs text-muted-foreground">{completionRate}% curriculum complete</p>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start gap-3">
                <User className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Profile & Settings</p>
                  <p className="text-xs text-muted-foreground">Manage account & preferences</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  colorClass,
  trend
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  colorClass: string
  trend?: { value: number | string; label: string; positive?: boolean }
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            {trend.positive !== false ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              {trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StreakCalendar({ currentStreak }: { currentStreak: number }) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const startDay = startOfMonth.getDay()

  const weeks = []
  let week = []

  for (let i = 0; i < startDay; i++) {
    week.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  while (week.length > 0 && week.length < 7) {
    week.push(null)
  }
  if (week.length > 0) weeks.push(week)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                  day === null
                    ? 'bg-transparent'
                    : day === today.getDate()
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                      : day <= today.getDate() && day > today.getDate() - currentStreak
                        ? 'bg-orange-500/10 text-orange-600 font-medium'
                        : day <= today.getDate()
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-secondary text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Streak</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--primary)]" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}

function generateMockProgressData(): ProgressData[] {
  const data = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i * 7)
    data.push({
      date: date.toISOString().split('T')[0],
      lessonsCompleted: Math.floor(Math.random() * 8) + 2,
      hoursStudied: Math.floor(Math.random() * 10) + 5,
    })
  }
  return data
}

function generateMockGradeData(): GradeData[] {
  return [
    { assignment: 'JS Fundamentals Quiz', grade: 92, maxGrade: 100 },
    { assignment: 'React Components', grade: 87, maxGrade: 100 },
    { assignment: 'TypeScript Basics', grade: 95, maxGrade: 100 },
    { assignment: 'Node.js API', grade: 89, maxGrade: 100 },
    { assignment: 'MongoDB Queries', grade: 91, maxGrade: 100 },
    { assignment: 'Express Middleware', grade: 85, maxGrade: 100 },
  ]
}

function generateMockLanguageProgress(): LanguageProgress[] {
  return [
    { language: 'JavaScript', progress: 85, color: '#f7df1e' },
    { language: 'TypeScript', progress: 72, color: '#3178c6' },
    { language: 'React', progress: 68, color: '#61dafb' },
    { language: 'Node.js', progress: 55, color: '#68a063' },
    { language: 'MongoDB', progress: 48, color: '#47a248' },
    { language: 'Next.js', progress: 35, color: '#000000' },
  ]
}
