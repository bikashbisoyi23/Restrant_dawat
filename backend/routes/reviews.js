import express from 'express';
import { getDb } from '../database.js';

const router = express.Router();

// GET /api/reviews - Get all public reviews
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        res.json({ success: true, data: db.data.reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/reviews - Submit a review (Booking ID must be valid and status 'completed')
router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const { booking_id, customer_name, rating, comment } = req.body;

        if (!booking_id || !customer_name || !rating) {
            return res.status(400).json({ success: false, message: 'Booking ID, name, and rating are required' });
        }

        const validRating = Number(rating);
        if (validRating < 1 || validRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Verify booking
        const booking = db.data.reservations.find(r => r.id === booking_id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Invalid Booking ID' });
        }

        if (booking.status !== 'completed') {
            return res.status(403).json({ success: false, message: 'You can only leave a review after your booking is completed' });
        }

        // Check if already reviewed
        if (db.data.reviews.find(r => r.booking_id === booking_id)) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
        }

        const newReview = {
            id: Date.now().toString(),
            booking_id,
            customer_name,
            rating: validRating,
            comment: comment || '',
            created_at: new Date().toISOString()
        };

        db.data.reviews.push(newReview);
        await db.write();

        res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
