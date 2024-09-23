import AmpPhaseDataPacket from "./AmpPhaseDataPacket";
import DistanceDataPacket from "./DistanceDataPacket";

interface WebSocketContextType {
    socket: WebSocket | null;
    status: boolean;
    portUpdateTrigger: number;
    sensorUpdateTrigger: number;
    //* Distance data queue
    distanceDataQueue: DistanceDataPacket[];
    distanceHistoryData: DistanceDataPacket[];
    setDistanceHistoryData: (data: DistanceDataPacket[]) => void;
    setDistanceDataQueue: (data: DistanceDataPacket[]) => void;
    //* Amplitude and phase data queue
    getLastPacketBySensorId: (sensorId: number) => AmpPhaseDataPacket[] | undefined;
    sensorDataQueues: Map<number, AmpPhaseDataPacket[]>;
    clearSensorDataQueues: () => void;
    getPacketsBySensorId: (sensorId: number) => AmpPhaseDataPacket[] | undefined;
}

export default WebSocketContextType;
