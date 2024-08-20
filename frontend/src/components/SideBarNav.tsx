import { CSidebarNav, CNavTitle, CNavItem, CNavLink, CNavGroup } from "@coreui/react";
import { NavLink } from "react-router-dom";
// TODO: add routes dynamically
// import { DefinedRoutes } from "../Routes";

const SideBarNav = () => {
    return (
        <CSidebarNav>
            <CNavTitle> Exploration Tool</CNavTitle>
            <CNavItem>
                <CNavLink to="/" as={NavLink}>
                    Home
                </CNavLink>
            </CNavItem>
            <CNavGroup toggler={<> Sensor Tools</>}>
                <CNavItem>
                    <CNavLink to="/distance-tool" as={NavLink}>
                        <span className="nav-icon">
                            <span className="nav-icon-bullet"></span>
                        </span>{" "}
                        Distance Detector
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink to="/motion-tool">
                        <span className="nav-icon">
                            <span className="nav-icon-bullet"></span>
                        </span>{" "}
                        Motion Detector
                    </CNavLink>
                </CNavItem>
            </CNavGroup>
            <CNavGroup toggler={<> CoreUi Docs</>}>
                <CNavItem href="https://coreui.io">
                    <span className="nav-icon">
                        <span className="nav-icon-bullet"></span>
                    </span>{" "}
                    Download CoreUI
                </CNavItem>
            </CNavGroup>
        </CSidebarNav>
    );
};

export default SideBarNav;
