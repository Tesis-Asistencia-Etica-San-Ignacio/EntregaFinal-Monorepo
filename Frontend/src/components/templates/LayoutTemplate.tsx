import { Outlet, Link, useLocation } from "react-router-dom"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../atoms/ui/sidebar"
import { Main } from "../atoms/Main"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../atoms/ui/breadcrumb"
import { AppSidebar } from "../organisms/AppSideBar"
import type { SidebarData } from "@/types/sideBar"
import type { User } from "@/types/userType"
import React from "react"

interface LayoutTemplateProps {
  user: User | null
  sidebarData: SidebarData
  onLogout: () => Promise<void>
  getInitials: () => string
}

export default function LayoutTemplate({
  user,
  sidebarData,
  onLogout,
  getInitials,
}: LayoutTemplateProps) {
  const location = useLocation()
  const locationState = location.state as { breadcrumbLabel?: string } | null
  const segments = location.pathname
    .split("/")
    .filter((seg) => seg !== "")

  const makeLabel = (seg: string) =>
    seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Override de rutas para ciertos segmentos:
  const overridePaths: Record<string, string> = {
    evaluacion: "/historial-archivos-evaluados",
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        sidebarData={sidebarData}
        onLogout={onLogout}
        getInitials={getInitials}
      />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {segments.map((seg, idx) => {
                const isLast = idx === segments.length - 1
                // Calcula la ruta real o usa el override
                const rawPath = "/" + segments.slice(0, idx + 1).join("/")
                const path = overridePaths[seg] ?? rawPath

                return (
                  <React.Fragment key={rawPath}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          {locationState?.breadcrumbLabel && rawPath.startsWith("/evaluacion/")
                            ? locationState.breadcrumbLabel
                            : makeLabel(seg)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={path}>{makeLabel(seg)}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Main fixed>
          <Outlet />
        </Main>
      </SidebarInset>
    </SidebarProvider>
  )
}
