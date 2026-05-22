'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Dock, DockIcon } from '@/components/ui/dock'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Pen } from 'lucide-react'
import {
  IconBrandGoogleFilled,
  IconScaleOutline,
  IconEmpathize,
} from '@tabler/icons-react'

import { signIn, useSession } from 'next-auth/react'

export default function DockNavigate() {
  const { status, data: session } = useSession()

  const GoogleLogin = React.useCallback(async () => {
    await signIn('google', { callbackUrl: '/', redirect: true })
  }, [])

  return (
    <Dock
      direction="middle"
      className="absolute bottom-4 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-black/80"
    >
      {status === 'authenticated' ? (
        <React.Fragment>
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
                <Button variant="ghost">
                  <IconEmpathize />
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
