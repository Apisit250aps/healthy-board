import { MongoClient, ObjectId } from 'mongodb'

const URI = 'mongodb://localhost:27017/healthy-board'

const MOCK_USERS = [
  { name: 'สมชาย ใจดี', email: 'somchai@mock.dev', weight: 78.5, height: 172 },
  { name: 'วิภา ศรีสุข', email: 'vipa@mock.dev', weight: 55.2, height: 160 },
  {
    name: 'ธนกร พรมมา',
    email: 'thanakorn@mock.dev',
    weight: 92.0,
    height: 180,
  },
  {
    name: 'นภัส รุ่งเรือง',
    email: 'napat@mock.dev',
    weight: 48.7,
    height: 155,
  },
  { name: 'ปิยะ แสงจันทร์', email: 'piya@mock.dev', weight: 67.3, height: 168 },
]

/** สุ่มตัวเลขระหว่าง min–max */
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** สุ่มน้ำหนักในช่วง ±5 กก. จากค่าเริ่มต้น แล้วค่อยๆ drift */
function generateWeightSeries(baseWeight: number, count: number): number[] {
  const weights: number[] = []
  let current = baseWeight
  for (let i = 0; i < count; i++) {
    const delta = (Math.random() - 0.48) * 1.2 // drift ลงเล็กน้อยโดยรวม
    current = Math.round((current + delta) * 10) / 10
    current = Math.max(current, baseWeight - 6)
    current = Math.min(current, baseWeight + 6)
    weights.push(current)
  }
  return weights
}

async function seed() {
  const client = new MongoClient(URI)
  await client.connect()
  const db = client.db()

  const usersCol = db.collection('users')
  const weightCol = db.collection('weight')

  // ลบ mock users เดิมออกก่อน (ถ้ามี)
  await usersCol.deleteMany({ email: { $in: MOCK_USERS.map((u) => u.email) } })
  const mockEmails = MOCK_USERS.map((u) => u.email)
  const existingMockUsers = await usersCol
    .find({ email: { $in: mockEmails } })
    .toArray()
  if (existingMockUsers.length > 0) {
    await weightCol.deleteMany({
      userId: { $in: existingMockUsers.map((u) => u._id.toHexString()) },
    })
  }

  console.log('🌱 Seeding users...')
  const now = new Date()

  for (const mockUser of MOCK_USERS) {
    const userId = new ObjectId()
    const userIdStr = userId.toHexString()

    // Insert user
    await usersCol.insertOne({
      _id: userId,
      id: userIdStr,
      name: mockUser.name,
      email: mockUser.email,
      image: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(mockUser.name)}`,
      weight: mockUser.weight,
      height: mockUser.height,
      isActive: true,
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    })

    // สร้าง weight records ย้อนหลัง 3 เดือน ความถี่สุ่ม 3–7 วัน/ครั้ง
    const weightRecords: object[] = []
    const startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    let cursor = new Date(startDate)

    // นับจำนวน entries คร่าวๆ ก่อนเพื่อ generate weights
    let tempCursor = new Date(startDate)
    let count = 0
    while (tempCursor <= now) {
      tempCursor = new Date(
        tempCursor.getTime() + randInt(3, 7) * 24 * 60 * 60 * 1000,
      )
      count++
    }

    const weights = generateWeightSeries(mockUser.weight, count)
    let idx = 0

    while (cursor <= now) {
      const recId = new ObjectId()
      weightRecords.push({
        _id: recId,
        id: recId.toHexString(),
        userId: userIdStr,
        weight: weights[idx] ?? mockUser.weight,
        date: new Date(cursor),
        createdAt: new Date(cursor),
        updatedAt: new Date(cursor),
      })
      cursor = new Date(cursor.getTime() + randInt(3, 7) * 24 * 60 * 60 * 1000)
      idx++
    }

    await weightCol.insertMany(weightRecords)
    console.log(`  ✅ ${mockUser.name} — ${weightRecords.length} records`)
  }

  console.log('\n✅ Seed complete!')
  await client.close()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
