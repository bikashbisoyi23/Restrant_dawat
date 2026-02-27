import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { reservationsApi } from '../services/api';

export default function BookingLookupPage() {
    const [bookingId, setBookingId] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSearch(e) {
        e.preventDefault();
        if (!bookingId.trim()) return;

        setLoading(true); setError(''); setBooking(null);
        try {
            const res = await reservationsApi.getById(bookingId.trim());
            setBooking(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking not found. Please check your ID and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '60px', background: 'radial-gradient(ellipse at center, #1A0C0A, #0F0A07)' }}>
            <div className="container" style={{ maxWidth: 600 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, rgba(212,168,83,0.1), rgba(212,168,83,0.05))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(212,168,83,0.2)' }}>
                        <Search size={30} color="#D4A853" />
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: '#FFF8F0', marginBottom: 12 }}>Check Reservation Status</h1>
                    <p style={{ color: '#9A8A7A' }}>Enter your Booking ID to view your reservation details.</p>
                </div>

                <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <input
                                className="form-input"
                                placeholder="Enter Booking ID (e.g. 550e8400...)"
                                value={bookingId}
                                onChange={e => setBookingId(e.target.value)}
                                required
                                style={{ padding: '14px 20px' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-gold" disabled={loading} style={{ padding: '14px 24px' }}>
                            {loading ? 'Searching...' : 'Find'}
                        </button>
                    </form>
                    {error && <div style={{ color: '#e74c3c', marginTop: 16, fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                </div>

                {booking && (
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                            <div style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: 50, background: 'rgba(212,168,83,0.1)', color: '#D4A853', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 20 }}>
                                Status: {booking.status.toUpperCase()}
                            </div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 8 }}>{booking.customer_name}</h2>
                            <p style={{ color: '#9A8A7A', fontFamily: 'monospace' }}>ID: {booking.id}</p>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 24, marginBottom: 30 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div><p style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date & Time</p><p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{new Date(booking.date).toLocaleDateString()} at {booking.time}</p></div>
                                <div><p style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase' }}>Guests</p><p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{booking.guests} People</p></div>
                                <div><p style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase' }}>Table</p><p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{booking.table_name}</p></div>
                                <div><p style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contact</p><p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{booking.phone}</p></div>
                            </div>
                        </div>

                        <Link to={`/booking/${booking.id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            View Full Details <FileText size={18} style={{ marginLeft: 8 }} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
