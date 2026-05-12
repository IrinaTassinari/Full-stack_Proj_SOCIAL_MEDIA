import dotenv from 'dotenv';
dotenv.config();
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not defined in .env");
}
if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY is not defined in .env");
}
if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not defined in .env");
}
if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is not defined in .env");
}
if (!process.env.EMAIL_HOST) {
    throw new Error("EMAIL_HOST is not defined in .env");
}
if (!process.env.EMAIL_PORT) {
    throw new Error("EMAIL_PORT is not defined in .env");
}
if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is not defined in .env");
}
if (!process.env.EMAIL_PASS) {
    throw new Error("EMAIL_PASS is not defined in .env");
}
if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not defined in .env");
}
export const env = {
    port: Number(process.env.PORT) || 3000,
    mongoUrl: process.env.MONGO_URL || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    clientUrl: process.env.CLIENT_URL,
    emailHost: process.env.EMAIL_HOST,
    emailPort: Number(process.env.EMAIL_PORT),
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    emailFrom: process.env.EMAIL_FROM,
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
