import type { Metadata } from 'next'
import { Itim } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import ClientProvider from '@/hooks/client-provider'
import { OverlayProvider } from '@/hooks/use-overlay'

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
        <ClientProvider>
          <SessionProvider session={session}>
            <OverlayProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </OverlayProvider>
          </SessionProvider>
        </ClientProvider>
      </body>
    </html>
  )
}
