import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { tablesApi } from '../../services/api';
import { CheckCircle } from 'lucide-react';

const TIME_SLOTS = [
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM',
];

export default function AdminReserve() {
    const [form, setForm] = useState({ customer_name: '', email: '', phone: '', date: '', time: '', guests: 2, table_id: '', special_requests: '' });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

    async function fetchTables() {
        if (!form.date || !form.time) return;
        setLoading(true);
        try {
            const res = await tablesApi.getAll({ date: form.date, time: form.time, guests: form.guests });
            setTables(res.data.data);
            set('table_id', '');
        } finally { setLoading(false); }
    }

    useEffect(() => { if (form.date && form.time) fetchTables(); }, [form.date, form.time, form.guests]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.table_id) { setError('Please select a table.'); return; }
        setSubmitting(true); setError('');
        try {
            const res = await adminApi.createReservation({ ...form, table_id: Number(form.table_id), guests: Number(form.guests) });
            setSuccess(res.data.data);
            setForm({ customer_name: '', email: '', phone: '', date: '', time: '', guests: 2, table_id: '', special_requests: '' });
            setTables([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create reservation.');
        } finally { setSubmitting(false); }
    }

    if (success) return (
        <div style={{ maxWidth: 600 }}>
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <CheckCircle size={60} color="#2ecc71" style={{ marginBottom: 16 }} />
                <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Reservation Created!</h2>
                <p style={{ color: '#9A8A7A', marginBottom: 24 }}>Booking ID: <strong style={{ color: '#D4A853', fontFamily: 'monospace', fontSize: '0.85rem' }}>{success.id}</strong></p>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '16px 20px', textAlign: 'left', marginBottom: 24, fontSize: '0.88rem' }}>
                    <div><strong>Customer:</strong> {success.customer_name}</div>
                    <div><strong>Phone:</strong> {success.phone}</div>
                    <div><strong>Date:</strong> {success.date} at {success.time}</div>
                    <div><strong>Guests:</strong> {success.guests}</div>
                    <div><strong>Table:</strong> {success.table_name}</div>
                </div>
                <button className="btn btn-gold" onClick={() => setSuccess(null)}>Create Another Booking</button>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>Reserve for Client</h1>
                <p style={{ color: '#9A8A7A' }}>Manually create a reservation for walk-in or call-in clients</p>
            </div>
            {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ padding: '32px', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 20 }}>Client Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input className="form-input" placeholder="Client name" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input className="form-input" placeholder="+92 300 0000000" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="Optional" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 20 }}>Booking Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input type="date" className="form-input" value={form.date} min={today} onChange={e => set('date', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Guests</label>
                            <select className="form-select" value={form.guests} onChange={e => set('guests', e.target.value)}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => <option key={n} value={n}>{n} Guests</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Time Slot *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {TIME_SLOTS.map(slot => (
                                <button type="button" key={slot} onClick={() => set('time', slot)} style={{
                                    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                                    background: form.time === slot ? 'linear-gradient(135deg, #D4A853, #E5C06A)' : 'rgba(255,255,255,0.05)',
                                    color: form.time === slot ? '#0F0A07' : '#9A8A7A', fontWeight: form.time === slot ? 700 : 400,
                                    outline: form.time === slot ? 'none' : '1px solid rgba(212,168,83,0.2)',
                                }}>{slot}</button>
                            ))}
                        </div>
                    </div>

                    {/* Table selection */}
                    {loading && <div className="loading" style={{ padding: '20px' }}><div className="spinner" /></div>}
                    {tables.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Select Table *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                                {tables.map(t => (
                                    <div key={t.id} onClick={() => t.is_available && set('table_id', t.id)} style={{
                                        padding: '12px', borderRadius: 10, textAlign: 'center', cursor: t.is_available ? 'pointer' : 'not-allowed',
                                        border: `2px solid ${form.table_id == t.id ? '#D4A853' : t.is_available ? 'rgba(212,168,83,0.2)' : 'rgba(231,76,60,0.3)'}`,
                                        background: form.table_id == t.id ? 'rgba(212,168,83,0.15)' : t.is_available ? 'rgba(255,255,255,0.03)' : 'rgba(231,76,60,0.05)',
                                        opacity: t.is_available ? 1 : 0.5,
                                    }}>
                                        <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t.location === 'vip' ? '👑' : t.location === 'outdoor' ? '🌿' : '🪑'}</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: form.table_id == t.id ? '#D4A853' : '#FFF8F0' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9A8A7A' }}>{t.seats} seats</div>
                                        <div style={{ fontSize: '0.68rem', color: t.is_available ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
                                            {t.is_available ? '✓ Free' : '✗ Booked'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Special Requests</label>
                        <textarea className="form-textarea" value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Any special arrangements..." />
                    </div>
                </div>

                <button type="submit" className="btn btn-gold" disabled={submitting} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                    {submitting ? 'Creating Reservation...' : '✓ Create Reservation'}
                </button>
            </form>
        </div>
    );
}
