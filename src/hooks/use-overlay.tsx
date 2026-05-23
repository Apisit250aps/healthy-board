'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
  ReactNode,
} from 'react'

export const DIALOG_KEY = {
  ACTION_DROPDOWN: 'ACTION_DROPDOWN',
  MODAL_DIALOG: 'MODAL_DIALOG',
  CONFIRM_DIALOG: 'CONFIRM_DIALOG',
} as const

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type DialogConfig = {
  title: string
  description?: string
  children?: ReactNode
  closeOutside?: boolean
  size?: DialogSize
}

export type AlertConfig = {
  title: string
  description?: string
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void | Promise<void>
}

type DialogInstance = {
  id: string
  config: DialogConfig
}

type AlertInstance = {
  id: string
  config: AlertConfig
}

type OverlayContextValue = {
  open: Record<string, boolean>
  openOverlay: (id: string) => void
  closeOverlay: (id: string) => void
  closeAll: () => void
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  dialogs: DialogInstance[]
  alerts: AlertInstance[]
  addDialog: (config: DialogConfig) => string
  removeDialog: (id: string) => void
  addAlert: (config: AlertConfig) => string
  removeAlert: (id: string) => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [dialogs, setDialogs] = useState<DialogInstance[]>([])
  const [alerts, setAlerts] = useState<AlertInstance[]>([])

  const openOverlay = useCallback((id: string) => {
    setOpen((s) => ({ ...s, [id]: true }))
  }, [])

  const closeOverlay = useCallback((id: string) => {
    setOpen((s) => ({ ...s, [id]: false }))
  }, [])

  const closeAll = useCallback(() => {
    setOpen({})
  }, [])

  const addDialog = useCallback((config: DialogConfig) => {
    const id = `dialog-${Date.now()}-${Math.random()}`
    setDialogs((d) => [...d, { id, config }])
    setOpen((s) => ({ ...s, [id]: true }))
    return id
  }, [])

  const removeDialog = useCallback((id: string) => {
    setDialogs((d) => d.filter((item) => item.id !== id))
    setOpen((s) => {
      const newOpen = { ...s }
      delete newOpen[id]
      return newOpen
    })
  }, [])

  const addAlert = useCallback((config: AlertConfig) => {
    const id = `alert-${Date.now()}-${Math.random()}`
    setAlerts((a) => [...a, { id, config }])
    setOpen((s) => ({ ...s, [id]: true }))
    return id
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((a) => a.filter((item) => item.id !== id))
    setOpen((s) => {
      const newOpen = { ...s }
      delete newOpen[id]
      return newOpen
    })
  }, [])

  useLayoutEffect(() => {
    const isAnyOpen = Object.values(open).some((v) => v === true)

    if (!isAnyOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = ''
        document.body.style.overflow = ''
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const contextValue = useMemo(
    () => ({
      open,
      openOverlay,
      closeOverlay,
      closeAll,
      setOpen,
      dialogs,
      alerts,
      addDialog,
      removeDialog,
      addAlert,
      removeAlert,
    }),
    [
      open,
      openOverlay,
      closeOverlay,
      closeAll,
      dialogs,
      alerts,
      addDialog,
      removeDialog,
      addAlert,
      removeAlert,
    ],
  )

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
    </OverlayContext.Provider>
  )
}

type UseOverlayReturn = {
  open: Record<string, boolean>
  openOverlay: (id: string) => void
  closeOverlay: (id: string) => void
  closeAll: () => void
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  dialogs: DialogInstance[]
  alerts: AlertInstance[]
  dialog: {
    show: (config: DialogConfig) => string
    close: (id: string) => void
  }
  alert: {
    show: (config: AlertConfig) => string
    close: (id: string) => void
  }
}

export function useOverlay(): UseOverlayReturn {
  const ctx = useContext(OverlayContext)
  if (!ctx) {
    throw new Error('useOverlay must be used inside OverlayProvider')
  }

  return {
    open: ctx.open,
    openOverlay: ctx.openOverlay,
    closeOverlay: ctx.closeOverlay,
    closeAll: ctx.closeAll,
    setOpen: ctx.setOpen,
    dialogs: ctx.dialogs,
    alerts: ctx.alerts,
    dialog: {
      show: ctx.addDialog,
      close: ctx.removeDialog,
    },
    alert: {
      show: ctx.addAlert,
      close: ctx.removeAlert,
    },
  }
}
