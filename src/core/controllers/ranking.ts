import { auth } from '@/auth'
import { connect } from '@/lib/db'
import { NextResponse } from 'next/server'

/** ข้อมูลดิบต่อ user — ส่งไปให้ client คำนวณ ranking เอง */
export type UserWeightStats = {
  userId: string
  name: string
  image?: string
  firstWeight: number
  lastWeight: number
  firstDate: string
  lastDate: string
  totalRecords: number
}

async function getRanking(): Promise<
  NextResponse<ApiResponse<UserWeightStats[]>>
> {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    const db = await connect()

    // group weight records per user — ไม่คำนวณ rate ที่นี่
    const statsPipeline = [
      { $sort: { userId: 1, date: 1 } },
      {
        $group: {
          _id: '$userId',
          firstWeight: { $first: '$weight' },
          lastWeight: { $last: '$weight' },
          firstDate: { $first: '$date' },
          lastDate: { $last: '$date' },
          totalRecords: { $sum: 1 },
        },
      },
    ]

    const stats = await db
      .collection('weight')
      .aggregate(statsPipeline)
      .toArray()

    if (stats.length === 0) {
      return NextResponse.json({ success: true, message: 'OK', data: [] })
    }

    // join กับ users collection ฝั่ง JS
    const { ObjectId } = await import('mongodb')
    const userIds = stats.flatMap((s) => {
      try {
        return [new ObjectId(s._id as string)]
      } catch {
        return []
      }
    })

    const users = await db
      .collection('users')
      .find({ _id: { $in: userIds } })
      .toArray()

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]))

    const data: UserWeightStats[] = stats.map((r) => {
      const user = userMap[r._id as string]
      return {
        userId: r._id as string,
        name: user?.name ?? 'Unknown',
        image: user?.image,
        firstWeight: Math.round(r.firstWeight * 10) / 10,
        lastWeight: Math.round(r.lastWeight * 10) / 10,
        firstDate:
          r.firstDate instanceof Date
            ? r.firstDate.toISOString()
            : String(r.firstDate),
        lastDate:
          r.lastDate instanceof Date
            ? r.lastDate.toISOString()
            : String(r.lastDate),
        totalRecords: r.totalRecords,
      }
    })

    return NextResponse.json({ success: true, message: 'OK', data })
  } catch (error) {
    console.error('[ranking] error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Server error',
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}

export { getRanking }
