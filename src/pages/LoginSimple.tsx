import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSimple.css';
import { LOGOS } from '../utils/logoCache';
import { useSecurity } from '../components/SecurityProvider';

interface TestAccount {
  email: string;
  password: string;
  code: string;
  role: string;
}

const testAccounts: TestAccount[] = [
  { email: 'ethan@ols.com', password: 'ethan123', code: '1234', role: 'super_admin' },
  { email: 'bastien@ols.com', password: 'bastien123', code: '5678', role: 'super_admin' },
  { email: 'issam@ols.com', password: 'issam123', code: '9012', role: 'super_admin' },
  { email: 'admin', password: 'admin123', code: '0000', role: 'super_admin' },
  { email: 'trinity@ols.com', password: 'trinity123', code: '4321', role: 'student' }
];

const LoginSimple: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSecurity();
  
  const [step, setStep] = useState<'credentials' | 'security'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tempAccount, setTempAccount] = useState<TestAccount | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const account = testAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase().trim() && acc.password === password
    );
    if (account) {
      setTempAccount(account);
      setStep('security');
    } else {
      setError('Identifiants incorrects');
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tempAccount) {
      setError('Erreur de session');
      return;
    }
    if (securityCode === tempAccount.code) {
      const userId = tempAccount.email.toLowerCase().trim();
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', userId);
      localStorage.setItem('currentUserRole', tempAccount.role);
      console.log('Connexion reussie:', userId, 'Role:', tempAccount.role);
      await login(userId);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/home', { replace: true });
    } else {
      setError('Code de securite incorrect');
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setSecurityCode('');
    setError('');
  };

  return (
    <>
      <div className="login-bg-canvas">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      <div className="login-simple-container">
        <div className={'login-side-panel gpu-accelerated ' + (step === 'security' ? 'slide-right' : '')}>
          <img src={LOGOS.main} alt="Odin La Science" className="login-logo" />
          <h1 className="login-side-title">Odin La Science</h1>
          <p className="login-side-subtitle">Votre plateforme scientifique tout-en-un</p>
        </div>
        <div className="login-form-side">
          <div className="login-form-wrapper">
            <div className="login-step-indicator">
              <div className={'login-step-dot ' + (step === 'credentials' ? 'active' : '')}></div>
              <div className={'login-step-dot ' + (step === 'security' ? 'active' : '')}></div>
            </div>
            {step === 'credentials' && (
              <div className="login-step-transition-enter">
                <h2 className="login-form-title"><span>Bienvenue</span></h2>
                <p className="login-form-subtitle">Connectez-vous</p>
                <form onSubmit={handleCredentialsSubmit} className="login-form">
                  <div className="login-form-group">
                    <label htmlFor="email" className="login-label">Email</label>
                    <input type="text" id="email" className="login-input" placeholder="email@ols.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                  </div>
                  <div className="login-form-group">
                    <label htmlFor="password" className="login-label">Mot de passe</label>
                    <input type={showPassword ? 'text' : 'password'} id="password" className="login-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {error && <div className="login-error">{error}</div>}
                  <div className="login-form-group">
                    <button type="submit" className="login-btn">Continuer</button>
                  </div>
                </form>
              </div>
            )}
            {step === 'security' && (
              <div className="login-step-transition-enter">
                <h2 className="login-form-title"><span>Verification</span></h2>
                <p className="login-form-subtitle">Code de securite</p>
                <form onSubmit={handleSecuritySubmit} className="login-form">
                  <div className="login-form-group">
                    <label htmlFor="securityCode" className="login-label">Code</label>
                    <input type="text" id="securityCode" className="login-input login-input-code" placeholder="0000" value={securityCode} onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} required autoFocus />
                    <p className="login-code-helper">1234 (Ethan), 5678 (Bastien), 9012 (Issam), 0000 (Admin)</p>
                  </div>
                  {error && <div className="login-error">{error}</div>}
                  <div className="login-form-group">
                    <button type="submit" className="login-btn">Se connecter</button>
                  </div>
                  <div className="login-form-group">
                    <button type="button" className="login-btn login-btn-secondary" onClick={handleBackToCredentials}>Retour</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSimple;
