import { CDropdown, CDropdownMenu, CDropdownToggle, CNavbarNav, CNavItem, CNavLink } from "@coreui/react";
import { NavLink } from "react-router-dom";
import AppRoute from "../../types/AppRoute";
import NavigationGroups from "../../types/NavigationGroups";
import { DefinedRoutes } from "../../Routes";
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

const populateNavigation = () => {
    const navItemsByGroup: NavigationGroups = {};

    DefinedRoutes.map((route) => {
        let groupName = route.title;
        if (route.group) {
            groupName = route.group;
        }
        if (!navItemsByGroup[groupName]) {
            navItemsByGroup[groupName] = [];
        }
        let navBarItem = createNavItem(route);
        if (route.customLink) {
            navBarItem = createNavItem(route, true);
        }
        navItemsByGroup[groupName].push(navBarItem);
    });

    return (
        <>
            {Object.entries(navItemsByGroup).map(([groupName, navItems]) => {
                if (navItems.length === 1) {
                    return navItems[0];
                } else {
                    return (
                        <CDropdown variant="nav-item" key={groupName}>
                            <CDropdownToggle color="secondary">{groupName}</CDropdownToggle>
                            <CDropdownMenu className="text-nowrap">{navItems.map((item) => item)}</CDropdownMenu>
                        </CDropdown>
                    );
                }
            })}
        </>
    );
};

const AppNavBarNavigation = () => {
    let renderedItems = populateNavigation();

    useEffect(() => {
        renderedItems = populateNavigation();
    }, [DefinedRoutes]);

    return (
        <>
            <CNavbarNav>{renderedItems}</CNavbarNav>
        </>
    );
};

export default AppNavBarNavigation;
