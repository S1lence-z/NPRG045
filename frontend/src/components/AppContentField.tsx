import React, { Suspense } from "react";
import { CSpinner } from "@coreui/react";
import { DefinedRoutes } from "../Routes";
import { Routes, Route } from "react-router-dom";
import { AppRoute } from "./Types";

type ContentFieldProps = {
    children?: React.ReactNode;
};

const AppContentField: React.FC<ContentFieldProps> = () => {
    return (
        <div className="d-flex flex-grow-1">
            <Suspense fallback={<CSpinner color="primary" />}>
                <Routes>
                    {DefinedRoutes.map((route: AppRoute) => {
                        return <Route key={route.title} path={route.path} element={route.component()} />;
                    })}
                </Routes>
            </Suspense>
        </div>
    );
};

export default AppContentField;
