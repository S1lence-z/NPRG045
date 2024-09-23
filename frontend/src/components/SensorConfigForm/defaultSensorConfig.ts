import SensorConfig from "../../types/SensorConfig";

export const emptySensorConfig: SensorConfig = {
    id: 0,
    name: "",
    sweeps_per_frame: 0,
    continuous_sweep_mode: false,
    double_buffering: false,
    inter_frame_idle_state: "",
    inter_sweep_idle_state: "",
    // OPTIONAL FIELDS
    sweep_rate: 0,
    frame_rate: 0,
    start_point: 0,
    num_points: 0,
    step_length: 0,
    profile: "",
    hwaas: 0,
    receiver_gain: 0,
    enable_tx: false,
    enable_loopback: false,
    phase_enhancement: false,
    prf: "",
};

export const defaultSensorConfig: SensorConfig = {
    id: 0,
    name: "",
    sweeps_per_frame: 1,
    continuous_sweep_mode: false,
    double_buffering: false,
    inter_frame_idle_state: "DEEP_SLEEP",
    inter_sweep_idle_state: "READY",
    // OPTIONAL FIELDS
    sweep_rate: 1,
    frame_rate: 1,
    start_point: 80,
    num_points: 160,
    step_length: 1,
    profile: "PROFILE_3",
    hwaas: 8,
    receiver_gain: 16,
    enable_tx: true,
    enable_loopback: false,
    phase_enhancement: false,
    prf: "PRF_15_6_MHz",
};
