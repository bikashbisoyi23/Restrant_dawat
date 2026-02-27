import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'];

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ date: '', status: 'all' });
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    async function load() {
        setLoading(true);
        try {
            const params = {};
            if (filter.date) params.date = filter.date;
            if (filter.status !== 'all') params.status = filter.status;
            const res = await adminApi.getBookings(params);
            setBookings(res.data.data);
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [filter]);

    async function updateStatus(id, status) {
        setUpdating(id);
        try {
            await adminApi.updateStatus(id, status);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        } catch { alert('Failed to update status.'); }
        setUpdating(null);
    }

    const filtered = bookings.filter(b =>
        b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        b.phone.includes(search) ||
        (b.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const statusColors = {
        confirmed: { bg: 'rgba(39,174,96,0.15)', color: '#2ecc71' },
        cancelled: { bg: 'rgba(231,76,60,0.15)', color: '#e74c3c' },
        seated: { bg: 'rgba(52,152,219,0.15)', color: '#3498db' },
        completed: { bg: 'rgba(155,89,182,0.15)', color: '#9b59b6' },
        'no-show': { bg: 'rgba(230,126,34,0.15)', color: '#e67e22' },
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>All Bookings</h1>
                <p style={{ color: '#9A8A7A' }}>Manage and update reservation statuses</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
                    <Search size={16} color="#9A8A7A" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="form-input" placeholder="Search by name, phone or email..." value={search}
                        onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
                <input type="date" className="form-input" value={filter.date} onChange={e => setFilter(p => ({ ...p, date: e.target.value }))} style={{ width: 170 }} />
                <select className="form-select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))} style={{ width: 160 }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                {(filter.date || filter.status !== 'all') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ date: '', status: 'all' })}>Clear</button>
                )}
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9A8A7A' }}>
                        <Filter size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p>No bookings found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <tr>
                                    {['Customer', 'Phone', 'Date', 'Time', 'Guests', 'Table', 'Pre-Orders', 'Booked At', 'By', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#D4A853', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b, i) => (
                                    <tr key={b.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                                            {b.email && <div style={{ color: '#9A8A7A', fontSize: '0.78rem' }}>{b.email}</div>}
                                            {b.special_requests && <div style={{ color: '#D4A853', fontSize: '0.72rem', marginTop: 2 }}>📝 Has note</div>}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#9A8A7A' }}>{b.phone}</td>
                                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{b.date}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.time}</td>
                                        <td style={{ padding: '12px 14px' }}>{b.guests}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ fontWeight: 600 }}>{b.table_name}</div>
                                            <div style={{ color: '#9A8A7A', fontSize: '0.75rem' }}>{b.table_location}</div>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                                            {b.pre_ordered_items && b.pre_ordered_items.length > 0 ? (
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#D4A853', marginBottom: 2 }}>{b.pre_ordered_items.length} items (₹{b.total_amount || 0})</div>
                                                    <ul style={{ paddingLeft: 14, margin: 0, color: '#9A8A7A' }}>
                                                        {b.pre_ordered_items.map((item, idx) => (
                                                            <li key={idx}>{item.quantity}x {item.name}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#9A8A7A', opacity: 0.6 }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#9A8A7A', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                            {new Date(b.created_at).toLocaleString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: b.booked_by === 'admin' ? '#D4A853' : '#9A8A7A', fontSize: '0.78rem' }}>
                                            {b.booked_by === 'admin' ? '👤 Admin' : '🌐 Online'}
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', ...(statusColors[b.status] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' }) }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {b.status !== 'seated' && b.status !== 'completed' && b.status !== 'cancelled' && (
                                                    <button className="btn btn-sm" disabled={updating === b.id}
                                                        onClick={() => updateStatus(b.id, 'seated')}
                                                        style={{ background: 'rgba(52,152,219,0.2)', color: '#3498db', border: '1px solid rgba(52,152,219,0.3)', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Seat
                                                    </button>
                                                )}
                                                {b.status === 'seated' && (
                                                    <button className="btn btn-sm" disabled={updating === b.id}
                                                        onClick={() => updateStatus(b.id, 'completed')}
                                                        style={{ background: 'rgba(155,89,182,0.2)', color: '#9b59b6', border: '1px solid rgba(155,89,182,0.3)', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Complete
                                                    </button>
                                                )}
                                                {b.status === 'confirmed' && (
                                                    <button className="btn btn-sm" disabled={updating === b.id}
                                                        onClick={() => updateStatus(b.id, 'no-show')}
                                                        style={{ background: 'rgba(230,126,34,0.2)', color: '#e67e22', border: '1px solid rgba(230,126,34,0.3)', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        No-show
                                                    </button>
                                                )}
                                                {b.status !== 'cancelled' && b.status !== 'completed' && (
                                                    <button className="btn btn-sm" disabled={updating === b.id}
                                                        onClick={() => window.confirm('Cancel this reservation?') && updateStatus(b.id, 'cancelled')}
                                                        style={{ background: 'rgba(231,76,60,0.2)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && filtered.length > 0 && (
                <p style={{ color: '#9A8A7A', fontSize: '0.8rem', marginTop: 12 }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''} shown</p>
            )}
        </div>
    );
}
