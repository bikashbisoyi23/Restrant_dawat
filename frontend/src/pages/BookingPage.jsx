import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tablesApi, reservationsApi, menuApi } from '../services/api';
import { CalendarDays, Clock, Users, MapPin, Check, ChevronRight, ChevronLeft, Plus, Minus, ShoppingBag } from 'lucide-react';

const TIME_SLOTS = [
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM',
];

const LOCATION_COLORS = { indoor: '#3498db', outdoor: '#27ae60', vip: '#D4A853' };

export default function BookingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ date: '', time: '', guests: 2, table_id: '', customer_name: '', email: '', phone: '', special_requests: '' });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [preOrder, setPreOrder] = useState({}); // { [item_id]: quantity }

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        menuApi.getAll().then(res => setMenuItems(res.data.data.filter(m => m.is_available))).catch(() => { });
    }, []);

    function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

    function handleQty(id, delta) {
        setPreOrder(prev => {
            const current = prev[id] || 0;
            const next = current + delta;
            if (next <= 0) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            return { ...prev, [id]: next };
        });
    }

    const preOrderItemsArray = Object.entries(preOrder).map(([id, qty]) => {
        const item = menuItems.find(m => m.id === Number(id));
        return { item_id: Number(id), quantity: qty, price: item.price };
    });
    const subtotal = preOrderItemsArray.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const tax = subtotal * 0.05;
    const totalAmount = subtotal + tax;

    async function fetchTables() {
        if (!form.date || !form.time) return;
        setLoading(true); setError('');
        try {
            const res = await tablesApi.getAll({ date: form.date, time: form.time, guests: form.guests });
            setTables(res.data.data);
            setStep(2);
        } catch {
            setError('Could not load tables. Please try again.');
        } finally { setLoading(false); }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.customer_name || !form.phone) { setError('Name and phone are required.'); return; }
        setSubmitting(true); setError('');
        try {
            const res = await reservationsApi.create({
                ...form,
                table_id: Number(form.table_id),
                guests: Number(form.guests),
                pre_ordered_items: preOrderItemsArray,
                total_amount: totalAmount
            });
            navigate(`/booking/${res.data.data.id}`, { state: { reservation: res.data.data } });
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally { setSubmitting(false); }
    }

    const selectedTable = tables.find(t => t.id === Number(form.table_id));

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <p style={{ color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem', marginBottom: 12 }}>Reserve Your Spot</p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif' }}>Book a <span style={{ color: '#D4A853' }}>Table</span></h1>
                    <p>Simple, fast, and confirmed in seconds</p>
                </div>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container" style={{ maxWidth: 800 }}>
                    {/* Step Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 48, flexWrap: 'wrap' }}>
                        {[
                            { n: 1, label: 'Date & Time' },
                            { n: 2, label: 'Pick Table' },
                            { n: 3, label: 'Pre-Order Food' },
                            { n: 4, label: 'Your Details' }
                        ].map(({ n, label }, i) => (
                            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: step >= n ? 1 : 0.6, transition: 'all 0.3s ease' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: step >= n ? 'linear-gradient(135deg, #D4A853, #E5C06A)' : 'rgba(255,255,255,0.03)',
                                        color: step >= n ? '#0F0A07' : '#9A8A7A',
                                        fontWeight: 800, fontSize: '0.95rem',
                                        border: `2px solid ${step >= n ? '#D4A853' : 'rgba(212,168,83,0.15)'}`,
                                        boxShadow: step === n ? '0 0 20px rgba(212,168,83,0.4)' : 'none',
                                    }}>
                                        {step > n ? <Check size={20} /> : n}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: step >= n ? '#D4A853' : '#9A8A7A', whiteSpace: 'nowrap', fontWeight: step === n ? 700 : 400 }}>{label}</span>
                                </div>
                                {i < 3 && <div style={{ width: 40, height: 3, background: step > n ? 'linear-gradient(90deg, #D4A853, #E5C06A)' : 'rgba(212,168,83,0.15)', margin: '0 12px', marginBottom: 24, borderRadius: 2 }} />}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', padding: '12px 20px', borderRadius: 10, marginBottom: 24, textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 30, fontSize: '1.6rem' }}>
                                When would you like to <span style={{ color: '#D4A853' }}>visit?</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                                <div className="form-group">
                                    <label className="form-label"><CalendarDays size={14} style={{ display: 'inline', marginRight: 6 }} />Date</label>
                                    <input type="date" className="form-input" value={form.date} min={today}
                                        onChange={e => { set('date', e.target.value); set('table_id', ''); }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: 6 }} />Guests</label>
                                    <select className="form-select" value={form.guests} onChange={e => { set('guests', e.target.value); set('table_id', ''); }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 32 }}>
                                <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: 6 }} />Time Slot</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {TIME_SLOTS.map(slot => (
                                        <button key={slot} className="hover-glow" onClick={() => set('time', slot)} style={{
                                            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                                            background: form.time === slot ? 'linear-gradient(135deg, #D4A853, #E5C06A)' : 'rgba(255,255,255,0.03)',
                                            color: form.time === slot ? '#0F0A07' : '#FFF8F0',
                                            fontWeight: form.time === slot ? 700 : 400,
                                            boxShadow: form.time === slot ? '0 8px 20px rgba(212,168,83,0.3)' : 'none',
                                            outline: form.time === slot ? 'none' : '1px solid rgba(212,168,83,0.15)',
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            transform: form.time === slot ? 'scale(1.05)' : 'scale(1)'
                                        }}>{slot}</button>
                                    ))}
                                </div>
                            </div>
                            <button className="btn btn-gold" onClick={fetchTables} disabled={!form.date || !form.time || loading}
                                style={{ width: '100%', justifyContent: 'center', opacity: (!form.date || !form.time) ? 0.5 : 1 }}>
                                {loading ? 'Loading Tables...' : <>Check Available Tables <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>Select Your <span style={{ color: '#D4A853' }}>Table</span></h2>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                <span style={{ color: '#9A8A7A', fontSize: '0.88rem' }}>📅 {form.date}</span>
                                <span style={{ color: '#9A8A7A', fontSize: '0.88rem' }}>🕐 {form.time}</span>
                                <span style={{ color: '#9A8A7A', fontSize: '0.88rem' }}>👥 {form.guests} Guests</span>
                            </div>
                            {/* Location Legend */}
                            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                                {[['indoor', 'Indoor'], ['outdoor', 'Outdoor 🌿'], ['vip', 'VIP Suite ⭐']].map(([loc, label]) => (
                                    <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#9A8A7A' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: LOCATION_COLORS[loc] }} />
                                        {label}
                                    </div>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#9A8A7A' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(231,76,60,0.5)' }} />
                                    Booked
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
                                {tables.map(t => {
                                    const selected = form.table_id === t.id;
                                    return (
                                        <div key={t.id}
                                            onClick={() => t.is_available && set('table_id', t.id)}
                                            style={{
                                                padding: 20, borderRadius: 16, textAlign: 'center', cursor: t.is_available ? 'pointer' : 'not-allowed',
                                                border: `2px solid ${selected ? '#D4A853' : t.is_available ? 'rgba(212,168,83,0.1)' : 'rgba(231,76,60,0.15)'}`,
                                                background: selected ? 'rgba(212,168,83,0.15)' : t.is_available ? `linear-gradient(to bottom, rgba(${t.location === 'indoor' ? '52,152,219' : t.location === 'outdoor' ? '39,174,96' : '212,168,83'},0.05), transparent)` : 'rgba(231,76,60,0.05)',
                                                opacity: t.is_available ? 1 : 0.6,
                                                transform: selected ? 'scale(1.05)' : 'scale(1)',
                                                boxShadow: selected ? '0 10px 25px rgba(212,168,83,0.2)' : 'none',
                                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            }}>
                                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>
                                                {t.location === 'vip' ? '👑' : t.location === 'outdoor' ? '🌿' : '🪑'}
                                            </div>
                                            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.05rem', color: selected ? '#D4A853' : '#FFF8F0', letterSpacing: '0.02em' }}>{t.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#A39383', marginTop: 4 }}>{t.seats} seats</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: 8, color: selected ? '#D4A853' : (t.is_available ? LOCATION_COLORS[t.location] : '#e74c3c'), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {t.is_available ? 'Available' : 'Booked'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="btn btn-gold" onClick={() => setStep(3)} disabled={!form.table_id}
                                style={{ width: '100%', justifyContent: 'center', opacity: !form.table_id ? 0.5 : 1 }}>
                                Continue to Pre-Order Food <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: PRE-ORDER FOOD */}
                    {step === 3 && (
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 6 }}>Pre-Order <span style={{ color: '#D4A853' }}>Food</span> (Optional)</h2>
                                    <p style={{ color: '#9A8A7A', fontSize: '0.9rem' }}>Skip the wait and have your meal ready or cooking when you arrive.</p>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            </div>

                            <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 10, marginBottom: 24 }}>
                                {['starters', 'mains', 'breads', 'desserts', 'beverages'].map(cat => {
                                    const cats = menuItems.filter(m => m.category === cat);
                                    if (cats.length === 0) return null;
                                    return (
                                        <div key={cat} style={{ marginBottom: 20 }}>
                                            <h3 style={{ fontSize: '1.1rem', color: '#D4A853', textTransform: 'capitalize', marginBottom: 12, borderBottom: '1px solid rgba(212,168,83,0.2)', paddingBottom: 6 }}>{cat}</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                                {cats.map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                                                            <div style={{ color: '#D4A853', fontSize: '0.9rem', fontWeight: 700 }}>₹{item.price}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '4px' }}>
                                                            <button onClick={() => handleQty(item.id, -1)} disabled={!preOrder[item.id]} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: preOrder[item.id] ? 'rgba(231,76,60,0.8)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: preOrder[item.id] ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                                                            <span style={{ width: 20, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{preOrder[item.id] || 0}</span>
                                                            <button onClick={() => handleQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(46,204,113,0.8)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'radial-gradient(ellipse at top left, rgba(212,168,83,0.15), transparent 70%)', padding: '16px 24px', borderRadius: 12, border: '1px solid rgba(212,168,83,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D4A853', color: '#0F0A07', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={20} /></div>
                                    <div>
                                        <div style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase' }}>{Object.values(preOrder).reduce((a, b) => a + b, 0)} Items Added</div>
                                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#FFF8F0', fontWeight: 700 }}>₹{totalAmount.toFixed(2)}</div>
                                    </div>
                                </div>
                                <button className="btn btn-gold" onClick={() => setStep(4)}>
                                    {Object.keys(preOrder).length > 0 ? 'Continue' : 'Skip & Continue'} <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: YOUR DETAILS */}
                    {step === 4 && (
                        <form onSubmit={handleSubmit}>
                            <div className="glass-card" style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>Your <span style={{ color: '#D4A853' }}>Details</span></h2>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(3)}>
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                </div>

                                {selectedTable && (
                                    <div style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.88rem', color: '#D4A853' }}>✓ {selectedTable.name}</span>
                                        <span style={{ fontSize: '0.88rem', color: '#9A8A7A' }}>{selectedTable.seats} seats • {selectedTable.location}</span>
                                        <span style={{ fontSize: '0.88rem', color: '#9A8A7A' }}>{form.date} at {form.time}</span>
                                        {totalAmount > 0 && <span style={{ fontSize: '0.88rem', color: '#2ecc71', fontWeight: 600 }}>Pre-Order: ₹{totalAmount.toFixed(2)}</span>}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input className="form-input" placeholder="Your name" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone *</label>
                                        <input className="form-input" placeholder="+92 300 0000000" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email (Optional)</label>
                                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Guests</label>
                                        <input className="form-input" type="number" value={form.guests} onChange={e => set('guests', e.target.value)} min={1} max={selectedTable?.seats || 12} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 28 }}>
                                    <label className="form-label">Special Requests (Optional)</label>
                                    <textarea className="form-textarea" placeholder="Any dietary requirements, birthday arrangements, high chair needed, etc." value={form.special_requests} onChange={e => set('special_requests', e.target.value)} />
                                </div>

                                <button type="submit" className="btn btn-gold" disabled={submitting} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                                    {submitting ? 'Confirming...' : <><Check size={18} /> Confirm Reservation</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
