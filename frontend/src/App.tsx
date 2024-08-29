// Styles imports
import "bootstrap/dist/css/bootstrap.min.css";
import "@coreui/coreui/dist/css/coreui.min.css";
// Components
import { WebSocketProvider } from "./contexts/WebSocketContext";
import DefaultLayout from "./layout/DefaultLayout";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
    return (
        <WebSocketProvider>
            <Router>
                <DefaultLayout />
            </Router>
        </WebSocketProvider>
    );
}

export default App;
