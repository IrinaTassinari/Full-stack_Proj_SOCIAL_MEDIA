import app from "./app.js";
import { connectDB } from "./db/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/socket.js";
import http from "http";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Создаём HTTP-сервер на базе Express
    const server = http.createServer(app);

    initSocket(server);

    server.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // Логируем понятную ошибку
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to start server:", message);

    // ВАЖНО: завершаем процесс, чтобы не висел "полумёртвый" сервер
    process.exit(1);
  }
};
startServer();
export default app;

/*
app.ts = настройки Express-приложения
server.ts = запуск приложения

server.ts запускает сервер
То есть server.ts отвечает за:
загрузку .env
подключение MongoDB
запуск порта
*/
