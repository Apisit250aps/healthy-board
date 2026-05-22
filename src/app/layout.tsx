import type { Metadata } from 'next'
import { Itim } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'

const itim = Itim({
  weight: '400',
  subsets: ['latin', 'thai'],
  variable: '--font-itim',
})

export const metadata: Metadata = {
  title: 'Healthy Board',
  description: 'A application to track your health and fitness progress.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang="en" className={cn('h-full', 'antialiased', itim.variable)}>
      <body className={cn('min-h-full flex flex-col', itim.className)}>
        <SessionProvider
          session={session}
          refetchInterval={0}
          refetchOnWindowFocus={false}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
