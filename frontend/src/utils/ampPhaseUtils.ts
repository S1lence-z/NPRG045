import AmpPhaseDataPacket from "../types/AmpPhaseDataPacket";

const normalize = (value: number, min: number, max: number) => (value - min) / (max - min);

export const getDistanceLabels = (sensorPacket: AmpPhaseDataPacket[]): string[] => {
    const rawDistances = sensorPacket.flatMap((packet) => packet.data.distances_result);
    const minDistance = Math.min(...rawDistances);
    const maxDistance = Math.max(...rawDistances);
    return rawDistances.map((distance) => normalize(distance, minDistance, maxDistance).toFixed(2));
};

export const getTimeLabels = (sensorPackets: AmpPhaseDataPacket[]) => {
    return sensorPackets.map((packet) => packet.data.timestamp);
};

export const getDistanceAxisDataPoints = (sensorPackets: AmpPhaseDataPacket[], valueNameY: string) => {
    return sensorPackets.flatMap((sensorPacket) => {
        const { distances_result: distances, subsweep_results, timestamp } = sensorPacket.data;
        const { amplitude: amplitudes, phase: phases } = subsweep_results[0];

        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);

        return distances.map((distance, index) => ({
            timestamp: timestamp,
            distance: normalize(distance, minDistance, maxDistance),
            amplitude: amplitudes[index],
            phase: phases[index],
            x: normalize(distance, minDistance, maxDistance),
            y: valueNameY === "amplitude" ? amplitudes[index] : phases[index],
        }));
    });
};

export const getTimeAxisDataPoints = (sensorPackets: AmpPhaseDataPacket[], valueNameY: string) => {
    return sensorPackets.flatMap((sensorPacket) => {
        const { distances_result: distances, subsweep_results, timestamp } = sensorPacket.data;
        const { amplitude: amplitudes, phase: phases } = subsweep_results[0];

        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);

        const maxAmplitude = Math.max(...amplitudes);
        const maxPhase = Math.max(...phases);
        const maxPhaseDistance = distances[amplitudes.indexOf(maxPhase)];
        const maxAmplitudeDistance = distances[amplitudes.indexOf(maxAmplitude)];

        return {
            timestamp: timestamp,
            distance: normalize(maxAmplitudeDistance, minDistance, maxDistance),
            amplitude: maxAmplitude,
            phase: maxPhaseDistance,
            x: timestamp,
            y: valueNameY === "amplitude" ? maxAmplitude : maxPhaseDistance,
        };
    });
};
