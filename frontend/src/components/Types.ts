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