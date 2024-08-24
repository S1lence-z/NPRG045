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
