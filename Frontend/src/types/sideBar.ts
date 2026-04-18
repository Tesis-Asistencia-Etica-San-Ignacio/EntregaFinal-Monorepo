
interface BaseNavItem {
    title: string;
    badge?: string;
    icon?: React.ElementType;
    roles?: string[];
}

export type NavLink = BaseNavItem & {
    url: string;
    items?: never;
};

export type NavCollapsible = BaseNavItem & {
    items: NavItem[];
    url?: never;
};

export type NavItem = NavLink | NavCollapsible;

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface SidebarData {
    navGroups: NavGroup[];
}

export function isNavLink(item: NavItem): item is NavLink {
    return "url" in item;
}

export function isNavCollapsible(item: NavItem): item is NavCollapsible {
    return "items" in item;
}

export function flattenNavLinks(items: NavItem[]): NavLink[] {
    return items.flatMap((item) => {
        if (isNavLink(item)) return [item];
        return flattenNavLinks(item.items);
    });
}
