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
} from '@tabler/icons-react'

import { signIn, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import WeighRecord from './weigh-record'

export default function DockNavigate() {
  const { status } = useSession()
  const pathname = usePathname()

  const GoogleLogin = React.useCallback(async () => {
    await signIn('google', { callbackUrl: '/', redirect: true })
  }, [])

  return (
    <Dock
      direction="middle"
      iconSize={52}
      iconMagnification={72}
      className="absolute bottom-4 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-black/80"
    >
      {status === 'authenticated' ? (
        <React.Fragment>
          {pathname !== '/' && (
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="lg" asChild>
                    <Link href="/">
                      <IconArrowBackUp size={26} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ย้อนกลับ</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          )}
          <WeighRecord>
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="lg">
                    <IconScaleOutline size={26} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>บันทึกน้ำหนัก</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </WeighRecord>
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/me">
                    <IconEmpathize size={26} />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>ตัวฉัน</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </React.Fragment>
      ) : (
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={GoogleLogin} size="lg">
                <IconBrandGoogleFilled size={26} />
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
