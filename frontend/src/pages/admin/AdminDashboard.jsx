import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { CalendarCheck, Users, Tag, MessageSquare, Table2, XCircle, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getDashboard().then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /></div>;
    if (!data) return <div style={{ color: '#e74c3c' }}>Failed to load dashboard. Please refresh.</div>;

    const { stats, todaySchedule } = data;

    const statCards = [
        { icon: CalendarCheck, label: "Today's Bookings", value: stats.todayBookings, color: '#3498db' },
        { icon: TrendingUp, label: 'Total Bookings', value: stats.totalBookings, color: '#D4A853' },
        { icon: Clock, label: 'Pending (Confirmed)', value: stats.pendingBookings, color: '#2ecc71' },
        { icon: XCircle, label: 'Cancelled Today', value: stats.cancelledToday, color: '#e74c3c' },
        { icon: Table2, label: 'Total Tables', value: stats.totalTables, color: '#9b59b6' },
        { icon: MessageSquare, label: 'Unread Messages', value: stats.unreadContacts, color: '#e67e22' },
        { icon: Tag, label: 'Active Offers', value: stats.activeOffers, color: '#1abc9c' },
    ];

    const STATUS_COLORS = { confirmed: '#2ecc71', cancelled: '#e74c3c', seated: '#3498db', completed: '#9b59b6', 'no-show': '#e67e22' };

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Admin 👋
                </h1>
                <p style={{ color: '#9A8A7A' }}>Here's what's happening at Hotel Dawat today</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 36 }}>
                {statCards.map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: color + '1A' }} />
                        <Icon size={22} color={color} style={{ marginBottom: 10 }} />
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                        <div style={{ color: '#9A8A7A', fontSize: '0.8rem', marginTop: 6 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link to="/admin/reserve" className="btn btn-gold btn-sm">+ Reserve for Client</Link>
                <Link to="/admin/offers" className="btn btn-primary btn-sm">+ Add Today's Offer</Link>
                <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View All Bookings</Link>
            </div>

            {/* Today's Schedule */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: 20, color: '#D4A853' }}>
                    📅 Today's Schedule
                </h2>
                {todaySchedule.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9A8A7A' }}>
                        <CalendarCheck size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p>No bookings for today yet.</p>
                        <Link to="/admin/reserve" className="btn btn-gold btn-sm" style={{ marginTop: 16 }}>Reserve a Table</Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(212,168,83,0.2)' }}>
                                    {['Time', 'Customer', 'Phone', 'Guests', 'Table', 'Status', 'Booked By'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#D4A853', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {todaySchedule.map((r, i) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{r.time}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.customer_name}</td>
                                        <td style={{ padding: '12px 14px', color: '#9A8A7A' }}>{r.phone}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.guests}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.table_name}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ ...statusStyle(r.status) }}>{r.status}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', color: r.booked_by === 'admin' ? '#D4A853' : '#9A8A7A', fontSize: '0.8rem' }}>
                                            {r.booked_by === 'admin' ? '👤 Admin' : '🌐 Online'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function statusStyle(s) {
    const map = { confirmed: { background: 'rgba(39,174,96,0.15)', color: '#2ecc71' }, cancelled: { background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }, seated: { background: 'rgba(52,152,219,0.15)', color: '#3498db' }, completed: { background: 'rgba(155,89,182,0.15)', color: '#9b59b6' }, 'no-show': { background: 'rgba(230,126,34,0.15)', color: '#e67e22' } };
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', ...map[s] };
}
