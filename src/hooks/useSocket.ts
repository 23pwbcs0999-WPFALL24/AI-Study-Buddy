"use client";

import { useEffect, useRef } from "react";
import { backendUrl } from "@/lib/config";
import { io, Socket } from "socket.io-client";

export function useSocket(roomId: string, username: string, onMessage: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current = io(backendUrl, {
        path: "/socket.io",
        transports: ["websocket"],
        withCredentials: true,
        timeout: 20000,
        forceNew: true
      });

      console.log("Initializing socket connection...");
      
      // Connection event listeners
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
        if (username) {
          console.log("Joining room after connection:", roomId);
          socketRef.current?.emit("join-room", roomId, "me", username);
        }
      });
      
      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
      
      socketRef.current.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error);
      });
      
      socketRef.current.on("chat-message", onMessage);
      socketRef.current.on("user-joined", onMessage);
      socketRef.current.on("user-left", onMessage);
    })();
    return () => {
      active = false;
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
      }
    };
  }, [roomId, username]); // Only recreate socket when roomId or username changes

  return socketRef;
}


