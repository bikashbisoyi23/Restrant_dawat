import { useState } from 'react';
import { contactApi } from '../services/api';
import { Phone, Mail, MapPin, Instagram, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await contactApi.send(form);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send. Please try again.');
        } finally { setLoading(false); }
    }

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <p style={{ color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.85rem', marginBottom: 12 }}>Get in Touch</p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif' }}>Contact <span style={{ color: '#D4A853' }}>Us</span></h1>
                    <p>We'd love to hear from you</p>
                </div>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container" style={{ maxWidth: 900 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
                        {/* Contact Info */}
                        <div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: 24 }}>
                                Visit <span style={{ color: '#D4A853' }}>Us</span>
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                                {[
                                    [Phone, 'Phone', '+92-300-0000000', null],
                                    [Mail, 'Email', 'info@hoteldawat.com', null],
                                    [MapPin, 'Address', 'Dawat Street, City Centre, Karachi', null],
                                    [Instagram, 'Instagram', '@dawatonplate', 'https://www.instagram.com/dawatonplate?igsh=MXM1MnowY3V0djd6Zw=='],
                                ].map(([Icon, label, val, href]) => (
                                    <div key={label} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', borderRadius: 12, transition: 'transform 0.3s', cursor: href ? 'pointer' : 'default', border: '1px solid rgba(212,168,83,0.1)' }} onMouseEnter={e => href && (e.currentTarget.style.transform = 'translateY(-4px)')} onMouseLeave={e => href && (e.currentTarget.style.transform = 'translateY(0)')}>
                                        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 0 10px rgba(212,168,83,0.1)' }}>
                                            <Icon size={20} color="#D4A853" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#A39383', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                                            {href ? (
                                                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#D4A853', fontWeight: 700, fontSize: '0.98rem', textShadow: '0 0 10px rgba(212,168,83,0.2)' }}>{val}</a>
                                            ) : (
                                                <div style={{ color: '#FFF8F0', fontSize: '0.98rem', fontWeight: 600, letterSpacing: '0.02em' }}>{val}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Hours */}
                            <div className="glass-card" style={{ padding: '20px 24px' }}>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#D4A853', marginBottom: 16, fontSize: '1.05rem' }}>Opening Hours</h3>
                                {[['Mon – Thu', '12:00 PM – 10:30 PM'], ['Fri – Sat', '12:00 PM – 11:30 PM'], ['Sunday', '11:00 AM – 10:00 PM']].map(([d, t]) => (
                                    <div key={d} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                                        <span style={{ color: '#9A8A7A' }}>{d}</span>
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="glass-card" style={{ padding: '40px' }}>
                            {sent ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(46,204,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle size={40} color="#2ecc71" />
                                    </div>
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 12 }}>Message <span style={{ color: '#D4A853' }}>Sent!</span></h3>
                                    <p style={{ color: '#A39383', fontSize: '1.05rem' }}>We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 30 }}>Send a <span style={{ color: '#D4A853' }}>Message</span></h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Your Name *</label>
                                            <input className="form-input" style={{ background: 'rgba(15,10,7,0.5)', padding: '14px 18px' }} placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Email *</label>
                                            <input className="form-input" style={{ background: 'rgba(15,10,7,0.5)', padding: '14px 18px' }} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Phone</label>
                                            <input className="form-input" style={{ background: 'rgba(15,10,7,0.5)', padding: '14px 18px' }} placeholder="+92 300 0000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Message *</label>
                                            <textarea className="form-textarea" style={{ background: 'rgba(15,10,7,0.5)', padding: '16px 18px', minHeight: 140 }} placeholder="How can we help you?" value={form.message} onChange={e => set('message', e.target.value)} required />
                                        </div>
                                    </div>
                                    {error && <div style={{ color: '#e74c3c', marginTop: 12, fontSize: '0.88rem' }}>{error}</div>}
                                    <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 30, padding: '15px 30px', fontSize: '1.05rem' }}>
                                        {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
