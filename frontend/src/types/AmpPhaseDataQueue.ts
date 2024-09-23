import AmpPhaseDataPacket from "./AmpPhaseDataPacket";

interface FuncAddDataToQueue {
    (data: AmpPhaseDataPacket): Map<number, AmpPhaseDataPacket[]>;
}

interface AmpPhaseDataQueue {
    (): {
        getLastPacketBySensorId: (sensorId: number) => AmpPhaseDataPacket[] | undefined;
        addAmpPhaseData: FuncAddDataToQueue;
        sensorDataQueues: Map<number, AmpPhaseDataPacket[]>;
        clearSensorDataQueues: () => void;
        getPacketsBySensorId: (sensorId: number) => AmpPhaseDataPacket[] | undefined;
    };
}

export default AmpPhaseDataQueue;
