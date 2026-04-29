import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

export const env = {
    port: Number(process.env.PORT) || 3000,
    mongoUrl: process.env.MONGO_URL || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET 
};

/**
 * // Загружаем переменные окружения из файла .env
// После этого значения из .env будут доступны через process.env
 * 
 * Единый объект с настройками приложения.
 * Почему так удобно:
 * 1. Все env-переменные собраны в одном месте.
 * 2. В остальных файлах мы импортируем уже готовый объект env.
 * 3. Это делает код чище и понятнее.
 * 
 * // Порт, на котором будет запускаться сервер.
    // process.env.PORT всегда строка, поэтому приводим к Number.
 */