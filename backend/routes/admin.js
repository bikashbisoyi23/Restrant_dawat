import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadCloud, cloudinary } from '../config/cloudinary.js';
import Menu from '../models/Menu.js';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import Offer from '../models/Offer.js';
import Contact from '../models/Contact.js';
import Review from '../models/Review.js';

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dawat@2024';
const activeSessions = new Set();

const requireAdmin = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    next();
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = uuidv4();
        activeSessions.add(token);
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

router.post('/logout', requireAdmin, (req, res) => {
    activeSessions.delete(req.headers['x-admin-token']);
    res.json({ success: true, message: 'Logged out' });
});

router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const totalBookings = await Reservation.countDocuments();
        const todayBookings = await Reservation.countDocuments({ date: today });
        const pendingBookings = await Reservation.countDocuments({ status: 'confirmed' });
        const cancelledToday = await Reservation.countDocuments({ date: today, status: 'cancelled' });

        const totalTables = await Table.countDocuments({ is_available: true });
        const unreadContacts = await Contact.countDocuments({ status: 'new' });
        const activeOffers = await Offer.countDocuments({ is_active: true });

        const todayReservations = await Reservation.find({
            date: today,
            status: { $ne: 'cancelled' }
        }).sort({ timeSlot: 1 });

        const tables = await Table.find();
        const tablesMap = tables.reduce((acc, t) => { acc[t.id] = t.name; return acc; }, {});

        const todaySchedule = todayReservations.map(r => ({
            ...r.toObject(),
            table_name: tablesMap[r.tableId] || 'Unknown Table'
        }));

        res.json({
            success: true,
            data: {
                stats: { totalBookings, todayBookings, pendingBookings, cancelledToday, totalTables, unreadContacts, activeOffers },
                todaySchedule
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/bookings', requireAdmin, async (req, res) => {
    try {
        const { date, status } = req.query;
        let query = {};
        if (date) query.date = date;
        if (status) query.status = status;

        const reservations = await Reservation.find(query).sort({ createdAt: -1 });
        const tables = await Table.find();

        const tablesMap = tables.reduce((acc, t) => {
            acc[t.id] = t;
            return acc;
        }, {});

        const mappedBookings = reservations.map(r => {
            const table = tablesMap[r.tableId];
            return {
                ...r.toObject(),
                table_name: table?.name,
                table_seats: table?.seats,
                table_location: table?.location
            };
        });

        res.json({ success: true, data: mappedBookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/reservations/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const updated = await Reservation.findOneAndUpdate(
            { id: req.params.id },
            { status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Reservation not found' });
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/reservations', requireAdmin, async (req, res) => {
    try {
        const { customer_name, email, phone, date, time, guests, table_id, special_requests } = req.body;
        if (!customer_name || !phone || !date || !time || !guests || !table_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const conflict = await Reservation.findOne({
            tableId: table_id.toString(),
            date,
            timeSlot: time,
            status: { $ne: 'cancelled' }
        });

        if (conflict) return res.status(409).json({ success: false, message: 'Table already booked for that slot' });

        const newRes = new Reservation({
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
            booked_by: 'admin',
            createdAt: new Date().toISOString()
        });

        await newRes.save();
        const table = await Table.findOne({ id: table_id.toString() });

        res.status(201).json({
            success: true,
            message: 'Reservation created by admin',
            data: { ...newRes.toObject(), table_name: table?.name }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- MENU MANAGEMENT ---
router.post('/menu', requireAdmin, uploadCloud.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, is_available, is_featured } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
        }

        const newItem = new Menu({
            id: Date.now().toString(),
            name,
            description: description || '',
            price: Number(price),
            category,
            is_available: is_available === 'true' || is_available === true,
            is_featured: is_featured === 'true' || is_featured === true,
            image_url: req.file ? req.file.path : ''
        });

        await newItem.save();
        res.status(201).json({ success: true, message: 'Menu item added', data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/menu/:id', requireAdmin, uploadCloud.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, is_available, is_featured } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (is_available !== undefined) updateData.is_available = (is_available === 'true' || is_available === true);
        if (is_featured !== undefined) updateData.is_featured = (is_featured === 'true' || is_featured === true);

        if (req.file) {
            updateData.image_url = req.file.path;
        }

        const updated = await Menu.findOneAndUpdate(
            { id: req.params.id },
            { $set: updateData },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Menu item not found' });
        res.json({ success: true, message: 'Menu item updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/menu/:id', requireAdmin, async (req, res) => {
    try {
        const item = await Menu.findOneAndDelete({ id: req.params.id });
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

        res.json({ success: true, message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- OFFERS MANAGEMENT ---
router.post('/offers', requireAdmin, uploadCloud.single('image'), async (req, res) => {
    try {
        const { title, description, items, original_price, discounted_price, badge } = req.body;

        const newOffer = new Offer({
            id: Date.now().toString(),
            title,
            description,
            items: JSON.parse(items), // expects array as JSON string from multipart request
            original_price: Number(original_price),
            discounted_price: Number(discounted_price),
            badge: badge || '',
            is_active: true,
            image_url: req.file ? req.file.path : ''
        });

        await newOffer.save();
        res.status(201).json({ success: true, message: 'Offer created', data: newOffer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/offers/:id', requireAdmin, uploadCloud.single('image'), async (req, res) => {
    try {
        const { title, description, items, original_price, discounted_price, badge, is_active } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (items) updateData.items = JSON.parse(items);
        if (original_price) updateData.original_price = Number(original_price);
        if (discounted_price) updateData.discounted_price = Number(discounted_price);
        if (badge !== undefined) updateData.badge = badge;
        if (is_active !== undefined) updateData.is_active = (is_active === 'true' || is_active === true);

        if (req.file) {
            updateData.image_url = req.file.path;
        }

        const updated = await Offer.findOneAndUpdate(
            { id: req.params.id },
            { $set: updateData },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, message: 'Offer updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/offers/:id', requireAdmin, async (req, res) => {
    try {
        const item = await Offer.findOneAndDelete({ id: req.params.id });
        if (!item) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- CONTACTS / MESSAGES ---
router.get('/contacts', requireAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/contacts/:id/read', requireAdmin, async (req, res) => {
    try {
        const contact = await Contact.findOneAndUpdate(
            { id: req.params.id },
            { status: 'read' },
            { new: true }
        );
        if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- TABLES ---
router.get('/tables', requireAdmin, async (req, res) => {
    try {
        const tables = await Table.find();
        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/tables/:id', requireAdmin, async (req, res) => {
    try {
        const { is_active } = req.body;
        const updated = await Table.findOneAndUpdate(
            { id: req.params.id },
            { is_available: is_active },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Table not found' });

        res.json({ success: true, message: 'Table status updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
