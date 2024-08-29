import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DistanceProfile } from "../components/Types";
import axios from "axios";

interface DistanceProfileContextType {
    knownProfiles: readonly DistanceProfile[];
    selectedProfile: DistanceProfile | undefined;
    setSelectedProfile: (profile: DistanceProfile | undefined) => void;
    triggerFetchProfiles: () => void;
}

const DistanceProfileContext = createContext<DistanceProfileContextType | undefined>(undefined);

export const DistanceProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [knownProfiles, setKnownProfiles] = useState<DistanceProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<DistanceProfile | undefined>(undefined);
    const [fetchProfilesTrigger, setFetchProfilesTrigger] = useState<number>(0);

    const fetchDistanceProfiles = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/profiles/distance/")
            .then((response) => {
                const profiles = response.data;
                setKnownProfiles(profiles);
            })
            .catch((error) => {
                console.error("There was an error fetching the distance profiles.", error);
            });
    };

    const triggerFetchProfiles = () => {
        setFetchProfilesTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        fetchDistanceProfiles();
    }, [fetchProfilesTrigger]);

    return (
        <DistanceProfileContext.Provider
            value={{ knownProfiles, selectedProfile, setSelectedProfile, triggerFetchProfiles }}>
            {children}
        </DistanceProfileContext.Provider>
    );
};

export const useDistanceProfile = () => {
    const context = useContext(DistanceProfileContext);
    if (!context) {
        throw new Error("useDistanceProfile must be used within a DistanceProfileProvider");
    }
    return context;
};
