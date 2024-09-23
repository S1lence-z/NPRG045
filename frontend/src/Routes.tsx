import AppRoute from "./types/AppRoute";
import DistanceToolPage from "./pages/DistanceToolPage";
import HomePage from "./pages/HomePage";
import HandmotionToolPage from "./pages/HandmotionToolPage";

const DummyComponent = () => {
    return (
        <div>
            <h1>Testing Component</h1>
        </div>
    );
};

export const DefinedRoutes: AppRoute[] = [
    {
        title: "Home",
        path: "/",
        component: HomePage,
    },
    {
        group: "Sensor Tools",
        title: "Distance Detector",
        path: "/distance-detector",
        component: DistanceToolPage,
    },
    {
        group: "Sensor Tools",
        title: "Handmotion Detector",
        path: "/handmotion-detector",
        component: HandmotionToolPage,
    },
    {
        customLink: "https://coreui.io",
        title: "CoreUI Documentation",
        component: DummyComponent,
    },
];
