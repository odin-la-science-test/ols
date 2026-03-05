import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import {
  hashPassword,
  SecureStorage,
  MFAManager,
  AuditLedger
} from '../utils/encryption';
import { useSecurity } from '../components/SecurityProvider';
import { LOGOS } from '../utils/logoCache';
import './DesktopLogin.css';

const DesktopLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useSecurity();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mfaNeeded, setMfaNeeded] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [expectedMfaCode, setExpectedMfaCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const userProfile = await SecureStorage.getItem(`user_profile_${normalizedEmail}`);

      if (userProfile) {
        const hashedInputPassword = await hashPassword(password);

        if (userProfile.password === hashedInputPassword) {
          if (!mfaNeeded) {
            const secret = userProfile.mfaSecret || await MFAManager.generateSecret();
            if (!userProfile.mfaSecret) {
              userProfile.mfaSecret = secret;
              await SecureStorage.setItem(`user_profile_${normalizedEmail}`, userProfile);
            }

            setMfaSecret(secret);
            setMfaNeeded(true);
            const expected = (await hashPassword(secret)).slice(0, 6).toUpperCase();
            setExpectedMfaCode(expected);
            setIsLoading(false);
            return;
          }

          // Verify MFA
          const currentSecret = mfaSecret || userProfile.mfaSecret;
          const isMfaValid = await MFAManager.verifyCode(currentSecret, mfaCode);

          if (isMfaValid) {
            await AuditLedger.log('auth_success_desktop', { identifier: normalizedEmail });
            localStorage.setItem('currentUser', normalizedEmail);
            localStorage.setItem('currentUserRole', userProfile.role || 'user');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('fromDesktopLogin', 'true');
            await login(normalizedEmail);
            showToast('✅ Connexion réussie!', 'success');
            navigate('/desktop-home');
          } else {
            await AuditLedger.log('auth_failure_desktop', { reason: 'invalid_mfa', identifier: normalizedEmail });
            showToast('❌ Code MFA invalide', 'error');
          }
        } else {
          showToast('❌ Identifiants incorrects', 'error');
        }
      } else {
        showToast('❌ Utilisateur non trouvé', 'error');
      }
    } catch (error) {
      console.error('Desktop Login Error:', error);
      showToast('❌ Erreur technique lors de la connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="desktop-login">
      <div className="desktop-login-container">
        <div className="desktop-login-header">
          <img src={LOGOS.main} alt="Odin La Science" className="desktop-login-logo" />
          <h1>Odin La Science</h1>
          <p>Application Desktop</p>
        </div>

        <form onSubmit={handleLogin} className="desktop-login-form">
          <div className="desktop-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
            />
          </div>

          <div className="desktop-form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="desktop-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="desktop-login-footer">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="desktop-link-btn"
            >
              Créer un compte
            </button>
          </div>
        </form>

        <div className="desktop-login-info">
          <p>Version Desktop 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default DesktopLogin;
