import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import DistanceProfile from "../types/DistanceProfile";
import { emptyDistanceProfile } from "../components/DistanceProfileForm/defaultDistanceProfile";
import { fetchDistanceProfiles } from "../hooks/apiHooks";

interface DistanceProfileContextType {
    knownDistanceProfiles: DistanceProfile[];
    selectedProfile: DistanceProfile;
    setSelectedProfile: (profile: DistanceProfile) => void;
    triggerFetchProfiles: () => void;
}

const DistanceProfileContext = createContext<DistanceProfileContextType | undefined>(undefined);

export const DistanceProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [knownProfiles, setKnownProfiles] = useState<DistanceProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<DistanceProfile>(emptyDistanceProfile);
    const [fetchProfilesTrigger, setFetchProfilesTrigger] = useState<number>(0);

    const triggerFetchProfiles = () => {
        setFetchProfilesTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        if (knownProfiles.length === 0) {
            setSelectedProfile(emptyDistanceProfile);
        }
    }, [knownProfiles]);

    useEffect(() => {
        const fetchProfiles = async () => {
            const newlyFetchedProfiles = await fetchDistanceProfiles();
            setKnownProfiles(newlyFetchedProfiles);
        };
        fetchProfiles();
    }, [fetchProfilesTrigger]);

    return (
        <DistanceProfileContext.Provider
            value={{ knownDistanceProfiles: knownProfiles, selectedProfile, setSelectedProfile, triggerFetchProfiles }}>
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
