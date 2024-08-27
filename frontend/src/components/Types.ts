export interface Port {
    name: string;
    description: string;
    device_hwid: string;
}

export interface Sensor {
    id: number;
    port_name: string;
    port_description: string;
    hwid: string;
    is_connected: boolean;
}

export class SelectOption<T = any> {
    label: string;
    value: T;

    constructor(label: string, value: T) {
        this.label = label;
        this.value = value;
    }
}

export interface DistanceData {
    timestamp: string;
    distances: {
        value: number;
        limits: number[];
    };
    strengths: number[];
    temperature: number;
}

export interface WebSocketContextType {
    socket: WebSocket | null;
    status: boolean;
    portUpdateTrigger: number;
    sensorUpdateTrigger: number;
    distanceDataQueue: DistanceData[];
}

export enum MessageType {
    CONNECTION_ESTABLISHED = "connection_established",
    CONNECTION_CLOSED = "connection_closed",
    PORT_CHANGE = "port_change",
    SENSOR_CHANGE = "sensor_change",
    DISTANCE_DATA = "distance_data",
}

export interface AppRoute {
    title: string;
    group?: string;
    path?: string;
    customLink?: string;
    component: () => JSX.Element;
}

export interface NavigationGroups {
    [key: string]: JSX.Element[];
}

interface FuncAddDataToQueue {
    (data: DistanceData): void;
}

export interface CustomDataQueue {
    (initialValue: []): [DistanceData[], FuncAddDataToQueue];
}

export interface DistanceProfile {
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
