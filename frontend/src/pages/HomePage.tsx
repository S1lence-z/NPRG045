import { useEffect, useState } from "react";
import axios from "axios";
import { useWebSocket } from "../contexts/WebSocketContext";
import { Port, Sensor } from "../components/Types";
import { CButton, CButtonGroup, CCard, CCardBody, CCardTitle, CFormSelect } from "@coreui/react";
import { PortsProvider, usePorts } from "../contexts/AvailablePortsContext";

const AvailablePorts = () => {
    const { availablePorts } = usePorts();

    const populateCardGroup = () => {
        // TODO: add port images to the cards

        if (availablePorts) {
            return availablePorts.map((port: Port) => {
                return (
                    <CCard key={port.name} className="bg-info">
                        <CCardBody>
                            <CCardTitle>{port.name}</CCardTitle>
                            <div key={port.device_hwid} className="card-text">
                                <p>
                                    <b>Device HWID:</b> {port.device_hwid}
                                    <br />
                                    <b>Device Description:</b> {port.description}
                                </p>
                            </div>
                        </CCardBody>
                    </CCard>
                );
            });
        }
    };

    return (
        <div>
            <h3>Available Sensors</h3>
            <div className="d-flex gap-3">{populateCardGroup()}</div>
            <PortConnectSelection />
        </div>
    );
};

const PortConnectSelection = () => {
    // Ports context
    const { availablePorts, selectedPort, setSelectedPort } = usePorts();
    // States
    const [portOptions, setPortOptions] = useState<{ label: string; value: string }[]>([]);

    const handlePortChange = (event: any) => {
        const selectedPortValue = event.target.value;
        const selectedPort = availablePorts.find((port) => port.name === selectedPortValue);
        setSelectedPort(selectedPort);
    };

    const handleConnectPort = () => {
        if (selectedPort === undefined) {
            console.error("No port selected.");
            return;
        }
        const postData = selectedPort;
        console.log(postData);
        axios
            .post("http://127.0.0.1:8000/api/v1/sensors/", postData)
            .then((response) => {
                console.log("Port connection response: ", response.data);
            })
            .catch((error) => {
                console.error("There was an error connecting to the port.", error);
            });
    };

    const handleConnectAllPorts = () => {
        availablePorts.forEach((availablePort) => {
            const postData = availablePort;
            axios
                .post("http://127.0.0.1:8000/api/v1/sensors/", postData)
                .then((response) => {
                    console.log("Port connection response: ", response.data);
                })
                .catch((error) => {
                    console.error("There was an error connecting to the port.", error);
                });
        });
    };

    useEffect(() => {
        const portNames = availablePorts.map((port: Port) => {
            return { value: port.name, label: port.name };
        });
        setPortOptions(portNames);
    }, [availablePorts]);

    return (
        <>
            <CFormSelect id="portSelect" onChange={handlePortChange} label="Select a port" options={portOptions} />
            <CButtonGroup className="mt-2" role="group">
                <CButton color="success" onClick={handleConnectPort}>
                    Connect Selected Port
                </CButton>
                <CButton color="warning" onClick={handleConnectAllPorts}>
                    Connect All
                </CButton>
                <CButton color="danger">Disconnect All</CButton>
            </CButtonGroup>
        </>
    );
};

const KnownSensorsInformation = () => {
    const [knownSensors, setKnownSensors] = useState<Sensor[]>([]);
    const triggerSensorChange = useWebSocket();

    const fetchKnownSensors = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/sensors/")
            .then((response) => {
                setKnownSensors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the available sensors.", error);
            });
    };

    const populateCardGroup = () => {
        if (knownSensors) {
            return knownSensors.map((sensor: Sensor) => {
                return (
                    <CCard key={sensor.id} style={{ width: "18rem" }} className="flex-fill">
                        <CCardBody>
                            <CCardTitle>Sensor {sensor.id}</CCardTitle>
                            <div className="card-text">
                                <div>
                                    <b>COM Port:</b> {sensor.port_name}
                                </div>
                                <div>
                                    <b>Description:</b> {sensor.port_description}
                                </div>
                                <div>
                                    <b>Hardware ID:</b> {sensor.hwid}
                                </div>
                                <div
                                    style={{
                                        backgroundColor: sensor.is_connected ? "green" : "red",
                                        color: "black",
                                        borderRadius: "5px",
                                        padding: "5px",
                                    }}>
                                    <b>Status:</b> {sensor.is_connected ? "CONNECTED" : "DISCONNECTED"}
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                );
            });
        }
    };

    useEffect(() => {
        fetchKnownSensors();
    }, [triggerSensorChange]);

    return (
        <>
            <h3>Known Sensors</h3>
            <div className="d-flex gap-3">{populateCardGroup()}</div>
        </>
    );
};

const HomePage = () => {
    return (
        <PortsProvider>
            <div className="home-page d-flex flex-column gap-3">
                <div className="available-sensors">
                    <AvailablePorts key={1} />
                </div>
                <div className="known-sensor">
                    <KnownSensorsInformation key={2} />
                </div>
            </div>
        </PortsProvider>
    );
};

export default HomePage;
