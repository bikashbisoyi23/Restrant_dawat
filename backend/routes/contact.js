import express from 'express';
import Contact from '../models/Contact.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email and message are required' });
        }

        const contact = new Contact({
            id: uuidv4(),
            name,
            email,
            phone: phone || '',
            message,
            status: 'new',
            createdAt: new Date().toISOString()
        });

        await contact.save();

        res.status(201).json({ success: true, message: 'Message sent! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
