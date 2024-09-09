import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFetchConnectedSensors } from "../hooks/apiHooks";
import { CButton, CCard, CCardHeader } from "@coreui/react";
import StartStopFunc from "../types/StartStopFunc";

//* GENERIC COMPONENT FOR CONNECTED SENSORS STATUS
const ConnectedSensorsStatus = ({ onStart, onStop }: { onStart: StartStopFunc; onStop: StartStopFunc }) => {
    // TODO: There is is loading and error array available in the useFetchConnectedSensors hook
    const { connectedSensors, fetchConnectedSensors } = useFetchConnectedSensors();
    const { sensorUpdateTrigger } = useWebSocket();

    useEffect(() => {
        fetchConnectedSensors();
    }, [sensorUpdateTrigger]);

    return (
        <>
            <h5>Controls</h5>
            <CCard>
                <CCardHeader id="sensor-state-card-header">Connected sensor {connectedSensors.length}</CCardHeader>
            </CCard>
            <div className="button-list d-flex justify-content-evenly align-items-center mt-2">
                <CButton type="button" color="success" className="flex-fill" onClick={() => onStart(connectedSensors)}>
                    Start
                </CButton>
                <CButton
                    type="button"
                    color="danger"
                    className="flex-fill ms-2"
                    onClick={() => onStop(connectedSensors)}>
                    Stop
                </CButton>
            </div>
        </>
    );
};

export default ConnectedSensorsStatus;
