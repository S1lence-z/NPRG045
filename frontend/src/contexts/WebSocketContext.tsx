import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";

interface DistanceData {
    timestamp: string;
    distances: {
        value: number;
        limits: number[];
    };
    strengths: number[];
    temperature: number;
}

interface WebSocketContextType {
    socket: WebSocket | null;
    status: boolean;
    portUpdateTrigger: number;
    sensorUpdateTrigger: number;
    distanceDataQueue: DistanceData[];
}

enum MessageType {
    CONNECTION_ESTABLISHED = "connection_established",
    CONNECTION_CLOSED = "connection_closed",
    PORT_CHANGE = "port_change",
    SENSOR_CHANGE = "sensor_change",
    DISTANCE_DATA = "distance_data",
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const backendUrl = "ws://127.0.0.1:8000/ws/connections/";
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [status, setStatus] = useState<boolean>(false);
    const [portUpdateTrigger, setPortUpdateTrigger] = useState<number>(0);
    const [sensorUpdateTrigger, setSensorUpdateTrigger] = useState<number>(0);
    const [distanceDataQueue, setDistanceDataQueue] = useState<DistanceData[]>([]);

    useEffect(() => {
        const ws = new WebSocket(backendUrl);
        ws.onopen = () => {
            setStatus(true);
        };
        ws.onclose = () => {
            setStatus(false);
        };
        ws.onmessage = (event) => {
            switch (JSON.parse(event.data).type) {
                case MessageType.CONNECTION_ESTABLISHED:
                    console.log("Connection established");
                    break;
                case MessageType.CONNECTION_CLOSED:
                    console.log("Connection closed");
                    break;
                case MessageType.PORT_CHANGE:
                    console.log("Port change occured");
                    setPortUpdateTrigger((prev) => prev + 1);
                    break;
                case MessageType.SENSOR_CHANGE:
                    console.log("Sensor change occured");
                    setSensorUpdateTrigger((prev) => prev + 1);
                    break;
                case MessageType.DISTANCE_DATA:
                    console.log("Distance data received and queued");
                    const packetData = JSON.parse(event.data).data;
                    console.log(packetData);
                    if (distanceDataQueue.length >= 10) {
                        setDistanceDataQueue((prev) => prev.slice(1).concat(packetData));
                    } else {
                        setDistanceDataQueue((prev) => prev.concat(packetData));
                    }
                    break;
                default:
                    console.error("Unknown message type");
            }
        };
        ws.onerror = (error) => {
            console.error("Client experienced an error: ", error);
        };
        setSocket(ws);
        return () => {
            ws.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{ socket, status, portUpdateTrigger, sensorUpdateTrigger, distanceDataQueue }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === null) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
