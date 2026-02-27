import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    items: { type: [String], required: true },
    original_price: { type: Number, required: true },
    discounted_price: { type: Number, required: true },
    badge: { type: String },
    is_active: { type: Boolean, default: true },
    image_url: { type: String }
}, { timestamps: true });

export default mongoose.model('Offer', OfferSchema);
