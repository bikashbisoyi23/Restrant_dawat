import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        adminApi.getContacts().then(r => { setContacts(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>Customer Messages</h1>
                <p style={{ color: '#9A8A7A' }}>Contact form submissions from your website visitors</p>
            </div>

            {loading ? <div className="loading"><div className="spinner" /></div> : contacts.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.5, color: '#D4A853' }} />
                    <p style={{ color: '#9A8A7A' }}>No messages yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {contacts.map(c => (
                            <div key={c.id} className="glass-card" onClick={() => setSelected(c)}
                                style={{ padding: '18px 20px', cursor: 'pointer', border: selected?.id === c.id ? '1px solid #D4A853' : '1px solid rgba(212,168,83,0.2)', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</span>
                                        {!c.is_read && <span style={{ marginLeft: 8, background: '#D4A853', color: '#0F0A07', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>NEW</span>}
                                    </div>
                                    <span style={{ color: '#9A8A7A', fontSize: '0.75rem' }}>
                                        {new Date(c.created_at).toLocaleString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ color: '#9A8A7A', fontSize: '0.82rem', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                                    <span><Mail size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.email}</span>
                                    {c.phone && <span><Phone size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.phone}</span>}
                                </div>
                                <p style={{ color: '#FFF8F0', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detail Panel */}
                    {selected && (
                        <div className="glass-card" style={{ padding: '28px', height: 'fit-content', position: 'sticky', top: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem' }}>{selected.name}</h3>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A', fontSize: '1.3rem' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                {[
                                    [Mail, selected.email, 'mailto:' + selected.email],
                                    selected.phone ? [Phone, selected.phone, 'tel:' + selected.phone] : null,
                                    [Clock, new Date(selected.created_at).toLocaleString(), null],
                                ].filter(Boolean).map(([Icon, val, href]) => (
                                    <div key={val} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <Icon size={16} color="#D4A853" />
                                        {href ? <a href={href} style={{ color: '#D4A853' }}>{val}</a> : <span style={{ color: '#9A8A7A', fontSize: '0.88rem' }}>{val}</span>}
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px solid rgba(212,168,83,0.15)', paddingTop: 16 }}>
                                <div style={{ color: '#9A8A7A', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Message</div>
                                <p style={{ lineHeight: 1.8, fontSize: '0.92rem', color: '#FFF8F0' }}>{selected.message}</p>
                            </div>
                            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                                <a href={`mailto:${selected.email}`} className="btn btn-gold btn-sm"><Mail size={14} /> Reply via Email</a>
                                {selected.phone && <a href={`tel:${selected.phone}`} className="btn btn-ghost btn-sm"><Phone size={14} /> Call</a>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
