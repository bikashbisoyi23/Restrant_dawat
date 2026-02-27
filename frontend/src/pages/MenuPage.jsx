import { useState, useEffect } from 'react';
import { menuApi, UPLOADS_URL } from '../services/api';
import { Search, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['all', 'starters', 'mains', 'breads', 'desserts', 'beverages'];

const CATEGORY_IMAGES = {
    all: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    starters: '/uploads/default_starter.png',
    mains: '/uploads/default_main.png',
    breads: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    desserts: '/uploads/default_dessert.png',
    beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80'
};

export default function MenuPage() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        menuApi.getAll().then(r => { setItems(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = items
        .filter(i => cat === 'all' || i.category === cat)
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="page-header" style={{
                background: 'radial-gradient(ellipse at top, rgba(107,31,42,0.15), transparent 70%)',
                borderBottom: '1px solid rgba(212,168,83,0.05)',
                marginBottom: 40
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem', marginBottom: 16, fontWeight: 700 }}>Our Culinary Journey</p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: 16, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        The <span style={{ color: '#D4A853', fontStyle: 'italic' }}>Menu</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#A39383', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>Authentic flavours crafted with passion, tradition, and the finest ingredients</p>
                </div>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto 36px' }}>
                        <Search size={18} color="#9A8A7A" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            className="form-input"
                            placeholder="Search dishes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 46 }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: 40, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {CATEGORIES.map(c => (
                            <div key={c} onClick={() => setCat(c)} style={{
                                minWidth: 140, height: 100, flexShrink: 0, position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                                border: `2px solid ${cat === c ? '#D4A853' : 'transparent'}`,
                                transition: 'transform 0.2s, opacity 0.2s',
                                transform: cat === c ? 'scale(1.05)' : 'scale(1)',
                                opacity: cat === c ? 1 : 0.6
                            }}>
                                <img src={CATEGORY_IMAGES[c].startsWith('http') ? CATEGORY_IMAGES[c] : `${UPLOADS_URL}${CATEGORY_IMAGES[c]}`} alt={c} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12 }}>
                                    <span style={{ color: cat === c ? '#D4A853' : '#FFF8F0', fontWeight: 800, fontSize: '1.05rem', textTransform: 'capitalize', letterSpacing: '0.05em', textShadow: cat === c ? '0 0 10px rgba(212,168,83,0.5)' : 'none' }}>{c}</span>
                                </div>
                                {cat !== c && <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px)', background: 'rgba(15,10,7,0.3)', zIndex: 2 }} />}
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner" /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                            {filtered.map(item => (
                                <div key={item.id} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>

                                    <div style={{ height: 180, width: '100%', background: 'rgba(212,168,83,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.image_url ? (
                                            <img src={`${UPLOADS_URL}${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                        ) : (
                                            <ImageIcon size={40} color="rgba(212,168,83,0.3)" />
                                        )}
                                        {item.is_featured && <span className="badge" style={{ position: 'absolute', top: 12, right: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>Chef's Pick</span>}
                                        <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(15,10,7,0.85)', color: '#D4A853', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                                            {item.category}
                                        </span>
                                    </div>

                                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: 8, lineHeight: 1.2 }}>{item.name}</h3>
                                            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', color: '#D4A853', fontWeight: 700, textShadow: '0 0 15px rgba(212,168,83,0.3)' }}>₹{item.price}</span>
                                        </div>
                                        <p style={{ color: '#9A8A7A', fontSize: '0.85rem', lineHeight: 1.6, marginTop: 4, flex: 1 }}>{item.description}</p>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#9A8A7A' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                            <p>No dishes found matching your search.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
