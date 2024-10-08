enum WebSocketMessageType {
    CONNECTION_ESTABLISHED = "connection_established",
    CONNECTION_CLOSED = "connection_closed",
    PORT_CHANGE = "port_change",
    SENSOR_CHANGE = "sensor_change",
    DISTANCE_DATA = "distance_data",
    AMP_PHASE_DATA = "amp_phase_data",
}

export default WebSocketMessageType;
