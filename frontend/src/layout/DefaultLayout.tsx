import AppContentField from "../components/AppContentField";
import AppNavBar from "../components/NavBar/AppNavBar";

const DefaultLayout = () => {
    return (
        <div className="d-flex flex-column flex-grow-1" id="app-layout-wrapper">
            <AppNavBar />
            <div className="d-flex p-2 m-2 overflow-auto" id="app-content-wrapper">
                <AppContentField />
            </div>
        </div>
    );
};

export default DefaultLayout;
