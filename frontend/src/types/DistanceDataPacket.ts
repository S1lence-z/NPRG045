import DistanceData from "./DistanceData";
import Sensor from "./Sensor";

interface DistanceDataPacket {
    type: string;
    message: string;
    sensor: Sensor;
    data: DistanceData;
}

export default DistanceDataPacket;
