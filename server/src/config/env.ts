import dotenv from 'dotenv';

// Load environment variables from server/.env for local development.
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

// Centralized typed environment configuration for the backend.
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
