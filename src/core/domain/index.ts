import z from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export const weightRecordSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  weight: z.number(),
  date: z.date(),
  // 
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type User = z.infer<typeof userSchema>
export type WeightRecord = z.infer<typeof weightRecordSchema>
