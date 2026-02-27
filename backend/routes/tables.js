import express from 'express';
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { date, time, guests } = req.query;
        let query = { is_available: true };

        if (guests) {
            query.seats = { $gte: parseInt(guests) };
        }

        let tables = await Table.find(query);

        if (date && time) {
            const bookedReservations = await Reservation.find({
                date,
                timeSlot: time,
                status: { $ne: 'cancelled' }
            });
            const bookedIds = bookedReservations.map(r => r.tableId);

            tables = tables.map(t => {
                const tableObj = t.toObject();
                return { ...tableObj, is_available: !bookedIds.includes(t.id) };
            });
        }

        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/available', async (req, res) => {
    try {
        const { date, time, guests } = req.query;
        if (!date || !time) return res.status(400).json({ success: false, message: 'date and time are required' });

        const bookedReservations = await Reservation.find({
            date,
            timeSlot: time,
            status: { $ne: 'cancelled' }
        });
        const bookedIds = bookedReservations.map(r => r.tableId);

        let query = {
            is_available: true,
            id: { $nin: bookedIds }
        };

        if (guests) {
            query.seats = { $gte: parseInt(guests) };
        }

        const tables = await Table.find(query);

        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
