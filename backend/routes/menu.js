import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const items = db.data.menu_items.filter(i => i.is_available);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/featured', async (req, res) => {
    try {
        const db = await getDb();
        const items = db.data.menu_items.filter(i => i.is_featured && i.is_available);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const db = await getDb();
        const items = db.data.menu_items.filter(i => i.category === req.params.category && i.is_available);
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
