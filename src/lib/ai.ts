import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface QuestionnaireData {
  experienceLevel: string
  goals: string[]
  timeCommitment: number
  preferredLanguages: string[]
  learningStyle: string
  interests: string[]
}

export interface CurriculumLesson {
  id: string
  title: string
  description: string
  type: 'reading' | 'video' | 'coding' | 'quiz' | 'project'
  estimatedTime: number // minutes
  order: number
  resources?: string[]
}

export interface CurriculumTopic {
  id: string
  title: string
  description: string
  lessons: CurriculumLesson[]
  order: number
}

export interface CurriculumLanguage {
  id: string
  name: string
  description: string
  topics: CurriculumTopic[]
  order: number
}

export interface GeneratedCurriculum {
  languages: CurriculumLanguage[]
  totalEstimatedHours: number
  weeklySchedule: {
    week: number
    focus: string
    hours: number
    topics: string[]
  }[]
}

function buildPrompt(data: QuestionnaireData): string {
  const { experienceLevel, goals, timeCommitment, preferredLanguages, learningStyle, interests } = data
  
  return `You are an expert MERN stack curriculum designer. Create a personalized learning curriculum for a developer with the following profile:

**Experience Level:** ${experienceLevel}
**Goals:** ${goals.join(', ')}
**Time Commitment:** ${timeCommitment} hours per week
**Preferred Languages/Technologies:** ${preferredLanguages.join(', ')}
**Learning Style:** ${learningStyle}
**Specific Interests:** ${interests.join(', ')}

Create a comprehensive, structured curriculum that:
1. Covers the full MERN stack (MongoDB, Express.js, React, Node.js) plus TypeScript, Next.js, and modern tooling
2. Is tailored to their experience level (beginner/intermediate/advanced)
3. Fits within their weekly time commitment
4. Prioritizes their preferred languages and interests
5. Matches their learning style (visual, hands-on, reading, mixed)
6. Includes practical projects and assignments
7. Progresses logically from fundamentals to advanced topics

Return a JSON object with this exact structure:
{
  "languages": [
    {
      "id": "unique-id",
      "name": "Language/Technology Name",
      "description": "Brief description",
      "order": 1,
      "topics": [
        {
          "id": "unique-id",
          "title": "Topic Title",
          "description": "Topic description",
          "order": 1,
          "lessons": [
            {
              "id": "unique-id",
              "title": "Lesson Title",
              "description": "Lesson description",
              "type": "reading|video|coding|quiz|project",
              "estimatedTime": 30,
              "order": 1,
              "resources": ["resource-url-1", "resource-url-2"]
            }
          ]
        }
      ]
    }
  ],
  "totalEstimatedHours": 100,
  "weeklySchedule": [
    {
      "week": 1,
      "focus": "Focus area for this week",
      "hours": 10,
      "topics": ["Topic 1", "Topic 2"]
    }
  ]
}

Requirements:
- Generate 4-6 main languages/technologies (JavaScript/TypeScript, React, Node.js, MongoDB, Express, Next.js)
- Each language should have 3-5 topics
- Each topic should have 3-6 lessons
- Lesson types should vary (reading, video, coding, quiz, project)
- Total estimated hours should be realistic for their time commitment (e.g., 3-6 months)
- Weekly schedule should span 12-24 weeks
- Include practical project lessons
- Make it personalized to their goals and interests
- Return ONLY valid JSON, no markdown formatting`
}

export async function generateCurriculum(data: QuestionnaireData): Promise<GeneratedCurriculum> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = buildPrompt(data)
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  try {
    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const curriculum = JSON.parse(jsonMatch[0])
    return curriculum as GeneratedCurriculum
  } catch (error) {
    console.error('Failed to parse curriculum:', error)
    console.error('Raw response:', text)
    throw new Error('Failed to generate curriculum')
  }
}

export function getDefaultCurriculum(): GeneratedCurriculum {
  // Fallback curriculum in case AI fails
  return {
    languages: [
      {
        id: 'javascript-typescript',
        name: 'JavaScript & TypeScript',
        description: 'Modern JavaScript and TypeScript fundamentals',
        order: 1,
        topics: [
          {
            id: 'js-fundamentals',
            title: 'JavaScript Fundamentals',
            description: 'ES6+ features, async patterns, modules',
            order: 1,
            lessons: [
              { id: 'js-1', title: 'ES6+ Syntax & Features', description: 'Arrow functions, destructuring, spread operator', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'js-2', title: 'Async/Await & Promises', description: 'Handling asynchronous operations', type: 'coding', estimatedTime: 60, order: 2 },
              { id: 'js-3', title: 'Modules & Tooling', description: 'ES modules, bundlers, package managers', type: 'reading', estimatedTime: 30, order: 3 },
            ]
          },
          {
            id: 'typescript-basics',
            title: 'TypeScript Basics',
            description: 'Static typing for JavaScript',
            order: 2,
            lessons: [
              { id: 'ts-1', title: 'Types & Interfaces', description: 'Basic types, interfaces, type aliases', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'ts-2', title: 'Generics & Utility Types', description: 'Advanced TypeScript patterns', type: 'coding', estimatedTime: 60, order: 2 },
            ]
          }
        ]
      },
      {
        id: 'react',
        name: 'React',
        description: 'Building user interfaces with React',
        order: 2,
        topics: [
          {
            id: 'react-fundamentals',
            title: 'React Fundamentals',
            description: 'Components, props, state, hooks',
            order: 1,
            lessons: [
              { id: 'react-1', title: 'Components & JSX', description: 'Functional components, JSX syntax', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'react-2', title: 'State & Effects', description: 'useState, useEffect hooks', type: 'coding', estimatedTime: 60, order: 2 },
              { id: 'react-3', title: 'Forms & Events', description: 'Controlled components, form handling', type: 'coding', estimatedTime: 45, order: 3 },
            ]
          },
          {
            id: 'react-advanced',
            title: 'Advanced React',
            description: 'Context, performance, testing',
            order: 2,
            lessons: [
              { id: 'react-4', title: 'Context API & State Management', description: 'Global state without libraries', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'react-5', title: 'Performance Optimization', description: 'useMemo, useCallback, React.memo', type: 'reading', estimatedTime: 30, order: 2 },
            ]
          }
        ]
      },
      {
        id: 'node-express',
        name: 'Node.js & Express',
        description: 'Backend development with Node.js and Express',
        order: 3,
        topics: [
          {
            id: 'node-basics',
            title: 'Node.js Fundamentals',
            description: 'Runtime, modules, file system',
            order: 1,
            lessons: [
              { id: 'node-1', title: 'Node.js Runtime & Modules', description: 'CommonJS, ES modules, npm', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'node-2', title: 'File System & Streams', description: 'Reading/writing files, streams', type: 'coding', estimatedTime: 60, order: 2 },
            ]
          },
          {
            id: 'express-api',
            title: 'Building REST APIs with Express',
            description: 'Routing, middleware, validation',
            order: 2,
            lessons: [
              { id: 'express-1', title: 'Express Basics & Routing', description: 'Setting up server, route handlers', type: 'coding', estimatedTime: 60, order: 1 },
              { id: 'express-2', title: 'Middleware & Error Handling', description: 'Custom middleware, error boundaries', type: 'coding', estimatedTime: 45, order: 2 },
              { id: 'express-3', title: 'Validation & Security', description: 'Input validation, helmet, cors', type: 'reading', estimatedTime: 30, order: 3 },
            ]
          }
        ]
      },
      {
        id: 'mongodb',
        name: 'MongoDB & Prisma',
        description: 'Database design and ORM with Prisma',
        order: 4,
        topics: [
          {
            id: 'mongodb-basics',
            title: 'MongoDB Fundamentals',
            description: 'Documents, collections, queries',
            order: 1,
            lessons: [
              { id: 'mongo-1', title: 'MongoDB Basics', description: 'CRUD operations, queries', type: 'coding', estimatedTime: 60, order: 1 },
              { id: 'mongo-2', title: 'Data Modeling', description: 'Schema design, relationships', type: 'reading', estimatedTime: 45, order: 2 },
            ]
          },
          {
            id: 'prisma-orm',
            title: 'Prisma ORM',
            description: 'Type-safe database access',
            order: 2,
            lessons: [
              { id: 'prisma-1', title: 'Prisma Setup & Schema', description: 'Models, migrations, Prisma Client', type: 'coding', estimatedTime: 60, order: 1 },
              { id: 'prisma-2', title: 'Advanced Queries', description: 'Relations, transactions, raw queries', type: 'coding', estimatedTime: 45, order: 2 },
            ]
          }
        ]
      },
      {
        id: 'nextjs',
        name: 'Next.js Full-Stack',
        description: 'Full-stack React framework',
        order: 5,
        topics: [
          {
            id: 'nextjs-basics',
            title: 'Next.js Fundamentals',
            description: 'App router, server components, routing',
            order: 1,
            lessons: [
              { id: 'next-1', title: 'App Router & Server Components', description: 'File-based routing, RSC', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'next-2', title: 'Data Fetching & Caching', description: 'fetch, cache, revalidate', type: 'coding', estimatedTime: 60, order: 2 },
              { id: 'next-3', title: 'Authentication & Middleware', description: 'NextAuth, route protection', type: 'coding', estimatedTime: 60, order: 3 },
            ]
          },
          {
            id: 'nextjs-advanced',
            title: 'Advanced Next.js',
            description: 'Deployment, optimization, testing',
            order: 2,
            lessons: [
              { id: 'next-4', title: 'Deployment & CI/CD', description: 'Vercel, Docker, GitHub Actions', type: 'reading', estimatedTime: 45, order: 1 },
              { id: 'next-5', title: 'Performance & SEO', description: 'Images, fonts, metadata, ISR', type: 'reading', estimatedTime: 30, order: 2 },
            ]
          }
        ]
      }
    ],
    totalEstimatedHours: 120,
    weeklySchedule: [
      { week: 1, focus: 'JavaScript/TypeScript Fundamentals', hours: 10, topics: ['ES6+', 'Async Patterns', 'TypeScript Basics'] },
      { week: 2, focus: 'React Fundamentals', hours: 10, topics: ['Components', 'State', 'Hooks'] },
      { week: 3, focus: 'Advanced React', hours: 10, topics: ['Context', 'Performance', 'Forms'] },
      { week: 4, focus: 'Node.js & Express', hours: 10, topics: ['Runtime', 'Routing', 'Middleware'] },
      { week: 5, focus: 'REST APIs & Validation', hours: 10, topics: ['API Design', 'Security', 'Error Handling'] },
      { week: 6, focus: 'MongoDB & Prisma', hours: 10, topics: ['Data Modeling', 'Prisma ORM', 'Queries'] },
      { week: 7, focus: 'Next.js App Router', hours: 10, topics: ['Server Components', 'Data Fetching', 'Auth'] },
      { week: 8, focus: 'Full-Stack Project', hours: 15, topics: ['Project Planning', 'Implementation', 'Deployment'] },
      { week: 9, focus: 'Testing & Optimization', hours: 10, topics: ['Unit Tests', 'E2E Tests', 'Performance'] },
      { week: 10, focus: 'Advanced Topics', hours: 10, topics: ['WebSockets', 'GraphQL', 'Microservices'] },
      { week: 11, focus: 'Capstone Project', hours: 20, topics: ['Architecture', 'Implementation', 'Polish'] },
      { week: 12, focus: 'Portfolio & Career Prep', hours: 10, topics: ['Portfolio', 'Resume', 'Interview Prep'] },
    ]
  }
}