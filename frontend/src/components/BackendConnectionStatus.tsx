import { useWebSocket } from "../contexts/WebSocketContext";

const PrintStatus = ({ status }: { status: boolean }) => {
    const onlineState = "🟢";
    const offlineState = "🔴";
    return status ? onlineState : offlineState;
};

export const BackendConnectionStatus = () => {
    const { status: backendStatus } = useWebSocket();

    return <>Backend: {PrintStatus({ status: backendStatus })}</>;
};
