import DistanceToolControls from "../components/DistanceToolControls";
import { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CCard, CCardBody } from "@coreui/react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, CategoryScale);

const chartHeight = 130;
const chartWidth = 200;

type DistanceDataPoint = {
    x: string;
    y: number;
    temperature: number;
    strength: number;
};

const DistanceChartCard = () => {
    const { distanceDataQueue } = useWebSocket();
    const [chartData, setChartData] = useState<ChartData<"line", DistanceDataPoint[]>>({
        labels: [],
        datasets: [
            {
                label: "Sensor 1",
                data: [] as DistanceDataPoint[],
                borderColor: "rgba(255,99,132,1)",
                backgroundColor: "rgba(255,99,132,0.2)",
                yAxisID: "y-distance",
                xAxisID: "x-time",
            },
            {
                label: "Sensor 2",
                data: [] as DistanceDataPoint[],
                borderColor: "rgba(0,123,255,1)",
                backgroundColor: "rgba(0,123,255,0.2)",
                yAxisID: "y-distance",
                xAxisID: "x-time",
            },
        ],
    });

    const chartOptions: ChartOptions<"line"> = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    font: {
                        size: 16,
                    },
                },
            },
            title: {
                display: true,
                text: "Distance Measurements",
                font: {
                    size: 20,
                },
            },
            tooltip: {
                titleFont: {
                    size: 16,
                },
                bodyFont: {
                    size: 16,
                },
                callbacks: {
                    label: (context) => {
                        const dataPoint = context.raw as DistanceDataPoint;
                        return [
                            `Distance: ${Math.ceil(dataPoint.y * 1000) / 1000} m`,
                            `Temperature: ${dataPoint.temperature} °C`,
                            `Strength: ${Math.ceil(dataPoint.strength * 1000) / 1000}`,
                        ];
                    },
                },
            },
        },
        scales: {
            "x-time": {
                position: "bottom",
                title: { display: true, text: "Time (TimeStamp)", font: { size: 16 } },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            "y-distance": {
                position: "left",
                title: { display: true, text: "Distance (m)", font: { size: 16 } },
                ticks: {
                    font: {
                        size: 14,
                    },
                },
            },
        },
    };

    useEffect(() => {
        // Data
        const sensor1Data = distanceDataQueue.filter((packet) => packet.sensor.id === 1);
        const sensor2Data = distanceDataQueue.filter((packet) => packet.sensor.id === 2);

        // Labels
        const labels = sensor1Data.map((packet) => packet.data.timestamp);

        // Data from sensor 1
        const sensorOnePoint = sensor1Data.map((packet) => ({
            x: packet.data.timestamp,
            y: packet.data.distances.value,
            temperature: packet.data.temperature,
            strength: packet.data.strengths.values[0],
        }));
        const sensorTwoPoint = sensor2Data.map((packet) => ({
            x: packet.data.timestamp,
            y: packet.data.distances.value,
            temperature: packet.data.temperature,
            strength: packet.data.strengths.values[0],
        }));

        // Update chart data
        setChartData({
            labels: labels,
            datasets: [
                { ...chartData.datasets[0], data: sensorOnePoint },
                { ...chartData.datasets[1], data: sensorTwoPoint },
            ],
        });
    }, [distanceDataQueue]);

    return (
        <CCard className="flex-fill">
            <CCardBody>
                <Line height={chartHeight} width={chartWidth} data={chartData} options={chartOptions} />
            </CCardBody>
        </CCard>
    );
};

const DistanceToolPage = () => {
    return (
        <div className="distance-tool-page d-flex flex-row flex-fill gap-3">
            <div className="distance-tool-charts d-flex flex-grow-1">
                <DistanceChartCard />
            </div>
            <div className="distance-tool-controls d-flex flex-column flex-grow-1">
                <DistanceToolControls />
            </div>
        </div>
    );
};

export default DistanceToolPage;
