import { createContext, useContext, useMemo, useState } from "react"

export type SidebarLayoutMode = "icon" | "offcanvas"

type SidebarLayoutProviderProps = {
  children: React.ReactNode
  defaultSidebarLayout?: SidebarLayoutMode
  storageKey?: string
}

type SidebarLayoutProviderState = {
  sidebarLayout: SidebarLayoutMode
  setSidebarLayout: (layout: SidebarLayoutMode) => void
}

const DEFAULT_SIDEBAR_LAYOUT: SidebarLayoutMode = "icon"

const SidebarLayoutProviderContext =
  createContext<SidebarLayoutProviderState | undefined>(undefined)

const isSidebarLayoutMode = (value: string | null): value is SidebarLayoutMode =>
  value === "icon" || value === "offcanvas"

export function SidebarLayoutProvider({
  children,
  defaultSidebarLayout = DEFAULT_SIDEBAR_LAYOUT,
  storageKey = "vite-ui-sidebar-layout",
}: SidebarLayoutProviderProps) {
  const [sidebarLayout, setSidebarLayoutState] = useState<SidebarLayoutMode>(
    () => {
      const storedLayout =
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKey)
          : null

      return isSidebarLayoutMode(storedLayout)
        ? storedLayout
        : defaultSidebarLayout
    }
  )

  const setSidebarLayout = (layout: SidebarLayoutMode) => {
    window.localStorage.setItem(storageKey, layout)
    setSidebarLayoutState(layout)
  }

  const value = useMemo(
    () => ({
      sidebarLayout,
      setSidebarLayout,
    }),
    [sidebarLayout]
  )

  return (
    <SidebarLayoutProviderContext.Provider value={value}>
      {children}
    </SidebarLayoutProviderContext.Provider>
  )
}

export const useSidebarLayout = () => {
  const context = useContext(SidebarLayoutProviderContext)

  if (context === undefined) {
    throw new Error(
      "useSidebarLayout must be used within a SidebarLayoutProvider"
    )
  }

  return context
}
