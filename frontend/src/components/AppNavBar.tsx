import { CContainer, CNavbar, CNavbarBrand, CNavbarText } from "@coreui/react";
import AppNavBarNavigation from "./AppNavBarNavigation";
import { BackendConnectionStatus } from "./ConnectionStatus";

const AppNavBar = () => {
    const customFontSize = 20;

    return (
        <>
            <CNavbar expand="lg" placement="sticky-top" color="light" style={{fontSize: customFontSize}}>
                <CContainer fluid>
                    <CNavbarBrand style={{fontSize: customFontSize}} >Exploration Tool</CNavbarBrand>
                    <AppNavBarNavigation />
                    <CNavbarText className="d-flex justify-content-center align-items-center">
                        <BackendConnectionStatus />
                    </CNavbarText>
                </CContainer>
            </CNavbar>
        </>
    );
};

export default AppNavBar;
