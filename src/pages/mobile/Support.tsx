import React, { useState } from 'react';
import MobilePageLayout from '../../components/MobilePageLayout';
import {
    MessageCircle, Mail, Phone, Book, Video, HelpCircle,
    Send, CheckCircle
} from 'lucide-react';

const MobileSupport = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const supportOptions = [
        {
            icon: <MessageCircle size={24} />,
            title: 'Chat en direct',
            description: 'Réponse immédiate',
            color: '#10b981',
            action: 'Démarrer le chat'
        },
        {
            icon: <Mail size={24} />,
            title: 'Email',
            description: 'support@odin-science.com',
            color: '#3b82f6',
            action: 'Envoyer un email'
        },
        {
            icon: <Phone size={24} />,
            title: 'Téléphone',
            description: '+33 1 23 45 67 89',
            color: '#8b5cf6',
            action: 'Appeler'
        },
        {
            icon: <Book size={24} />,
            title: 'Documentation',
            description: 'Guides et tutoriels',
            color: '#f59e0b',
            action: 'Consulter'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    return (
        <MobilePageLayout title="Support">
            {/* Hero */}
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Comment pouvons-nous vous aider ?
                </h2>
                <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    Notre équipe est là pour vous
                </p>
            </div>

            {/* Support Options */}
            <div style={{ padding: '0 1.5rem 2rem' }}>
                {supportOptions.map((option, i) => (
                    <div
                        key={i}
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '0.75rem',
                            background: `${option.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {React.cloneElement(option.icon, { color: option.color })}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {option.title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                {option.description}
                            </p>
                        </div>
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                background: `${option.color}20`,
                                border: `1px solid ${option.color}40`,
                                borderRadius: '0.5rem',
                                color: option.color,
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {option.action}
                        </button>
                    </div>
                ))}
            </div>

            {/* Contact Form */}
            <div style={{
                padding: '2rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    Envoyez-nous un message
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Votre email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Sujet"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={{
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                        required
                    />
                    <textarea
                        placeholder="Votre message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        style={{
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#f8fafc',
                            fontSize: '1rem',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                        required
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Send size={20} />
                        Envoyer
                    </button>
                </form>
            </div>

            {/* FAQ Quick Links */}
            <div style={{ padding: '2rem 1.5rem' }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    marginBottom: '1rem'
                }}>
                    Questions fréquentes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Comment démarrer ?', 'Gérer mon abonnement', 'Exporter mes données', 'Sécurité des données'].map((q, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            <HelpCircle size={20} color="#3b82f6" />
                            <span style={{ fontSize: '0.95rem' }}>{q}</span>
                        </div>
                    ))}
                </div>
            </div>
        </MobilePageLayout>
    );
};

export default MobileSupport;
