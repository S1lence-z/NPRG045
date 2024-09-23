import { createContext, useContext, useEffect, useState } from "react";
import SensorConfig from "../types/SensorConfig";
import { emptySensorConfig } from "../components/SensorConfigForm/defaultSensorConfig";
import { fetchSensorConfigs } from "../hooks/apiHooks";

interface SensorConfigContextType {
    knownSensorConfigs: SensorConfig[];
    selectedSensorConfig: SensorConfig;
    setSelectedSensorConfig: (sensorConfig: SensorConfig) => void;
    triggerFetchSensorConfigs: () => void;
}

const SensorConfigContext = createContext<SensorConfigContextType | undefined>(undefined);

export const SensorConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [knownSensorConfigs, setKnownSensorConfigs] = useState<SensorConfig[]>([]);
    const [selectedSensorConfig, setSelectedSensorConfig] = useState<SensorConfig>(emptySensorConfig);
    const [fetchSensorConfigsTrigger, setFetchSensorConfigsTrigger] = useState<number>(0);

    const triggerFetchSensorConfigs = () => {
        setFetchSensorConfigsTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        if (knownSensorConfigs.length === 0) {
            setSelectedSensorConfig(emptySensorConfig);
        }
    }, [knownSensorConfigs]);

    useEffect(() => {
        const fetchConfigs = async () => {
            const newlyFetchedConfigs = await fetchSensorConfigs();
            setKnownSensorConfigs(newlyFetchedConfigs);
        };

        fetchConfigs();
    }, [fetchSensorConfigsTrigger]);

    return (
        <SensorConfigContext.Provider
            value={{ knownSensorConfigs, selectedSensorConfig, setSelectedSensorConfig, triggerFetchSensorConfigs }}>
            {children}
        </SensorConfigContext.Provider>
    );
};

export const useSensorConfig = () => {
    const context = useContext(SensorConfigContext);
    if (!context) {
        throw new Error("useSensorConfig must be used within a SensorConfigProvider");
    }
    return context;
};
