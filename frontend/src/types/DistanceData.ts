interface DistanceData {
    timestamp: string;
    distances: {
        value: number;
        limits: number[];
    };
    strengths: {
        values: number[];
    };
    temperature: number;
}

export default DistanceData;
