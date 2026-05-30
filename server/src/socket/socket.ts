import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

// The initialized Socket.io server is reused by controllers that need to emit events.
let io: Server;


export const initSocket = (server: HttpServer): Server => {
  const allowedOrigins = [
    env.clientUrl,
    env.clientUrl.replace("localhost", "127.0.0.1"),
    env.clientUrl.replace("127.0.0.1", "localhost"),
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Each user joins a personal room named by their user id.
    // Controllers can then emit events directly to that user's room.
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }

  return io;
};
