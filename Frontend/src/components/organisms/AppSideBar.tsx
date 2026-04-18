import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarTrigger,
} from "@/components/atoms/ui/sidebar"
import { NavGroup } from "@/components/molecules/side-navigation/NavGroup"
import { NavUser } from "@/components/molecules/side-navigation/NavUser"
import logo from "@/assets/Logo_HUSI_Blanco.png"
import { useSidebarLayout } from "@/context/SidebarLayoutContext"
import { User } from "@/types/userType"
import { flattenNavLinks, isNavCollapsible, type NavLink, type SidebarData } from "@/types/sideBar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: User | null
    sidebarData: SidebarData
    onLogout: () => Promise<void>
    getInitials: () => string
}

export function AppSidebar({
    user,
    sidebarData,
    onLogout,
    getInitials,
    ...props
}: AppSidebarProps) {
    const { sidebarLayout } = useSidebarLayout()
    const otrosGroup = sidebarData.navGroups.find((g) => g.title === "Otros")
    const ajustes = otrosGroup?.items.find((i) => i.title === "Ajustes")
    const settingsItems: NavLink[] =
        ajustes && isNavCollapsible(ajustes) ? flattenNavLinks(ajustes.items) : []

    return (
        <Sidebar collapsible={sidebarLayout} {...props}>
            <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-2">
                <img
                    src={logo}
                    alt="Logo Hospital Universitario San Ignacio"
                    className="h-15 w-auto group-data-[collapsible=icon]:hidden"
                />
                {sidebarLayout === "icon" && (
                    <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
                )}
            </SidebarHeader>

            <SidebarContent>
                {sidebarData.navGroups.map((group) => (
                    <NavGroup key={group.title} title={group.title} items={group.items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser
                    user={user}
                    onLogout={onLogout}
                    getInitials={getInitials}
                    settingsItems={settingsItems}
                />
            </SidebarFooter>

        </Sidebar>
    )
}
