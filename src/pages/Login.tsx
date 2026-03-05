import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { hashPassword, SecureStorage } from '../utils/encryption';
import { LOGOS } from '../utils/logoCache';

function Login() {
    const navigate = useNavigate();
    const { loadThemeForUser } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const normalizedEmail = email.toLowerCase().trim();
            const userProfile = await SecureStorage.getItem(`user_profile_${normalizedEmail}`);
            
            if (userProfile) {
                const hashedInputPassword = await hashPassword(password);
                console.log('Checking login for:', normalizedEmail);

                if (userProfile.password === hashedInputPassword) {
                    console.log('Password match! Login successful (AES-256)');
                    
                    const user = {
                        email: normalizedEmail,
                        role: userProfile.role || 'user',
                        name: userProfile.firstName || userProfile.username || 'User',
                        firstName: userProfile.firstName || 'User',
                        lastName: userProfile.lastName || 'User'
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUserRole', userProfile.role || 'user');
                    localStorage.setItem('loginTime', Date.now().toString());
                    
                    loadThemeForUser(normalizedEmail);
                    navigate('/home');
                    return;
                } else {
                    setError('Email ou mot de passe incorrect.');
                }
            } else {
                setError('Email ou mot de passe incorrect.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                <img src={LOGOS.main} alt="Logo" style={{ width: '180px', marginBottom: '2rem', filter: 'brightness(0) invert(1)' }} />
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Odin La Science</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', textAlign: 'center', maxWidth: '400px' }}>Plateforme scientifique complète</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 2rem' }}>
                <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={28} color="#667eea" />
                        Connexion sécurisée
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.85rem' }}>🔒 Chiffrement AES-256</p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email</label>
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre.email@ols.com" required style={{ width: '100%', padding: '1rem', border: '2px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '1rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '1rem', paddingRight: '3rem', border: '2px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '1rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Première visite ?{' '}
                                <button type="button" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                                    Créer un compte
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
