import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssignmentStatus } from '@/generated/prisma/client'

const VALID_STATUSES: AssignmentStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED']

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.assignment.findMany({
      where: { userId: session.user.id },
      orderBy: [{ dueDate: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('List assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Valid id and status are required' }, { status: 400 })
    }

    const assignment = await prisma.assignment.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status,
        ...(status === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ assignment: updated })
  } catch (error) {
    console.error('Update assignment error:', error)
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
  }
}
