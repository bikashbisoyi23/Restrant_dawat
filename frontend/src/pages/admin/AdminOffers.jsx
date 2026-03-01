import { useState, useEffect } from 'react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';

const EMPTY = { title: '', description: '', original_price: '', offer_price: '', badge: 'Today Special', image_url: '' };

export default function AdminOffers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | offer object
    const [form, setForm] = useState(EMPTY);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function load() {
        try {
            const res = await adminApi.getOffers();
            setOffers(res.data.data);
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    function openAdd() { setForm(EMPTY); setModal('add'); setError(''); setFile(null); }
    function openEdit(offer) { setForm({ ...offer, original_price: offer.original_price || '', offer_price: offer.discounted_price }); setModal(offer); setError(''); setFile(null); }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            if (form.description) formData.append('description', form.description);
            // Ensure valid numbers
            if (form.original_price) formData.append('original_price', form.original_price);
            formData.append('offer_price', form.offer_price);
            if (form.badge) formData.append('badge', form.badge);
            if (file) formData.append('image', file);

            if (modal === 'add') {
                await adminApi.createOffer(formData);
            } else {
                await adminApi.updateOffer(modal.id, formData);
            }
            await load();
            setModal(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save offer.');
        } finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this offer?')) return;
        try { await adminApi.deleteOffer(id); setOffers(prev => prev.filter(o => o.id !== id)); } catch { alert('Delete failed.'); }
    }

    async function toggleActive(offer) {
        try {
            await adminApi.updateOffer(offer.id, { is_active: !offer.is_active });
            setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
        } catch { alert('Toggle failed.'); }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>Today's Offers</h1>
                    <p style={{ color: '#9A8A7A' }}>Manage daily specials shown on the homepage</p>
                </div>
                <button className="btn btn-gold" onClick={openAdd}><Plus size={18} /> Add New Offer</button>
            </div>

            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {offers.length === 0 && (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
                            <Tag size={40} style={{ marginBottom: 12, opacity: 0.5, color: '#D4A853' }} />
                            <p style={{ color: '#9A8A7A' }}>No offers yet. Add one to show on the homepage!</p>
                        </div>
                    )}
                    {offers.map(offer => (
                        <div key={offer.id} className="glass-card" style={{ padding: '24px', opacity: offer.is_active ? 1 : 0.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ display: 'inline-block', background: '#D4A853', color: '#0F0A07', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{offer.badge}</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => toggleActive(offer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: offer.is_active ? '#2ecc71' : '#9A8A7A' }} title={offer.is_active ? 'Deactivate' : 'Activate'}>
                                        {offer.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                    </button>
                                    <button onClick={() => openEdit(offer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4A853' }}><Pencil size={16} /></button>
                                    <button onClick={() => handleDelete(offer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: 6 }}>{offer.title}</h3>
                            <p style={{ color: '#9A8A7A', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 14 }}>{offer.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#D4A853', fontWeight: 700 }}>₹{offer.discounted_price}</span>
                                {offer.original_price && <span style={{ textDecoration: 'line-through', color: '#9A8A7A' }}>₹{offer.original_price}</span>}
                                {offer.original_price && <span style={{ background: 'rgba(39,174,96,0.2)', color: '#2ecc71', padding: '2px 8px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700 }}>
                                    {Math.round((1 - offer.discounted_price / offer.original_price) * 100)}% OFF
                                </span>}
                            </div>
                            <div style={{ marginTop: 10, fontSize: '0.75rem', color: offer.is_active ? '#2ecc71' : '#9A8A7A' }}>
                                {offer.is_active ? '✓ Visible on homepage' : '✗ Hidden'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div className="glass-card" style={{ padding: 36, maxWidth: 520, width: '100%', position: 'relative' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 24 }}>
                            {modal === 'add' ? 'Add New Offer' : 'Edit Offer'}
                        </h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Family Biryani Feast" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What's included..." style={{ minHeight: 80 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Original Price</label>
                                    <input className="form-input" type="number" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} placeholder="Original ₹" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Offer Price *</label>
                                    <input className="form-input" type="number" value={form.offer_price} onChange={e => setForm(p => ({ ...p, offer_price: e.target.value }))} required placeholder="Sale ₹" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Offer Image (Optional)</label>
                                <input type="file" accept="image/*" className="form-input" style={{ padding: '8px' }} onChange={e => setFile(e.target.files[0])} />
                                {modal !== 'add' && modal?.image_url && !file && (
                                    <div style={{ fontSize: '0.8rem', color: '#9A8A7A', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        Current image: <img src={modal.image_url.startsWith('http') ? modal.image_url : `${UPLOADS_URL}${modal.image_url}`} style={{ height: 40, borderRadius: 4, objectFit: 'cover' }} alt="Current Offer" loading="lazy" />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Badge Label</label>
                                <input className="form-input" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Today Special / Weekend Offer" />
                            </div>
                            {error && <div style={{ color: '#e74c3c', fontSize: '0.88rem' }}>{error}</div>}
                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                                    {saving ? 'Saving...' : 'Save Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
