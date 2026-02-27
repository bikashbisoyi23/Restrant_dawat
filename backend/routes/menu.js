import express from 'express';
import Menu from '../models/Menu.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const items = await Menu.find({ is_available: true });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/featured', async (req, res) => {
    try {
        const items = await Menu.find({ is_featured: true, is_available: true });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const items = await Menu.find({ category: req.params.category, is_available: true });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
