import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    items: { type: [String], default: [] },
    original_price: { type: Number },
    discounted_price: { type: Number, required: true },
    badge: { type: String },
    is_active: { type: Boolean, default: true },
    image_url: { type: String }
}, { timestamps: true });

export default mongoose.model('Offer', OfferSchema);
