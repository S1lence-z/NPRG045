import { AppRoute } from "./components/Types";
import DistanceToolPage from "./pages/DistanceToolPage";
import HomePage from "./pages/HomePage";

const DummyComponent = () => {
    return (
        <div>
            <p>Testing Component</p>
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
        title: "Motion Detector",
        path: "/motion-detector",
        component: DummyComponent,
    },
    {
        customLink: "https://coreui.io",
        title: "CoreUI Documentation",
        component: DummyComponent,
    },
];
