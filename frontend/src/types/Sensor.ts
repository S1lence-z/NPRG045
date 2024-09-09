interface Sensor {
    id: number;
    port_name: string;
    port_description: string;
    hwid: string;
    is_connected: boolean;
}

export default Sensor;
