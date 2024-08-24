import { useEffect, useState } from "react";
import axios from "axios";
import { useWebSocket } from "../contexts/WebSocketContext";
import { Port, SelectOption, Sensor } from "../components/Types";
import { CButton, CButtonGroup, CCard, CCardBody, CCardGroup, CCardTitle } from "@coreui/react";
import ReactSelect, { GroupBase, SingleValue } from "react-select";

const AvailablePorts = () => {
    const [availablePorts, setAvailablePorts] = useState<readonly Port[]>([]);
    const [portOptions, setPortOptions] = useState<readonly (SelectOption<Port> | GroupBase<SelectOption<Port>>)[]>([]);
    const [selectedPort, setSelectedPort] = useState<SingleValue<SelectOption<Port>> | null>(null);
    const portUpdateTrigger = useWebSocket();

    const fetchAvailablePorts = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/ports/")
            .then((response) => {
                const responseData = response.data;
                // Set the available port objects
                setAvailablePorts(responseData);
                // Set the options for the select input
                const portNames = responseData.map((port: Port) => {
                    return new SelectOption<Port>(port.name, port);
                });
                setPortOptions(portNames);
            })
            .catch((error) => {
                console.error("There was an error fetching the available ports.", error);
            });
    };

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

    const handlePortChange = (selectedOption: any) => {
        setSelectedPort(selectedOption);
    };

    const handleConnectPort = () => {
        if (selectedPort === null) {
            console.error("No port selected.");
            return;
        }
        const postData = selectedPort.value;
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

    // TODO: implement disconnect all ports

    useEffect(() => {
        fetchAvailablePorts();
    }, [portUpdateTrigger]);

    return (
        <div>
            <h3>Available sensors</h3>
            <CCardGroup>{populateCardGroup()}</CCardGroup>
            <div className="mt-2">
                <ReactSelect
                    value={selectedPort}
                    onChange={handlePortChange}
                    options={portOptions}
                    placeholder="Select a port"
                />
                <CButtonGroup className="mt-2" role="group">
                    <CButton color="success" onClick={handleConnectPort}>
                        Connect Selected Port
                    </CButton>
                    <CButton color="warning" onClick={handleConnectAllPorts}>
                        Connect All
                    </CButton>
                    <CButton color="danger">Disconnect All</CButton>
                </CButtonGroup>
            </div>
        </div>
    );
};

const ConnectedSensorsInformation = () => {
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
                    <CCard key={sensor.id} style={{ width: "18rem" }}>
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
                                <div>
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
            <h3>Connected sensors</h3>
            <CCardGroup>{populateCardGroup()}</CCardGroup>
        </>
    );
};

const HomePage = () => {
    return (
        <div className="home-page">
            <h2>New Home Page</h2>
            <AvailablePorts key={1} />
            <ConnectedSensorsInformation key={2} />
        </div>
    );
};

export default HomePage;
