import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email and message are required' });
        }
        const contact = { id: Date.now(), name, email, phone: phone || '', message, is_read: false, created_at: new Date().toISOString() };
        db.data.contacts.push(contact);
        await db.write();
        res.status(201).json({ success: true, message: 'Message sent! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
