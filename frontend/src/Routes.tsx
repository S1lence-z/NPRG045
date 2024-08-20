import DistanceToolPage from "./pages/DistanceToolPage";
import HomePage from "./pages/HomePage";

export interface AppRoute {
    title: string,
    path: string;
    component: () => JSX.Element;
}

const DummyComponent = () => {
    return (
        <div>
            <p>Testing Component</p>
        </div>
    )
}

export const DefinedRoutes: AppRoute[] = [
    {
        title: "Home",
        path: "/",
        component: HomePage,
    },
    {
        title: "Distance Detector",
        path: "/distance-tool",
        component: DistanceToolPage,
    },
    {
        title: "Motion Detector",
        path: "/motion-tool",
        component: DummyComponent,
    },
];
