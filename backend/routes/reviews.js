import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// GET /api/reviews - Get all public reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/reviews - Submit a review (Booking ID must be valid and status 'completed')
router.post('/', async (req, res) => {
    try {
        const { booking_id, customer_name, rating, comment } = req.body;

        if (!booking_id || !customer_name || !rating) {
            return res.status(400).json({ success: false, message: 'Booking ID, name, and rating are required' });
        }

        const validRating = Number(rating);
        if (validRating < 1 || validRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Verify booking
        const booking = await Reservation.findOne({ id: booking_id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Invalid Booking ID' });
        }

        if (booking.status !== 'completed') {
            return res.status(403).json({ success: false, message: 'You can only leave a review after your booking is completed' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ reservationId: booking_id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
        }

        const newReview = new Review({
            id: uuidv4(),
            reservationId: booking_id,
            customerName: customer_name,
            rating: validRating,
            comment: comment || '',
            createdAt: new Date().toISOString()
        });

        await newReview.save();

        res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
