import { NextRequest, NextResponse } from 'next/server'
import { WeightRecord } from '../domain'
import { auth } from '@/auth'
import { weightCollection } from '@/lib/db/collections'

async function weightRecord(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<WeightRecord>>> {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
          success: false,
        },
        { status: 401 },
      )
    }

    const { weight } = await req.json()
    const now = new Date()
    const collection = await weightCollection()
    const newRecord = await collection.insertOne({
      userId: session.user.id!,
      weight,
      date: now,
      updatedAt: now,
      createdAt: now,
    })

    return NextResponse.json({
      message: 'Weight record created successfully',
      success: true,
      data: {
        id: newRecord.insertedId.toString(),
        userId: session.user.id!,
        weight,
        date: now,
        updatedAt: now,
        createdAt: now,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to create weight record',
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export { weightRecord }
