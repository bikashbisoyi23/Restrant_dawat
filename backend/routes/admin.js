import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from '../database.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed!'));
    }
});

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
        const db = await getDb();
        const today = new Date().toISOString().split('T')[0];
        const allRes = db.data.reservations;

        const totalBookings = allRes.length;
        const todayBookings = allRes.filter(r => r.date === today).length;
        const pendingBookings = allRes.filter(r => r.status === 'confirmed').length;
        const cancelledToday = allRes.filter(r => r.date === today && r.status === 'cancelled').length;
        const totalTables = db.data.tables.filter(t => t.is_active).length;
        const unreadContacts = db.data.contacts.filter(c => !c.is_read).length;
        const activeOffers = db.data.offers.filter(o => o.is_active).length;

        const todaySchedule = allRes
            .filter(r => r.date === today && r.status !== 'cancelled')
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(r => {
                const table = db.data.tables.find(t => t.id === r.table_id);
                return { ...r, table_name: table?.name };
            });

        res.json({
            success: true,
            data: { stats: { totalBookings, todayBookings, pendingBookings, cancelledToday, totalTables, unreadContacts, activeOffers }, todaySchedule }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/bookings', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const { date, status } = req.query;
        let bookings = db.data.reservations.map(r => {
            const table = db.data.tables.find(t => t.id === r.table_id);
            return { ...r, table_name: table?.name, table_seats: table?.seats, table_location: table?.location };
        });
        if (date) bookings = bookings.filter(r => r.date === date);
        if (status) bookings = bookings.filter(r => r.status === status);
        bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/reservations', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const { customer_name, email, phone, date, time, guests, table_id, special_requests } = req.body;
        if (!customer_name || !phone || !date || !time || !guests || !table_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const conflict = db.data.reservations.find(
            r => r.table_id === Number(table_id) && r.date === date && r.time === time && r.status !== 'cancelled'
        );
        if (conflict) return res.status(409).json({ success: false, message: 'Table already booked for that slot' });

        const newRes = {
            id: uuidv4(),
            customer_name, email: email || '', phone, date, time,
            guests: Number(guests), table_id: Number(table_id),
            status: 'confirmed',
            special_requests: special_requests || '',
            booked_by: 'admin',
            created_at: new Date().toISOString(),
        };
        db.data.reservations.push(newRes);
        await db.write();
        const table = db.data.tables.find(t => t.id === Number(table_id));
        res.status(201).json({ success: true, message: 'Reservation created by admin', data: { ...newRes, table_name: table?.name } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/reservations/:id/status', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const { status } = req.body;
        const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const idx = db.data.reservations.findIndex(r => r.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Reservation not found' });
        db.data.reservations[idx].status = status;
        await db.write();
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- MENU MANAGEMENT ---
router.post('/menu', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const { name, description, price, category, is_available, is_featured } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
        }

        const newItem = {
            id: Date.now(),
            name,
            description: description || '',
            price: Number(price),
            category,
            is_available: is_available === 'true' || is_available === true,
            is_featured: is_featured === 'true' || is_featured === true,
            image_url: req.file ? `/uploads/${req.file.filename}` : '',
            created_at: new Date().toISOString()
        };

        db.data.menu_items.push(newItem);
        await db.write();
        res.status(201).json({ success: true, message: 'Menu item added', data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/menu/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.menu_items.findIndex(m => m.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, message: 'Menu item not found' });

        const item = db.data.menu_items[idx];
        const { name, description, price, category, is_available, is_featured } = req.body;

        const updatedItem = {
            ...item,
            name: name || item.name,
            description: description !== undefined ? description : item.description,
            price: price ? Number(price) : item.price,
            category: category || item.category,
            is_available: is_available !== undefined ? (is_available === 'true' || is_available === true) : item.is_available,
            is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : item.is_featured,
            image_url: req.file ? `/uploads/${req.file.filename}` : item.image_url
        };

        db.data.menu_items[idx] = updatedItem;
        await db.write();

        // Optional: delete old image if new image uploaded
        if (req.file && item.image_url) {
            const oldPath = path.join(process.cwd(), 'public', item.image_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        res.json({ success: true, message: 'Menu item updated', data: updatedItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/menu/:id', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.menu_items.findIndex(m => m.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, message: 'Menu item not found' });

        const item = db.data.menu_items[idx];
        if (item.image_url) {
            const imgPath = path.join(process.cwd(), 'public', item.image_url);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        db.data.menu_items.splice(idx, 1);
        await db.write();
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- OFFERS MANAGEMENT ---
router.get('/offers', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        res.json({ success: true, data: [...db.data.offers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/offers', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const { title, description, original_price, offer_price, badge } = req.body;
        if (!title || !offer_price) return res.status(400).json({ success: false, message: 'Title and offer price required' });
        const newOffer = {
            id: Date.now(),
            title, description: description || '',
            original_price: original_price ? Number(original_price) : null,
            offer_price: Number(offer_price),
            badge: badge || 'Today Special',
            image_url: req.file ? `/uploads/${req.file.filename}` : '',
            is_active: true,
            created_at: new Date().toISOString(),
        };
        db.data.offers.push(newOffer);
        await db.write();
        res.status(201).json({ success: true, message: 'Offer added', data: newOffer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/offers/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.offers.findIndex(o => o.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

        const item = db.data.offers[idx];
        const updatedItem = { ...item, ...req.body, id: item.id };
        if (req.body.offer_price) updatedItem.offer_price = Number(req.body.offer_price);
        if (req.body.original_price) updatedItem.original_price = Number(req.body.original_price);
        if (req.file) {
            updatedItem.image_url = `/uploads/${req.file.filename}`;
            if (item.image_url) {
                const oldPath = path.join(process.cwd(), 'public', item.image_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        db.data.offers[idx] = updatedItem;
        await db.write();
        res.json({ success: true, message: 'Offer updated', data: updatedItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/offers/:id', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const idx = db.data.offers.findIndex(o => o.id === Number(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, message: 'Offer not found' });
        db.data.offers.splice(idx, 1);
        await db.write();
        res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/contacts', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const contacts = [...db.data.contacts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        db.data.contacts.forEach(c => c.is_read = true);
        await db.write();
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
