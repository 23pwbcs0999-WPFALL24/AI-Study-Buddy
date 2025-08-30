"use client";

import { useEffect, useRef } from "react";
import { backendUrl } from "@/lib/config";
import { io, Socket } from "socket.io-client";

export function useSocket(
  roomId: string,
  userId: string,     // ✅ now using real userId
  username: string,
  onMessage: (data: any) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId || !userId || !username) return; // prevent empty joins

    // cleanup any existing socket before creating new
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // create socket
    const socket = io(backendUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,              // ✅ auto reconnect
      reconnectionAttempts: 5,         // ✅ retry 5 times
      reconnectionDelay: 1000          // ✅ wait 1s between retries
    });

    socketRef.current = socket;

    console.log("🔌 Initializing socket connection...");

    // --- Connection lifecycle ---
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join-room", roomId, userId, username);  // ✅ send real userId
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    socket.on("connect_error", (error: any) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // --- Listen to all server events ---
    socket.on("chat-message", onMessage);
    socket.on("user-joined", onMessage);
    socket.on("user-left", onMessage);
    socket.on("shared-note", onMessage);
    socket.on("shared-quiz", onMessage);
    socket.on("focus-mode", onMessage);

    // cleanup
    return () => {
      console.log("🛑 Disconnecting socket...");
      socket.disconnect();
    };
  }, [roomId, userId, username]);

  return socketRef;
}
