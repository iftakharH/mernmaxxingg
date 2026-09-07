'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LanguageProgress {
  language: string
  progress: number
  color: string
}

export default function ProgressPage() {
  const [areas, setAreas] = useState<LanguageProgress[]>([])
  const [completionRate, setCompletionRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch progress')
      }
      const data = await response.json()
      setAreas(data.languageProgress ?? [])
      const total = data.stats?.totalLessons ?? 0
      const completed = data.stats?.completedLessons ?? 0
      setCompletionRate(total > 0 ? Math.round((completed / total) * 100) : 0)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load progress')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Progress</h2>
        <p className="text-muted-foreground mt-1">
          Track curriculum completion by technology area.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning progress by topic</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading…' : `Overall curriculum completion: ${completionRate}%`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No curriculum data yet. Complete onboarding to generate your personalized plan.
            </p>
          ) : (
            areas.map((area) => (
              <div key={area.language} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{area.language}</span>
                  <span className="text-muted-foreground">{area.progress}%</span>
                </div>
                <Progress value={area.progress} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
