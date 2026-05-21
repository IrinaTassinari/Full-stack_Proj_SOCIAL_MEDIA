import { io, type Socket } from "socket.io-client";

// Берём адрес backend
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Создаём переменную, где будет храниться socket-соединение. Сначала соединения нет - null
let socket: Socket | null = null;

// Функция для подключения socket. Она принимает userId, потому что серверу нужно знать, в какую комнату добавить пользователя
export const connectSocket = (userId: string) => {
    // Если socket ещё не создан, создаём подключение
  if (!socket) {
    socket = io(API_URL);
  }

  // Отправляем событие join на backend. То есть frontend говорит: Подключи меня к комнате с моим userId
  socket.emit("join", userId);

  // return socket нужен, чтобы после подключения сразу получить socket object
  return socket;
};

// говорит: “дай мне текущий socket, если он уже есть”
export const getSocket = () => socket;

// Отключаем socket
export const disconnectSocket = () => {
  socket?.disconnect(); // если socket существует — вызови disconnect()
  socket = null; // если socket null — ничего не делай
};
