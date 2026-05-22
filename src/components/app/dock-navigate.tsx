'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Dock, DockIcon } from '@/components/ui/dock'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'
import {
  IconBrandGoogleFilled,
  IconScaleOutline,
  IconEmpathize,
  IconArrowBackUp,
  IconLogout,
} from '@tabler/icons-react'

import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function DockNavigate() {
  const { status } = useSession()
  const pathname = usePathname()

  const GoogleLogin = React.useCallback(async () => {
    await signIn('google', { callbackUrl: '/', redirect: true })
  }, [])

  const Logout = React.useCallback(async () => {
    await signOut({ callbackUrl: '/', redirect: true })
  }, [])

  return (
    <Dock
      direction="middle"
      className="absolute bottom-4 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-black/80"
    >
      {status === 'authenticated' ? (
        <React.Fragment>
          {pathname !== '/' && (
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" asChild>
                    <Link href="/">
                      <IconArrowBackUp />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ย้อนกลับ</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          )}
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">
                  <IconScaleOutline />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>บันทึกน้ำหนัก</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" asChild>
                  <Link href="/me">
                    <IconEmpathize />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>ตัวฉัน</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={Logout}>
                  <IconLogout />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>ออกจากระบบ</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </React.Fragment>
      ) : (
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={GoogleLogin}>
                <IconBrandGoogleFilled />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>เข้าสู่ระบบด้วย Google</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      )}
    </Dock>
  )
}
