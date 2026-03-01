import { useState, useEffect, useCallback, useRef } from 'react';
import { galleryApi, UPLOADS_URL } from '../services/api';
import { Image as ImageIcon, Film, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

function getUrl(item) {
    return item.url.startsWith('http') ? item.url : `${UPLOADS_URL}${item.url}`;
}

/* ─── Hero Slider ────────────────────────────────────────────────────── */
function HeroSlider({ slides }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    const go = useCallback((dir) => {
        setCurrent(p => (p + dir + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        timerRef.current = setInterval(() => go(1), 4500);
        return () => clearInterval(timerRef.current);
    }, [go]);

    const resetTimer = (dir) => {
        clearInterval(timerRef.current);
        go(dir);
        timerRef.current = setInterval(() => go(1), 4500);
    };

    if (!slides.length) return null;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: 520,
            overflow: 'hidden',
            borderRadius: 20,
            marginBottom: 60,
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
            border: '1px solid rgba(212,168,83,0.18)',
        }}>
            {/* Slides */}
            {slides.map((item, i) => (
                <div
                    key={item.id}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: i === current ? 1 : 0,
                        transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
                        pointerEvents: i === current ? 'auto' : 'none',
                    }}
                >
                    {item.type === 'video' ? (
                        <video
                            src={getUrl(item)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            autoPlay muted loop playsInline
                        />
                    ) : (
                        <img
                            src={getUrl(item)}
                            alt={item.caption || 'Slide'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    {/* Gradient overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(15,10,7,0.85) 0%, rgba(15,10,7,0.1) 55%, transparent 100%)',
                    }} />
                    {item.caption && (
                        <div style={{
                            position: 'absolute', bottom: 36, left: 40, right: 40,
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                            color: '#FFF8F0',
                            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                            letterSpacing: '0.03em',
                        }}>
                            {item.caption}
                        </div>
                    )}
                </div>
            ))}

            {/* Left button */}
            <button
                onClick={() => resetTimer(-1)}
                aria-label="Previous slide"
                style={{
                    position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(15,10,7,0.6)', border: '1px solid rgba(212,168,83,0.35)',
                    borderRadius: '50%', width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#D4A853', backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s', zIndex: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,83,0.25)'; e.currentTarget.style.borderColor = '#D4A853'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,10,7,0.6)'; e.currentTarget.style.borderColor = 'rgba(212,168,83,0.35)'; }}
            >
                <ChevronLeft size={22} />
            </button>

            {/* Right button */}
            <button
                onClick={() => resetTimer(1)}
                aria-label="Next slide"
                style={{
                    position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(15,10,7,0.6)', border: '1px solid rgba(212,168,83,0.35)',
                    borderRadius: '50%', width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#D4A853', backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s', zIndex: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,168,83,0.25)'; e.currentTarget.style.borderColor = '#D4A853'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,10,7,0.6)'; e.currentTarget.style.borderColor = 'rgba(212,168,83,0.35)'; }}
            >
                <ChevronRight size={22} />
            </button>

            {/* Dot indicators */}
            <div style={{
                position: 'absolute', bottom: 16, right: 40,
                display: 'flex', gap: 8, zIndex: 10,
            }}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { clearInterval(timerRef.current); setCurrent(i); timerRef.current = setInterval(() => go(1), 4500); }}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{
                            width: i === current ? 24 : 8, height: 8,
                            borderRadius: 4, border: 'none', cursor: 'pointer',
                            background: i === current ? '#D4A853' : 'rgba(255,255,255,0.35)',
                            transition: 'all 0.3s',
                            padding: 0,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Lightbox ───────────────────────────────────────────────────────── */
function Lightbox({ item, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(5,3,2,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
                animation: 'lbFadeIn 0.25s ease',
            }}
        >
            <button
                onClick={onClose}
                aria-label="Close"
                style={{
                    position: 'fixed', top: 22, right: 22,
                    background: 'rgba(212,168,83,0.15)',
                    border: '1px solid rgba(212,168,83,0.4)',
                    borderRadius: '50%', width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#D4A853', zIndex: 10001,
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,83,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,168,83,0.15)'}
            >
                <X size={20} />
            </button>

            <div
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '90vw', maxHeight: '88vh',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    animation: 'lbZoomIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    display: 'flex', flexDirection: 'column',
                    background: '#1A1007',
                }}
            >
                {item.type === 'video' ? (
                    <video
                        src={getUrl(item)}
                        controls
                        autoPlay
                        controlsList="nodownload"
                        style={{ maxWidth: '88vw', maxHeight: '78vh', display: 'block', objectFit: 'contain' }}
                    />
                ) : (
                    <img
                        src={getUrl(item)}
                        alt={item.caption || 'Gallery Image'}
                        style={{ maxWidth: '88vw', maxHeight: '78vh', display: 'block', objectFit: 'contain' }}
                    />
                )}
                {item.caption && (
                    <div style={{
                        padding: '14px 20px',
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1rem',
                        color: '#FFF8F0',
                        borderTop: '1px solid rgba(212,168,83,0.15)',
                        background: '#1A1007',
                        textAlign: 'center',
                    }}>
                        {item.caption}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes lbZoomIn { from { transform: scale(0.82); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

/* ─── Gallery Card ───────────────────────────────────────────────────── */
function GalleryCard({ item, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={() => onClick(item)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `1px solid ${hovered ? 'rgba(212,168,83,0.4)' : 'rgba(212,168,83,0.1)'}`,
                boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.6), 0 0 18px rgba(212,168,83,0.12)' : '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.35s cubic-bezier(0.25,1,0.5,1)',
                transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
                background: '#0F0A07',
            }}
        >
            {/* Uniform image area */}
            <div style={{ width: '100%', height: 240, overflow: 'hidden', position: 'relative' }}>
                {item.type === 'video' ? (
                    <video
                        src={getUrl(item)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
                        muted playsInline
                    />
                ) : (
                    <img
                        src={getUrl(item)}
                        alt={item.caption || 'Gallery Image'}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
                    />
                )}

                {/* Type badge */}
                <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(0,0,0,0.55)',
                    padding: '6px 10px', borderRadius: 8,
                    display: 'flex', alignItems: 'center',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    zIndex: 2,
                }}>
                    {item.type === 'video' ? <Film size={16} color="#D4A853" /> : <ImageIcon size={16} color="#D4A853" />}
                </span>

                {/* Zoom icon on hover */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.35)',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 2,
                }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'rgba(212,168,83,0.2)',
                        border: '2px solid #D4A853',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(6px)',
                        transform: hovered ? 'scale(1)' : 'scale(0.6)',
                        transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    }}>
                        <ZoomIn size={22} color="#D4A853" />
                    </div>
                </div>
            </div>

            {/* Caption */}
            {item.caption && (
                <div style={{
                    padding: '12px 16px',
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '0.95rem',
                    color: '#FFF8F0',
                    borderTop: '1px solid rgba(212,168,83,0.1)',
                    background: 'linear-gradient(180deg, #1A1007 0%, #0F0A07 100%)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {item.caption}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxItem, setLightboxItem] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        galleryApi.getAll().then(res => {
            setItems(res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }).finally(() => setLoading(false));
    }, []);

    // Use top 5 images for the slider (prefer images over videos if possible)
    const sliderItems = items.filter(i => i.type === 'image').slice(0, 5);
    const fallbackSlider = sliderItems.length ? sliderItems : items.slice(0, 5);

    return (
        <div style={{ paddingTop: 100, paddingBottom: 80, minHeight: '100vh' }}>
            <div className="container">

                {/* Page Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                        color: '#FFF8F0',
                        marginBottom: 14,
                    }}>
                        Our <span style={{ color: '#D4A853' }}>Gallery</span>
                    </h1>
                    <span className="gold-divider" />
                    <p style={{ color: '#9A8A7A', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto' }}>
                        Experience the ambiance, the culinary artistry, and the unforgettable moments captured at Hotel Dawat On Plate.
                    </p>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* ── Hero Slider ── */}
                        {fallbackSlider.length > 0 && (
                            <HeroSlider slides={fallbackSlider} />
                        )}

                        {/* ── Grid ── */}
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9A8A7A' }}>
                                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 16, color: '#D4A853' }} />
                                <h2>No media found</h2>
                                <p>We are currently updating our gallery. Please check back later.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <span style={{ height: 2, flex: 1, background: 'rgba(212,168,83,0.15)', borderRadius: 2 }} />
                                    <span style={{ color: '#D4A853', fontFamily: 'Playfair Display, serif', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                        All Moments · {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                    <span style={{ height: 2, flex: 1, background: 'rgba(212,168,83,0.15)', borderRadius: 2 }} />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 24,
                                }}>
                                    {items.map(item => (
                                        <GalleryCard key={item.id} item={item} onClick={setLightboxItem} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox */}
            {lightboxItem && (
                <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
            )}
        </div>
    );
}
