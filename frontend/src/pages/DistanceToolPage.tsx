import axios from "axios";
import { useState, useEffect } from "react";
import { Sensor } from "../components/Types";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CChart } from "@coreui/react-chartjs";
import { CButton, CCard, CCardBody, CCardTitle } from "@coreui/react";

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
        <div className="card-group">
            {connectedSensors.map((sensor) => {
                return (
                    <CCard key={sensor.id}>
                        <CCardBody>
                            <CCardTitle>Sensor {sensor.id}</CCardTitle>
                            <CButton
                                type="button"
                                className="btn-success"
                                onClick={() => startDistanceMeasurement(sensor.id)}>
                                Start
                            </CButton>
                            <CButton
                                type="button"
                                className="btn-danger"
                                onClick={() => stopDistanceMeasurement(sensor.id)}>
                                Stop
                            </CButton>
                        </CCardBody>
                    </CCard>
                );
            })}
        </div>
    );
};

// TODO: show the distance measurements in a graph
// TODO: show strength of signal in a graph
const ShowDistanceGraph = () => {
    const { distanceDataQueue } = useWebSocket();

    return (
        <div className="show-distance-measurements">
            <div className="card bg-warning">
                <div className="card-header">Distance Graph</div>
                <div className="card-body">
                    <div className="c-chart-wrapper">
                        <CChart
                            height={300}
                            width={400}
                            type="line"
                            data={{
                                labels: distanceDataQueue.map((data) => data.timestamp),
                                datasets: [
                                    {
                                        label: "Distance",
                                        backgroundColor: "rgba(255,99,132,0.2)",
                                        borderColor: "rgba(255,99,132,1)",
                                        pointBackgroundColor: "rgba(255,99,132,1)",
                                        pointBorderColor: "#fff",
                                        data: distanceDataQueue.map((data) => data.distances.value),
                                    },
                                ],
                            }}></CChart>
                    </div>
                </div>

                {/* <LineChart
                width={730}
                height={300}
                data={distanceDataQueue}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis type="number" domain={["data.distances.limits[0]", "data.distances.limits[1]"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="distances.value" stroke="black" activeDot={{ r: 8 }} />
            }}

            {/* <LineChart
                width={730}
                height={300}
                data={distanceDataQueue}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis type="number" domain={["data.distances.limits[0]", "data.distances.limits[1]"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="distances.value" stroke="black" activeDot={{ r: 8 }} />
            </LineChart> */}
            </div>
        </div>
    );
};

//! All data must be processed on the backend, frontend just displays the data
const ShowTemperatureGraph = () => {
    const { distanceDataQueue } = useWebSocket();

    return (
        <div className="card mb-4 bg-danger">
            <div className="card-header">Temperature Graph</div>
            <div className="card-body">
                <div className="c-chart-wrapper">
                    <CChart
                        height={300}
                        width={400}
                        type="line"
                        data={{
                            labels: distanceDataQueue.map((data) => data.timestamp),
                            datasets: [
                                {
                                    label: "Temperature",
                                    backgroundColor: "rgba(255,99,132,0.2)",
                                    borderColor: "rgba(255,99,132,1)",
                                    pointBackgroundColor: "rgba(255,99,132,1)",
                                    pointBorderColor: "#fff",
                                    data: distanceDataQueue.map((data) => data.temperature),
                                },
                            ],
                        }}></CChart>
                </div>
            </div>
        </div>
    );
};

const DistanceToolPage = () => {
    return (
        <div className="distance-tool-page d-flex flex-column">
            <h2>Distance Tool</h2>
            <h4>Sensors Available to Measure Distance</h4>
            <div className="row row-cols-2">
                <AvailableMeasuringSensors />
            </div>
            <h4>Charts</h4>
            <div className="row row-cols-2">
                <ShowDistanceGraph />
                <ShowTemperatureGraph />
            </div>
        </div>
    );
};

export default DistanceToolPage;
