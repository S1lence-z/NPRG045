import { CCard, CCardBody, CCardText, CCol, CRow } from "@coreui/react";
import { useSensorConfig } from "../contexts/SensorConfigContext";
import SensorConfig from "../types/SensorConfig";
import SensorConfigForm from "./SensorConfigForm/SensorConfigForm";
import ConnectedSensorsStatus from "./ConnectedSensorsStatus";
import ConfigSelector from "./ConfigSelector";
import { fetchDeleteSensorConfig } from "../hooks/apiHooks";
import axios from "axios";
import Sensor from "../types/Sensor";

// TODO: use the generic ConfigDetailsCard component
const SensorConfigDetails = () => {
    const { selectedSensorConfig } = useSensorConfig();

    const showSensorConfigDetails = (sensorConfig: SensorConfig) => {
        const name = sensorConfig.name;
        const sweepsPerFrame = sensorConfig.sweeps_per_frame;
        const continuousSweepMode = sensorConfig.continuous_sweep_mode;
        const doubleBuffering = sensorConfig.double_buffering;
        const interFrameIdleState = sensorConfig.inter_frame_idle_state;
        const interSweepIdleState = sensorConfig.inter_sweep_idle_state;
        // Optional fields
        const sweepRate = sensorConfig.sweep_rate;
        const frameRate = sensorConfig.frame_rate;
        const startPoint = sensorConfig.start_point;
        const numPoints = sensorConfig.num_points;
        const step_length = sensorConfig.step_length;
        const profile = sensorConfig.profile;
        const hwaas = sensorConfig.hwaas;
        const receiverGain = sensorConfig.receiver_gain;
        const enableTx = sensorConfig.enable_tx;
        const enableLoopback = sensorConfig.enable_loopback;
        const phaseEnhancement = sensorConfig.phase_enhancement;
        const prf = sensorConfig.prf;

        return (
            <CCard>
                <CCardBody>
                    <CCol>
                        <CCardText>
                            <b>Name:</b> {name}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText>
                            <b>Sweeps per Frame:</b> {sweepsPerFrame}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText>
                            <b>Continuous Sweep Mode:</b> {continuousSweepMode ? "Enabled" : "Disabled"}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText>
                            <b>Double Buffering:</b> {doubleBuffering ? "Enabled" : "Disabled"}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText>
                            <b>Inter Frame Idle State:</b> {interFrameIdleState}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText>
                            <b>Inter Sweep Idle State:</b> {interSweepIdleState}
                        </CCardText>
                    </CCol>
                    <CCol>
                        <CCardText className="mt-3">
                            <strong>OPTIONAL FIELDS</strong>
                        </CCardText>
                    </CCol>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>Sweep Rate:</b> {sweepRate}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>Frame Rate:</b> {frameRate}
                            </CCardText>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>Start Point:</b> {startPoint}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>Number of Points:</b> {numPoints}
                            </CCardText>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>Step Length:</b> {step_length}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>Profile:</b> {profile}
                            </CCardText>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>HWAAS:</b> {hwaas}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>Receiver Gain:</b> {receiverGain}
                            </CCardText>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>Enable TX:</b> {enableTx ? "Yes" : "No"}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>Enable Loopback:</b> {enableLoopback ? "Yes" : "No"}
                            </CCardText>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCardText>
                                <b>Phase Enhancement:</b> {phaseEnhancement ? "Yes" : "No"}
                            </CCardText>
                        </CCol>
                        <CCol>
                            <CCardText>
                                <b>PRF:</b> {prf}
                            </CCardText>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
        );
    };

    return (
        <div className="selected-sensor-config-detail mt-2">
            <h5>Selected Sensor Config Details</h5>
            {showSensorConfigDetails(selectedSensorConfig)}
        </div>
    );
};

const HandmotionToolControls = () => {
    const { knownSensorConfigs, selectedSensorConfig, setSelectedSensorConfig, triggerFetchSensorConfigs } =
        useSensorConfig();

    const startHandmotionMeasurement = (availableSensors: Sensor[]) => {
        const postData = {
            sensor_config_id: selectedSensorConfig?.id,
        };
        availableSensors.forEach((sensor: Sensor) => {
            axios
                .post(`http://127.0.0.1:8000/api/v1/measurements/amp_phase/${sensor.id}/start`, postData)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("There was an error starting the handmotion measurement.", error);
                });
        });
    };

    const stopHandmotionMeasurement = (availableSensors: Sensor[]) => {
        availableSensors.forEach((sensor: Sensor) => {
            axios
                .post(`http://127.0.0.1:8000/api/v1/measurements/amp_phase/${sensor.id}/stop`)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("There was an error starting the handmotion measurement.", error);
                });
        });
    };

    return (
        <div className="d-flex flex-column flex-fill justify-space-between">
            <ConnectedSensorsStatus onStart={startHandmotionMeasurement} onStop={stopHandmotionMeasurement} />
            <div className="mt-2">
                <ConfigSelector<SensorConfig>
                    label="Sensor Config"
                    knownConfigs={knownSensorConfigs}
                    selectedConfig={selectedSensorConfig}
                    setSelectedConfig={setSelectedSensorConfig}
                    triggerFetchConfigs={triggerFetchSensorConfigs}
                    apiDeleteCallback={fetchDeleteSensorConfig}
                    ConfigFormComponent={SensorConfigForm}
                />
            </div>
            <div className="mt-2">
                <SensorConfigDetails />
            </div>
        </div>
    );
};

export default HandmotionToolControls;
