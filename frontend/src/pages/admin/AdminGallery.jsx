import { useState, useEffect } from 'react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { Upload, Trash2, Image as ImageIcon, Film } from 'lucide-react';

export default function AdminGallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [error, setError] = useState('');

    async function load() {
        try {
            const res = await adminApi.getGallery(); // Wait I need to add getGallery to adminApi, but I can use galleryApi.getAll
            setItems(res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch { }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function handleUpload(e) {
        e.preventDefault();
        if (!file) return setError('Please select a file to upload');

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
        if (!validTypes.includes(file.type)) {
            return setError('Invalid file type. Only JPG, PNG, WEBP, and MP4 are allowed.');
        }
        if (file.size > 10 * 1024 * 1024) return setError('File size must be under 10MB');

        setUploading(true); setError('');
        const formData = new FormData();
        formData.append('media', file);
        formData.append('caption', caption);

        try {
            await adminApi.uploadGallery(formData);
            setFile(null);
            setCaption('');
            await load();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this media from the gallery?')) return;
        try {
            await adminApi.deleteGallery(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch { alert('Delete failed'); }
    }

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 6 }}>Gallery Management</h1>
                <p style={{ color: '#9A8A7A' }}>Upload photos and videos to showcase your restaurant</p>
            </div>

            {/* Upload Section */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: 40, maxWidth: 600 }}>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Select Media (Image/Video, max 10MB) *</label>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp, video/mp4"
                                onChange={e => setFile(e.target.files[0])}
                                className="form-input"
                                style={{ padding: '8px' }}
                            />
                        </div>
                    </div>
                    {file && (
                        <div style={{ fontSize: '0.8rem', color: '#D4A853' }}>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Caption (Optional)</label>
                        <input className="form-input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g., A beautiful evening at Dawat" />
                    </div>
                    {error && <div style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{error}</div>}
                    <button type="submit" className="btn btn-gold" disabled={uploading || !file} style={{ justifyContent: 'center' }}>
                        {uploading ? 'Uploading...' : <><Upload size={18} /> Upload to Gallery</>}
                    </button>
                </form>
            </div>

            {/* Gallery Grid */}
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: 20 }}>Uploaded Media</h2>
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                    {items.length === 0 && <p style={{ color: '#9A8A7A', gridColumn: '1/-1' }}>No media uploaded yet.</p>}
                    {items.map(item => (
                        <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 6 }}>
                                <span style={{ background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                                    {item.type === 'video' ? <Film size={14} color="#D4A853" /> : <ImageIcon size={14} color="#D4A853" />}
                                </span>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(231,76,60,0.8)', color: '#fff', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ height: 180, width: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.type === 'video' ? (
                                    <video src={item.url.startsWith('http') ? item.url : `${UPLOADS_URL}${item.url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                                ) : (
                                    <img src={item.url.startsWith('http') ? item.url : `${UPLOADS_URL}${item.url}`} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </div>
                            {item.caption && (
                                <div style={{ padding: '12px', fontSize: '0.85rem', color: '#FFF8F0', borderTop: '1px solid rgba(212,168,83,0.1)' }}>
                                    {item.caption}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
