import { BackendConnectionStatus } from "./ConnectionStatus";
import SideBarNav from "./SideBarNav";
import { CSidebar, CSidebarBrand, CSidebarHeader, CSidebarFooter } from "@coreui/react";

// TODO: add simple bar as custom scroll wheel
const AppSideBar = () => {
    return (
        <CSidebar className="border-end" colorScheme="dark">
            <CSidebarHeader className="border-bottom">
                <CSidebarBrand>Exploration Tool</CSidebarBrand>
            </CSidebarHeader>
            <SideBarNav />
            <CSidebarFooter className="fs-5">
                <BackendConnectionStatus />
            </CSidebarFooter>
        </CSidebar>
    );
};

export default AppSideBar;
