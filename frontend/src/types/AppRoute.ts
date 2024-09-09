interface AppRoute {
    title: string;
    group?: string;
    path?: string;
    customLink?: string;
    component: () => JSX.Element;
}

export default AppRoute;
