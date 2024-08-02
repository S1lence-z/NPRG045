import "../css/homepage.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "reactstrap";
import ReactSelect, { GroupBase, SingleValue } from "react-select";
import { Port, SelectOption, Sensor } from "../components/Types";
import { useWebSocket } from "../contexts/WebSocketContext";
import CardStrip from "../components/CardStrip";
import SensorCard from "../components/SensorCard";

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
            <ReactSelect
                value={selectedPort}
                onChange={handlePortChange}
                options={portOptions}
                placeholder="Select a port"
            />
            <Button color="primary" onClick={handlePortConnection}>
                Connect
            </Button>
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
            <CardStrip
                cards={knownSensors.map((sensor) => {
                    return {
                        id: sensor.id,
                        title: `Sensor ${sensor.id}`,
                        content: sensor,
                    };
                })}
                CardComponent={SensorCard}
            />
        </div>
    );
};

const HomePage = () => {
    return (
        <div className="home-page">
            <h2>Home Page</h2>
            <div className="available-sensor">
                <p>Available Sensors</p>
                <SelectPort />
                <KnownSensorsList />
            </div>
        </div>
    );
};

export default HomePage;
