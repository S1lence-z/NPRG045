export type SensorConfig = {
    id: number;
    // Required fields
    name: string;
    sweeps_per_frame: number;
    continuous_sweep_mode: boolean;
    double_buffering: boolean;
    inter_frame_idle_state: string;
    inter_sweep_idle_state: string;
    // Optional fields
    sweep_rate: number;
    frame_rate: number;
    start_point: number;
    num_points: number;
    step_length: number;
    profile: string;
    hwaas: number;
    receiver_gain: number;
    enable_tx: boolean;
    enable_loopback: boolean;
    phase_enhancement: boolean;
    prf: string;
};

export default SensorConfig;
