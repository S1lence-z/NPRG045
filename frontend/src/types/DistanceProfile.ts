interface DistanceProfile {
    id: number;
    name: string;
    start_m: number;
    end_m: number;
    max_step_length: number;
    max_profile: string;
    close_range_leakage_cancellation: boolean;
    signal_quality: number;
    threshold_method: string;
    peaksorting_method: string;
    reflector_shape: string;
    num_frames_in_recorded_threshold: number;
    fixed_threshold_value: number;
    fixed_strength_threshold_value: number;
    threshold_sensitivity: number;
    update_rate: number;
}

export default DistanceProfile;
