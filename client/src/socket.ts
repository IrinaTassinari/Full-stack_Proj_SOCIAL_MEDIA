import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Keep one socket connection per browser session.
let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (!socket) {
    socket = io(API_URL);
  }

  // Join the personal room used by the backend to deliver real-time messages.
  socket.emit("join", userId);

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
