import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { UtensilsCrossed, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [show, setShow] = useState(false);

    if (localStorage.getItem('adminToken')) {
        navigate('/admin/dashboard', { replace: true });
        return null;
    }

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await adminApi.login(form);
            localStorage.setItem('adminToken', res.data.token);
            navigate('/admin/dashboard');
        } catch {
            setError('Invalid username or password');
        } finally { setLoading(false); }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #1A0C0A, #0F0A07)', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6B1F2A, #D4A853)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <UtensilsCrossed size={30} color="#fff" />
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#FFF8F0' }}>Hotel Dawat</h1>
                    <p style={{ color: '#D4A853', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin Panel</p>
                </div>

                <div className="glass-card" style={{ padding: '40px' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: 28, textAlign: 'center' }}>
                        <Lock size={18} style={{ display: 'inline', marginRight: 8, color: '#D4A853', verticalAlign: 'middle' }} />
                        Sign In
                    </h2>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} color="#9A8A7A" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="form-input" placeholder="admin" value={form.username}
                                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={{ paddingLeft: 40 }} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} color="#9A8A7A" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="form-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    style={{ paddingLeft: 40, paddingRight: 40 }} required />
                                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A' }}>
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {error && <div style={{ color: '#e74c3c', fontSize: '0.88rem', textAlign: 'center' }}>{error}</div>}
                        <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                            {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
                        </button>
                    </form>
                    <p style={{ color: '#9A8A7A', fontSize: '0.8rem', textAlign: 'center', marginTop: 20 }}>
                        Default: admin / dawat@2024
                    </p>
                </div>
            </div>
        </div>
    );
}
