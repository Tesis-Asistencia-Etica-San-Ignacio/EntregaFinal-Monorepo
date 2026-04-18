import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/atoms/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/atoms/ui/sidebar'
import { Badge } from '@/components/atoms/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/atoms/ui/dropdown-menu'
import {
    isNavLink,
    type NavCollapsible,
    type NavGroup as NavGroupType,
    type NavItem,
    type NavLink,
} from '@/types/sideBar'

export function NavGroup({ title, items }: NavGroupType) {
    const location = useLocation()
    const href = location.pathname

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => (
                    <RecursiveSidebarItem
                        key={getNavItemKey(item, index)}
                        item={item}
                        href={href}
                        depth={0}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
    <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
)

const RecursiveSidebarItem = ({ item, href, depth }: { item: NavItem; href: string; depth: number }) => {
    const { state } = useSidebar()

    if (isNavLink(item)) {
        return depth === 0 ? (
            <SidebarMenuLink item={item} href={href} />
        ) : (
            <SidebarMenuNestedLink item={item} href={href} />
        )
    }

    if (depth === 0 && state === 'collapsed') {
        return <SidebarMenuCollapsedDropdown item={item} href={href} />
    }

    return depth === 0 ? (
        <SidebarMenuCollapsible item={item} href={href} />
    ) : (
        <SidebarMenuNestedCollapsible item={item} href={href} depth={depth} />
    )
}

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
    const { setOpenMobile } = useSidebar()

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={checkIsActive(href, item)}
                tooltip={item.title}
            >
                <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

const SidebarMenuNestedLink = ({ item, href }: { item: NavLink; href: string }) => {
    const { setOpenMobile } = useSidebar()

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton
                asChild
                isActive={checkIsActive(href, item)}
            >
                <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}

const SidebarMenuCollapsible = ({ item, href }: { item: NavCollapsible; href: string }) => {
    return (
        <Collapsible
            asChild
            defaultOpen={checkIsActive(href, item)}
            className='group/collapsible'
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className='CollapsibleContent'>
                    <SidebarMenuSub>
                        {item.items.map((subItem, index) => (
                            <RecursiveSidebarItem
                                key={getNavItemKey(subItem, index)}
                                item={subItem}
                                href={href}
                                depth={1}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

const SidebarMenuNestedCollapsible = ({
    item,
    href,
    depth,
}: {
    item: NavCollapsible
    href: string
    depth: number
}) => {
    return (
        <Collapsible
            asChild
            defaultOpen={checkIsActive(href, item)}
            className='group/collapsible'
        >
            <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuSubButton isActive={checkIsActive(href, item)}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent className='CollapsibleContent'>
                    <SidebarMenuSub>
                        {item.items.map((subItem, index) => (
                            <RecursiveSidebarItem
                                key={getNavItemKey(subItem, index)}
                                item={subItem}
                                href={href}
                                depth={depth + 1}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuSubItem>
        </Collapsible>
    )
}

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: NavCollapsible; href: string }) => {
    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(href, item)}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='right' align='start' sideOffset={4}>
                    <DropdownMenuLabel>
                        {item.title} {item.badge ? `(${item.badge})` : ''}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items.map((sub, index) => (
                        <CollapsedDropdownTreeItem
                            key={getNavItemKey(sub, index)}
                            item={sub}
                            href={href}
                        />
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}

const CollapsedDropdownTreeItem = ({ item, href }: { item: NavItem; href: string }) => {
    if (isNavLink(item)) {
        return (
            <DropdownMenuItem asChild>
                <Link
                    to={item.url}
                    className={`${checkIsActive(href, item) ? 'bg-secondary' : ''}`}
                >
                    {item.icon && <item.icon />}
                    <span className='max-w-52 text-wrap'>{item.title}</span>
                    {item.badge && <span className='ml-auto text-xs'>{item.badge}</span>}
                </Link>
            </DropdownMenuItem>
        )
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                {item.icon && <item.icon />}
                <span className='max-w-52 text-wrap'>{item.title}</span>
                {item.badge && <span className='ml-2 text-xs'>{item.badge}</span>}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {item.items.map((subItem, index) => (
                    <CollapsedDropdownTreeItem
                        key={getNavItemKey(subItem, index)}
                        item={subItem}
                        href={href}
                    />
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}

function normalizePath(path: string): string {
    const normalized = path.split('?')[0].replace(/\/+$/, '')
    return normalized === '' ? '/' : normalized
}

function checkIsActive(href: string, item: NavItem): boolean {
    if (isNavLink(item)) {
        const normalizedHref = normalizePath(href)
        const normalizedUrl = normalizePath(item.url)

        if (normalizedUrl === '/') return normalizedHref === normalizedUrl

        return normalizedHref === normalizedUrl || normalizedHref.startsWith(`${normalizedUrl}/`)
    }

    return item.items.some((subItem) => checkIsActive(href, subItem))
}

function getNavItemKey(item: NavItem, index: number): string {
    return isNavLink(item) ? `${item.title}-${item.url}` : `${item.title}-group-${index}`
}
