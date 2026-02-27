import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    caption: { type: String },
    order: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Gallery', GallerySchema);
