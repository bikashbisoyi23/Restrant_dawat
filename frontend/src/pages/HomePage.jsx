import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Users, Clock, Award, Flame, Calendar, Image as ImageIcon } from 'lucide-react';
import { menuApi, offersApi, reviewsApi, UPLOADS_URL } from '../services/api';
import { DEFAULT_IMAGES } from '../utils/defaultImages';
import { ITEM_IMAGES } from '../utils/itemImages';

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [offers, setOffers] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        menuApi.getFeatured().then(r => setFeatured(r.data.data)).catch(() => { });
        offersApi.getPublic().then(r => setOffers(r.data.data)).catch(() => { });
        reviewsApi.getAll().then(r => setReviews(r.data.data)).catch(() => { });
    }, []);

    const categoryEmojis = { starters: '🥗', mains: '🍛', breads: '🫓', desserts: '🍮', beverages: '🥤' };

    return (
        <div>
            {/* HERO */}
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

                <video
                    autoPlay loop muted playsInline
                    src="/hero_bg.mp4"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.8 }}
                />

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)', zIndex: 1 }} />

                {/* Decorative circles */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: `1px solid rgba(212,168,83,${0.05 + i * 0.03})`, width: 300 + i * 200, height: 300 + i * 200, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }} />
                ))}

                <div style={{ position: 'relative', textAlign: 'center', padding: '160px 24px 100px', maxWidth: 900, margin: '0 auto', zIndex: 2 }}>

                    <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.4)', color: '#FFF', fontSize: '0.75rem', fontWeight: 600, padding: '6px 16px', borderRadius: 30, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32, backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        Luxurious Dining & Ambience
                    </div>

                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontFamily: 'Playfair Display, serif', color: '#FFFFFF', marginBottom: 20, lineHeight: 1.05, textShadow: '0 8px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)' }}>
                        Experience <br />
                        <span style={{ color: '#D4A853', fontStyle: 'italic', textShadow: '0 4px 20px rgba(212,168,83,0.4)' }}>Elegance</span>
                    </h1>

                    <p style={{ color: '#FFFFFF', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', lineHeight: 1.6, maxWidth: 650, margin: '0 auto 48px', textShadow: '0 4px 15px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)', fontWeight: 400, letterSpacing: '0.02em' }}>
                        Step into a world of breathtaking ambience and authentic culinary mastery. Hotel Dawat On Plate is your destination for unforgettable family memories.
                    </p>

                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/book" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', boxShadow: '0 8px 30px rgba(107,31,42,0.8)', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                            Reserve a Table <ChevronRight size={20} />
                        </Link>
                        <Link to="/gallery" className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '1.05rem', borderColor: 'rgba(255,255,255,0.8)', color: '#FFF', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                            View Gallery
                        </Link>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginTop: 60, paddingTop: 40, borderTop: '1px solid rgba(212,168,83,0.15)' }}>
                        {[['15+', 'Years of Excellence'], ['50+', 'Signature Dishes'], ['4.9★', 'Family Rating'], ['10K+', 'Happy Families']].map(([val, label]) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#D4A853', fontWeight: 700 }}>{val}</div>
                                <div style={{ color: '#9A8A7A', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TODAY'S SPECIAL OFFERS */}
            {offers.length > 0 && (
                <section className="section" style={{ background: 'linear-gradient(135deg, #0F0A07, #1A0C0A)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 50 }}>
                            <span className="badge" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Flame size={14} /> Today's Special</span>
                            <h2 className="section-title">Exclusive <span>Offers</span></h2>
                            <span className="gold-divider" />
                            <p className="section-subtitle">Limited-time deals crafted specially for your family</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            {offers.map(offer => (
                                <div key={offer.id} className="glass-card" style={{ padding: 0, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                                    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                                        <span className="badge" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)', background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>{offer.badge}</span>
                                    </div>

                                    <div style={{ height: 220, position: 'relative', overflow: 'hidden', background: '#000' }}>
                                        <img
                                            src={offer.image_url && offer.image_url.startsWith('http') ? offer.image_url : `${UPLOADS_URL}${offer.image_url}`}
                                            alt={offer.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES.fallback; }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,7,1), transparent)' }} />
                                    </div>

                                    <div style={{ padding: '0 28px 28px', marginTop: -20, position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#FFF8F0', marginBottom: 8 }}>{offer.title}</h3>
                                        <p style={{ color: '#9A8A7A', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>{offer.description}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#D4A853', fontWeight: 700 }}>₹{offer.discounted_price}</span>
                                            {offer.original_price && <span style={{ color: '#9A8A7A', textDecoration: 'line-through', fontSize: '1rem' }}>₹{offer.original_price}</span>}
                                            {offer.original_price && <span style={{ background: 'rgba(39,174,96,0.2)', color: '#2ecc71', padding: '2px 8px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                                                {Math.round((1 - offer.discounted_price / offer.original_price) * 100)}% OFF
                                            </span>}
                                        </div>
                                        <Link to="/book" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Book & Enjoy</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY US */}
            <section className="section" style={{ background: '#0A0705' }}>
                <div className="container">
                    <h2 className="section-title">Why Families <span>Choose Us</span></h2>
                    <span className="gold-divider" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 48 }}>
                        {[
                            { icon: Award, title: 'Authentic Recipes', desc: 'Traditional recipes passed down for generations, made with love and the finest ingredients.' },
                            { icon: Users, title: 'Family-Friendly', desc: 'Spacious seating, kids-friendly menu options, and a warm, welcoming environment for all ages.' },
                            { icon: Clock, title: 'Open 7 Days', desc: 'Lunch & dinner service every day of the week, with late-night slots on weekends.' },
                            { icon: Star, title: 'Top Rated', desc: '4.9-star rating from thousands of delighted families across the city.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                                <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, rgba(107,31,42,0.5), rgba(212,168,83,0.2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(212,168,83,0.3)' }}>
                                    <Icon size={26} color="#D4A853" />
                                </div>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', marginBottom: 10 }}>{title}</h3>
                                <p style={{ color: '#9A8A7A', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED MENU */}
            <section className="section" style={{ background: '#0F0A07' }}>
                <div className="container">
                    <h2 className="section-title">Signature <span>Dishes</span></h2>
                    <span className="gold-divider" />
                    <p className="section-subtitle">Our most beloved creations, crafted with passion</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, marginTop: 48 }}>
                        {featured.slice(0, 8).map(item => (
                            <div key={item.id} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
                                <div style={{ height: 160, width: '100%', background: 'rgba(212,168,83,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.image_url ? (
                                        <img src={item.image_url.startsWith('http') ? item.image_url : `${UPLOADS_URL}${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={(e) => { e.currentTarget.src = ITEM_IMAGES[item.name] || DEFAULT_IMAGES[item.category] || DEFAULT_IMAGES.fallback; }} />
                                    ) : (
                                        <img src={ITEM_IMAGES[item.name] || DEFAULT_IMAGES[item.category] || DEFAULT_IMAGES.fallback} alt="Featured Meal" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} loading="lazy" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGES[item.category] || DEFAULT_IMAGES.fallback; }} />
                                    )}
                                    <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(15,10,7,0.85)', color: '#D4A853', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                                        {item.category}
                                    </span>
                                </div>
                                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', marginBottom: 4 }}>{item.name}</h3>
                                    <p style={{ color: '#9A8A7A', fontSize: '0.85rem', lineHeight: 1.6, marginTop: 4, flex: 1 }}>{item.description}</p>
                                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(212,168,83,0.1)', paddingTop: 16 }}>
                                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#D4A853', fontWeight: 700 }}>₹{item.price}</span>
                                        <Link to="/book" className="btn btn-primary btn-sm">Book</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/menu" className="btn btn-outline">View Full Menu <ChevronRight size={18} /></Link>
                    </div>
                </div>
            </section>

            {/* CUSTOMER REVIEWS */}
            {reviews.length > 0 && (
                <section className="section" style={{ background: '#1A0C0A' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 className="section-title">What Families <span>Say</span></h2>
                            <span className="gold-divider" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            {reviews.slice(0, 6).map(review => (
                                <div key={review.id} className="glass-card" style={{ padding: 32, position: 'relative' }}>
                                    <Quote size={40} color="rgba(212,168,83,0.1)" style={{ position: 'absolute', top: 20, right: 20 }} />
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill={review.rating >= star ? '#D4A853' : 'transparent'} color={review.rating >= star ? '#D4A853' : '#9A8A7A'} />)}
                                    </div>
                                    <p style={{ color: '#FFF8F0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>"{review.comment}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(212,168,83,0.1)', paddingTop: 16 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6B1F2A, #D4A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                                            {review.customer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>{review.customer_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9A8A7A' }}>Verified Diner</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA BANNER */}
            <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #6B1F2A, #3D0F15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(212,168,83,0.15), transparent 70%)' }} />
                <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFF8F0', marginBottom: 16 }}>
                        Ready for an Unforgettable Family Dinner?
                    </h2>
                    <p style={{ color: 'rgba(255,248,240,0.7)', marginBottom: 32, fontSize: '1.1rem' }}>
                        Reserve your table online in seconds. Special arrangements available for birthdays & anniversaries.
                    </p>
                    <Link to="/book" className="btn btn-gold" style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
                        Book Your Table Now <ChevronRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
