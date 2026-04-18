import { useAuthContext } from "@/context/AuthContext"
import LayoutTemplate from "@/components/templates/LayoutTemplate"
import { sidebarData } from "@/data/sidebar-data"
import { isNavCollapsible, type NavCollapsible, type NavItem, type SidebarData } from "@/types/sideBar"

export default function LayoutScreen() {
    const { user, logout } = useAuthContext()

    function filterNavItemsByRole(items: NavItem[], userRole: string): NavItem[] {
        return items.reduce<NavItem[]>((acc, item) => {
            if (item.roles && !item.roles.includes(userRole)) {
                return acc
            }

            if (!isNavCollapsible(item)) {
                acc.push(item)
                return acc
            }

            const filteredChildren = filterNavItemsByRole(item.items, userRole)

            if (!filteredChildren.length) {
                return acc
            }

            const filteredItem: NavCollapsible = {
                ...item,
                items: filteredChildren,
            }

            acc.push(filteredItem)
            return acc
        }, [])
    }

    function filterSidebarDataByRole(data: SidebarData, userRole: string): SidebarData {
        return {
            navGroups: data.navGroups
                .map(group => ({
                    ...group,
                    items: filterNavItemsByRole(group.items, userRole)
                }))
                .filter(group => group.items.length > 0)
        }
    }


    const filteredData =
        user && user.type
            ? filterSidebarDataByRole(sidebarData, user.type)
            : sidebarData

    // Lógica de logout
    async function handleLogout() {
        try {
            await logout()
        } catch (error) {
            console.error("Error cerrando sesión:", error)
        }
    }

    // Lógica de iniciales
    function getInitials() {
        if (!user) return ""
        const firstInitial = user.name?.charAt(0)?.toUpperCase() || ""
        const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || ""
        return `${firstInitial}${lastInitial}`
    }
    return (
        <LayoutTemplate
            user={user}
            sidebarData={filteredData}
            onLogout={handleLogout}
            getInitials={getInitials}
        />
    )
}
