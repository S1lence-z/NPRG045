import { useEffect, useRef } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CChart } from "@coreui/react-chartjs";
import { Chart as ChartJS } from "chart.js";
import DistanceToolControls from "../components/DistanceToolControls";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

const chartHeight = 130;
const chartWidth = 200;

const DistanceChartCard = () => {
    const { distanceDataQueue } = useWebSocket();
    const distanceChartRef = useRef<ChartJS>(null);

    useEffect(() => {
        if (distanceChartRef.current) {
            const chart = distanceChartRef.current;
            const labels = distanceDataQueue.map((data) => data.timestamp);
            const distances = distanceDataQueue.map((data) => data.distances.value);
            const temperatures = distanceDataQueue.map((data) => data.temperature);
            const strengths = distanceDataQueue.map((data) => data.strengths[0]);
            // TODO: edit the data structure to include the strength of the signal

            chart.data.labels = labels;
            chart.data.datasets[0].data = distances;
            chart.data.datasets[1].data = temperatures;
            chart.data.datasets[2].data = strengths;
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
                                yAxisID: "y-distance",
                                data: [],
                            },
                            {
                                label: "Temperature",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-temperature",
                                data: [],
                            },
                            {
                                label: "Strength",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-strength",
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
            </div>
            <div className="distance-tool-controls d-flex flex-column flex-grow-1 ms-5">
                <DistanceToolControls />
            </div>
        </div>
    );
};

export default DistanceToolPage;
