import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Pages
import HomePage from "./pages/HomePage";
import DistanceToolPage from "./pages/DistanceToolPage";
// Components
import { WebSocketProvider } from "./contexts/WebSocketContext";
import SideBar from "./components/SideBar";
import ContentField from "./components/ContentField";

function App() {
    return (
        <WebSocketProvider>
            <Router>
                <SideBar />
                <ContentField title="Exploration Tool">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/distance-tool" element={<DistanceToolPage />} />
                    </Routes>
                </ContentField>
            </Router>
        </WebSocketProvider>
    );
}

export default App;
