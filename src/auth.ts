import NextAuth, { type User, type NextAuthConfig, Session } from 'next-auth'
import Google from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import type { AdapterUser } from '@auth/core/adapters'
import { ObjectId } from 'mongodb'
import client from './lib/db'

const config = {
  adapter: MongoDBAdapter(client),
  providers: [Google],
  callbacks: {
    async signIn({ user }: { user: User | AdapterUser }) {
      // Block sign-in if user is explicitly deactivated
      if ((user as User).isActive === false) {
        return false
      }
      return true
    },
    async session({ session, user }: { session: Session; user: User }) {
      session.user.isActive =
        (user as User & { isActive?: boolean }).isActive ?? true
      return session
    },
  },
  events: {
    async createUser({ user }: { user: User }) {
      // Set isActive: true by default for all new users
      if (user.id) {
        await client
          .db()
          .collection('users')
          .updateOne(
            { _id: new ObjectId(user.id) },
            {
              $set: {
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          )
      }
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
