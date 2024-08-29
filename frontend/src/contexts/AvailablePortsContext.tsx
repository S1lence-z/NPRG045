import axios from "axios";
import { Port } from "../components/Types";
import { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketContext";

interface PortsContextType {
    availablePorts: readonly Port[];
    selectedPort: Port | undefined;
    setSelectedPort: (port: Port | undefined) => void;
}

const PortsContext = createContext<PortsContextType | undefined>(undefined);

export const PortsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [availablePorts, setAvailablePorts] = useState<readonly Port[]>([]);
    const [selectedPort, setSelectedPort] = useState<Port | undefined>(undefined);
    const portUpdateTrigger = useWebSocket();

    const fetchAvailablePorts = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/ports/")
            .then((response) => {
                const responseData = response.data;
                setAvailablePorts(responseData);
            })
            .catch((error) => {
                console.error("There was an error fetching the available ports.", error);
            });
    };

    useEffect(() => {
        fetchAvailablePorts();
    }, [portUpdateTrigger]);

    return (
        <PortsContext.Provider value={{ availablePorts, selectedPort, setSelectedPort }}>
            {children}
        </PortsContext.Provider>
    );
};

export const usePorts = () => {
    const context = useContext(PortsContext);
    if (!context) {
        throw new Error("usePorts must be used within a PortsProvider");
    }
    return context;
};
