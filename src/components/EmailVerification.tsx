import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { TwoFactorAuth } from '../utils/securityEnhancements';
import { useTheme } from './ThemeContext';

interface EmailVerificationProps {
    email: string;
    onVerified: () => void;
    onCancel?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onVerified, onCancel }) => {
    const { theme } = useTheme();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const c = theme.colors;

    useEffect(() => {
        // Envoyer le code initial
        sendVerificationCode();
    }, []);

    useEffect(() => {
        // Timer pour l'expiration du code
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    useEffect(() => {
        // Cooldown pour le renvoi
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const sendVerificationCode = async () => {
        try {
            await TwoFactorAuth.generateAndSendCode(email);
            setResendCooldown(60); // 60 secondes avant de pouvoir renvoyer
            setTimeLeft(300); // Reset timer
            setError('');
        } catch (err) {
            setError('Erreur lors de l\'envoi du code');
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Seulement des chiffres

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Prendre seulement le dernier caractère
        setCode(newCode);
        setError('');

        // Auto-focus sur le champ suivant
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Vérifier automatiquement si tous les champs sont remplis
        if (newCode.every(digit => digit !== '') && index === 5) {
            verifyCode(newCode.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);

        // Focus sur le dernier champ rempli
        const lastFilledIndex = newCode.findIndex(digit => digit === '');
        if (lastFilledIndex !== -1) {
            inputRefs.current[lastFilledIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
            verifyCode(newCode.join(''));
        }
    };

    const verifyCode = async (codeString: string) => {
        setLoading(true);
        setError('');

        try {
            const isValid = TwoFactorAuth.verifyCode(email, codeString);
            
            if (isValid) {
                setSuccess(true);
                setTimeout(() => {
                    onVerified();
                }, 1000);
            } else {
                setError('Code incorrect ou expiré');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError('Erreur lors de la vérification');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (resendCooldown === 0) {
            sendVerificationCode();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: c.cardBg,
            borderRadius: '1rem',
            border: `1px solid ${c.borderColor}`,
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            {/* Icône */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${c.accentPrimary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                <Mail size={40} color={c.accentPrimary} />
            </div>

            {/* Titre */}
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: c.textPrimary,
                textAlign: 'center'
            }}>
                Vérification par email
            </h2>

            {/* Description */}
            <p style={{
                fontSize: '0.9rem',
                color: c.textSecondary,
                textAlign: 'center',
                marginBottom: '2rem',
                maxWidth: '400px'
            }}>
                Un code de vérification à 6 chiffres a été envoyé à<br />
                <strong style={{ color: c.textPrimary }}>{email}</strong>
            </p>

            {/* Champs de code */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem'
            }} onPaste={handlePaste}>
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={loading || success}
                        style={{
                            width: '50px',
                            height: '60px',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            border: `2px solid ${success ? '#10b981' : error ? '#ef4444' : digit ? c.accentPrimary : c.borderColor}`,
                            borderRadius: '0.75rem',
                            background: success ? 'rgba(16, 185, 129, 0.1)' : c.bgSecondary,
                            color: c.textPrimary,
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: loading || success ? 'not-allowed' : 'text'
                        }}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {/* Messages d'erreur/succès */}
            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#10b981',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    <CheckCircle size={18} />
                    Code vérifié avec succès !
                </div>
            )}

            {/* Timer */}
            <div style={{
                fontSize: '0.85rem',
                color: timeLeft < 60 ? '#ef4444' : c.textSecondary,
                marginBottom: '1rem',
                fontWeight: 600
            }}>
                ⏱️ Code valide pendant: {formatTime(timeLeft)}
            </div>

            {/* Bouton renvoyer */}
            <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading || success}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: resendCooldown > 0 ? c.bgSecondary : 'transparent',
                    border: `1px solid ${c.borderColor}`,
                    borderRadius: '0.5rem',
                    color: resendCooldown > 0 ? c.textSecondary : c.accentPrimary,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: resendCooldown > 0 || loading || success ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1rem'
                }}
            >
                <RefreshCw size={16} />
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
            </button>

            {/* Bouton annuler */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    disabled={loading || success}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        color: c.textSecondary,
                        fontSize: '0.85rem',
                        cursor: loading || success ? 'not-allowed' : 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Annuler
                </button>
            )}
        </div>
    );
};

export default EmailVerification;
