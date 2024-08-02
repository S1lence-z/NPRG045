import React from "react";
import { Sensor } from "./Types";

const GetStatus = (status: boolean) => {
    return status ? "Connected" : "Disconnected";
};

interface SensorCardProps {
    cardData: Sensor;
}

const SensorCard: React.FC<SensorCardProps> = ({ cardData }) => {
    return (
        <div className="sensor-card">
            <h3>Sensor {cardData.id}</h3>
            <p><b>COM Port:</b> {cardData.port_name}</p>
            <p><b>Description:</b> {cardData.port_description}</p>
            <p><b>Hardware ID:</b> {cardData.hwid}</p>
            <p><b>Status:</b> {GetStatus(cardData.is_connected)}</p>
        </div>
    );
};

export default SensorCard;
