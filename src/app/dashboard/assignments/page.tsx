'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string
  status: AssignmentStatus
  dueDate: string | null
  grade: number | null
  language: string
  topic: string
}

const statusLabels: Record<AssignmentStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  SUBMITTED: 'Submitted',
  GRADED: 'Graded',
}

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return 'No due date'
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`
  if (diffDays === 0) return 'Due today'
  return `Due in ${diffDays}d`
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch('/api/assignments')
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch assignments')
      }
      const data = await response.json()
      setAssignments(data.assignments ?? [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const updateStatus = async (id: string, status: AssignmentStatus) => {
    setUpdatingId(id)
    try {
      const response = await fetch('/api/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!response.ok) throw new Error('Failed to update assignment')
      const data = await response.json()
      setAssignments((prev) => prev.map((a) => (a.id === id ? data.assignment : a)))
      toast.success(`Assignment marked as ${statusLabels[status].toLowerCase()}`)
    } catch {
      toast.error('Failed to update assignment')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
        <p className="text-muted-foreground mt-1">
          Complete your weekly tasks and keep your learning streak active.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your assignments</CardTitle>
          <CardDescription>
            Generated from your personalized curriculum. Start a task, then submit it when done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No assignments yet. Generate your curriculum to get personalized tasks.
              </p>
              <Link href="/onboarding/questionnaire">
                <Button variant="outline">Set up my learning plan</Button>
              </Link>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {assignment.language} &bull; {assignment.topic} &bull; {formatDueDate(assignment.dueDate)}
                    {assignment.status === 'GRADED' && assignment.grade !== null
                      ? ` · Grade: ${assignment.grade}%`
                      : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{assignment.type.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline">{statusLabels[assignment.status]}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {assignment.status === 'NOT_STARTED' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(assignment.id, 'IN_PROGRESS')}
                      disabled={updatingId === assignment.id}
                    >
                      Start
                    </Button>
                  )}
                  {assignment.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(assignment.id, 'SUBMITTED')}
                      disabled={updatingId === assignment.id}
                    >
                      Submit
                    </Button>
                  )}
                  {updatingId === assignment.id && (
                    <Loader2 className="h-4 w-4 animate-spin self-center text-[var(--primary)]" />
                  )}
                </div>
              </div>
            ))
          )}
          <div className="pt-2">
            <Link href="/onboarding/questionnaire">
              <Button variant="outline">Refine my learning preferences</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
