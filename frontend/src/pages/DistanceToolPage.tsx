import { useEffect, useRef } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CChart } from "@coreui/react-chartjs";
import { Chart as ChartJS } from "chart.js";
import DistanceToolControls from "../components/DistanceToolControls";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

const chartHeight = 50;
const chartWidth = 200;

const DistanceChartCard = () => {
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
        <CCard>
            <CCardHeader>Distance Data</CCardHeader>
            <CCardBody>
                <CChart
                    ref={distanceChartRef}
                    height={chartHeight}
                    width={chartWidth}
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
            </CCardBody>
        </CCard>
    );
};

const TemperatureChartCard = () => {
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
        <CCard className="mt-2">
            <CCardHeader>Temperature Data</CCardHeader>
            <CCardBody>
                <CChart
                    ref={temperatureChartRef}
                    height={chartHeight}
                    width={chartWidth}
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
            </CCardBody>
        </CCard>
    );
};

const DistanceToolPage = () => {
    return (
        <div className="d-flex flex-row flex-grow-1">
            <div className="distance-charts d-flex flex-column flex-grow-1 justify-content-between">
                <DistanceChartCard />
                <TemperatureChartCard />
            </div>
            <div className="distance-tool-controls d-flex flex-column flex-grow-1 ms-5">
                <DistanceToolControls />
            </div>
        </div>
    );
};

export default DistanceToolPage;
