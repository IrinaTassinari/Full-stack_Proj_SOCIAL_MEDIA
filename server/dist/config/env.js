import dotenv from 'dotenv';
// Загружаем переменные окружения из файла .env
// После этого значения из .env будут доступны через process.env
dotenv.config();
/**
 * Единый объект с настройками приложения.
 * Почему так удобно:
 * 1. Все env-переменные собраны в одном месте.
 * 2. В остальных файлах мы импортируем уже готовый объект env.
 * 3. Это делает код чище и понятнее.
 */
export const env = {
    // Порт, на котором будет запускаться сервер.
    // process.env.PORT всегда строка, поэтому приводим к Number.
    port: Number(process.env.PORT) || 3000,
    // URL для подключения к MongoDB.
    mongoUrl: process.env.MONGO_URL || '',
    // Текущий режим работы приложения.
    // Обычно это development / production.
    nodeEnv: process.env.NODE_ENV || 'development',
};
