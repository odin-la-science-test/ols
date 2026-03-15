import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { useToast } from '../components/ToastContext';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { 
    checkPasswordStrength, 
    isValidEmail, 
    hashPassword,
    SessionManager,
    RateLimiter
} from '../utils/encryption';
import { InputValidator, AnomalyDetector } from '../utils/securityEnhancements';
import { SecurityLogger } from '../utils/securityConfig';
import LegalModal from '../components/LegalModal';
import {
    Users, Building2, ChevronRight, CheckCircle,
    ShieldCheck, ArrowLeft, Eye, EyeOff, AlertCircle, Mail, Lock,
    Briefcase, GraduationCap, Building
} from 'lucide-react';

// Types de compte à l'inscription
type RegistrationAccountType = 'director' | 'personal' | 'public_institution';

// Prix de base par compte
const BASE_ACCOUNT_PRICE = 2600; // Prix mensuel de base pour le pack complet

// Remise selon le type de compte
const ACCOUNT_TYPE_DISCOUNTS: Record<RegistrationAccountType, number> = {
    director: 0,           // Pas de remise
    personal: 0,           // Pas de remise
    public_institution: 0.30, // -30% automatique
};

// Labels pour l'affichage
const ACCOUNT_TYPE_LABELS: Record<RegistrationAccountType, string> = {
    director: 'Directeur',
    personal: 'Personnel',
    public_institution: 'Institut/Laboratoire Public',
};

// Descriptions
const ACCOUNT_TYPE_DESCRIPTIONS: Record<RegistrationAccountType, string> = {
    director: 'Gestion complète avec possibilité de créer plusieurs comptes',
    personal: 'Compte individuel pour usage personnel',
    public_institution: 'Pour les institutions publiques (remise de 30%)',
};

const ANNUAL_DISCOUNT = 0.20; // 20% de remise sur l'annuel

const Register = () => {
    const navigate = useNavigate();
    const { theme, loadThemeForUser } = useTheme();
    const { showToast } = useToast();
    const { isMobile } = useDeviceDetection();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const registrationLimiter = new RateLimiter(3, 60 * 60 * 1000);

    const [formData, setFormData] = useState({
        // Étape 1: Type de compte
        accountType: 'director' as RegistrationAccountType,
        
        // Étape 2: Informations personnelles
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        
        // Informations organisation (optionnel pour personal)
        organizationName: '',
        
        // Étape 3: Facturation
        billingCycle: 'monthly' as 'monthly' | 'annual',
        
        // Étape 4: Paiement
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        
        // Conditions
        acceptTerms: false,
        acceptPrivacy: false
    });

    const c = theme.colors;
    const ds = theme.designSystem;

    const calculatePrice = () => {
        const discount = ACCOUNT_TYPE_DISCOUNTS[formData.accountType];
        const priceAfterDiscount = BASE_ACCOUNT_PRICE * (1 - discount);
        
        let finalPrice = priceAfterDiscount;
        if (formData.billingCycle === 'annual') {
            finalPrice = priceAfterDiscount * 12 * (1 - ANNUAL_DISCOUNT);
        }

        return {
            basePrice: BASE_ACCOUNT_PRICE,
            discount: discount * 100,
            discountAmount: BASE_ACCOUNT_PRICE * discount,
            priceAfterDiscount: Math.round(priceAfterDiscount),
            finalPrice: Math.round(finalPrice),
            monthlyEquivalent: formData.billingCycle === 'annual' ? Math.round(finalPrice / 12) : Math.round(priceAfterDiscount)
        };
    };

    const cost = calculatePrice();

    const nextStep = () => {
        // Validation avant de passer à l'étape suivante
        if (step === 2) {
            // Valider l'email
            if (!isValidEmail(formData.email)) {
                setEmailError('Email invalide');
                showToast('Veuillez entrer un email valide', 'error');
                return;
            }
            setEmailError('');

            // Valider le mot de passe
            if (passwordStrength.score < 4) {
                setPasswordError('Mot de passe trop faible');
                showToast('Veuillez choisir un mot de passe plus fort', 'error');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setPasswordError('Les mots de passe ne correspondent pas');
                showToast('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            setPasswordError('');
        }

        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    // Validation en temps réel du mot de passe
    const handlePasswordChange = (password: string) => {
        setFormData({ ...formData, password });
        const strength = checkPasswordStrength(password);
        setPasswordStrength(strength);
    };

    // Validation en temps réel de l'email
    const handleEmailChange = (email: string) => {
        setFormData({ ...formData, email });
        
        const validation = InputValidator.validateInput(email, 'email');
        if (email && !validation.valid) {
            setEmailError(validation.errors.join(', '));
        } else if (email && !isValidEmail(email)) {
            setEmailError('Format d\'email invalide');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Vérifier le rate limiting
        if (!registrationLimiter.checkLimit(formData.email)) {
            showToast('Trop de tentatives. Veuillez réessayer plus tard.', 'error');
            SecurityLogger.log('registration_rate_limit', formData.email);
            return;
        }

        // Validation de sécurité des entrées
        const emailValidation = InputValidator.validateInput(formData.email, 'email');
        if (!emailValidation.valid) {
            showToast('Email invalide: ' + emailValidation.errors.join(', '), 'error');
            return;
        }

        const passwordValidation = InputValidator.validateInput(formData.password, 'text');
        if (!passwordValidation.valid) {
            showToast('Mot de passe invalide: ' + passwordValidation.errors.join(', '), 'error');
            SecurityLogger.log('registration_injection_attempt', formData.email, { errors: passwordValidation.errors });
            return;
        }

        // Vérifier les conditions
        if (!formData.acceptTerms || !formData.acceptPrivacy) {
            showToast('Veuillez accepter les conditions d\'utilisation', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Hasher le mot de passe
            const hashedPassword = await hashPassword(formData.password);

            // Sanitize user inputs
            const sanitizedData = InputValidator.sanitizeObject({
                firstName: formData.firstName,
                lastName: formData.lastName,
                organizationName: formData.organizationName,
                phone: formData.phone
            });

            // Save Mock Profile
            const userProfile = {
                email: emailValidation.sanitized,
                password: hashedPassword,
                username: emailValidation.sanitized.split('@')[0],
                role: formData.accountType === 'director' ? 'admin' : 'user',
                accountType: formData.accountType,
                ...sanitizedData,
                subscription: {
                    status: 'active',
                    type: 'full',
                    cycle: formData.billingCycle,
                    modules: 'all'
                },
                createdAt: new Date().toISOString()
            };

            localStorage.setItem(`user_profile_${formData.email}`, JSON.stringify(userProfile));
            localStorage.setItem('currentUser', formData.email);
            localStorage.setItem('currentUserRole', userProfile.role);

            // Créer une session sécurisée
            SessionManager.createSession(formData.email);

            // Enregistrer le comportement
            AnomalyDetector.recordBehavior(formData.email, 'registration');
            SecurityLogger.log('registration_success', formData.email);

            showToast('🚀 Inscription réussie ! Bienvenue sur Odin la Science.', 'success');
            loadThemeForUser(formData.email);
            
            setTimeout(() => {
                navigate('/home');
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            SecurityLogger.log('registration_error', formData.email, { error: String(error) });
            showToast('Erreur lors de l\'inscription', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isMobile ? '2rem' : '3rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: isMobile ? '12px' : '16px', left: 0, right: 0, height: '2px', background: c.borderColor, zIndex: 0 }}></div>
            {[1, 2, 3, 4].map(s => (
                <div key={s} style={{
                    width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '50%',
                    background: step >= s ? c.accentPrimary : c.bgSecondary,
                    border: `2px solid ${step >= s ? c.accentPrimary : c.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, position: 'relative',
                    color: step >= s ? '#fff' : c.textSecondary,
                    fontWeight: 700, transition: 'all 0.3s ease',
                    boxShadow: step === s ? `0 0 10px ${c.accentPrimary}66` : 'none',
                    fontSize: isMobile ? '0.8rem' : '1rem'
                }}>
                    {step > s ? <CheckCircle size={isMobile ? 16 : 20} /> : s}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className={isMobile ? "app-viewport" : ""} style={{
                minHeight: '100vh', width: '100vw', background: c.bgPrimary, color: c.textPrimary,
                fontFamily: ds.fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: !isMobile ? '40px 20px' : '0', position: 'relative', overflow: 'hidden'
            }}>
                {/* Background elements */}
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: isMobile ? '200px' : '400px', height: isMobile ? '200px' : '400px', background: `${c.accentPrimary}08`, borderRadius: '50%', filter: 'blur(100px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: isMobile ? '150px' : '300px', height: isMobile ? '150px' : '300px', background: `${c.accentHugin}08`, borderRadius: '50%', filter: 'blur(80px)' }}></div>

                <div className={isMobile ? "app-scrollbox" : ""} style={{
                    width: '100%', maxWidth: isMobile ? 'none' : '900px',
                    background: isMobile ? 'transparent' : c.cardBg,
                    backdropFilter: isMobile ? 'none' : 'blur(20px)',
                    borderRadius: isMobile ? '0' : ds.borderRadius,
                    border: isMobile ? 'none' : `1px solid ${c.borderColor}`,
                    boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'visible', zIndex: 1,
                    paddingBottom: isMobile ? '100px' : '0'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: isMobile ? '40px 20px 20px' : '3rem 2rem',
                        background: isMobile ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'center',
                        borderBottom: isMobile ? 'none' : `1px solid ${c.borderColor}`
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <img src="/logo1.png" alt="Odin" style={{ height: isMobile ? '50px' : '80px', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.2))' }} />
                            <h1 style={{ fontSize: isMobile ? '1.25rem' : '2.25rem', fontWeight: 800, background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Odin la Science
                            </h1>
                        </div>
                    </div>

                    <div style={{ padding: isMobile ? '15px' : '40px' }}>
                        {renderStepIndicator()}

                        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                            {/* STEP 1: TYPE DE COMPTE */}
                            {step === 1 && (
                                <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
                                        Type de compte
                                    </h2>
                                    <p style={{ textAlign: 'center', color: c.textSecondary, marginBottom: '2rem', fontSize: '0.9rem' }}>
                                        Sélectionnez le type de compte qui vous correspond
                                    </p>

                                    {/* Sélection du type de compte */}
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(1, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                        {(['director', 'personal', 'public_institution'] as RegistrationAccountType[]).map(type => {
                                            const Icon = type === 'director' ? Briefcase :
                                                        type === 'personal' ? Users :
                                                        Building;
                                            
                                            return (
                                                <div
                                                    key={type}
                                                    onClick={() => setFormData({ ...formData, accountType: type })}
                                                    className="card-native"
                                                    style={{
                                                        padding: '1.5rem',
                                                        borderRadius: '1rem',
                                                        border: `2px solid ${formData.accountType === type ? c.accentPrimary : 'transparent'}`,
                                                        background: formData.accountType === type ? `${c.accentPrimary}15` : c.bgSecondary,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        boxShadow: formData.accountType === type ? `0 8px 16px ${c.accentPrimary}22` : 'none'
                                                    }}
                                                >
                                                    <div style={{ 
                                                        padding: '1rem', 
                                                        background: 'rgba(255,255,255,0.03)', 
                                                        borderRadius: '0.75rem',
                                                        flexShrink: 0
                                                    }}>
                                                        <Icon size={28} color={formData.accountType === type ? c.accentPrimary : c.textSecondary} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                                            {ACCOUNT_TYPE_LABELS[type]}
                                                        </h3>
                                                        <p style={{ fontSize: '0.85rem', color: c.textSecondary, lineHeight: 1.4, marginBottom: '0.5rem' }}>
                                                            {ACCOUNT_TYPE_DESCRIPTIONS[type]}
                                                        </p>
                                                        {type === 'public_institution' && (
                                                            <div style={{ 
                                                                display: 'inline-block',
                                                                padding: '0.25rem 0.75rem',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700
                                                            }}>
                                                                -30% de remise
                                                            </div>
                                                        )}
                                                    </div>
                                                    {formData.accountType === type && (
                                                        <CheckCircle size={24} color={c.accentPrimary} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Résumé du prix */}
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1.5rem',
                                        background: `${c.accentPrimary}10`,
                                        borderRadius: '1rem',
                                        border: `1px solid ${c.accentPrimary}30`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: c.textSecondary }}>Prix de base</span>
                                            <span style={{ fontWeight: 600 }}>{cost.basePrice}€/mois</span>
                                        </div>
                                        {cost.discount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#10b981' }}>
                                                <span>Remise ({cost.discount}%)</span>
                                                <span style={{ fontWeight: 600 }}>-{cost.discountAmount}€</span>
                                            </div>
                                        )}
                                        <div style={{ 
                                            borderTop: `1px solid ${c.borderColor}`, 
                                            paddingTop: '0.75rem',
                                            marginTop: '0.75rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            color: c.accentPrimary
                                        }}>
                                            <span>Prix mensuel</span>
                                            <span>{cost.priceAfterDiscount}€</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: INFORMATIONS PERSONNELLES */}
                            {step === 2 && (
                                <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Vos informations</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '15px' : '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                Prénom
                                            </label>
                                            <input
                                                type="text" required
                                                placeholder="Jean"
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary, fontSize: '1rem' }}
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                Nom
                                            </label>
                                            <input
                                                type="text" required
                                                placeholder="Dupont"
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary, fontSize: '1rem' }}
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>

                                        {formData.accountType !== 'personal' && (
                                            <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                    {formData.accountType === 'director' ? "Nom de l'organisation" : "Nom de l'institut/laboratoire"}
                                                </label>
                                                <input
                                                    type="text" required
                                                    placeholder={formData.accountType === 'director' ? "ex: BioEcoAgro Lab 42" : "ex: CNRS - Institut Pasteur"}
                                                    style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary, fontSize: '1rem' }}
                                                    value={formData.organizationName}
                                                    onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                Email Professionnel
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="email" required placeholder="contact@lab.com"
                                                    style={{ 
                                                        width: '100%', padding: '16px', borderRadius: '1rem', 
                                                        border: `2px solid ${emailError ? '#ef4444' : c.borderColor}`, 
                                                        background: c.bgSecondary, color: c.textPrimary 
                                                    }}
                                                    value={formData.email}
                                                    onChange={e => handleEmailChange(e.target.value)}
                                                />
                                                {emailError && (
                                                    <div style={{ 
                                                        position: 'absolute', right: '12px', top: '50%', 
                                                        transform: 'translateY(-50%)', color: '#ef4444' 
                                                    }}>
                                                        <AlertCircle size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            {emailError && (
                                                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertCircle size={12} /> {emailError}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                Mot de passe
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'} 
                                                    required 
                                                    placeholder="••••••••"
                                                    style={{ 
                                                        width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '1rem', 
                                                        border: `2px solid ${passwordError ? '#ef4444' : c.borderColor}`, 
                                                        background: c.bgSecondary, color: c.textPrimary 
                                                    }}
                                                    value={formData.password}
                                                    onChange={e => handlePasswordChange(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute', right: '12px', top: '50%',
                                                        transform: 'translateY(-50%)', background: 'none',
                                                        border: 'none', cursor: 'pointer', color: c.textSecondary,
                                                        padding: '4px', display: 'flex', alignItems: 'center'
                                                    }}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {formData.password && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                                        {[1, 2, 3, 4, 5, 6].map(level => (
                                                            <div
                                                                key={level}
                                                                style={{
                                                                    flex: 1,
                                                                    height: '4px',
                                                                    borderRadius: '2px',
                                                                    background: passwordStrength.score >= level
                                                                        ? passwordStrength.score <= 2 ? '#ef4444'
                                                                        : passwordStrength.score <= 4 ? '#f59e0b'
                                                                        : '#10b981'
                                                                        : 'rgba(255,255,255,0.1)',
                                                                    transition: 'all 0.3s'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: c.textSecondary }}>
                                                        Force: {
                                                            passwordStrength.score <= 2 ? '❌ Faible' :
                                                            passwordStrength.score <= 4 ? '⚠️ Moyen' :
                                                            '✅ Fort'
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>
                                                <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                                Confirmer le mot de passe
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    required
                                                    placeholder="••••••••"
                                                    style={{
                                                        width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '1rem',
                                                        border: `2px solid ${formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : c.borderColor}`,
                                                        background: c.bgSecondary, color: c.textPrimary
                                                    }}
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{
                                                        position: 'absolute', right: '12px', top: '50%',
                                                        transform: 'translateY(-50%)', background: 'none',
                                                        border: 'none', cursor: 'pointer', color: c.textSecondary,
                                                        padding: '4px', display: 'flex', alignItems: 'center'
                                                    }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                                    <div style={{
                                                        position: 'absolute', right: '50px', top: '50%',
                                                        transform: 'translateY(-50%)', color: '#10b981'
                                                    }}>
                                                        <CheckCircle size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertCircle size={12} /> Les mots de passe ne correspondent pas
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FACTURATION */}
                            {step === 3 && (
                                <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 800 }}>Cycle de facturation</h2>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                                            className="card-native"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.billingCycle === 'monthly' ? c.accentPrimary : 'transparent'}`,
                                                background: formData.billingCycle === 'monthly' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Mensuel</h3>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: c.accentPrimary, marginBottom: '0.5rem' }}>
                                                {cost.priceAfterDiscount}€
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary }}>par mois</p>
                                        </div>

                                        <div
                                            onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                                            className="card-native"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.billingCycle === 'annual' ? c.accentPrimary : 'transparent'}`,
                                                background: formData.billingCycle === 'annual' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '10px',
                                                background: '#10b981',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                -20% économie
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Annuel</h3>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', marginBottom: '0.5rem' }}>
                                                {cost.finalPrice}€
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary }}>
                                                soit {cost.monthlyEquivalent}€/mois
                                            </p>
                                        </div>
                                    </div>

                                    {/* Résumé */}
                                    <div style={{
                                        padding: '1.5rem',
                                        background: `${c.accentPrimary}10`,
                                        borderRadius: '1rem',
                                        border: `1px solid ${c.accentPrimary}30`
                                    }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Récapitulatif</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: c.textSecondary }}>Type de compte</span>
                                            <span style={{ fontWeight: 600 }}>{ACCOUNT_TYPE_LABELS[formData.accountType]}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: c.textSecondary }}>Cycle</span>
                                            <span style={{ fontWeight: 600 }}>{formData.billingCycle === 'annual' ? 'Annuel' : 'Mensuel'}</span>
                                        </div>
                                        {formData.billingCycle === 'annual' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981' }}>
                                                <span>Économie annuelle</span>
                                                <span style={{ fontWeight: 600 }}>
                                                    {Math.round(cost.priceAfterDiscount * 12 * ANNUAL_DISCOUNT)}€
                                                </span>
                                            </div>
                                        )}
                                        <div style={{ 
                                            borderTop: `1px solid ${c.borderColor}`, 
                                            paddingTop: '0.75rem',
                                            marginTop: '0.75rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '1.2rem',
                                            fontWeight: 800,
                                            color: c.accentPrimary
                                        }}>
                                            <span>Total</span>
                                            <span>{formData.billingCycle === 'annual' ? cost.finalPrice : cost.priceAfterDiscount}€</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: PAIEMENT ET CONFIRMATION */}
                            {step === 4 && (
                                <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 800 }}>Paiement</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '15px' : '20px' }}>
                                        <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Titulaire</label>
                                            <input
                                                type="text" required placeholder="NOM PRÉNOM"
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary }}
                                                value={formData.cardHolder} onChange={e => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Numéro de carte</label>
                                            <input
                                                type="text" required placeholder="0000 0000 0000 0000" maxLength={19}
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary, fontSize: '1.1rem', letterSpacing: '0.1em' }}
                                                value={formData.cardNumber}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                    setFormData({ ...formData, cardNumber: val });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Expire</label>
                                            <input
                                                type="text" required placeholder="12/28" maxLength={5}
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary }}
                                                value={formData.expiry}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const formatted = val.length >= 2 ? val.slice(0, 2) + '/' + val.slice(2, 4) : val;
                                                    setFormData({ ...formData, expiry: formatted });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>CVV</label>
                                            <input
                                                type="text" required placeholder="123" maxLength={3}
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary }}
                                                value={formData.cvv} onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>

                                    {/* Conditions d'utilisation */}
                                    <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            padding: '12px',
                                            borderRadius: '0.75rem',
                                            background: formData.acceptTerms ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                            border: `1px solid ${formData.acceptTerms ? '#10b981' : c.borderColor}`,
                                            transition: 'all 0.3s'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.acceptTerms}
                                                onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    accentColor: c.accentPrimary
                                                }}
                                            />
                                            <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                J'accepte les{' '}
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                                                    style={{ color: c.accentPrimary, textDecoration: 'underline' }}
                                                >
                                                    conditions d'utilisation
                                                </a>
                                                {' '}et je reconnais avoir pris connaissance de la politique de confidentialité
                                            </span>
                                        </label>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            padding: '12px',
                                            borderRadius: '0.75rem',
                                            background: formData.acceptPrivacy ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                            border: `1px solid ${formData.acceptPrivacy ? '#10b981' : c.borderColor}`,
                                            transition: 'all 0.3s'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.acceptPrivacy}
                                                onChange={e => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    accentColor: c.accentPrimary
                                                }}
                                            />
                                            <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                J'accepte que mes données soient traitées conformément au{' '}
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                                                    style={{ color: c.accentPrimary, textDecoration: 'underline' }}
                                                >
                                                    RGPD
                                                </a>
                                                {' '}et je consens au traitement de mes données personnelles
                                            </span>
                                        </label>
                                    </div>

                                    {/* Sécurité */}
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '0.8rem',
                                        color: c.textSecondary
                                    }}>
                                        <ShieldCheck size={20} color="#10b981" />
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>Sécurité maximale</div>
                                            <div>Vos données sont cryptées avec AES-256-GCM et protégées par des protocoles de sécurité avancés</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '40px',
                                paddingTop: '20px',
                                borderTop: isMobile ? 'none' : `1px solid ${c.borderColor}`,
                                position: isMobile ? 'fixed' : 'relative',
                                bottom: isMobile ? '20px' : 'auto',
                                left: isMobile ? '20px' : 'auto',
                                right: isMobile ? '20px' : 'auto',
                                background: isMobile ? 'transparent' : 'none',
                                zIndex: 10
                            }}>
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep} style={{
                                        padding: '16px 24px', borderRadius: '1.25rem', border: `1px solid ${c.borderColor}`,
                                        background: isMobile ? 'rgba(255,255,255,0.05)' : 'transparent', color: c.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        backdropFilter: isMobile ? 'blur(10px)' : 'none'
                                    }}>
                                        <ArrowLeft size={18} />
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => navigate('/login')} style={{
                                        padding: '16px 24px', borderRadius: '1.25rem', border: 'none',
                                        background: 'transparent', color: c.textSecondary, cursor: 'pointer'
                                    }}>
                                        Annuler
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button type="button" onClick={nextStep} style={{
                                        padding: isMobile ? '16px 40px' : '16px 32px', borderRadius: '1.25rem', border: 'none',
                                        background: `linear-gradient(135deg, ${c.gradientStart}, ${c.gradientEnd})`,
                                        color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: `0 8px 20px ${c.accentPrimary}44`,
                                        flex: isMobile ? 1 : 'none', marginLeft: isMobile ? '10px' : '0',
                                        justifyContent: 'center'
                                    }}>
                                        Suivant <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy}
                                        style={{
                                            padding: isMobile ? '16px 40px' : '16px 40px', 
                                            borderRadius: '1.25rem', 
                                            border: 'none',
                                            background: isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy 
                                                ? 'rgba(16, 185, 129, 0.3)' 
                                                : '#10b981', 
                                            color: '#fff', 
                                            fontWeight: 800, 
                                            cursor: isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy ? 'not-allowed' : 'pointer',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px', 
                                            boxShadow: isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy 
                                                ? 'none' 
                                                : '0 8px 20px rgba(16, 185, 129, 0.4)',
                                            flex: isMobile ? 1 : 'none', 
                                            marginLeft: isMobile ? '10px' : '0',
                                            justifyContent: 'center',
                                            opacity: isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy ? 0.5 : 1
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    border: '2px solid #fff',
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 0.8s linear infinite'
                                                }} />
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                Payer <CheckCircle size={18} />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    input:focus {
                        outline: none;
                        border-color: ${c.accentPrimary} !important;
                        box-shadow: 0 0 0 2px ${c.accentPrimary}33;
                    }
                    .card-native:active {
                        transform: scale(0.98);
                    }
                `}</style>
            </div>

            {/* Modals */}
            <LegalModal 
                isOpen={showTermsModal} 
                onClose={() => setShowTermsModal(false)} 
                type="terms" 
            />
            <LegalModal 
                isOpen={showPrivacyModal} 
                onClose={() => setShowPrivacyModal(false)} 
                type="privacy" 
            />
        </>
    );
};

export default Register;
