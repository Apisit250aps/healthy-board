import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { User, userSchema } from '../domain'
import { usersCollection } from '@/lib/db/collections'
import { ObjectId } from 'mongodb'

const updateSchema = userSchema
  .pick({ name: true, weight: true, height: true })
  .partial()

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

async function updateUserProfile(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid data',
          error: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const collection = await usersCollection()
    await collection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { ...parsed.data, updatedAt: new Date() } },
    )

    return NextResponse.json({ success: true, message: 'Profile updated' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update profile', error },
      { status: 500 },
    )
  }
}

export { getUserProfile, updateUserProfile }
