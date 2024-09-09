import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import WebSocketMessageType from "../types/WebSocketMessageType";
import DistanceDataPacket from "../types/DistanceDataPacket";
import useDistanceDataQueue from "../components/DistanceDataQueue";
import WebSocketContextType from "../types/WebScoketContextType";

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const backendUrl = "ws://127.0.0.1:8000/ws/connections/";

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [status, setStatus] = useState<boolean>(false);
    const [portUpdateTrigger, setPortUpdateTrigger] = useState<number>(0);
    const [sensorUpdateTrigger, setSensorUpdateTrigger] = useState<number>(0);
    const [distanceDataQueue, setDistanceDataQueue, addDataToQueue, historyData, setHistoryData] = useDistanceDataQueue(
        []
    );

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
                case WebSocketMessageType.CONNECTION_ESTABLISHED:
                    console.log("Connection established");
                    break;
                case WebSocketMessageType.CONNECTION_CLOSED:
                    console.log("Connection closed");
                    break;
                case WebSocketMessageType.PORT_CHANGE:
                    console.log("Port change occured");
                    setPortUpdateTrigger((prev) => prev + 1);
                    break;
                case WebSocketMessageType.SENSOR_CHANGE:
                    console.log("Sensor change occured");
                    setSensorUpdateTrigger((prev) => prev + 1);
                    break;
                case WebSocketMessageType.DISTANCE_DATA:
                    console.log("Distance data received and queued");
                    const packetData: DistanceDataPacket = JSON.parse(event.data);
                    addDataToQueue(packetData);
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
            value={{
                socket,
                status,
                portUpdateTrigger,
                sensorUpdateTrigger,
                distanceDataQueue,
                historyData,
                setHistoryData,
                setDistanceDataQueue,
            }}>
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
