import DistanceDataPacket from "./DistanceDataPacket";

interface WebSocketContextType {
    socket: WebSocket | null;
    status: boolean;
    portUpdateTrigger: number;
    sensorUpdateTrigger: number;
    distanceDataQueue: DistanceDataPacket[];
    historyData: DistanceDataPacket[];
    setHistoryData: (data: DistanceDataPacket[]) => void;
    setDistanceDataQueue: (data: DistanceDataPacket[]) => void;
}

export default WebSocketContextType;
