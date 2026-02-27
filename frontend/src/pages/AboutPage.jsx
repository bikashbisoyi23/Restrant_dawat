import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Award, Users, Leaf } from 'lucide-react';

export default function AboutPage() {
    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <p style={{ color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem', marginBottom: 12 }}>Our Story</p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif' }}>About <span style={{ color: '#D4A853' }}>Hotel Dawat</span></h1>
                    <p>A legacy of love, flavour, and family traditions</p>
                </div>
            </div>

            <section className="section">
                <div className="container" style={{ maxWidth: 900 }}>
                    {/* Story */}
                    <div className="glass-card" style={{ padding: '48px', marginBottom: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '4rem', marginBottom: 20, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>🍽️</div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', marginBottom: 20, lineHeight: 1.2 }}>
                                A <span style={{ color: '#D4A853', textShadow: '0 0 15px rgba(212,168,83,0.3)' }}>Family</span> Tradition
                            </h2>
                            <p style={{ color: '#A39383', lineHeight: 1.9, marginBottom: 20, fontSize: '1.05rem' }}>
                                Hotel Dawat On Plate was born from a simple belief — that the best meals are shared with the ones you love. Founded over 15 years ago, our restaurant has been the gathering place for thousands of families, celebrating birthdays, anniversaries, festivals, and simple everyday moments.
                            </p>
                            <p style={{ color: '#A39383', lineHeight: 1.9, fontSize: '1.05rem' }}>
                                Our chefs bring authentic regional recipes to life, using only the freshest ingredients sourced daily from local markets. Every dish is crafted with the same love and care that you'd find in a grandmother's kitchen.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {[['15+', 'Years Open', Award], ['50+', 'Dishes', Leaf], ['10K+', 'Families', Users], ['4.9★', 'Rating', Heart]].map(([val, label, Icon]) => (
                                <div key={label} className="glass-panel hover-glow" style={{ padding: '24px 20px', textAlign: 'center', borderRadius: 16 }}>
                                    <Icon size={28} color="#D4A853" style={{ marginBottom: 12, dropShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
                                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#D4A853', fontWeight: 700, marginBottom: 4 }}>{val}</div>
                                    <div style={{ color: '#FFF8F0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Values */}
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', textAlign: 'center', marginBottom: 32 }}>
                        Our <span style={{ color: '#D4A853' }}>Values</span>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 48 }}>
                        {[
                            { emoji: '🌿', title: 'Fresh Ingredients', desc: 'Daily sourced from local farms and markets for maximum freshness and flavour.' },
                            { emoji: '👨‍🍳', title: 'Masterful Chefs', desc: 'Experienced chefs with a deep passion for traditional and contemporary Indian cuisine.' },
                            { emoji: '👨‍👩‍👦', title: 'Family First', desc: 'Every corner of our restaurant is designed to make families feel at home.' },
                            { emoji: '🤝', title: 'Warm Hospitality', desc: 'We treat every guest like family — with respect, care, and a warm smile.' },
                        ].map(({ emoji, title, desc }) => (
                            <div key={title} className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', transition: 'all 0.3s ease' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16, textShadow: '0 5px 15px rgba(0,0,0,0.4)' }}>{emoji}</div>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: 12, color: '#FFF8F0', letterSpacing: '0.02em' }}>{title}</h3>
                                <p style={{ color: '#A39383', fontSize: '0.95rem', lineHeight: 1.7 }}>{desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Instagram CTA */}
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(107,31,42,0.3), rgba(212,168,83,0.1))' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📸</div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 12 }}>Follow Our Journey</h3>
                        <p style={{ color: '#9A8A7A', marginBottom: 24 }}>See our daily specials, behind-the-scenes moments, and happy customer stories on Instagram.</p>
                        <a
                            href="https://www.instagram.com/dawatonplate?igsh=MXM1MnowY3V0djd6Zw=="
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-gold"
                        >
                            📱 Follow @dawatonplate
                        </a>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/book" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                            Reserve Your Table <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
