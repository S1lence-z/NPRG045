import DistanceToolControls from "../components/DistanceToolControls";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CButton, CCard, CCardBody, CFormSwitch, CHeader } from "@coreui/react";
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
import zoomPlugin from "chartjs-plugin-zoom";
import DistanceDataPoint from "../types/DistanceDataPoint";
import DistanceDataPacket from "../types/DistanceDataPacket";
import { DistanceProfileProvider } from "../contexts/DistanceProfileContext";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, CategoryScale, zoomPlugin);

const DistanceChartCard = ({ chartHeight, chartWidth }: { chartHeight: number; chartWidth: number }) => {
    const {
        distanceDataQueue,
        setDistanceDataQueue,
        distanceHistoryData: historyData,
        setDistanceHistoryData: setHistoryData,
    } = useWebSocket();
    // TODO: update sensor ids dynamically
    const firstSensorId = 11;
    const secondSensorId = 12;

    const [chartData, setChartData] = useState<ChartData<"line", DistanceDataPoint[]>>({
        labels: [],
        datasets: [
            {
                label: "Sensor " + firstSensorId.toString(),
                data: [] as DistanceDataPoint[],
                borderColor: "rgba(255,99,132,1)",
                backgroundColor: "rgba(255,99,132,0.2)",
                yAxisID: "y-distance",
                xAxisID: "x-time",
                pointRadius: (context) => {
                    if (context.raw === undefined) {
                        return 1;
                    }
                    const dataPoint = context.raw as DistanceDataPoint;
                    if (dataPoint.strength === undefined) {
                        return 1;
                    }
                    const strength = dataPoint.strength;
                    return Math.abs(strength);
                },
            },
            {
                label: "Sensor " + secondSensorId.toString(),
                data: [] as DistanceDataPoint[],
                borderColor: "rgba(0,123,255,1)",
                backgroundColor: "rgba(0,123,255,0.2)",
                yAxisID: "y-distance",
                xAxisID: "x-time",
                pointRadius: (context) => {
                    if (context.raw === undefined) {
                        return 1;
                    }
                    const dataPoint = context.raw as DistanceDataPoint;
                    if (dataPoint.strength === undefined) {
                        return 1;
                    }
                    const strength = dataPoint.strength;
                    return Math.abs(strength);
                },
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
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: "x",
                },
                pan: {
                    enabled: true,
                    mode: "x",
                },
            },
        },
        scales: {
            "x-time": {
                position: "bottom",
                title: { display: true, text: "Time (timestamp)", font: { size: 16 } },
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

    const updateChart = (dataToShow: DistanceDataPacket[]) => {
        setChartData({
            labels: dataToShow.map((packet) => packet.data.timestamp),
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: dataToShow
                        .filter((packet) => packet.sensor.id === firstSensorId)
                        .map((packet) => ({
                            x: packet.data.timestamp,
                            y: packet.data.distances.value,
                            temperature: packet.data.temperature,
                            strength: packet.data.strengths.values[0],
                        })),
                },
                {
                    ...chartData.datasets[1],
                    data: dataToShow
                        .filter((packet) => packet.sensor.id === secondSensorId)
                        .map((packet) => ({
                            x: packet.data.timestamp,
                            y: packet.data.distances.value,
                            temperature: packet.data.temperature,
                            strength: packet.data.strengths.values[0],
                        })),
                },
            ],
        });
    };

    useEffect(() => {
        // Data
        const sensor1Packets = distanceDataQueue.filter((packet) => packet.sensor.id === firstSensorId);
        const sensor2Packets = distanceDataQueue.filter((packet) => packet.sensor.id === secondSensorId);

        // Labels
        let labels = sensor1Packets.map((packet) => packet.data.timestamp);
        if (sensor1Packets.length === 0) {
            labels = sensor2Packets.map((packet) => packet.data.timestamp);
        }

        // Data from sensor 1
        const sensor1Data = sensor1Packets.map((packet) => ({
            x: packet.data.timestamp,
            y: packet.data.distances.value,
            temperature: packet.data.temperature,
            strength: packet.data.strengths.values[0],
        }));

        // Data from sensor 2
        const sensor2Data = sensor2Packets.map((packet) => ({
            x: packet.data.timestamp,
            y: packet.data.distances.value,
            temperature: packet.data.temperature,
            strength: packet.data.strengths.values[0],
        }));

        // Update chart data
        setChartData({
            labels: labels,
            datasets: [
                { ...chartData.datasets[0], data: sensor1Data },
                { ...chartData.datasets[1], data: sensor2Data },
            ],
        });
    }, [distanceDataQueue]);

    const handleShowWholeSessionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const showWholeSession = event.target.checked;
        if (showWholeSession) {
            updateChart(historyData);
        } else {
            updateChart(distanceDataQueue);
        }
    };

    const handleClearButtonClick = useCallback(() => {
        setDistanceDataQueue([]);
        setHistoryData([]);
    }, []);

    return (
        <CCard className="flex-fill">
            <CHeader>
                <CFormSwitch
                    label="Show Session History"
                    id="show-chart-history"
                    onChange={handleShowWholeSessionChange}
                />
                <CButton color="primary" className="p-1 fs-10" onClick={handleClearButtonClick}>
                    Clear
                </CButton>
            </CHeader>
            <CCardBody>
                <div className="chart-wrapper">
                    <Line height={chartHeight} width={chartWidth} data={chartData} options={chartOptions} />
                </div>
            </CCardBody>
        </CCard>
    );
};

const DistanceToolPage = () => {
    return (
        <DistanceProfileProvider>
            <div className="distance-tool-page d-flex flex-row flex-fill gap-3 px-5 pt-2">
                <div className="distance-tool-charts d-flex flex-grow-1">
                    <DistanceChartCard chartHeight={120} chartWidth={250} />
                </div>
                <div className="distance-tool-controls d-flex flex-column flex-fill">
                    <DistanceToolControls />
                </div>
            </div>
        </DistanceProfileProvider>
    );
};

export default DistanceToolPage;
