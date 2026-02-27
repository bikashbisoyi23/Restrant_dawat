import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    seats: { type: Number, required: true },
    location: { type: String, required: true },
    is_available: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Table', TableSchema);
