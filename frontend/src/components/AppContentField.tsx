import React, { Suspense } from "react";
import { CContainer, CSpinner } from "@coreui/react";
import { DefinedRoutes, AppRoute } from "../Routes";
import { Routes, Route } from "react-router-dom";

type ContentFieldProps = {
    children?: React.ReactNode;
};

const AppContentField: React.FC<ContentFieldProps> = () => {
    return (
        <CContainer>
            <Suspense fallback={<CSpinner color="primary" />}>
                <Routes>
                    {DefinedRoutes.map((route: AppRoute) => {
                        return <Route key={route.path} path={route.path} element={route.component()} />;
                    })}
                </Routes>
            </Suspense>
        </CContainer>
    );
};

export default AppContentField;
