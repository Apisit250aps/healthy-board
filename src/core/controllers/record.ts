import { auth } from '@/auth'
import { usersCollection, weightCollection } from '@/lib/db/collections'
import { weightRecordSchema } from '@/core/domain'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

const createSchema = weightRecordSchema.pick({ weight: true })
const updateSchema = weightRecordSchema.pick({ weight: true })

function unauthorized() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 },
  )
}

function serverError(error: unknown) {
  return NextResponse.json(
    { success: false, message: 'Server error', error },
    { status: 500 },
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getWeightRecords(
  _req: NextRequest,
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session) return unauthorized()

    const col = await weightCollection()
    const records = await col
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .toArray()

    const data = records.map((r) => ({
      id: r.id ?? (r._id as ObjectId).toHexString(),
      userId: r.userId,
      weight: r.weight,
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt),
      updatedAt:
        r.updatedAt instanceof Date
          ? r.updatedAt.toISOString()
          : String(r.updatedAt),
    }))

    return NextResponse.json({ success: true, message: 'OK', data })
  } catch (error) {
    return serverError(error)
  }
}

async function createWeightRecord(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
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

    const id = new ObjectId().toHexString()
    const now = new Date()
    const record = {
      id,
      userId: session.user.id!,
      weight: parsed.data.weight,
      date: now,
      createdAt: now,
      updatedAt: now,
    }

    const col = await weightCollection()
    const u = await usersCollection()

    await col.insertOne(record)
    await u.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { updatedAt: new Date(), weight: parsed.data.weight } },
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Created',
        data: {
          ...record,
          date: record.date.toISOString(),
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return serverError(error)
  }
}

async function updateWeightRecord(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session) return unauthorized()

    const { id } = await params
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

    const col = await weightCollection()
    const result = await col.findOneAndUpdate(
      { id, userId: session.user.id },
      { $set: { weight: parsed.data.weight, updatedAt: new Date() } },
      { returnDocument: 'after' },
    )

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Record not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: 'Updated' })
  } catch (error) {
    return serverError(error)
  }
}

async function deleteWeightRecord(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session) return unauthorized()

    const { id } = await params
    const col = await weightCollection()
    const result = await col.deleteOne({ id, userId: session.user.id })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Record not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return serverError(error)
  }
}

export {
  getWeightRecords,
  createWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
}
