import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    tableId: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guests: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    specialRequests: { type: String },
    status: { type: String, enum: ['confirmed', 'seated', 'completed', 'cancelled'], default: 'confirmed' },
    createdAt: { type: String, required: true },
    pre_ordered_items: [
        {
            itemId: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    total_amount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Reservation', ReservationSchema);
