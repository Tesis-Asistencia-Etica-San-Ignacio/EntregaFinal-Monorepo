import { Outlet } from "react-router-dom"
import { Separator } from "@/components/atoms/ui/separator"
import SidebarNav from "@/components/organisms/sidebar-nav"
import type { NavLink } from "@/types/sideBar"

export interface SettingsTemplateProps {
    sidebarNavItems: NavLink[]
}

export default function SettingsTemplate({ sidebarNavItems }: SettingsTemplateProps) {
    return (
        <section>
            <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ajustes</h1>
                <p className="text-muted-foreground">
                    Administre la configuración de su cuenta y establezca sus preferencias.
                </p>
            </div>

            <Separator className="my-4 lg:my-6" />

            <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="top-0 lg:sticky lg:w-1/5">
                    <SidebarNav items={sidebarNavItems} />
                </aside>

                <div className="flex w-full overflow-y-hidden p-1 pr-4">
                    <Outlet />
                </div>
            </div>
        </section>
    )
}
