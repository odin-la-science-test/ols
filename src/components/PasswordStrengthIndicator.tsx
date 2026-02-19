import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
    password: string;
    strength: { score: number; feedback: string[] };
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password, strength }) => {
    if (!password) return null;

    const getStrengthColor = (score: number) => {
        if (score <= 1) return '#ef4444'; // Rouge
        if (score === 2) return '#f59e0b'; // Orange
        if (score === 3) return '#eab308'; // Jaune
        if (score === 4) return '#22c55e'; // Vert clair
        return '#10b981'; // Vert foncé
    };

    const getStrengthLabel = (score: number) => {
        if (score <= 1) return 'Très faible';
        if (score === 2) return 'Faible';
        if (score === 3) return 'Moyen';
        if (score === 4) return 'Fort';
        return 'Très fort';
    };

    const getStrengthIcon = (score: number) => {
        if (score <= 1) return <ShieldX size={16} />;
        if (score === 2) return <ShieldAlert size={16} />;
        if (score === 3) return <Shield size={16} />;
        return <ShieldCheck size={16} />;
    };

    const color = getStrengthColor(strength.score);
    const label = getStrengthLabel(strength.score);
    const icon = getStrengthIcon(strength.score);

    return (
        <div style={{ marginTop: '0.75rem' }}>
            {/* Barre de progression */}
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                marginBottom: '0.5rem'
            }}>
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: level <= strength.score ? color : 'rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>

            {/* Label et icône */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: color,
                fontWeight: 600
            }}>
                {icon}
                <span>Force du mot de passe : {label}</span>
            </div>

            {/* Feedback */}
            {strength.feedback.length > 0 && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${color}33`
                }}>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.25rem',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: 1.6
                    }}>
                        {strength.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Critères de sécurité */}
            <div style={{
                marginTop: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                fontSize: '0.75rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: password.length >= 8 ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                }}>
                    <span>{password.length >= 8 ? '✓' : '○'}</span>
                    <span>8+ caractères</span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: /[A-Z]/.test(password) ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                }}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                    <span>Majuscule</span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: /[a-z]/.test(password) ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                }}>
                    <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                    <span>Minuscule</span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: /[0-9]/.test(password) ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                }}>
                    <span>{/[0-9]/.test(password) ? '✓' : '○'}</span>
                    <span>Chiffre</span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: /[^A-Za-z0-9]/.test(password) ? '#10b981' : 'rgba(255, 255, 255, 0.4)'
                }}>
                    <span>{/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}</span>
                    <span>Caractère spécial</span>
                </div>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
