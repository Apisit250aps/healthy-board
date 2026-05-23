'use client'

import { Button } from './button'
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenu,
} from './dropdown-menu'
import { useOverlay, DIALOG_KEY } from '@/hooks/use-overlay'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { IconDotsVertical } from '@tabler/icons-react'
import { useId, createContext } from 'react'
import { cn } from '@/lib/utils';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const DIALOG_SIZE = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-5xl',
  full: 'sm:max-w-[90vw]',
} as const

type ConfirmDialogProps = {
  title: string
  description?: string
  trigger?: React.ReactNode
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
  dialogKey?: string
}

type ModalDialogProps = {
  title: string
  description?: string
  trigger?: React.ReactNode
  children?: React.ReactNode
  closeOutside?: boolean
  className?: string
  dialogKey?: string
  size?: DialogSize
}

function useOverlayKey(prefix: string, providedKey?: string) {
  const id = useId()
  return providedKey ?? `${prefix}-${id}`
}

const ActionDropdown = ({
  children,
  dialogKey,
}: {
  children?: React.ReactNode
  dialogKey?: string
}) => {
  const { open, openOverlay, closeOverlay } = useOverlay()
  const overlayKey = useOverlayKey(DIALOG_KEY.ACTION_DROPDOWN, dialogKey)

  return (
    <DropdownMenu
      key={overlayKey}
      open={open[overlayKey] || false}
      onOpenChange={(v) =>
        v ? openOverlay(overlayKey) : closeOverlay(overlayKey)
      }
    >
      <DropdownMenuTrigger
        asChild
        onClick={(e) => {
          e.preventDefault()
          openOverlay(overlayKey)
        }}
      >
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ConfirmDialog({
  title,
  description,
  trigger,
  onConfirm,
  cancelText = 'ยกเลิก',
  confirmText = 'ดำเนินการต่อ',
  dialogKey,
}: ConfirmDialogProps) {
  const { openOverlay, open, closeOverlay } = useOverlay()
  const overlayKey = useOverlayKey(DIALOG_KEY.CONFIRM_DIALOG, dialogKey)

  return (
    <AlertDialog
      open={open[overlayKey] || false}
      onOpenChange={(v) =>
        v ? openOverlay(overlayKey) : closeOverlay(overlayKey)
      }
    >
      {trigger && (
        <AlertDialogTrigger
          asChild
          onClick={(e) => {
            e.preventDefault()
            openOverlay(overlayKey)
          }}
        >
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => closeOverlay(overlayKey)}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ModalDialog({
  title,
  description,
  trigger,
  children,
  closeOutside = true,
  dialogKey,
  size = 'md',
  className
}: ModalDialogProps) {
  const { open, closeOverlay, openOverlay } = useOverlay()
  const overlayKey = useOverlayKey(DIALOG_KEY.MODAL_DIALOG, dialogKey)

  return (
    <Dialog
      open={open[overlayKey] || false}
      onOpenChange={(v) =>
        v ? openOverlay(overlayKey) : closeOverlay(overlayKey)
      }
    >
      {trigger && (
        <DialogTrigger
          asChild
          onClick={(e) => {
            e.preventDefault()
            openOverlay(overlayKey)
          }}
          
        >
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(DIALOG_SIZE[size], className)}
        onInteractOutside={closeOutside ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Context for accessing overlay state in rendered dialogs/alerts
export const OverlayRenderContext = createContext<{
  dialogIds: string[]
  alertIds: string[]
} | null>(null)

/**
 * Component that renders programmatically added dialogs and alerts
 * Should be placed in your layout/root component
 */
export function OverlayRenderer() {
  const { open, closeOverlay, dialogs, alerts } = useOverlay()

  return (
    <OverlayRenderContext.Provider
      value={{
        dialogIds: dialogs.map((d) => d.id),
        alertIds: alerts.map((a) => a.id),
      }}
    >
      {dialogs.map(({ id, config }) => (
        <Dialog
          key={id}
          open={open[id] || false}
          onOpenChange={(v) => (!v ? closeOverlay(id) : undefined)}
        >
          <DialogContent
            className={
              config.size
                ? DIALOG_SIZE[config.size as DialogSize]
                : DIALOG_SIZE.md
            }
            onInteractOutside={
              config.closeOutside === false
                ? (e) => e.preventDefault()
                : undefined
            }
          >
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              {config.description && (
                <DialogDescription>{config.description}</DialogDescription>
              )}
            </DialogHeader>
            {config.children}
          </DialogContent>
        </Dialog>
      ))}

      {alerts.map(({ id, config }) => (
        <AlertDialog
          key={id}
          open={open[id] || false}
          onOpenChange={(v) => (!v ? closeOverlay(id) : undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{config.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {config.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => closeOverlay(id)}>
                {config.cancelText || 'ยกเลิก'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  config.onConfirm?.()
                  closeOverlay(id)
                }}
              >
                {config.confirmText || 'ดำเนินการต่อ'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </OverlayRenderContext.Provider>
  )
}

export { ActionDropdown, ConfirmDialog, ModalDialog }
