import { useEffect, useState } from "react";
import axios from "axios";
import ReactSelect, { GroupBase, SingleValue } from "react-select";
import { Port, SelectOption, Sensor } from "../components/Types";
import { useWebSocket } from "../contexts/WebSocketContext";

const SelectPort = () => {
    const [selectedPort, setSelectedPort] = useState<SingleValue<SelectOption<Port>> | null>(null);
    const [portOptions, setPortOptions] = useState<readonly (SelectOption<Port> | GroupBase<SelectOption<Port>>)[]>([]);
    const portUpdateTrigger = useWebSocket();

    const fetchPorts = () => {
        setSelectedPort(null);
        axios
            .get("http://127.0.0.1:8000/api/v1/ports/")
            .then((response) => {
                const responseData = response.data;
                const portNames = responseData.map((port: Port) => {
                    return new SelectOption<Port>(port.name, port);
                });
                setPortOptions(portNames);
            })
            .catch((error) => {
                console.error("There was an error fetching the available ports.", error);
            });
    };

    const handlePortChange = (selectedOption: any) => {
        setSelectedPort(selectedOption);
    };

    const handlePortConnection = () => {
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

    useEffect(() => {
        fetchPorts();
    }, [portUpdateTrigger]);

    return (
        <div>
            <h3>Available ports</h3>
            <div className="d-flex">
                <ReactSelect
                    value={selectedPort}
                    onChange={handlePortChange}
                    options={portOptions}
                    placeholder="Select a port"
                />
                <button type="button" className="btn btn-primary mx-2" onClick={handlePortConnection}>
                    Connect
                </button>
            </div>
        </div>
    );
};

const KnownSensorsList = () => {
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

    useEffect(() => {
        fetchKnownSensors();
    }, [triggerSensorChange]);

    return (
        <div>
            <h3>Known Sensors</h3>
            <div className="row row-cols-3">
                {knownSensors.map((sensor: Sensor) => {
                    return (
                        <div className="card px-2 py-2 mx-2 bg-info">
                            <div className="card-title">
                                <b>Sensor {sensor.id}</b>
                            </div>
                            <div className="card-text">
                                <p>
                                    <b>COM Port:</b> {sensor.port_name}
                                </p>
                                <p>
                                    <b>Description:</b> {sensor.port_description}
                                </p>
                                <p>
                                    <b>Hardware ID:</b> {sensor.hwid}
                                </p>
                                <p>
                                    <b>Status:</b> {sensor.is_connected ? "Connected" : "Disconnected"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const HomePage = () => {
    return (
        <div className="home-page">
            <h2>Home Page</h2>
            <div className="available-sensor">
                <SelectPort />
                <KnownSensorsList />
            </div>
        </div>
    );
};

export default HomePage;
