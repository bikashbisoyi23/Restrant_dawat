import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

import { connectDB } from './database.js';
import tablesRouter from './routes/tables.js';
import reservationsRouter from './routes/reservations.js';
import menuRouter from './routes/menu.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';
import galleryRouter from './routes/gallery.js';
import reviewsRouter from './routes/reviews.js';
import Offer from './models/Offer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

connectDB(); // Connects to MongoDB via Mongoose synchronously in the background

// Public offers endpoint
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find({ is_active: true });
        res.json({ success: true, data: offers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.use('/api/tables', tablesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/menu', menuRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Hotel Dawat On Plate API is running 🍽️', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🍽️  Hotel Dawat On Plate API running at http://localhost:${PORT}`);
        console.log(`📋  Admin login: username=admin  password=dawat@2024`);
    });
}

export default app;
