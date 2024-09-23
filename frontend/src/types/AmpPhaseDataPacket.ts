import AmpPhaseData from "./AmpPhaseData";
import Sensor from "./Sensor";

type AmpPhaseDataPacket = {
    type: string;
    message: string;
    sensor: Sensor;
    data: AmpPhaseData;
};

export default AmpPhaseDataPacket;
