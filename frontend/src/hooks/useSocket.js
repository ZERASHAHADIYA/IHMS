import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io("http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on component unmount — keep alive for the session
    };
  }, [token]);

  return socketRef;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
