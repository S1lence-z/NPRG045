import { useEffect, useRef } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { CChart } from "@coreui/react-chartjs";
import { Chart as ChartJS } from "chart.js";
import DistanceToolControls from "../components/DistanceToolControls";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

const chartHeight = 100;
const chartWidth = 200;

const DistanceChartCard = () => {
    const { distanceDataQueue } = useWebSocket();
    const distanceChartRef = useRef<ChartJS>(null);

    // TODO: change the graph component to be able to set options
    // const setGraphOptions = () => {
    //     if (distanceChartRef.current) {
    //         distanceChartRef.current.options = {
    //             scales: {
    //                 x: {
    //                     display: false,
    //                 },
    //                 y: {
    //                     display: false,
    //                 },
    //                 "x-distance-sensor1": {
    //                     display: true,
    //                     type: "time",
    //                     time: {
    //                         unit: "second",
    //                     },
    //                     position: "bottom",
    //                     title: {
    //                         display: true,
    //                         text: "Sensor 1 Time",
    //                     },
    //                 },
    //                 "x-distance-sensor2": {
    //                     display: true,
    //                     type: "time",
    //                     time: {
    //                         unit: "second",
    //                     },
    //                     position: "bottom",
    //                     title: {
    //                         display: true,
    //                         text: "Sensor 2 Time",
    //                     },
    //                 },
    //                 "y-strength": {
    //                     display: false,
    //                 },
    //                 "y-temperature": {
    //                     display: false,
    //                 },
    //                 "y-distance": {
    //                     display: false,
    //                 }
    //             },
    //         };
    //     }
    // };

    useEffect(() => {
        // setGraphOptions();
        if (distanceChartRef.current) {
            const chart = distanceChartRef.current;

            const sensor1Data = distanceDataQueue.filter((packet) => packet.sensor.id === 1);
            const sensor2Data = distanceDataQueue.filter((packet) => packet.sensor.id === 2);

            const sensor1Distance = sensor1Data.map((packet) => packet.data.distances.value);
            const sensor1Temperature = sensor1Data.map((packet) => packet.data.temperature);
            const sensor1Strength = sensor1Data.map((packet) => packet.data.strengths.values[0]);

            const sensor2Distance = sensor2Data.map((packet) => packet.data.distances.value);
            const sensor2Temperature = sensor2Data.map((packet) => packet.data.temperature);
            const sensor2Strength = sensor2Data.map((packet) => packet.data.strengths.values[0]);

            const labels = sensor1Data.map((packet) => packet.data.timestamp);

            chart.data.labels = labels;
            chart.data.datasets[0].data = sensor1Distance;
            chart.data.datasets[1].data = sensor1Temperature;
            chart.data.datasets[2].data = sensor1Strength;
            chart.data.datasets[3].data = sensor2Distance;
            chart.data.datasets[4].data = sensor2Temperature;
            chart.data.datasets[5].data = sensor2Strength;
            chart.update();

            // const labels = distanceDataQueue.map((packet) => packet.data.timestamp);
            // const distances = distanceDataQueue.map((packet) => packet.data.distances.value);
            // const temperatures = distanceDataQueue.map((packet) => packet.data.temperature);
            // const strength = distanceDataQueue.map((packet) => packet.data.strengths.values[0]);

            // chart.data.labels = labels;
            // chart.data.datasets[0].data = distances;
            // chart.data.datasets[1].data = temperatures;
            // chart.data.datasets[2].data = strength;
            // chart.update();
        }
    }, [distanceDataQueue]);

    return (
        <CCard className="flex-fill">
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
                                label: "Distance 1",
                                backgroundColor: "rgba(255,99,132,0.2)",
                                borderColor: "rgba(255,99,132,1)",
                                pointBackgroundColor: "rgba(255,99,132,1)",
                                pointBorderColor: "#fff",
                                yAxisID: "y-distance",
                                xAxisID: "x-distance-sensor1",
                                data: [],
                            },
                            {
                                label: "Temperature 1",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-temperature",
                                xAxisID: "x-distance-sensor1",
                                data: [],
                            },
                            {
                                label: "Strength 1",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-strength",
                                xAxisID: "x-distance-sensor1",
                                data: [],
                            },
                            {
                                label: "Distance 2",
                                backgroundColor: "rgba(0,123,255,0.2)",
                                borderColor: "rgba(0,123,255,1)",
                                pointBackgroundColor: "rgba(0,123,255,1)",
                                pointBorderColor: "#fff",
                                yAxisID: "y-distance",
                                xAxisID: "x-distance-sensor2",
                                data: [],
                            },
                            {
                                label: "Temperature 2",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-temperature",
                                xAxisID: "x-distance-sensor2",
                                data: [],
                            },
                            {
                                label: "Strength 2",
                                backgroundColor: "transparent",
                                borderColor: "transparent",
                                pointBackgroundColor: "transparent",
                                pointBorderColor: "transparent",
                                yAxisID: "y-strength",
                                xAxisID: "x-distance-sensor2",
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
        <div className="d-flex flex-row flex-fill">
            <div className="distance-tool-charts d-flex flex-fill justify-content-between ">
                <DistanceChartCard />
            </div>
            <div className="distance-tool-controls d-flex flex-column flex-grow-1 ms-5">
                <DistanceToolControls />
            </div>
        </div>
    );
};

export default DistanceToolPage;
