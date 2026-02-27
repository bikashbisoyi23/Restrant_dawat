import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const reservations = db.data.reservations.map(r => {
            const table = db.data.tables.find(t => t.id === r.table_id);
            return { ...r, table_name: table?.name, table_seats: table?.seats, table_location: table?.location };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({ success: true, data: reservations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const r = db.data.reservations.find(r => r.id === req.params.id);
        if (!r) return res.status(404).json({ success: false, message: 'Reservation not found' });
        const table = db.data.tables.find(t => t.id === r.table_id);
        res.json({ success: true, data: { ...r, table_name: table?.name, table_seats: table?.seats, table_location: table?.location } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { customer_name, email, phone, date, time, guests, table_id, special_requests, booked_by, pre_ordered_items } = req.body;

        if (!customer_name || !phone || !date || !time || !guests || !table_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const conflict = db.data.reservations.find(
            r => r.table_id === Number(table_id) && r.date === date && r.time === time && r.status !== 'cancelled'
        );
        if (conflict) return res.status(409).json({ success: false, message: 'This table is already booked for that date and time' });

        const table = db.data.tables.find(t => t.id === Number(table_id) && t.is_active);
        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        // Calculate total amount if items are present
        let total_amount = 0;
        const saved_items = [];
        if (pre_ordered_items && Array.isArray(pre_ordered_items)) {
            pre_ordered_items.forEach(item => {
                const menuItem = db.data.menu_items.find(m => m.id === item.item_id);
                if (menuItem) {
                    const price = menuItem.price;
                    const qty = item.quantity || 1;
                    total_amount += price * qty;
                    saved_items.push({ item_id: menuItem.id, name: menuItem.name, price, quantity: qty });
                }
            });
        }

        const newReservation = {
            id: uuidv4(),
            customer_name, email: email || '', phone, date, time,
            guests: Number(guests), table_id: Number(table_id),
            status: 'confirmed',
            special_requests: special_requests || '',
            booked_by: booked_by || 'customer',
            pre_ordered_items: saved_items,
            total_amount,
            created_at: new Date().toISOString(),
        };

        db.data.reservations.push(newReservation);
        await db.write();

        res.status(201).json({ success: true, message: 'Reservation confirmed!', data: { ...newReservation, table_name: table.name, table_seats: table.seats, table_location: table.location } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.reservations.findIndex(r => r.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Reservation not found' });

        const { status, special_requests } = req.body;
        if (status) db.data.reservations[idx].status = status;
        if (special_requests !== undefined) db.data.reservations[idx].special_requests = special_requests;
        await db.write();

        res.json({ success: true, message: 'Reservation updated', data: db.data.reservations[idx] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.reservations.findIndex(r => r.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Reservation not found' });

        const reservation = db.data.reservations[idx];

        // Strict 30-minute cancellation rule for customers
        const createdTime = new Date(reservation.created_at).getTime();
        const thirtyMins = 30 * 60 * 1000;
        if (Date.now() - createdTime > thirtyMins) {
            return res.status(403).json({ success: false, message: 'Reservations can only be cancelled within 30 minutes of booking. Please contact the hotel directly.' });
        }

        db.data.reservations[idx].status = 'cancelled';
        await db.write();
        res.json({ success: true, message: 'Reservation cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
