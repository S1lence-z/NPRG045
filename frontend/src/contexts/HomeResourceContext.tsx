import axios from "axios";
import { Port, Sensor } from "../components/Types";
import { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketContext";

interface HomeResourceContextType {
    availablePorts: readonly Port[];
    selectedPort: Port | undefined;
    setSelectedPort: (port: Port | undefined) => void;
    knownSensors: readonly Sensor[];
}

const HomeResourceContext = createContext<HomeResourceContextType | undefined>(undefined);

export const HomeResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [availablePorts, setAvailablePorts] = useState<readonly Port[]>([]);
    const [selectedPort, setSelectedPort] = useState<Port | undefined>(undefined);
    const [knownSensors, setKnownSensors] = useState<Sensor[]>([]);
    const { portUpdateTrigger, sensorUpdateTrigger } = useWebSocket();

    const fetchKnownSensors = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/sensors/")
            .then((response) => {
                setKnownSensors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the available sensors.", error);
            });
    };

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
        fetchKnownSensors();
    }, [sensorUpdateTrigger]);

    useEffect(() => {
        fetchAvailablePorts();
    }, [portUpdateTrigger]);

    return (
        <HomeResourceContext.Provider value={{ availablePorts, selectedPort, setSelectedPort, knownSensors }}>
            {children}
        </HomeResourceContext.Provider>
    );
};

export const useHomeResource = () => {
    const context = useContext(HomeResourceContext);
    if (!context) {
        throw new Error("usePorts must be used within a PortsProvider");
    }
    return context;
};
