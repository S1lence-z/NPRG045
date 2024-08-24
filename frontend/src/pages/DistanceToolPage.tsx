import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Sensor } from "../components/Types";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CChart } from "@coreui/react-chartjs";
import { CButton, CCard, CCardBody, CCardTitle } from "@coreui/react";
import { Chart as ChartJS } from "chart.js";

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

const ShowDistanceGraph = () => {
    const { distanceDataQueue } = useWebSocket();
    const distanceChartRef = useRef<ChartJS>(null);
    
    useEffect(() => {
        if (distanceChartRef.current) {
            const chart = distanceChartRef.current;
            chart.data.labels = distanceDataQueue.map((data) => data.timestamp);
            chart.data.datasets[0].data = distanceDataQueue.map((data) => data.distances.value);
            // TODO: show strength of signal in a graph
            chart.update();
        }  
    }, [distanceDataQueue]);

    return (
        <div className="show-distance-measurements">
            <div className="card bg-warning">
                <div className="card-header">Distance Graph</div>
                <div className="card-body">
                    <div className="c-chart-wrapper">
                        <CChart
                            ref={distanceChartRef}
                            height={200}
                            width={300}
                            type="line"
                            data={{
                                labels: [],
                                datasets: [
                                    {
                                        label: "Distance",
                                        backgroundColor: "rgba(255,99,132,0.2)",
                                        borderColor: "rgba(255,99,132,1)",
                                        pointBackgroundColor: "rgba(255,99,132,1)",
                                        pointBorderColor: "#fff",
                                        data: [],
                                    },
                                ],
                            }}></CChart>
                    </div>
                </div>
            </div>
        </div>
    );
};

//! All data must be processed on the backend, frontend just displays the data
const ShowTemperatureGraph = () => {
    const { distanceDataQueue } = useWebSocket();
    const temperatureChartRef = useRef<ChartJS>(null);

    useEffect(() => {
        if (temperatureChartRef.current) {
            const chart = temperatureChartRef.current;
            chart.data.labels = distanceDataQueue.map((data) => data.timestamp);
            chart.data.datasets[0].data = distanceDataQueue.map((data) => data.temperature);
            chart.update();
        }  
    }, [distanceDataQueue]);

    return (
        <div className="card mb-4">
            <div className="card-header">Temperature Graph</div>
            <div className="card-body">
                <div className="c-chart-wrapper">
                    <CChart
                        ref={temperatureChartRef}
                        height={200}
                        width={300}
                        type="line"
                        data={{
                            labels: [],
                            datasets: [
                                {
                                    label: "Temperature",
                                    backgroundColor: "rgba(255,99,132,0.2)",
                                    borderColor: "rgba(255,99,132,1)",
                                    pointBackgroundColor: "rgba(255,99,132,1)",
                                    pointBorderColor: "#fff",
                                    data: [],
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
