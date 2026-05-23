'use client'

import React from 'react'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import DockNavigate from '@/components/app/dock-navigate'
import { Separator } from '@/components/ui/separator'
import { ShineBorder } from '@/components/ui/shine-border'
import { Button } from '@/components/ui/button'
import { IconMenu2Filled } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import WeightRecordsTable from '@/components/app/weight-records-table'
import EditProfileDialog, {
  EDIT_PROFILE_DIALOG_KEY,
} from '@/components/app/edit-profile-dialog'
import { useOverlay } from '@/hooks/use-overlay'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { User } from '@/core/domain'

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: 'ผอม', color: 'text-blue-500' }
  if (bmi < 25) return { label: 'ปกติ', color: 'text-green-500' }
  if (bmi < 30) return { label: 'น้ำหนักเกิน', color: 'text-yellow-500' }
  return { label: 'อ้วน', color: 'text-red-500' }
}

export default function Page() {
  const { data: session } = useSession()
  const { openOverlay } = useOverlay()
  const { data: profile } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<User>>('/api/me')
      return res.data.data!
    },
  })
  const bmi =
    profile?.weight && profile?.height
      ? profile.weight / Math.pow(profile.height / 100, 2)
      : null
  const bmiCategory = bmi ? getBMICategory(bmi) : null
  const Logout = React.useCallback(async () => {
    await signOut({ callbackUrl: '/', redirect: true })
  }, [])
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between pt-4 px-0 md:px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex justify-end w-full px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={'ghost'}>
                  <IconMenu2Filled />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() => openOverlay(EDIT_PROFILE_DIALOG_KEY)}
                  >
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={Logout}>Log out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <div className="mb-6 flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold text-center">
              {session?.user?.name}
            </h1>
            <p className="text-sm text-gray-500 text-center">
              {session?.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold">
                {profile?.weight != null ? `${profile.weight} kg` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">น้ำหนัก</span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold">
                {profile?.height != null ? `${profile.height} cm` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">ส่วนสูง</span>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={`text-base font-semibold ${bmiCategory?.color ?? ''}`}
              >
                {bmi != null ? bmi.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                BMI{bmiCategory ? ` · ${bmiCategory.label}` : ''}
              </span>
            </div>
          </div>
          <div className="w-full px-4 pb-24" id="record">
            <h2 className="text-base font-semibold mb-3">บันทึกน้ำหนัก</h2>
            <WeightRecordsTable />
          </div>
        </div>
      </main>
      <DockNavigate />
      <EditProfileDialog
        defaultValues={{
          name: profile?.name ?? session?.user?.name ?? '',
          weight: profile?.weight,
          height: profile?.height,
        }}
      />
    </div>
  )
}
