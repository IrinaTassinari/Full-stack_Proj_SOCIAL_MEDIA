import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export { cloudinary };

export const uploadToCloudinary = (
  buffer: Buffer, 
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url); // secure_url — это HTTPS-ссылка на загруженную картинку
      },
    );

    uploadStream.end(buffer); //Вот здесь сам файл реально отправляется в Cloudinary
  });
};


// buffer - Это сам файл в памяти. Его даёт multer:req.file.buffer
// Promise<string> - То есть в итоге она вернёт строку — URL картинки.

/**
 * файл из Postman/Frontend
↓
multer кладёт файл в req.file.buffer
↓
uploadToCloudinary отправляет buffer в Cloudinary
↓
Cloudinary возвращает URL
↓
MongoDB сохраняет только URL

 */