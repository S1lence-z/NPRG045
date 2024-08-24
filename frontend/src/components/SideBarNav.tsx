import { CSidebarNav, CNavTitle, CNavItem, CNavLink, CNavGroup } from "@coreui/react";
import { NavLink } from "react-router-dom";
import { DefinedRoutes } from "../Routes";
import { AppRoute, NavigationGroups } from "./Types";
import { useEffect } from "react";

const createNavItem = (route: AppRoute, hasLink: boolean = false) => {
    if (hasLink) {
        return (
            <CNavItem key={route.title} href={route.customLink}>
                <span className="nav-icon">
                    <span className="nav-icon-bullet"></span>
                </span>{" "}
                {route.title}
            </CNavItem>
        );
    } else {
        return (
            <CNavItem key={route.path}>
                <CNavLink to={route.path} as={NavLink}>
                    <span className="nav-icon">
                        <span className="nav-icon-bullet"></span>
                    </span>{" "}
                    {route.title}
                </CNavLink>
            </CNavItem>
        );
    }
};

const populateSideBarNav = () => {
    const sideBarItemsByGroup: NavigationGroups = {};

    DefinedRoutes.map((route) => {
        let groupName = route.title;
        if (route.group) {
            groupName = route.group;
        }
        if (!sideBarItemsByGroup[groupName]) {
            sideBarItemsByGroup[groupName] = [];
        }
        let navBarItem = createNavItem(route);
        if (route.customLink) {
            navBarItem = createNavItem(route, true);
        }
        sideBarItemsByGroup[groupName].push(navBarItem);
    });

    return (
        <>
            {Object.entries(sideBarItemsByGroup).map(([groupName, navItems]) => {
                if (navItems.length === 1) {
                    return navItems[0];
                } else {
                    return (
                        <CNavGroup key={groupName} toggler={groupName}>
                            {navItems.map((item) => item)}
                        </CNavGroup>
                    );
                }
            })}
        </>
    );
};

const SideBarNav = () => {
    let renderedItems = populateSideBarNav();

    useEffect(() => {
        renderedItems = populateSideBarNav();
    }, [DefinedRoutes]);

    return (
        <CSidebarNav>
            <CNavTitle> Exploration Tool</CNavTitle>
            {renderedItems}
        </CSidebarNav>
    );
};

export default SideBarNav;
