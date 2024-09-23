// TODO: add timestamp on the backend as well as here
type AmpPhaseData = {
    timestamp: string;
    subsweep_results: [
        {
            amplitude: number[];
            phase: number[];
        }
    ];
    distances_result: number[];
};

export default AmpPhaseData;
