"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { Message, Match } from "@/lib/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (receiverId: string, content: string) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onNewMatch: (callback: (match: Match) => void) => () => void;
  onUnmatch: (callback: (data: { matchId: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Connect to socket with auth token
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
    });

    newSocket.connect();

    // Authenticate socket
    newSocket.on("connect", () => {
      newSocket.emit("authenticate", token);
    });

    newSocket.on("authenticated", () => {
      console.log("Socket authenticated");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && connected) {
      socket.emit("sendMessage", { receiverId, content });
    }
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (!socket) return () => {};

    socket.on("newMessage", callback);
    return () => {
      socket.off("newMessage", callback);
    };
  };

  const onNewMatch = (callback: (match: Match) => void) => {
    if (!socket) return () => {};

    socket.on("newMatch", callback);
    return () => {
      socket.off("newMatch", callback);
    };
  };

  const onUnmatch = (callback: (data: { matchId: string }) => void) => {
    if (!socket) return () => {};

    socket.on("unmatch", callback);
    return () => {
      socket.off("unmatch", callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        sendMessage,
        onNewMessage,
        onNewMatch,
        onUnmatch,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
