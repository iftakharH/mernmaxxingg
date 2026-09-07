import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validate required fields (interests is optional in the UI)
    const requiredFields = ['experienceLevel', 'goals', 'timeCommitment', 'preferredLanguages', 'learningStyle']
    for (const field of requiredFields) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (data.interests !== undefined && !Array.isArray(data.interests)) {
      return NextResponse.json(
        { error: 'Invalid field: interests must be an array' },
        { status: 400 }
      )
    }

    const interests = Array.isArray(data.interests) ? data.interests : []

    // Upsert questionnaire response
    const questionnaire = await prisma.questionnaireResponse.upsert({
      where: { userId: session.user.id },
      update: {
        experienceLevel: data.experienceLevel,
        goals: data.goals,
        timeCommitment: data.timeCommitment,
        preferredLanguages: data.preferredLanguages,
        learningStyle: data.learningStyle,
        interests,
      },
      create: {
        userId: session.user.id,
        experienceLevel: data.experienceLevel,
        goals: data.goals,
        timeCommitment: data.timeCommitment,
        preferredLanguages: data.preferredLanguages,
        learningStyle: data.learningStyle,
        interests,
      },
    })

    return NextResponse.json({ questionnaire })
  } catch (error) {
    console.error('Questionnaire error:', error)
    return NextResponse.json(
      { error: 'Failed to save questionnaire' },
      { status: 500 }
    )
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

    const questionnaire = await prisma.questionnaireResponse.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ questionnaire })
  } catch (error) {
    console.error('Get questionnaire error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    )
  }
}