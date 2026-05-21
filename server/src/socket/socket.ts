import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

//создаём переменную io, в которой позже будет храниться Socket.io сервер
let io: Server;

// Потом в server.ts создаётся HTTP-сервер:const server = http.createServer(app);
// И только после этого вызывается: initSocket(server);

// Потом уже присваиваем значение io
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

    // socket - это соединение конкретного пользователя:
    // Ирина открыла сайт - появился один socket
    // другой пользователь открыл сайт - появился другой socket
    // У каждого подключения есть свой ID: socket.id
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // сервер ждёт от клиента событие join
    // socket.emit("join", "665f123abc");
    // Когда сервер это получит, он выполнит:
    // socket.join(userId);
    // То есть добавит этот socket в комнату с названием "665f123abc".

    socket.on("join", (userId: string) => {
      socket.join(userId);
    });

    // Это срабатывает, когда пользователь отключился:закрыл вкладку, обновил страницу, потерял интернет, frontend остановился
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
