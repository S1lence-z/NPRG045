import DistanceDataPacket from "./DistanceDataPacket";

interface FuncAddDataToQueue {
    (data: DistanceDataPacket): void;
}

interface CustomDataQueue {
    (initialValue: []): [
        DistanceDataPacket[],
        (data: DistanceDataPacket[]) => void,
        FuncAddDataToQueue,
        DistanceDataPacket[],
        (data: DistanceDataPacket[]) => void
    ];
}

export default CustomDataQueue;
