import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../database.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'));
        }
    }
});

// GET /api/gallery - Get all gallery items
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        res.json({ success: true, data: db.data.gallery });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/gallery - Admin upload to gallery
const adminAuth = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

router.post('/', adminAuth, upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const db = await getDb();
        const { caption } = req.body;
        const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        const newItem = {
            id: Date.now().toString(),
            url: `/uploads/${req.file.filename}`,
            type,
            caption: caption || '',
            created_at: new Date().toISOString()
        };

        db.data.gallery.push(newItem);
        await db.write();

        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/gallery/:id - Admin delete from gallery
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const db = await getDb();
        const id = req.params.id;
        const index = db.data.gallery.findIndex(i => i.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Optional: Remove file from disk
        const item = db.data.gallery[index];
        const filePath = path.join(process.cwd(), 'public', item.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        db.data.gallery.splice(index, 1);
        await db.write();

        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
