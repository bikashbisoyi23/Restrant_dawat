import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import Menu from './models/Menu.js';
import Table from './models/Table.js';
import Reservation from './models/Reservation.js';
import Offer from './models/Offer.js';
import Gallery from './models/Gallery.js';
import Contact from './models/Contact.js';
import Review from './models/Review.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'hotel_dawat.json');

async function seedDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Reading local JSON file...');
        if (!fs.existsSync(DB_PATH)) {
            console.log('No hotel_dawat.json found. Exiting.');
            process.exit(0);
        }

        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

        console.log('Clearing existing collections...');
        await Menu.deleteMany({});
        await Table.deleteMany({});
        await Reservation.deleteMany({});
        await Offer.deleteMany({});
        await Gallery.deleteMany({});
        await Contact.deleteMany({});
        await Review.deleteMany({});

        console.log('Seeding Menu Items...');
        if (data.menu_items && data.menu_items.length) {
            await Menu.insertMany(data.menu_items.map(item => ({ ...item, id: item.id.toString() })));
        }

        console.log('Seeding Tables...');
        if (data.tables && data.tables.length) {
            await Table.insertMany(data.tables.map(table => ({ ...table, id: table.id.toString() })));
        }

        console.log('Seeding Reservations...');
        if (data.reservations && data.reservations.length) {
            const validReservations = data.reservations.filter(r => r.tableId && r.timeSlot && r.customerName);
            await Reservation.insertMany(validReservations.map(r => ({ ...r, id: r.id.toString() })));
        }

        console.log('Seeding Offers...');
        if (data.offers && data.offers.length) {
            const validOffers = data.offers.map(o => ({
                ...o,
                id: o.id.toString(),
                discounted_price: o.discounted_price || o.original_price
            }));
            await Offer.insertMany(validOffers);
        }

        console.log('Seeding Gallery...');
        if (data.gallery && data.gallery.length) {
            await Gallery.insertMany(data.gallery.map(g => ({ ...g, id: g.id.toString() })));
        }

        console.log('Seeding Contacts...');
        if (data.contacts && data.contacts.length) {
            await Contact.insertMany(data.contacts.map(c => ({ ...c, id: c.id.toString() })));
        }

        console.log('Seeding Reviews...');
        if (data.reviews && data.reviews.length) {
            await Review.insertMany(data.reviews.map(r => ({ ...r, id: r.id.toString() })));
        }

        console.log('Database seeded successfully! 🌱');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDB();
