import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const { date, time, guests } = req.query;
        let tables = db.data.tables.filter(t => t.is_active);

        if (date && time) {
            const bookedIds = db.data.reservations
                .filter(r => r.date === date && r.time === time && r.status !== 'cancelled')
                .map(r => r.table_id);

            tables = tables.map(t => ({ ...t, is_available: !bookedIds.includes(t.id) }));
        } else {
            tables = tables.map(t => ({ ...t, is_available: true }));
        }

        if (guests) {
            tables = tables.filter(t => t.seats >= parseInt(guests));
        }

        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/available', async (req, res) => {
    try {
        const db = await getDb();
        const { date, time, guests } = req.query;
        if (!date || !time) return res.status(400).json({ success: false, message: 'date and time are required' });

        const bookedIds = db.data.reservations
            .filter(r => r.date === date && r.time === time && r.status !== 'cancelled')
            .map(r => r.table_id);

        let tables = db.data.tables.filter(t => t.is_active && !bookedIds.includes(t.id));

        if (guests) {
            tables = tables.filter(t => t.seats >= parseInt(guests));
        }

        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
