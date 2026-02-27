import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { LayoutDashboard, CalendarCheck, PlusSquare, Tag, MessageSquare, LogOut, UtensilsCrossed, Menu, X, Utensils, Image as ImageIcon } from 'lucide-react';

const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/bookings', icon: CalendarCheck, label: 'All Bookings' },
    { to: '/admin/reserve', icon: PlusSquare, label: 'Reserve for Client' },
    { to: '/admin/offers', icon: Tag, label: "Today's Offers" },
    { to: '/admin/menu', icon: Utensils, label: 'Menu Management' },
    { to: '/admin/gallery', icon: ImageIcon, label: 'Gallery Management' },
    { to: '/admin/contacts', icon: MessageSquare, label: 'Messages' },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    async function handleLogout() {
        try { await adminApi.logout(); } catch { }
        localStorage.removeItem('adminToken');
        navigate('/admin');
    }

    const Sidebar = () => (
        <aside style={{ width: 250, background: '#080504', borderRight: '1px solid rgba(212,168,83,0.1)', display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
            <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(212,168,83,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6B1F2A, #D4A853)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UtensilsCrossed size={18} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#FFF8F0', lineHeight: 1 }}>Admin</div>
                        <div style={{ fontSize: '0.65rem', color: '#D4A853', letterSpacing: '0.1em' }}>Hotel Dawat On Plate</div>
                    </div>
                </div>
            </div>

            <nav style={{ padding: '16px 12px', flex: 1 }}>
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                            borderRadius: 10, marginBottom: 4, fontSize: '0.9rem', fontWeight: isActive ? 700 : 400,
                            color: isActive ? '#D4A853' : '#9A8A7A',
                            background: isActive ? 'rgba(212,168,83,0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid #D4A853' : '3px solid transparent',
                            transition: 'all 0.2s',
                        })}>
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(212,168,83,0.1)' }}>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0A07' }}>
            {/* Desktop Sidebar */}
            <div className="admin-sidebar-desktop"><Sidebar /></div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 250 }}><Sidebar /></div>
                </div>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar (mobile) */}
                <div style={{ padding: '12px 20px', background: '#080504', borderBottom: '1px solid rgba(212,168,83,0.1)', display: 'flex', alignItems: 'center', gap: 12 }} className="admin-topbar">
                    <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#FFF8F0', cursor: 'pointer' }}>
                        <Menu size={22} />
                    </button>
                    <span style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853' }}>Hotel Dawat Admin</span>
                </div>
                <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </div>

            <style>{`
        .admin-sidebar-desktop { display: flex; }
        .admin-topbar { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none; }
          .admin-topbar { display: flex; }
        }
      `}</style>
        </div>
    );
}
