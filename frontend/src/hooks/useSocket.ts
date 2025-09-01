"use client";

import { useEffect, useRef } from "react";
import { backendUrl } from "@/lib/config";
import { io, Socket } from "socket.io-client";

export function useSocket(
  roomId: string,
  userId: string,
  username: string,
  onMessage: (event: { type: string; data?: any }) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId || !userId || !username) return; // prevent empty joins

    // cleanup existing socket before new one
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // create socket
    const socket = io(backendUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"], // safer fallback
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    console.log("🔌 Initializing socket connection...");

    // --- Lifecycle ---
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join-room",{ roomId, userId, username});
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    socket.on("connect_error", (error: any) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // --- Standardized event forwarding ---
    const forward = (type: string) => (data?: any) =>
      onMessage({ type, data });

    socket.on("chat-message", forward("chat-message"));
    socket.on("user-joined", forward("user-joined"));
    socket.on("user-left", forward("user-left"));
    socket.on("shared-note", forward("shared-note"));
    socket.on("shared-quiz", forward("shared-quiz"));
    socket.on("focus-mode", forward("focus-mode"));
    socket.on("session-started", forward("session-started"));
    socket.on("session-stopped", forward("session-stopped"));
    socket.on("active-users", forward("active-users"));

    // cleanup
    return () => {
      console.log("🛑 Disconnecting socket...");
      socket.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, username]);

  return socketRef;
}
