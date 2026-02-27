import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        { to: '/gallery', label: 'Gallery' },
        { to: '/find-booking', label: 'Find Booking' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            padding: '16px 24px',
            background: scrolled ? 'rgba(15,10,7,0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(24px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(212,168,83,0.1)' : '1px solid transparent',
            transition: 'all 0.4s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="Hotel Dawat Logo" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,168,83,0.8)' }} />
                <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: '#FFF8F0', lineHeight: 1 }}>
                        Hotel Dawat
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#D4A853', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        On Plate
                    </div>
                </div>
            </Link>

            {/* Desktop Links */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-desktop">
                {links.map(l => (
                    <Link key={l.to} to={l.to} className={`nav-link ${pathname === l.to ? 'active' : ''}`}>
                        {l.label}
                    </Link>
                ))}
                <Link to="/book" className="btn btn-gold btn-sm">Reserve Now</Link>
            </div>

            {/* Hamburger */}
            <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#FFF8F0', cursor: 'pointer', display: 'none' }} className="nav-burger">
                {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Mobile Menu */}
            {open && (
                <div style={{
                    position: 'fixed', top: 72, left: 0, right: 0,
                    background: 'rgba(15,10,7,0.98)', padding: '20px 24px',
                    display: 'flex', flexDirection: 'column', gap: 20,
                    borderBottom: '1px solid rgba(212,168,83,0.2)',
                }}>
                    {links.map(l => (
                        <Link key={l.to} to={l.to} onClick={() => setOpen(false)} style={{
                            color: pathname === l.to ? '#D4A853' : '#FFF8F0', fontSize: '1.1rem',
                        }}>{l.label}</Link>
                    ))}
                    <Link to="/book" onClick={() => setOpen(false)} className="btn btn-gold">Reserve Now</Link>
                </div>
            )}

            <style>{`
        .nav-link {
            color: #FFF8F0;
            font-size: 0.95rem;
            font-weight: 400;
            position: relative;
            padding-bottom: 4px;
            transition: color 0.3s ease;
            letter-spacing: 0.02em;
        }
        .nav-link:hover { color: #D4A853; }
        .nav-link::after {
            content: ''; position: absolute; left: 0; bottom: 0; width: 0%; height: 2px;
            background: #D4A853; transition: width 0.3s ease;
            border-radius: 2px;
            box-shadow: 0 0 8px rgba(212,168,83,0.4);
        }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .nav-link.active { color: #D4A853; font-weight: 700; }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
