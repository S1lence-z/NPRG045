import { useRef, useState } from "react";
import { CustomDataQueue, DistanceDataPacket } from "./Types";

const maxDisplayDataAmount = 100; //* maximum amount of data to display
const graphUpdateInterval = 30; //* in milliseconds

const useDistanceDataQueue: CustomDataQueue = (initialValue: []) => {
    const [historyData, setHistoryData] = useState<DistanceDataPacket[]>(initialValue);
    const [queue, setQueue] = useState<DistanceDataPacket[]>(initialValue);
    const lastUpdateTime = useRef(Date.now());

    const addDataToQueue = (data: DistanceDataPacket) => {
        const currentTime = Date.now();
        setHistoryData((prev) => {
            const updatedHistory = [...prev, data];
            if (shouldUpdateGraph(currentTime, lastUpdateTime.current)) {
                updateGraph(updatedHistory);
                lastUpdateTime.current = currentTime;
            }
            return updatedHistory;
        });
        return historyData;
    };

    const shouldUpdateGraph = (nowTime: number, lastUpdateTime: number) => {
        return nowTime - lastUpdateTime > graphUpdateInterval;
    };

    const updateGraph = (updatedHistory: DistanceDataPacket[]) => {
        setQueue(updatedHistory.slice(-maxDisplayDataAmount));
    };

    return [queue, setQueue, addDataToQueue, historyData, setHistoryData];
};

export default useDistanceDataQueue;
