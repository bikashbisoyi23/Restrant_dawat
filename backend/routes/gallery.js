import express from 'express';
import { uploadCloud, cloudinary } from '../config/cloudinary.js';
import Gallery from '../models/Gallery.js';

const router = express.Router();

// GET /api/gallery - Get all gallery items
router.get('/', async (req, res) => {
    try {
        const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin auth middleware
const adminAuth = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// POST /api/gallery - Admin upload to gallery
// Note: We're expecting field name 'media' in the multipart form format
router.post('/', adminAuth, uploadCloud.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { caption } = req.body;
        // Cloudinary automatically infers resource_type based on the uploaded file
        // The mimetypes map generally as: video/* -> video, image/* -> image
        const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video');
        const type = isVideo ? 'video' : 'image';

        const newItem = new Gallery({
            id: Date.now().toString(),
            url: req.file.path, // req.file.path contains the secure Cloudinary URL
            type,
            caption: caption || ''
        });

        await newItem.save();

        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/gallery/:id - Admin delete from gallery
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const item = await Gallery.findOne({ id });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Extract the Cloudinary public_id from the URL to delete the asset
        // Example URL: https://res.cloudinary.com/dnzku5l6w/image/upload/v1734567890/hotel_dawat/xyz123.jpg
        const urlParts = item.url.split('/');
        const fileWithExt = urlParts[urlParts.length - 1]; // xyz123.jpg
        const publicId = `hotel_dawat/${fileWithExt.split('.')[0]}`; // hotel_dawat/xyz123

        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: item.type });
        } catch (cloudErr) {
            console.error('Failed to delete from Cloudinary:', cloudErr);
        }

        await Gallery.deleteOne({ id });
        res.json({ success: true, message: 'Item deleted safely' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
