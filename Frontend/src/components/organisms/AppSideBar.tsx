import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/atoms/ui/sidebar"
import { NavGroup } from "@/components/molecules/side-navigation/NavGroup"
import { NavUser } from "@/components/molecules/side-navigation/NavUser"
import logo from "@/assets/Logo_HUSI_Blanco.png"
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
    const otrosGroup = sidebarData.navGroups.find((g) => g.title === "Otros")
    const ajustes = otrosGroup?.items.find((i) => i.title === "Ajustes")
    const settingsItems: NavLink[] =
        ajustes && isNavCollapsible(ajustes) ? flattenNavLinks(ajustes.items) : []

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <img src={logo} alt="Logo Hospital Universitario San Ignacio" />
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

            <SidebarRail />
        </Sidebar>
    )
}
