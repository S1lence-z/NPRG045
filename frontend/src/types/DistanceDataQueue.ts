import DistanceDataPacket from "./DistanceDataPacket";

interface FuncAddDataToQueue {
    (data: DistanceDataPacket): void;
}

interface DistanceDataQueue {
    (initialValue: []): [
        DistanceDataPacket[],
        (data: DistanceDataPacket[]) => void,
        FuncAddDataToQueue,
        DistanceDataPacket[],
        (data: DistanceDataPacket[]) => void
    ];
}

export default DistanceDataQueue;
