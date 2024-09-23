import HandmotionToolControls from "../components/HandmotionToolControls";
import { useCallback, useEffect, useState } from "react";
import { CButton, CCard, CCardBody, CCardText, CCol, CFormCheck, CRow } from "@coreui/react";
import { Line, Scatter } from "react-chartjs-2";
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
import { SensorConfigProvider } from "../contexts/SensorConfigContext";
import AmpPhaseDataPoint from "../types/AmpPhaseDataPoint";
import { useWebSocket } from "../contexts/WebSocketContext";
import AmpPhaseDataPacket from "../types/AmpPhaseDataPacket";
import { getDistanceAxisDataPoints, getTimeAxisDataPoints, getDistanceLabels, getTimeLabels } from "../utils/ampPhaseUtils";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, CategoryScale, zoomPlugin);

// Constants for the charts
const fontSize = 16;
// TODO: update sensor ids dynamically
const firstSensorId = 11;
const secondSensorId = 12;

// Amplitude Component
const AmplitudeDistanceChart = ({
    chartWidth,
    chartHeight,
    isTimeAxis,
    sensorDataQueues,
}: {
    chartWidth: number;
    chartHeight: number;
    isTimeAxis: boolean;
    sensorDataQueues: Map<number, AmpPhaseDataPacket[]>;
}) => {
    const POINT_RADIUS = 5;
    const { getLastPacketBySensorId, getPacketsBySensorId } = useWebSocket();

    const [chartData, setChartData] = useState<ChartData<"line", AmpPhaseDataPoint[]>>({
        labels: [],
        datasets: [
            {
                label: "Sensor " + firstSensorId.toString(),
                data: [] as AmpPhaseDataPoint[],
                borderColor: "rgba(255,99,132,1)",
                backgroundColor: "rgba(255,99,132,0.2)",
                yAxisID: "y-amplitude",
                xAxisID: "x-distance",
                pointRadius: POINT_RADIUS,
            },
            {
                label: "Sensor " + secondSensorId.toString(),
                data: [] as AmpPhaseDataPoint[],
                borderColor: "rgba(0,123,255,1)",
                backgroundColor: "rgba(0,123,255,0.2)",
                yAxisID: "y-amplitude",
                xAxisID: "x-distance",
                pointRadius: POINT_RADIUS,
            },
        ],
    });

    const chartOptionsDistanceX: ChartOptions<"line"> = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    font: {
                        size: fontSize,
                    },
                },
            },
            title: {
                display: true,
                text: "Amplitude vs Distance",
                font: {
                    size: fontSize,
                },
            },
            tooltip: {
                titleFont: {
                    size: fontSize,
                },
                bodyFont: {
                    size: fontSize,
                },
                callbacks: {
                    label: (context) => {
                        const dataPoint = context.raw as AmpPhaseDataPoint;
                        return [
                            `Amplitude: ${Math.ceil(dataPoint.amplitude * 1000) / 1000}`,
                            `Distance: ${Math.ceil(dataPoint.distance * 1000) / 1000} m`,
                            `Timestamp: ${dataPoint.timestamp}`,
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
            "x-distance": {
                position: "bottom",
                title: { display: true, text: "Distance (m)", font: { size: 16 } },
                ticks: {
                    maxTicksLimit: 20,
                    font: {
                        size: fontSize,
                    },
                },
            },
            "y-amplitude": {
                position: "left",
                title: { display: true, text: "Amplitude", font: { size: 16 } },
                ticks: {
                    font: {
                        size: fontSize,
                    },
                },
            },
        },
    };

    const chartOptionsTimeX: ChartOptions<"line"> = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    font: {
                        size: fontSize,
                    },
                },
            },
            title: {
                display: true,
                text: "Amplitude vs Distance",
                font: {
                    size: fontSize,
                },
            },
            tooltip: {
                titleFont: {
                    size: fontSize,
                },
                bodyFont: {
                    size: fontSize,
                },
                callbacks: {
                    label: (context) => {
                        const dataPoint = context.raw as AmpPhaseDataPoint;
                        return [
                            `Amplitude: ${Math.ceil(dataPoint.amplitude * 1000) / 1000}`,
                            `Distance: ${Math.ceil(dataPoint.distance * 1000) / 1000} m`,
                            `Timestamp: ${dataPoint.timestamp}`,
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
            "x-distance": {
                position: "bottom",
                title: { display: true, text: "Time", font: { size: 16 } },
                ticks: {
                    maxTicksLimit: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            "y-amplitude": {
                position: "left",
                title: { display: true, text: "Amplitude", font: { size: 16 } },
                ticks: {
                    font: {
                        size: fontSize,
                    },
                },
            },
        },
    };

    const [chartOptions, setChartOptions] = useState<ChartOptions<"line">>(chartOptionsDistanceX);

    const clearGraphData = useCallback(() => {
        setChartData({
            labels: [],
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: [],
                },
                {
                    ...chartData.datasets[1],
                    data: [],
                },
            ],
        });
    }, []);

    const showDistanceAxis = () => {
        // Data
        const sensor1Packets = getLastPacketBySensorId(firstSensorId);
        const sensor2Packets = getLastPacketBySensorId(secondSensorId);
        if (!sensor1Packets && !sensor2Packets) {
            // Clear the chart data
            clearGraphData();
            return;
        }

        if (!sensor1Packets || !sensor2Packets) {
            console.log("No data to display");
            return;
        }

        // Labels
        let labels = getDistanceLabels(sensor1Packets);
        if (labels.length === 0) {
            labels = getDistanceLabels(sensor2Packets);
        }

        // Data
        const sensor1Data = getDistanceAxisDataPoints(sensor1Packets, "amplitude");
        const sensor2Data = getDistanceAxisDataPoints(sensor2Packets, "amplitude");

        // Update chart data
        setChartData({
            labels,
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: sensor1Data,
                },
                {
                    ...chartData.datasets[1],
                    data: sensor2Data,
                },
            ],
        });
    };

    const showTimeAxis = () => {
        // Data
        const sensor1Packets = getPacketsBySensorId(firstSensorId);
        const sensor2Packets = getPacketsBySensorId(secondSensorId);
        if (!sensor1Packets && !sensor2Packets) {
            // Clear the chart data
            clearGraphData();
            return;
        }

        if (!sensor1Packets || !sensor2Packets) {
            console.log("No data to display");
            return;
        }

        // Labels
        let labels = getTimeLabels(sensor1Packets);
        if (labels.length === 0) {
            labels = getTimeLabels(sensor2Packets);
        }

        // Data
        const sensor1Data = getTimeAxisDataPoints(sensor1Packets, "amplitude");
        const sensor2Data = getTimeAxisDataPoints(sensor2Packets, "amplitude");

        // Update chart data
        setChartData({
            labels,
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: sensor1Data,
                },
                {
                    ...chartData.datasets[1],
                    data: sensor2Data,
                },
            ],
        });
    };

    useEffect(() => {
        if (isTimeAxis) {
            setChartOptions(chartOptionsTimeX);
        } else {
            setChartOptions(chartOptionsDistanceX);
        }
    }, [isTimeAxis]);

    useEffect(() => {
        isTimeAxis ? showTimeAxis() : showDistanceAxis();
    }, [isTimeAxis, sensorDataQueues]);

    return (
        <CCard className="flex-fill">
            <CCardBody>
                <Line height={chartHeight} width={chartWidth} data={chartData} options={chartOptions} />
            </CCardBody>
        </CCard>
    );
};

// Phase Component
const PhaseDistanceChart = ({
    chartWidth,
    chartHeight,
    sensorDataQueues,
}: {
    chartWidth: number;
    chartHeight: number;
    sensorDataQueues: Map<number, AmpPhaseDataPacket[]>;
}) => {
    const POINT_RADIUS = 5;
    const { getLastPacketBySensorId } = useWebSocket();

    const [chartData, setChartData] = useState<ChartData<"scatter", AmpPhaseDataPoint[]>>({
        labels: [],
        datasets: [
            {
                label: "Sensor " + firstSensorId.toString(),
                data: [] as AmpPhaseDataPoint[],
                borderColor: "rgba(255,99,132,1)",
                backgroundColor: "rgba(255,99,132,0.2)",
                yAxisID: "y-phase",
                xAxisID: "x-distance",
                pointRadius: POINT_RADIUS,
            },
            {
                label: "Sensor " + secondSensorId.toString(),
                data: [] as AmpPhaseDataPoint[],
                borderColor: "rgba(0,123,255,1)",
                backgroundColor: "rgba(0,123,255,0.2)",
                yAxisID: "y-phase",
                xAxisID: "x-distance",
                pointRadius: POINT_RADIUS,
            },
        ],
    });

    const chartOptions: ChartOptions<"scatter"> = {
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    font: {
                        size: fontSize,
                    },
                },
            },
            title: {
                display: true,
                text: "Phase vs Distance",
                font: {
                    size: fontSize,
                },
            },
            tooltip: {
                titleFont: {
                    size: fontSize,
                },
                bodyFont: {
                    size: fontSize,
                },
                callbacks: {
                    label: (context) => {
                        const dataPoint = context.raw as AmpPhaseDataPoint;
                        return [
                            `Phase: ${Math.ceil(dataPoint.phase * 1000) / 1000}`,
                            `Distance: ${Math.ceil(dataPoint.distance * 1000) / 1000} m`,
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
            "x-distance": {
                position: "bottom",
                title: { display: true, text: "Distance (m)", font: { size: fontSize } },
                ticks: {
                    font: {
                        size: fontSize,
                    },
                },
            },
            "y-phase": {
                position: "left",
                title: { display: true, text: "Phase", font: { size: fontSize } },
                ticks: {
                    font: {
                        size: fontSize,
                    },
                },
            },
        },
    };

    const clearGraphData = useCallback(() => {
        setChartData({
            labels: [],
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: [],
                },
                {
                    ...chartData.datasets[1],
                    data: [],
                },
            ],
        });
    }, []);

    useEffect(() => {
        // Data
        const sensor1Packets = getLastPacketBySensorId(firstSensorId);
        const sensor2Packets = getLastPacketBySensorId(secondSensorId);
        if (!sensor1Packets && !sensor2Packets) {
            clearGraphData();
            return;
        }

        if (!sensor1Packets || !sensor2Packets) {
            console.log("No data to display");
            return;
        }

        // Labels
        let labels = getDistanceLabels(sensor1Packets);
        if (labels.length === 0) {
            labels = getDistanceLabels(sensor2Packets);
        }

        // Data
        const sensor1Data = getDistanceAxisDataPoints(sensor1Packets, "phase");
        const sensor2Data = getDistanceAxisDataPoints(sensor2Packets, "phase");

        // Update chart data
        setChartData({
            labels,
            datasets: [
                {
                    ...chartData.datasets[0],
                    data: sensor1Data,
                },
                {
                    ...chartData.datasets[1],
                    data: sensor2Data,
                },
            ],
        });
    }, [sensorDataQueues]);

    return (
        <CCard className="flex-fill">
            <CCardBody>
                <Scatter height={chartHeight} width={chartWidth} data={chartData} options={chartOptions} />
            </CCardBody>
        </CCard>
    );
};

const HandMotionAdditionalControls = ({
    isTimeAxis,
    setIsTimeAxis,
    buttonActionCallback,
}: {
    isTimeAxis: boolean;
    setIsTimeAxis: React.Dispatch<React.SetStateAction<boolean>>;
    buttonActionCallback?: () => void;
}) => {
    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsTimeAxis(event.target.checked);
    };

    return (
        <CCard className="flex-fill">
            <CCardBody className="p-3">
                <CCardText className="d-flex justify-content-between align-items-center">
                    <CFormCheck
                        label="Show X axis as Time"
                        id="switch-chart-x-axis"
                        onChange={handleSwitchChange}
                        checked={isTimeAxis}
                    />
                    <CButton color="primary" className="p-1 fs-10" onClick={buttonActionCallback}>
                        Clear Charts
                    </CButton>
                </CCardText>
            </CCardBody>
        </CCard>
    );
};

const HandmotionToolPage = () => {
    const customChartWidth = 100;
    const customChartHeight = 30;
    const [isTimeAxis, setIsTimeAxis] = useState<boolean>(false);
    const { sensorDataQueues, clearSensorDataQueues } = useWebSocket();

    return (
        <>
            <SensorConfigProvider>
                <div className="handmotion-tool-page d-flex flex-row flex-fill gap-2 px-5">
                    <div className="handmotion-tool-charts d-flex flex-column gap-2 col-8">
                        <CRow>
                            <CCol md>
                                <AmplitudeDistanceChart
                                    chartHeight={customChartHeight}
                                    chartWidth={customChartWidth}
                                    isTimeAxis={isTimeAxis}
                                    sensorDataQueues={sensorDataQueues}
                                />
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol md>
                                <PhaseDistanceChart
                                    chartHeight={customChartHeight}
                                    chartWidth={customChartWidth}
                                    sensorDataQueues={sensorDataQueues}
                                />
                            </CCol>
                        </CRow>
                    </div>
                    <div className="handmotion-tool-sidebar d-flex flex-column flex-grow-2 col-4">
                        <div className="handmotion-additional-controls d-flex flex-column flex-fill">
                            <HandMotionAdditionalControls
                                isTimeAxis={isTimeAxis}
                                setIsTimeAxis={setIsTimeAxis}
                                buttonActionCallback={clearSensorDataQueues}
                            />
                        </div>
                        <div className="handmotion-tool-controls d-flex flex-column flex-fill mt-5">
                            <HandmotionToolControls />
                        </div>
                    </div>
                </div>
            </SensorConfigProvider>
        </>
    );
};

export default HandmotionToolPage;
