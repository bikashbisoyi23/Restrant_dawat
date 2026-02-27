import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    reservationId: { type: String, required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Review', ReviewSchema);
