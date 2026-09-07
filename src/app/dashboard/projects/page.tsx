'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ExternalLink, Code2 } from 'lucide-react'
import { toast } from 'sonner'

interface Project {
  id: string
  title: string
  description: string | null
  githubUrl: string | null
  liveUrl: string | null
  techStack: string[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', githubUrl: '', liveUrl: '', techStack: '' })

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data.projects ?? [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setIsCreating(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          githubUrl: form.githubUrl || null,
          liveUrl: form.liveUrl || null,
          techStack: form.techStack
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })
      if (!response.ok) throw new Error('Failed to create project')
      const data = await response.json()
      setProjects((prev) => [data.project, ...prev])
      setForm({ title: '', description: '', githubUrl: '', liveUrl: '', techStack: '' })
      setShowForm(false)
      toast.success('Project added to your portfolio')
    } catch {
      toast.error('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground mt-1">
            Build portfolio-ready projects and publish your best work.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Create new project entry'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New project</CardTitle>
            <CardDescription>Add a portfolio project with links and tech stack.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Full-stack task tracker"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Includes auth, CRUD, progress tracking, and deployment."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/you/project"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    placeholder="https://your-project.vercel.app"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="techStack">Tech stack (comma separated)</Label>
                <Input
                  id="techStack"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save project
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your project workspace</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'} in your portfolio.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-border p-4">
              <p className="font-medium text-foreground">Capstone: Full-stack task tracker</p>
              <p className="text-sm text-muted-foreground mt-1">
                Includes auth, CRUD, progress tracking, and deployment. Create your first project entry above to
                start your portfolio.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{project.title}</p>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                )}
                {project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                    >
                      <Code2 className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Live demo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
