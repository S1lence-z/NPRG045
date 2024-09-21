import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import DistanceProfile from "../types/DistanceProfile";
import Sensor from "../types/Sensor";
import SensorConfig from "../types/SensorConfig";

export const useFetchConnectedSensors = () => {
    //? is the loading state and error state necessary?
    const [connectedSensors, setConnectedSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConnectedSensors = async () => {
        setLoading(true);
        try {
            const response: AxiosResponse<Sensor[]> = await axios.get(
                "http://127.0.0.1:8000/api/v1/sensors/connected/"
            );
            setConnectedSensors(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching connected sensors: ", error);
            setError("error fetching connected sensors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedSensors();
    }, []);

    return { connectedSensors, fetchConnectedSensors, loading, error };
};

export const fetchDeleteDistanceProfile = async (distanceProfileId: number) => {
    await axios
        .delete(`http://127.0.0.1:8000/api/v1/profiles/distance/${distanceProfileId}`)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(JSON.stringify(error));
        });
};

export const fetchDeleteSensorConfig = async (sensorConfigId: number) => {
    await axios
        .delete(`http://127.0.0.1:8000/api/v1/sensor_configs/${sensorConfigId}`)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(JSON.stringify(error));
        });
};

export const fetchCreateDistanceProfile = async (distanceProfileFormData: DistanceProfile) => {
    await axios
        .post("http://127.0.0.1:8000/api/v1/profiles/distance/", distanceProfileFormData)
        .then((response) => {
            alert("Success: " + response.data.message);
        })
        .catch((error) => {
            const validationErrorMessage = JSON.stringify(error.response.data);
            alert("Error: " + validationErrorMessage);
        });
};

export const fetchUpdateDistanceProfile = async (
    distanceProfileId: number,
    distanceProfileFormData: DistanceProfile
) => {
    await axios
        .put(`http://127.0.0.1:8000/api/v1/profiles/distance/${distanceProfileId}`, distanceProfileFormData)
        .then((response) => {
            alert("Success: " + response.data.message);
        })
        .catch((error) => {
            const validationErrorMessage = JSON.stringify(error.response?.data);
            alert("Error: " + validationErrorMessage);
        });
};

export const fetchCreateSensorConfig = async (sensorConfigFormData: SensorConfig) => {
    await axios
        .post("http://127.0.0.1:8000/api/v1/sensor_configs/", sensorConfigFormData)
        .then((response) => {
            alert("Success: " + response.data);
        })
        .catch((error) => {
            const validationErrorMessage = JSON.stringify(error.response?.data);
            console.error(error);
            alert("Error: " + validationErrorMessage);
        });
};

export const fetchUpdateSensorConfig = async (sensorConfigId: number, sensorConfigFormData: SensorConfig) => {
    await axios
        .put(`http://127.0.0.1:8000/api/v1/sensor_configs/${sensorConfigId}`, sensorConfigFormData)
        .then((response) => {
            alert("Success: " + response.data);
        })
        .catch((error) => {
            const validationErrorMessage = JSON.stringify(error.response?.data);
            alert("Error: " + validationErrorMessage);
        });
};

export const fetchDistanceProfiles: () => Promise<DistanceProfile[]> = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/profiles/distance/");
        return response.data;
    } catch (error) {
        console.error("There was an error fetching the distance profiles.", error);
        return [];
    } finally {
        console.log("fetchDistanceProfiles completed");
    }
};

export const fetchSensorConfigs: () => Promise<SensorConfig[]> = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/sensor_configs/");
        return response.data;
    } catch (error) {
        console.error("There was an error fetching the sensor configs.", error);
        return [];
    } finally {
        console.log("fetchSensorConfigs completed");
    }
};
