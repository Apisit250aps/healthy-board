'use client'

import React from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import DockNavigate from '@/components/app/dock-navigate'
import { Separator } from '@/components/ui/separator'
import { ShineBorder } from '@/components/ui/shine-border'
import { Button } from '@/components/ui/button'
import { IconMenu2Filled } from '@tabler/icons-react'

export default function Page() {
  const { data: session } = useSession()
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-8 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex justify-end w-full">
            <Button variant={'ghost'}>
              <IconMenu2Filled />
            </Button>
          </div>
          <div className="relative rounded-full">
            <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
            <Image
              src={session?.user?.image || ''}
              alt={session?.user?.name || ''}
              width={96}
              height={96}
              className="rounded-full"
            />
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-2 text-sm ">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Settings</span>
              <span className="text-xs text-muted-foreground">
                Manage preferences
              </span>
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Account</span>
              <span className="text-xs text-muted-foreground">
                Profile & security
              </span>
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-1 ">
              <span className="font-medium">Help</span>
              <span className="text-xs text-muted-foreground">
                Support & docs
              </span>
            </div>
          </div>
        </div>
      </main>
      <DockNavigate />
    </div>
  )
}
