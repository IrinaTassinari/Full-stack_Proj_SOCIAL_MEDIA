/*
app.ts = настройки Express-приложения
server.ts = запуск приложения

server.ts запускает сервер
То есть server.ts отвечает за:
загрузку .env
подключение MongoDB
запуск порта
*/

import app from './app.js';
import {connectDB} from './db/db.js';
import { env } from './config/env.js';


const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
};

startServer();

export default app;
