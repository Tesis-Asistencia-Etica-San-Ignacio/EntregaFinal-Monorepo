import SettingsTemplate from "@/components/templates/settings/SettingsTemplate"
import { sidebarData } from "@/data/sidebar-data"
import { isNavCollapsible, type NavItem, type NavLink } from "@/types/sideBar"
import { useAuthContext } from "@/context/AuthContext"

export default function SettingsScreen() {
    const { user } = useAuthContext()

    function collectVisibleLinks(items: NavItem[], userRole: string): NavLink[] {
        return items.flatMap((item) => {
            if (item.roles && !item.roles.includes(userRole)) {
                return []
            }

            if (!isNavCollapsible(item)) {
                return [item]
            }

            return collectVisibleLinks(item.items, userRole)
        })
    }

    const otrosGroup = sidebarData.navGroups.find(g => g.title === "Otros")
    const ajustesItem = otrosGroup?.items.find(i => i.title === "Ajustes")

    const sidebarNavItems: NavLink[] =
        ajustesItem && isNavCollapsible(ajustesItem)
            ? collectVisibleLinks(ajustesItem.items, user?.type ?? "")
            : []

    return <SettingsTemplate sidebarNavItems={sidebarNavItems} />
}
