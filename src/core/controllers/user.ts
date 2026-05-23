import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { User } from '../domain'
import { usersCollection } from '@/lib/db/collections'
import { ObjectId } from 'mongodb'

async function getUserProfile(
  _: NextRequest,
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      )
    }
    const collection = await usersCollection()
    const user = await collection.findOne({
      _id: new ObjectId(session.user.id),
    })
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 },
      )
    }
    return NextResponse.json({
      success: true,
      message: 'User profile fetched successfully',
      data: user,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user profile',
        error,
      },
      { status: 500 },
    )
  }
}

export { getUserProfile }
