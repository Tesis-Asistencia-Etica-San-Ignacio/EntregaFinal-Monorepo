import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/atoms/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/atoms/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/ui/avatar"
import { ChevronsUpDown, LogOut } from "lucide-react"
import { Link } from "react-router-dom"
import type { User } from "@/types/userType"
import type { NavLink } from "@/types/sideBar"

interface NavUserProps {
    user: User | null
    onLogout: () => Promise<void>
    getInitials: () => string
    settingsItems: NavLink[]
}

export function NavUser({
    user,
    onLogout,
    getInitials,
    settingsItems,
}: NavUserProps) {
    const { isMobile } = useSidebar()
    if (!user) return null

    async function handleLogout() {
        try {
            await onLogout()
        } catch (e) {
            console.error("Error cerrando sesión:", e)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        {/* cabecera */}
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {/* Ajustes dinámicos */}
                        {settingsItems.length > 0 && (
                            <>
                                <DropdownMenuGroup>
                                    {settingsItems.map(it => {
                                        const Icon = it.icon
                                        return (
                                            <DropdownMenuItem asChild key={it.title}>
                                                <Link to={it.url ?? "#"}>
                                                    {Icon && <Icon className="mr-2" />}
                                                    {it.title}
                                                </Link>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                            </>
                        )}

                        {/* logout */}
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2" />
                            Cerrar sesión
                            <Link to="/auth" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
