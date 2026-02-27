import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hotel_dawat',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
        resource_type: 'auto' // Important for accepting both images and videos
    }
});

export const uploadCloud = multer({ storage });
export { cloudinary };
