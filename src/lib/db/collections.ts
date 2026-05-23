import { User, WeightRecord } from '@/core/domain'
import { Collection } from 'mongodb'
import { connect } from '.'

let _users: Collection<User> | null = null
let _weight: Collection<WeightRecord> | null = null

export async function usersCollection(): Promise<Collection<User>> {
  if (!_users) {
    const db = await connect()
    _users = db.collection<User>('users')
    await _users.createIndexes([
      { key: { id: 1 }, unique: true, name: 'uniq_id' },
      { key: { email: 1 }, unique: true, name: 'uniq_email' },
    ])
  }
  return _users
}

export async function weightCollection(): Promise<Collection<WeightRecord>> {
  if (!_weight) {
    const db = await connect()
    _weight = db.collection<WeightRecord>('weight')
    await _weight.createIndexes([
      { key: { id: 1 }, unique: true, name: 'uniq_id' },
      { key: { userId: 1, date: -1 }, name: 'idx_user_date' },
    ])
  }
  return _weight
}
