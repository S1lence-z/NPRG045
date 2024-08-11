import "../css/distancetoolpage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { Sensor } from "../components/Types";
import { useWebSocket } from "../contexts/WebSocketContext";
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

//TODO: import and use cardStrip when you make it work :)
// interface ConnectedSensorCardProps {
//     cardData: Sensor;
//     startDistanceMeasurement: (sensorId: number) => void;
//     stopDistanceMeasurement: (sensorId: number) => void;
// }

// const ConnectedSensorCard: React.FC<ConnectedSensorCardProps> = ({
//     cardData,
//     startDistanceMeasurement,
//     stopDistanceMeasurement,
// }) => {
//     return (
//         <div className="connected-sensor-card">
//             <h3>Sensor {cardData.id}</h3>
//             <p>
//                 <b>COM Port:</b> {cardData.port_name}
//             </p>
//             <button onClick={() => startDistanceMeasurement(cardData.id)}>Start</button>
//             <button onClick={() => stopDistanceMeasurement(cardData.id)}>Stop</button>
//         </div>
//     );
// };

const AvailableMeasuringSensors = () => {
    const [connectedSensors, setConnectedSensors] = useState<Sensor[]>([]);
    const { sensorUpdateTrigger } = useWebSocket();

    const fetchConnectedSensors = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/sensors/connected/")
            .then((response) => {
                console.log(response.data);
                setConnectedSensors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the connected sensors.", error);
            });
    };

    const startDistanceMeasurement = (sensorId: number) => {
        axios
            .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensorId}/start`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was an error starting the distance measurement.", error);
            });
    };

    const stopDistanceMeasurement = (sensorId: number) => {
        axios
            .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensorId}/stop`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was an error stopping the distance measurement.", error);
            });
    };

    useEffect(() => {
        fetchConnectedSensors();
    }, [sensorUpdateTrigger]);

    return (
        <div className="available-measuring-sensors">
            <ol>
                {connectedSensors.map((sensor) => {
                    return (
                        <li key={sensor.id}>
                            <h3>Sensor {sensor.id}</h3>
                            <p>
                                <b>COM Port:</b> {sensor.port_name}
                            </p>
                            <button onClick={() => startDistanceMeasurement(sensor.id)}>Start</button>
                            <button onClick={() => stopDistanceMeasurement(sensor.id)}>Stop</button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

// TODO: show the distance measurements in a graph
// TODO: show strength of signal in a graph
//! All data must be processed on the backend, frontend just displays the data
const ShowDistanceMeasurements = () => {
    const { distanceDataQueue } = useWebSocket();

    return (
        <div className="show-distance-measurements">
            <p>Distance Graph</p>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    width={500}
                    height={200}
                    data={distanceDataQueue}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[25, 40]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="black" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const DistanceToolPage = () => {
    return (
        <div className="distance-tool-page">
            <h2>Distance Tool</h2>
            <h3>Sensors Available to Measure Distance</h3>
            <AvailableMeasuringSensors />
            <h3>Temperature Graph</h3>
            <ShowDistanceMeasurements />
        </div>
    );
};

export default DistanceToolPage;
