import { useState, useEffect } from 'react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { Plus, Pencil, Trash2, Utensils, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_IMAGES } from '../../utils/defaultImages';
import { ITEM_IMAGES } from '../../utils/itemImages';

const CATEGORIES = ['starters', 'mains', 'breads', 'desserts', 'beverages'];
const EMPTY = { name: '', description: '', price: '', category: 'starters', is_available: true, is_featured: false };

export default function AdminMenu() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | item object
    const [form, setForm] = useState(EMPTY);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function load() {
        try {
            const res = await adminApi.getAllMenu();
            setItems(res.data.data);
        } catch { }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    function openAdd() { setForm(EMPTY); setFile(null); setModal('add'); setError(''); }
    function openEdit(item) { setForm(item); setFile(null); setModal(item); setError(''); }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true); setError('');

        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        if (file) formData.append('image', file);

        try {
            if (modal === 'add') {
                await adminApi.createMenu(formData);
            } else {
                await adminApi.updateMenu(modal.id, formData);
            }
            await load();
            setModal(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save menu item.');
        } finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this dish?')) return;
        try {
            await adminApi.deleteMenu(id);
            setItems(prev => prev.filter(m => m.id !== id));
        } catch { alert('Delete failed.'); }
    }

    async function toggleStatus(item, field) {
        try {
            const formData = new FormData();
            formData.append(field, !item[field]);
            const res = await adminApi.updateMenu(item.id, formData);
            setItems(prev => prev.map(m => m.id === item.id ? { ...m, [field]: res.data.data[field] } : m));
        } catch { alert('Update failed.'); }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>Menu Management</h1>
                    <p style={{ color: '#9A8A7A' }}>Add, edit, or remove dishes from the restaurant menu</p>
                </div>
                <button className="btn btn-gold" onClick={openAdd}><Plus size={18} /> Add New Dish</button>
            </div>

            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {items.length === 0 && (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
                            <Utensils size={40} style={{ marginBottom: 12, opacity: 0.5, color: '#D4A853' }} />
                            <p style={{ color: '#9A8A7A' }}>Menu is empty.</p>
                        </div>
                    )}
                    {items.map(item => (
                        <div key={item.id} className="glass-card" style={{ padding: 0, opacity: item.is_available ? 1 : 0.5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: 160, background: 'rgba(212,168,83,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.image_url ? (
                                    <img src={item.image_url.startsWith('http') ? item.image_url : `${UPLOADS_URL}${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={ITEM_IMAGES[item.name] || DEFAULT_IMAGES[item.category] || DEFAULT_IMAGES.fallback} alt="Default Fallback" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                )}
                                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                                    <button onClick={() => openEdit(item)} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer', color: '#D4A853' }}><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(231,76,60,0.8)', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer', color: '#fff' }}><Trash2 size={14} /></button>
                                </div>
                                <span style={{ position: 'absolute', bottom: 10, left: 10, background: '#D4A853', color: '#0F0A07', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                                    {item.category}
                                </span>
                            </div>

                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: 6 }}>{item.name}</h3>
                                    <span style={{ fontSize: '1.2rem', color: '#D4A853', fontWeight: 700 }}>₹{item.price}</span>
                                </div>
                                <p style={{ color: '#9A8A7A', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>{item.description}</p>

                                <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={item.is_available} onChange={() => toggleStatus(item, 'is_available')} />
                                        <span style={{ color: item.is_available ? '#2ecc71' : '#9A8A7A' }}>Available</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={item.is_featured} onChange={() => toggleStatus(item, 'is_featured')} />
                                        <span style={{ color: item.is_featured ? '#D4A853' : '#9A8A7A' }}>Chef's Pick</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="glass-card" style={{ padding: 32, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 20 }}>{modal === 'add' ? 'Add Dish' : 'Edit Dish'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Dish Name *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ minHeight: 60 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Price (₹) *</label>
                                    <input type="number" className="form-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Dish Image (Optional, max 5MB)</label>
                                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: '8px' }} />
                                {modal !== 'add' && form.image_url && !file && <span style={{ fontSize: '0.75rem', color: '#2ecc71', marginTop: 4, display: 'block' }}>✓ Has existing image</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#FFF8F0', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} /> In Stock
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: '#FFF8F0', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} /> Chef's Pick
                                </label>
                            </div>

                            {error && <div style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{error}</div>}
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : 'Save Dish'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
