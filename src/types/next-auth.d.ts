import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    isActive?: boolean
  }

  interface Session {
    user: {
      isActive?: boolean
    } & DefaultSession['user']
  }
}
