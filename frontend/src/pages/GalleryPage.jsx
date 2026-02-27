import { useState, useEffect } from 'react';
import { galleryApi, UPLOADS_URL } from '../services/api';
import { Image as ImageIcon, Film } from 'lucide-react';

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        galleryApi.getAll().then(res => {
            setItems(res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ paddingTop: 100, paddingBottom: 60, minHeight: '100vh' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', color: '#FFF8F0', marginBottom: 16 }}>Our Gallery</h1>
                    <p style={{ color: '#9A8A7A', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                        Experience the ambiance, the culinary artistry, and the unforgetable moments captured at Hotel Dawat On Plate.
                    </p>
                </div>

                {loading ? <div className="loading"><div className="spinner" /></div> : (
                    <div style={{
                        columnCount: 3,
                        columnWidth: 300,
                        columnGap: 24,
                    }}>
                        {items.length === 0 && (
                            <div style={{ columnSpan: 'all', textAlign: 'center', padding: '60px 20px', color: '#9A8A7A' }}>
                                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 16, color: '#D4A853' }} />
                                <h2>No media found</h2>
                                <p>We are currently updating our gallery. Please check back later.</p>
                            </div>
                        )}
                        {items.map(item => (
                            <div key={item.id} className="gallery-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 24, borderRadius: 16, breakInside: 'avoid', border: '1px solid rgba(212,168,83,0.1)' }}>
                                <div style={{ width: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', zIndex: 10, backdropFilter: 'blur(4px)' }}>
                                        {item.type === 'video' ? <Film size={18} color="#D4A853" /> : <ImageIcon size={18} color="#D4A853" />}
                                    </span>
                                    {item.type === 'video' ? (
                                        <video src={`${UPLOADS_URL}${item.url}`} style={{ width: '100%', height: 'auto', display: 'block' }} controls controlsList="nodownload" />
                                    ) : (
                                        <img className="gallery-img" src={`${UPLOADS_URL}${item.url}`} alt={item.caption || 'Gallery Image'} style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }} loading="lazy" />
                                    )}
                                </div>
                                {item.caption && (
                                    <div className="gallery-caption" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', fontSize: '1.05rem', color: '#FFF8F0', background: 'linear-gradient(to top, rgba(15,10,7,0.95), rgba(15,10,7,0.4))', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(212,168,83,0.2)', transform: 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1)', fontFamily: 'Playfair Display, serif', letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                        {item.caption}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .gallery-card:hover .gallery-img { transform: scale(1.08); }
                .gallery-card:hover .gallery-caption { transform: translateY(0); }
            `}</style>
        </div>
    );
}
