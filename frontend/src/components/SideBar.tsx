import { Navbar, NavItem, Nav } from "reactstrap";
import { Link } from "react-router-dom";
import { BackendConnectionStatus } from "./ConnectionStatus";

const SideBar = () => {
    // TODO: make the h2 heading a navbar brand that is centered
    return (
        <div className="sidebar">
            <div className="connection-status-services">
                <BackendConnectionStatus />
            </div>
            <h2>Menu</h2>
            <Navbar>
                <Nav pills vertical>
                    <NavItem>
                        <Link to="/">Connect</Link>
                    </NavItem>
                    <NavItem>
                        <Link to="/distance-tool">Distance Detector</Link>
                    </NavItem>
                </Nav>
            </Navbar>
        </div>
    );
};

export default SideBar;
