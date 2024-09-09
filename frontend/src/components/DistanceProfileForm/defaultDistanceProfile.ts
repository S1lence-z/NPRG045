import DistanceProfile from "../../types/DistanceProfile";

export const emptyDistanceProfile: DistanceProfile = {
    id: 0,
    name: "",
    start_m: 0,
    end_m: 0,
    max_step_length: 1,
    max_profile: "",
    close_range_leakage_cancellation: false,
    signal_quality: 0,
    threshold_method: "",
    peaksorting_method: "",
    reflector_shape: "",
    num_frames_in_recorded_threshold: 0,
    fixed_threshold_value: 0,
    fixed_strength_threshold_value: 0,
    threshold_sensitivity: 0,
    update_rate: 0,
};

// THIS IS THE SAME AS THE DEFAULT SETTINGS ON THE BACKEND
export const defaultDistanceProfile: DistanceProfile = {
    id: 0, //! This will not be send to the backend
    name: "",
    start_m: 0.25,
    end_m: 3.0,
    max_step_length: 1,
    max_profile: "PROFILE_5",
    close_range_leakage_cancellation: false,
    signal_quality: 15,
    threshold_method: "CFAR",
    peaksorting_method: "STRONGEST",
    reflector_shape: "GENERIC",
    num_frames_in_recorded_threshold: 100,
    fixed_threshold_value: 1.0,
    fixed_strength_threshold_value: 1.0,
    threshold_sensitivity: 1.0,
    update_rate: 50.0,
};
