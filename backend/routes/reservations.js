import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import Menu from '../models/Menu.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });

        // We need to fetch tables to append table name, seats and location to mimic previous behavior
        const tables = await Table.find();
        const tablesMap = tables.reduce((acc, t) => {
            acc[t.id] = t;
            return acc;
        }, {});

        const formattedReservations = reservations.map(r => {
            const table = tablesMap[r.tableId];
            return {
                ...r.toObject(),
                table_name: table?.name,
                table_seats: table?.seats,
                table_location: table?.location
            };
        });

        res.json({ success: true, data: formattedReservations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const r = await Reservation.findOne({ id: req.params.id });
        if (!r) return res.status(404).json({ success: false, message: 'Reservation not found' });

        const table = await Table.findOne({ id: r.tableId });
        res.json({
            success: true,
            data: {
                ...r.toObject(),
                table_name: table?.name,
                table_seats: table?.seats,
                table_location: table?.location
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { customer_name, email, phone, date, time, guests, table_id, special_requests, pre_ordered_items } = req.body;

        if (!customer_name || !phone || !date || !time || !guests || !table_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const conflict = await Reservation.findOne({
            tableId: table_id.toString(),
            date,
            timeSlot: time,
            status: { $ne: 'cancelled' }
        });

        if (conflict) return res.status(409).json({ success: false, message: 'This table is already booked for that date and time' });

        const table = await Table.findOne({ id: table_id.toString(), is_available: true });
        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

        // Calculate total amount if items are present
        let total_amount = 0;
        const saved_items = [];

        if (pre_ordered_items && Array.isArray(pre_ordered_items)) {
            for (const item of pre_ordered_items) {
                const menuItem = await Menu.findOne({ id: item.item_id.toString() });
                if (menuItem) {
                    const price = menuItem.price;
                    const qty = item.quantity || 1;
                    total_amount += price * qty;
                    // Adding name here for legacy frontend compatibility
                    saved_items.push({
                        itemId: menuItem.id,
                        name: menuItem.name,
                        price,
                        quantity: qty
                    });
                }
            }
        }

        const newReservation = new Reservation({
            id: uuidv4(),
            customerName: customer_name,
            customerEmail: email || '',
            customerPhone: phone,
            date,
            timeSlot: time,
            guests: Number(guests),
            tableId: table_id.toString(),
            status: 'confirmed',
            specialRequests: special_requests || '',
            pre_ordered_items: saved_items,
            total_amount,
            createdAt: new Date().toISOString()
        });

        await newReservation.save();

        res.status(201).json({
            success: true,
            message: 'Reservation confirmed!',
            data: {
                ...newReservation.toObject(),
                table_name: table.name,
                table_seats: table.seats,
                table_location: table.location
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { status, special_requests } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (special_requests !== undefined) updateData.specialRequests = special_requests;

        const updated = await Reservation.findOneAndUpdate(
            { id: req.params.id },
            { $set: updateData },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Reservation not found' });
        res.json({ success: true, message: 'Reservation updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const r = await Reservation.findOne({ id: req.params.id });
        if (!r) return res.status(404).json({ success: false, message: 'Reservation not found' });

        const isCustomer = !req.headers['x-admin-token'];

        if (isCustomer) {
            const bookingDate = new Date(r.createdAt);
            const now = new Date();
            const diffInMinutes = (now - bookingDate) / (1000 * 60);

            if (diffInMinutes > 30) {
                return res.status(403).json({
                    success: false,
                    message: 'Cancellations are only allowed within 30 minutes of booking.'
                });
            }
        }

        r.status = 'cancelled';
        await r.save();

        res.json({ success: true, message: 'Reservation cancelled successfully', data: r });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
