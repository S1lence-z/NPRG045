import axios from "axios";
import Sensor from "../types/Sensor";
import DistanceProfile from "../types/DistanceProfile";
import DistanceProfileForm from "./DistanceProfileForm/DistanceProfileForm";
import { useDistanceProfile } from "../contexts/DistanceProfileContext";
import ConnectedSensorsStatus from "./ConnectedSensorsStatus";
import ConfigSelector from "./ConfigSelector";
import { fetchDeleteDistanceProfile } from "../hooks/apiHooks";
import ConfigDetailsCard from "./ConfigDetailsCard";
import { distanceProfileDisplayNames } from "./DistanceProfileForm/distanceProfileNameMap";

const DistanceToolControls = () => {
    const {
        knownDistanceProfiles: knownProfiles,
        selectedProfile,
        setSelectedProfile,
        triggerFetchProfiles,
    } = useDistanceProfile();

    const startDistanceMeasurement = (availableSensors: Sensor[]) => {
        const postData = {
            distance_profile_id: selectedProfile?.id,
        };
        availableSensors.forEach((sensor) => {
            axios
                .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensor.id}/start`, postData)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("There was an error starting the distance measurement.", error);
                });
        });
    };

    const stopDistanceMeasurement = (availableSensors: Sensor[]) => {
        availableSensors.forEach((sensor) => {
            axios
                .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensor.id}/stop`)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("There was an error stopping the distance measurement.", error);
                });
        });
    };

    return (
        <div className="d-flex flex-column flex-fill justify-space-between">
            <ConnectedSensorsStatus onStart={startDistanceMeasurement} onStop={stopDistanceMeasurement} />
            <div className="mt-2 flex-grow-1">
                <ConfigSelector<DistanceProfile>
                    label="Select Distance Profile"
                    knownConfigs={knownProfiles}
                    selectedConfig={selectedProfile}
                    setSelectedConfig={setSelectedProfile}
                    triggerFetchConfigs={triggerFetchProfiles}
                    apiDeleteCallback={fetchDeleteDistanceProfile}
                    ConfigFormComponent={DistanceProfileForm}
                />
            </div>
            <div className="mt-2 flex-grow-1">
                <ConfigDetailsCard<DistanceProfile>
                    config={selectedProfile}
                    nameMap={distanceProfileDisplayNames}
                    label="Distance Profile Details"
                />
            </div>
        </div>
    );
};

export default DistanceToolControls;
