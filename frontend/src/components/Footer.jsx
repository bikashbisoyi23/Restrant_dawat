import { Link } from 'react-router-dom';
import { UtensilsCrossed, Instagram, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: '#080504', borderTop: '1px solid rgba(212,168,83,0.15)', padding: '60px 0 24px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6B1F2A, #D4A853)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UtensilsCrossed size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.2rem', color: '#FFF8F0' }}>Hotel Dawat</div>
                                <div style={{ fontSize: '0.65rem', color: '#D4A853', letterSpacing: '0.12em', textTransform: 'uppercase' }}>On Plate</div>
                            </div>
                        </div>
                        <p style={{ color: '#9A8A7A', fontSize: '0.9rem', lineHeight: 1.8 }}>
                            The perfect family dining experience. Authentic flavours, warm ambiance, and memories that last a lifetime.
                        </p>
                        <a
                            href="https://www.instagram.com/dawatonplate?igsh=MXM1MnowY3V0djd6Zw=="
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, color: '#D4A853', fontWeight: 700, fontSize: '0.9rem', transition: 'color 0.2s' }}
                        >
                            <Instagram size={20} />
                            @dawatonplate
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 20, fontSize: '1.1rem' }}>Quick Links</h4>
                        {[['/', 'Home'], ['/menu', 'Our Menu'], ['/book', 'Book a Table'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
                            <Link key={to} to={to} style={{ display: 'block', color: '#9A8A7A', marginBottom: 10, fontSize: '0.9rem', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#D4A853'}
                                onMouseLeave={e => e.target.style.color = '#9A8A7A'}
                            >{label}</Link>
                        ))}
                    </div>

                    {/* Timing */}
                    <div>
                        <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 20, fontSize: '1.1rem' }}>Opening Hours</h4>
                        {[
                            ['Mon – Thu', '12:00 PM – 10:30 PM'],
                            ['Fri – Sat', '12:00 PM – 11:30 PM'],
                            ['Sunday', '11:00 AM – 10:00 PM'],
                        ].map(([day, time]) => (
                            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                                <span style={{ color: '#9A8A7A' }}>{day}</span>
                                <span style={{ color: '#FFF8F0' }}>{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 20, fontSize: '1.1rem' }}>Contact Us</h4>
                        {[
                            [Phone, '+92-300-0000000'],
                            [Mail, 'info@hoteldawat.com'],
                            [MapPin, 'Dawat Street, City Centre'],
                        ].map(([Icon, text]) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                                <Icon size={16} color="#D4A853" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ color: '#9A8A7A', fontSize: '0.88rem' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(212,168,83,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: '#9A8A7A', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} Hotel Dawat On Plate. All rights reserved.
                    </p>
                    <p style={{ color: '#9A8A7A', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Made with <Heart size={14} color="#D4A853" fill="#D4A853" /> for food lovers
                    </p>
                </div>
            </div>
        </footer>
    );
}
