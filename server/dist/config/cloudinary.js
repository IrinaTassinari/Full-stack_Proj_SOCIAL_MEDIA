import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
});
export { cloudinary };
export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        // Multer keeps uploaded files in memory as buffers.
        // Cloudinary accepts that buffer through an upload stream and returns a URL.
        const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Cloudinary upload failed"));
                return;
            }
            resolve(result.secure_url);
        });
        uploadStream.end(buffer);
    });
};
