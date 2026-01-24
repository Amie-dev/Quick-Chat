import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocketContext must be used within a SocketProvider");
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // if user logs out, disconnect any existing socket
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        window.socket = undefined;
      }
      return;
    }

    const socketClient = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      withCredentials: true,
      reconnectionAttempts: 1,
    });

    setSocket(socketClient);
    window.socket = socketClient; // expose globally for authService.logout
    
    socketClient.on("connect", () => {
      console.log("Connected with id:", socketClient.id);
      toast.success("Socket connected!");
    });

    socketClient.on("connect_error", (error) => {
      console.error("Connection error", error);
      toast.error("Socket connection error");
    });
    socketClient.on("Internal_error", (error) => {
      console.error("Connection error", error);
      toast.error("Socket connection error");
    });

    socketClient.on("disconnect", () => {
      console.log("Socket disconnected");
      toast.error("Socket disconnected!");
    });

    // Cleanup when component unmounts or user changes
    return () => {
      socketClient.disconnect();
      setSocket(null); 
      window.socket = undefined;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
