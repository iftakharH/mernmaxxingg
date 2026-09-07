'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/marketing/Logo'

type QuestionnaireStep =
  | 'experience'
  | 'goals'
  | 'time-commitment'
  | 'languages'
  | 'learning-style'
  | 'interests'
  | 'complete'

interface QuestionnaireData {
  experienceLevel: string
  goals: string[]
  timeCommitment: number
  preferredLanguages: string[]
  learningStyle: string
  interests: string[]
}

const steps: { id: QuestionnaireStep; title: string; description: string }[] = [
  { id: 'experience', title: 'Experience', description: 'What\'s your current coding experience?' },
  { id: 'goals', title: 'Goals', description: 'What do you want to achieve?' },
  { id: 'time-commitment', title: 'Time', description: 'How much time can you dedicate?' },
  { id: 'languages', title: 'Technologies', description: 'Which technologies interest you most?' },
  { id: 'learning-style', title: 'Learning Style', description: 'How do you learn best?' },
  { id: 'interests', title: 'Interests', description: 'Any specific areas you want to focus on?' },
]

const experienceOptions = [
  { value: 'BEGINNER', label: 'Beginner', description: 'New to programming or MERN stack' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience with JavaScript/React' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Comfortable with full-stack development' },
]

const goalOptions = [
  'Get a job as a MERN stack developer',
  'Build my own SaaS product',
  'Freelance as a full-stack developer',
  'Contribute to open source',
  'Switch careers into tech',
  'Learn for personal projects',
]

const languageOptions = [
  { value: 'javascript', label: 'JavaScript (ES6+)' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'express', label: 'Express.js' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'prisma', label: 'Prisma ORM' },
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'docker', label: 'Docker' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'testing', label: 'Testing (Jest, Cypress)' },
]

const learningStyleOptions = [
  { value: 'VISUAL', label: 'Visual', description: 'Videos, diagrams, interactive demos' },
  { value: 'HANDS_ON', label: 'Hands-on', description: 'Coding exercises, projects, practice' },
  { value: 'READING', label: 'Reading', description: 'Documentation, articles, books' },
  { value: 'MIXED', label: 'Mixed', description: 'Combination of all approaches' },
]

const interestOptions = [
  'Authentication & Authorization',
  'Real-time applications (WebSockets)',
  'API Design & REST/GraphQL',
  'Database Design & Optimization',
  'DevOps & Deployment (CI/CD, Docker)',
  'Testing (Unit, Integration, E2E)',
  'Performance Optimization',
  'Security Best Practices',
  'State Management (Redux, Zustand, Context)',
  'UI/UX Design & Component Libraries',
  'Serverless Architecture',
  'Microservices',
]

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<QuestionnaireData>({
    experienceLevel: '',
    goals: [],
    timeCommitment: 10,
    preferredLanguages: [],
    learningStyle: '',
    interests: [],
  })

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const handleNext = async () => {
    if (!validateStep()) return

    if (isLastStep) {
      await submitQuestionnaire()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const validateStep = (): boolean => {
    const step = currentStep.id

    switch (step) {
      case 'experience':
        if (!data.experienceLevel) {
          toast.error('Please select your experience level')
          return false
        }
        break
      case 'goals':
        if (data.goals.length === 0) {
          toast.error('Please select at least one goal')
          return false
        }
        break
      case 'time-commitment':
        if (data.timeCommitment < 1) {
          toast.error('Please enter a valid time commitment')
          return false
        }
        break
      case 'languages':
        if (data.preferredLanguages.length < 3) {
          toast.error('Please select at least 3 technologies')
          return false
        }
        break
      case 'learning-style':
        if (!data.learningStyle) {
          toast.error('Please select your learning style')
          return false
        }
        break
      case 'interests':
        break
    }
    return true
  }

  const submitQuestionnaire = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/onboarding/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save questionnaire')
      }

      toast.success('Profile saved! Review your personalized curriculum next.')
      router.push('/onboarding/curriculum')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    setData(prev => ({
      ...prev,
      [currentStep.id === 'goals' ? 'goals' :
       currentStep.id === 'languages' ? 'preferredLanguages' : 'interests']: array.includes(item)
        ? array.filter(i => i !== item)
        : [...array, item]
    }))
  }

  const handleInputChange = (
    field: keyof QuestionnaireData,
    value: QuestionnaireData[keyof QuestionnaireData]
  ) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const selectedClass = 'border-[var(--primary)] bg-[var(--primary)]/5'
  const unselectedClass = 'border-border hover:border-[var(--primary)]/50'

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'experience':
        return (
          <div className="space-y-4">
            {experienceOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.experienceLevel === option.value ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  value={option.value}
                  checked={data.experienceLevel === option.value}
                  onChange={() => handleInputChange('experienceLevel', option.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  data.experienceLevel === option.value ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-muted-foreground'
                }`}>
                  {data.experienceLevel === option.value && (
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary-foreground)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-3">
            {goalOptions.map((goal) => (
              <label
                key={goal}
                className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.goals.includes(goal) ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.goals.includes(goal)}
                  onChange={() => toggleArrayItem(data.goals, goal)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 ${
                  data.goals.includes(goal) ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-muted-foreground'
                }`}>
                  {data.goals.includes(goal) && (
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary-foreground)]" />
                  )}
                </div>
                <p className="text-foreground">{goal}</p>
              </label>
            ))}
          </div>
        )

      case 'time-commitment':
        return (
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Hours per week: {data.timeCommitment}h
              </Label>
              <Input
                type="range"
                min="1"
                max="40"
                value={data.timeCommitment}
                onChange={(e) => handleInputChange('timeCommitment', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleInputChange('timeCommitment', hours)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    data.timeCommitment === hours
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-secondary text-foreground hover:bg-accent'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              We&apos;ll create a schedule that fits your availability. Most students complete the program in 3-6 months.
            </p>
          </div>
        )

      case 'languages':
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select all that interest you (minimum 3)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languageOptions.map((lang) => (
                <label
                  key={lang.value}
                  className={`relative flex items-center justify-between gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    data.preferredLanguages.includes(lang.value) ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.preferredLanguages.includes(lang.value)}
                    onChange={() => toggleArrayItem(data.preferredLanguages, lang.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-foreground">{lang.label}</span>
                  {data.preferredLanguages.includes(lang.value) && (
                    <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  )}
                </label>
              ))}
            </div>
            {data.preferredLanguages.length < 3 && (
              <p className="text-sm text-[var(--primary)]">Select at least 3 technologies</p>
            )}
          </div>
        )

      case 'learning-style':
        return (
          <div className="space-y-4">
            {learningStyleOptions.map((style) => (
              <label
                key={style.value}
                className={`relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  data.learningStyle === style.value ? selectedClass : unselectedClass
                }`}
              >
                <input
                  type="radio"
                  name="learningStyle"
                  value={style.value}
                  checked={data.learningStyle === style.value}
                  onChange={() => handleInputChange('learningStyle', style.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  data.learningStyle === style.value ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-muted-foreground'
                }`}>
                  {data.learningStyle === style.value && (
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary-foreground)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{style.label}</p>
                  <p className="text-sm text-muted-foreground">{style.description}</p>
                </div>
              </label>
            ))}
          </div>
        )

      case 'interests':
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select any specific areas you want to focus on (optional)</p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {interestOptions.map((interest) => (
                <label
                  key={interest}
                  className={`relative flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    data.interests.includes(interest) ? selectedClass : unselectedClass
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.interests.includes(interest)}
                    onChange={() => toggleArrayItem(data.interests, interest)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
                    data.interests.includes(interest) ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-muted-foreground'
                  }`}>
                    {data.interests.includes(interest) && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-[var(--primary-foreground)]" />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{interest}</p>
                </label>
              ))}
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/10 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">All set!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              We have everything we need to create your personalized MERN stack curriculum.
            </p>
            <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
              <div className="p-3 rounded-xl bg-secondary"><span className="text-xs text-muted-foreground block">Experience</span><span className="text-sm font-medium text-foreground">{data.experienceLevel}</span></div>
              <div className="p-3 rounded-xl bg-secondary"><span className="text-xs text-muted-foreground block">Goals</span><span className="text-sm font-medium text-foreground">{data.goals.length} selected</span></div>
              <div className="p-3 rounded-xl bg-secondary"><span className="text-xs text-muted-foreground block">Time</span><span className="text-sm font-medium text-foreground">{data.timeCommitment}h/week</span></div>
              <div className="p-3 rounded-xl bg-secondary"><span className="text-xs text-muted-foreground block">Technologies</span><span className="text-sm font-medium text-foreground">{data.preferredLanguages.length} selected</span></div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Skip for now
          </Link>
        </div>
      </div>

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Personalize Your Learning Path</h1>
            <p className="text-muted-foreground text-sm">Answer a few questions so we can create your custom curriculum</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all text-xs font-medium ${
                    index < currentStepIndex
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]'
                      : index === currentStepIndex
                      ? 'bg-background border-[var(--primary)] text-[var(--primary)]'
                      : 'bg-background border-border text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <p className={`mt-1 text-xs hidden sm:block ${
                    index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-3.5 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                      index < currentStepIndex ? 'bg-[var(--primary)]' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep || isLoading}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="gap-2"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Curriculum
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
