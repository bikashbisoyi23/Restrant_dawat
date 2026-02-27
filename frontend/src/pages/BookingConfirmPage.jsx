import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { reservationsApi, reviewsApi } from '../services/api';
import { CheckCircle, CalendarDays, Clock, Users, MapPin, AlertCircle, MessageSquare, Star, Copy, XCircle } from 'lucide-react';

const EMOJIS = { starters: '🥗', mains: '🍛', breads: '🫓', desserts: '🍮', beverages: '🥤', all: '🍽️' };

export default function BookingConfirmPage() {
    const { id } = useParams();
    const { state } = useLocation(); // Destructure state from useLocation
    const [resv, setResv] = useState(state?.reservation || null); // Changed reservation to resv
    const [loading, setLoading] = useState(!resv); // Changed reservation to resv
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [error, setError] = useState(''); // Initialized error to empty string

    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');

    useEffect(() => {
        if (!resv) { // Changed reservation to resv
            reservationsApi.getById(id)
                .then(res => { setResv(res.data.data); setLoading(false); }) // Changed setReservation to setResv, added setLoading(false)
                .catch(() => { setError('Reservation not found. Please check your ID and try again.'); setLoading(false); }); // Added setLoading(false)
        } else {
            setLoading(false); // If reservation is already in state, stop loading
        }
    }, [id, resv, state]); // Added resv and state to dependency array

    if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /></div>; // Moved loading check up

    if (error) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <AlertCircle size={48} color="#e74c3c" style={{ marginBottom: 20 }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 10 }}>Oops!</h2>
            <p style={{ color: '#9A8A7A', marginBottom: 24 }}>{error}</p>
            <Link to="/book" className="btn btn-gold">Make a New Booking</Link> {/* Changed to book page */}
        </div>
    );

    // If no reservation and not loading, it means it wasn't found and error was set.
    // This case is now handled by the `if (error)` block above.
    // The original `if (!reservation)` block is replaced by `if (error)` and `if (!resv)` (for loading).

    const createdTime = new Date(resv.created_at).getTime();
    const thirtyMins = 30 * 60 * 1000;
    const canCancel = resv.status === 'confirmed' && (Date.now() - createdTime) <= thirtyMins;
    const timeRemaining = canCancel ? Math.max(0, Math.floor((thirtyMins - (Date.now() - createdTime)) / 60000)) : 0;

    function initiateCancel() {
        setShowCancelModal(true);
    }

    async function handleCancel() {
        setShowCancelModal(false);
        setCancelling(true);
        try {
            await reservationsApi.cancel(resv.id);
            setResv(p => ({ ...p, status: 'cancelled' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Could not cancel. Please call us directly.');
        } finally { setCancelling(false); }
    }

    async function handleReviewSubmit(e) {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await reviewsApi.submit({ booking_id: resv.id, rating, comment: review }); // Changed reservation.id to resv.id
            setReviewSuccess('Thank you for your review!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review.');
        } finally { setSubmittingReview(false); }
    }

    const isCancelled = resv.status === 'cancelled'; // Changed reservation.status to resv.status
    const isCompleted = resv.status === 'completed'; // Added isCompleted

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '120px 24px 60px' }}>
            <div className="container" style={{ maxWidth: 600 }}>
                <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                    {isCancelled ? (
                        <XCircle size={64} color="#e74c3c" style={{ marginBottom: 16 }} />
                    ) : (
                        <CheckCircle size={64} color="#2ecc71" style={{ marginBottom: 16 }} />
                    )}

                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 8 }}>
                        {isCancelled ? 'Reservation Cancelled' : 'Booking Confirmed! 🎉'}
                    </h1>
                    <p style={{ color: '#9A8A7A', marginBottom: 32 }}>
                        {isCancelled ? 'This reservation has been cancelled.' : 'We look forward to welcoming your family!'}
                    </p>

                    {/* Booking ID */}
                    <div style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 10, padding: '10px 20px', marginBottom: 28, display: 'inline-block' }}>
                        <span style={{ color: '#9A8A7A', fontSize: '0.8rem' }}>Booking ID</span>
                        <div style={{ color: '#D4A853', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>{resv.id}</div> {/* Changed reservation.id to resv.id */}
                    </div>

                    {/* Details */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 24, textAlign: 'left', marginBottom: 28 }}>
                        {[
                            [CalendarDays, 'Date', resv.date], // Changed reservation.date to resv.date
                            [Clock, 'Time', resv.time], // Changed reservation.time to resv.time
                            [Users, 'Guests', `${resv.guests} guest${resv.guests > 1 ? 's' : ''}`], // Changed reservation.guests to resv.guests
                            [MapPin, 'Table', `${resv.table_name} (${resv.table_location})`], // Changed reservation.table_name, reservation.table_location to resv.table_name, resv.table_location
                            [MessageSquare, 'Phone', resv.phone], // Changed Phone to MessageSquare, reservation.phone to resv.phone
                            resv.email ? [MessageSquare, 'Email', resv.email] : null, // Changed Mail to MessageSquare, reservation.email to resv.email
                        ].filter(Boolean).map(([Icon, label, val]) => (
                            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                <Icon size={16} color="#D4A853" />
                                <span style={{ color: '#9A8A7A', fontSize: '0.88rem', width: 60 }}>{label}</span>
                                <span style={{ color: '#FFF8F0', fontSize: '0.88rem' }}>{val}</span>
                            </div>
                        ))}
                        {resv.special_requests && ( // Changed reservation.special_requests to resv.special_requests
                            <div style={{ marginTop: 12, padding: '10px', background: 'rgba(212,168,83,0.08)', borderRadius: 8, fontSize: '0.85rem', color: '#9A8A7A' }}>
                                📝 {resv.special_requests}
                            </div>
                        )}
                    </div>

                    {Array.isArray(resv.pre_ordered_items) && resv.pre_ordered_items.length > 0 && (
                        <div style={{ background: 'rgba(212,168,83,0.05)', borderRadius: 12, padding: 24, marginBottom: 30, border: '1px solid rgba(212,168,83,0.1)' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: 16, color: '#D4A853' }}>Pre-Ordered Menu Items</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {resv.pre_ordered_items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < resv.pre_ordered_items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: i < resv.pre_ordered_items.length - 1 ? 12 : 0 }}>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}
                                        </div>
                                        <div style={{ color: '#D4A853', fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px dashed rgba(212,168,83,0.3)', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total Pre-Order Amount</span>
                                <span style={{ color: '#D4A853' }}>₹{resv.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {error && <div style={{ color: '#e74c3c', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" className="btn btn-outline">Back to Home</Link>
                        {resv.status === 'confirmed' && ( // Changed reservation.status to resv.status
                            <div style={{ textAlign: 'center', marginTop: 30, paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ color: '#9A8A7A', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.6 }}>
                                    Need to make changes? You can cancel your reservation within 30 minutes of booking.
                                    Beyond that, please contact the hotel directly.
                                </p>
                                {canCancel ? (
                                    <button className="btn btn-danger btn-sm" onClick={initiateCancel} disabled={cancelling} style={{ borderColor: 'rgba(231,76,60,0.5)', color: '#e74c3c' }}>
                                        {cancelling ? 'Cancelling...' : `Cancel Reservation (Ends in ${timeRemaining}m)`}
                                    </button>
                                ) : (
                                    <div style={{ padding: '12px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', borderRadius: 8, fontSize: '0.85rem', display: 'inline-block' }}>
                                        Cancellation window closed. Please call the hotel to modify this booking.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isCompleted && !reviewSuccess && (
                        <div style={{ background: 'linear-gradient(to right, rgba(212,168,83,0.1), transparent)', borderRadius: 12, padding: 24, marginTop: 30, border: '1px solid rgba(212,168,83,0.2)' }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: 12, color: '#D4A853' }}>How was your experience?</h3>
                            <p style={{ color: '#9A8A7A', fontSize: '0.9rem', marginBottom: 20 }}>We hope you enjoyed your meal! We would love to hear your thoughts.</p>
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button type="button" key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                            <Star size={32} fill={rating >= star ? '#D4A853' : 'transparent'} color={rating >= star ? '#D4A853' : '#9A8A7A'} />
                                        </button>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <textarea className="form-textarea" placeholder="Tell us about the food, the service, and your overall experience..." value={review} onChange={e => setReview(e.target.value)} required rows={4} />
                                </div>
                                <button type="submit" className="btn btn-gold" disabled={submittingReview} style={{ width: 'FIT-CONTENT' }}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {reviewSuccess && (
                        <div style={{ padding: '24px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 12, marginTop: 30, textAlign: 'center' }}>
                            <Star size={40} fill="#D4A853" color="#D4A853" style={{ marginBottom: 12 }} />
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#2ecc71', marginBottom: 6 }}>{reviewSuccess}</h3>
                            <p style={{ color: '#9A8A7A', fontSize: '0.9rem' }}>Your feedback helps us continue providing excellent service.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom Cancel Confirmation Modal */}
            {showCancelModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', border: '1px solid rgba(231,76,60,0.3)', background: 'linear-gradient(135deg, rgba(30,15,15,0.95), rgba(15,8,8,0.95))' }}>
                        <XCircle size={48} color="#e74c3c" style={{ marginBottom: 16, margin: '0 auto' }} />
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 12, color: '#e74c3c' }}>Cancel Reservation?</h3>
                        <p style={{ color: '#9A8A7A', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
                            Are you absolutely sure you want to cancel this booking? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowCancelModal(false)} style={{ flex: 1, justifyContent: 'center' }}>No, Keep It</button>
                            <button className="btn btn-danger" onClick={handleCancel} style={{ flex: 1, justifyContent: 'center' }}>Yes, Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
