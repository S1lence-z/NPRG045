import { useCallback, useEffect, useRef, useState } from "react";
import AmpPhaseDataPacket from "../types/AmpPhaseDataPacket";
import AmpPhaseDataQueue from "../types/AmpPhaseDataQueue";

const maxDisplayDataAmount = 100; //* maximum amount of data to display for time x axis
const graphUpdateInterval = 1; //* in milliseconds

const useAmpPhaseDataQueue: AmpPhaseDataQueue = () => {
    const [sensorDataQueues, setSensorDataQueues] = useState<Map<number, AmpPhaseDataPacket[]>>(new Map());
    const lastUpdateTime = useRef(Date.now());

    const addAmpPhaseData = (data: AmpPhaseDataPacket) => {
        const currentTime = Date.now();

        setSensorDataQueues((prevQueues) => {
            const updatedQueues = new Map(prevQueues);
            const sensorId = data.sensor.id;
            const sensorQueue = updatedQueues.get(sensorId) || [];
            const updatedQueue = [...sensorQueue, data];
            if (shouldUpdateGraph(currentTime, lastUpdateTime.current)) {
                lastUpdateTime.current = currentTime;
            }
            updatedQueues.set(sensorId, updatedQueue);
            return updatedQueues;
        });
        return sensorDataQueues;
    };

    const getLastPacketBySensorId = (sensorId: number): AmpPhaseDataPacket[] | undefined => {
        const sensorDataQueue = sensorDataQueues.get(sensorId);
        if (!sensorDataQueue) return undefined;
        return sensorDataQueue.slice(-1);
    };

    const getPacketsBySensorId = (sensorId: number): AmpPhaseDataPacket[] | undefined => {
        const sensorDataQueue = sensorDataQueues.get(sensorId);
        if (!sensorDataQueue) return undefined;
        return sensorDataQueue.slice(-maxDisplayDataAmount);
    };

    const shouldUpdateGraph = useCallback(
        (nowTime: number, lastUpdateTime: number) => {
            return nowTime - lastUpdateTime > graphUpdateInterval;
        },
        [graphUpdateInterval]
    );

    const clearSensorDataQueues = useCallback(() => {
        setSensorDataQueues(new Map());
    }, []);

    useEffect(() => {
        console.log(sensorDataQueues);
    }, [sensorDataQueues]);

    return { getLastPacketBySensorId, addAmpPhaseData, sensorDataQueues, clearSensorDataQueues, getPacketsBySensorId };
};

export default useAmpPhaseDataQueue;
