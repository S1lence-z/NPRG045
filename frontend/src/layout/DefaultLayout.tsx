import AppSideBar from "../components/AppSideBar";
import AppContentField from "../components/AppContentField";

const DefaultLayout = () => {
    return (
        <>
            <AppSideBar />
            <div className="body d-flex flex-grow-1">
                <AppContentField />
            </div>
        </>
    );
};

export default DefaultLayout;
