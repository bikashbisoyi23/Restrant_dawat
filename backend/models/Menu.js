import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    is_available: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_veg: { type: Boolean, default: false },
    image_url: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Menu', MenuSchema);
