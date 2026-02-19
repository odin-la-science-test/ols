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
import type { AccountType } from '../types/accountTypes';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_PRICES } from '../types/accountTypes';
import {
    Users, Building2, ChevronRight, CheckCircle,
    LayoutDashboard, Beaker, BookOpen, Activity, ShieldCheck,
    ArrowLeft, Package, Check, Layers, Eye, EyeOff, AlertCircle, Mail, Lock,
    UserCog, Briefcase, GraduationCap, Wrench, Building, User, Landmark, Upload,
    CreditCard, TrendingUp
} from 'lucide-react';
import { LOGOS } from '../utils/logoCache';

// Remise selon le nombre de comptes
const VOLUME_DISCOUNTS = [
    { min: 1, max: 5, discount: 0 },
    { min: 6, max: 20, discount: 0.10 },
    { min: 21, max: 50, discount: 0.15 },
    { min: 51, max: 100, discount: 0.20 },
    { min: 101, max: Infinity, discount: 0.25 },
];

const MODULE_OPTIONS = [
    { id: 'munin', name: 'Munin Atlas', price: 250, icon: <BookOpen size={20} />, description: 'Encyclopédie scientifique et gestion des entités' },
    { id: 'hugin_core', name: 'Hugin Core', price: 450, icon: <LayoutDashboard size={20} />, description: 'Messagerie, Planning, Documents, Inventaire' },
    { id: 'hugin_lab', name: 'Hugin Lab', price: 850, icon: <Beaker size={20} />, description: 'Suivi de cultures, Recherches, Cahier de labo, Stocks' },
    { id: 'hugin_analysis', name: 'Hugin Analysis', price: 1200, icon: <Activity size={20} />, description: 'Spectrométrie, Cytométrie, Cinétique, Gels' },
];

const FULL_PACK_PRICE_25K = 2600;
const ANNUAL_DISCOUNT = 0.20;

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

    const registrationLimiter = new RateLimiter(3, 60 * 60 * 1000);

    const [formData, setFormData] = useState({
        // ÉTAPE 1: Type de compte
        accountCategory: '' as 'personal' | 'enterprise' | '',
        
        // Si personnel
        isStudent: false,
        studentCardImage: null as File | null,
        studentCardPreview: '',
        
        // Si entreprise  
        enterpriseType: '' as 'private' | 'public' | '',
        publicJustification: null as File | null,
        publicJustificationPreview: '',
        numberOfEmployees: 1,
        companyName: '',
        
        // ÉTAPE 2: Choix abonnement
        billingCycle: 'monthly' as 'monthly' | 'annual',
        subscriptionType: 'full' as 'full' | 'modules',
        selectedModules: [] as string[],
        
        // ÉTAPE 3: Infos personnelles
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        
        // ÉTAPE 4: Paiement
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        acceptTerms: false,
        acceptPrivacy: false
    });

    const c = theme.colors;
    const ds = theme.designSystem;

    const calculatePrice = () => {
        let basePrice = 0;
        
        // Prix de base selon abonnement
        if (formData.subscriptionType === 'full') {
            basePrice = 2600;
        } else {
            const prices: { [key: string]: number } = { 
                munin: 250, 
                hugin_core: 450, 
                hugin_lab: 850, 
                hugin_analysis: 1200 
            };
            basePrice = formData.selectedModules.reduce((sum, mod) => sum + (prices[mod] || 0), 0);
        }
        
        // Réduction étudiant (50%)
        if (formData.accountCategory === 'personal' && formData.isStudent) {
            basePrice = basePrice * 0.5;
        }
        
        // Multiplication par nombre d'employés
        if (formData.accountCategory === 'enterprise') {
            basePrice = basePrice * formData.numberOfEmployees;
        }
        
        const monthlyPrice = Math.round(basePrice);
        const annualPrice = formData.billingCycle === 'annual' 
            ? Math.round(monthlyPrice * 12 * 0.8)
            : monthlyPrice * 12;
        
        return {
            basePrice: Math.round(basePrice),
            monthly: monthlyPrice,
            annual: annualPrice,
            savings: formData.billingCycle === 'annual' ? Math.round(monthlyPrice * 12 * 0.2) : 0,
            studentDiscount: formData.accountCategory === 'personal' && formData.isStudent ? 50 : 0
        };
    };

    const cost = calculatePrice();

    const handleFileUpload = (file: File, type: 'student' | 'public') => {
        if (file.size > 5 * 1024 * 1024) {
            showToast('Le fichier ne doit pas dépasser 5 Mo', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'student') {
                setFormData({
                    ...formData,
                    studentCardImage: file,
                    studentCardPreview: reader.result as string
                });
            } else {
                setFormData({
                    ...formData,
                    publicJustification: file,
                    publicJustificationPreview: reader.result as string
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const nextStep = () => {
        // Validation avant de passer à l'étape suivante
        if (step === 1) {
            if (!formData.accountCategory) {
                showToast('Veuillez sélectionner un type de compte', 'error');
                return;
            }
            if (formData.accountCategory === 'personal' && formData.isStudent && !formData.studentCardImage) {
                showToast('Veuillez télécharger votre carte étudiante', 'error');
                return;
            }
            if (formData.accountCategory === 'enterprise') {
                if (!formData.enterpriseType) {
                    showToast('Veuillez sélectionner le type d\'entreprise', 'error');
                    return;
                }
                if (formData.enterpriseType === 'public' && !formData.publicJustification) {
                    showToast('Veuillez fournir un justificatif pour une structure publique', 'error');
                    return;
                }
                if (!formData.companyName) {
                    showToast('Veuillez entrer le nom de l\'établissement', 'error');
                    return;
                }
            }
        }

        if (step === 2) {
            if (formData.subscriptionType === 'modules' && formData.selectedModules.length === 0) {
                showToast('Veuillez sélectionner au moins un module', 'error');
                return;
            }
        }

        if (step === 3) {
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
        
        // Validation de sécurité
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
                fullName: formData.fullName,
                companyName: formData.companyName,
                phone: formData.phone
            });

            // Save Mock Profile
            const userProfile = {
                email: emailValidation.sanitized,
                password: hashedPassword,
                username: emailValidation.sanitized.split('@')[0],
                fullName: sanitizedData.fullName || emailValidation.sanitized.split('@')[0],
                phone: sanitizedData.phone,
                role: formData.accountCategory === 'enterprise' ? 'admin' : 'user',
                accountCategory: formData.accountCategory,
                isStudent: formData.isStudent,
                enterpriseType: formData.enterpriseType,
                companyName: sanitizedData.companyName,
                numberOfEmployees: formData.numberOfEmployees,
                subscription: {
                    status: 'active',
                    type: formData.subscriptionType,
                    cycle: formData.billingCycle,
                    modules: formData.subscriptionType === 'full' ? 'all' : formData.selectedModules,
                    price: formData.billingCycle === 'annual' ? cost.annual : cost.monthly
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
                    {step > s ? <Check size={isMobile ? 16 : 20} /> : s}
                </div>
            ))}
        </div>
    );

    return (
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
                paddingBottom: isMobile ? '100px' : '0' // Space for fixed buttons on mobile
            }}>
                {/* Header - Mobile vs Desktop */}
                <div style={{
                    padding: isMobile ? '40px 20px 20px' : '3rem 2rem',
                    background: isMobile ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    textAlign: 'center',
                    borderBottom: isMobile ? 'none' : `1px solid ${c.borderColor}`
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <img src={LOGOS.main} alt="Odin" style={{ height: isMobile ? '50px' : '80px', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.2))' }} />
                        <h1 style={{ fontSize: isMobile ? '1.25rem' : '2.25rem', fontWeight: 800, background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Odin la Science
                        </h1>
                    </div>
                </div>

                <div style={{ padding: isMobile ? '15px' : '40px' }}>
                    {renderStepIndicator()}

                    <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                        {/* STEP 1: TYPE DE COMPTE ET NOMBRE */}
                        {step === 1 && (
                            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
                                    Type de compte
                                </h2>
                                <p style={{ textAlign: 'center', color: c.textSecondary, marginBottom: '2rem', fontSize: '0.9rem' }}>
                                    Choisissez le type de compte qui vous correspond
                                </p>

                                {/* Choix Personnel / Entreprise */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div
                                        onClick={() => setFormData({ ...formData, accountCategory: 'personal', enterpriseType: '', companyName: '', numberOfEmployees: 1 })}
                                        style={{
                                            padding: '2rem',
                                            borderRadius: '1rem',
                                            border: `2px solid ${formData.accountCategory === 'personal' ? c.accentPrimary : c.borderColor}`,
                                            background: formData.accountCategory === 'personal' ? `${c.accentPrimary}15` : c.bgSecondary,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            textAlign: 'center',
                                            boxShadow: formData.accountCategory === 'personal' ? `0 8px 16px ${c.accentPrimary}22` : 'none'
                                        }}
                                    >
                                        <User size={48} color={formData.accountCategory === 'personal' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '1rem' }} />
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Personnel</h3>
                                        <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Compte individuel</p>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, accountCategory: 'enterprise', isStudent: false, studentCardImage: null, studentCardPreview: '' })}
                                        style={{
                                            padding: '2rem',
                                            borderRadius: '1rem',
                                            border: `2px solid ${formData.accountCategory === 'enterprise' ? c.accentPrimary : c.borderColor}`,
                                            background: formData.accountCategory === 'enterprise' ? `${c.accentPrimary}15` : c.bgSecondary,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            textAlign: 'center',
                                            boxShadow: formData.accountCategory === 'enterprise' ? `0 8px 16px ${c.accentPrimary}22` : 'none'
                                        }}
                                    >
                                        <Building2 size={48} color={formData.accountCategory === 'enterprise' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '1rem' }} />
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Entreprise</h3>
                                        <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Compte professionnel</p>
                                    </div>
                                </div>

                                {/* Si Personnel */}
                                {formData.accountCategory === 'personal' && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            border: `1px solid ${formData.isStudent ? c.accentPrimary : c.borderColor}`,
                                            background: formData.isStudent ? `${c.accentPrimary}10` : 'transparent',
                                            transition: 'all 0.3s'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isStudent}
                                                onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: c.accentPrimary }}
                                            />
                                            <GraduationCap size={28} color={formData.isStudent ? c.accentPrimary : c.textSecondary} />
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ fontSize: '1.05rem' }}>Je suis étudiant</strong>
                                                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>
                                                    🎓 Bénéficiez de 50% de réduction sur tous les tarifs
                                                </p>
                                            </div>
                                        </label>

                                        {formData.isStudent && (
                                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: c.bgPrimary, borderRadius: '0.75rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    📄 Carte étudiante (obligatoire)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'student')}
                                                    style={{ display: 'none' }}
                                                    id="studentCard"
                                                />
                                                <label
                                                    htmlFor="studentCard"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        padding: '1.25rem',
                                                        border: `2px dashed ${formData.studentCardImage ? '#10b981' : c.borderColor}`,
                                                        borderRadius: '0.75rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        background: formData.studentCardImage ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                                    }}
                                                >
                                                    {formData.studentCardImage ? <CheckCircle size={20} color="#10b981" /> : <Upload size={20} />}
                                                    <span style={{ fontWeight: 600 }}>
                                                        {formData.studentCardImage ? formData.studentCardImage.name : 'Télécharger la carte étudiante'}
                                                    </span>
                                                </label>
                                                {formData.studentCardPreview && (
                                                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                                        <img 
                                                            src={formData.studentCardPreview} 
                                                            alt="Aperçu carte étudiante" 
                                                            style={{ 
                                                                maxWidth: '100%', 
                                                                maxHeight: '200px', 
                                                                borderRadius: '0.5rem',
                                                                border: `1px solid ${c.borderColor}`
                                                            }} 
                                                        />
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.75rem', textAlign: 'center' }}>
                                                    Formats acceptés : JPG, PNG, PDF (max 5 Mo)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Si Entreprise */}
                                {formData.accountCategory === 'enterprise' && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                                            Type d'entreprise
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div
                                                onClick={() => setFormData({ ...formData, enterpriseType: 'private', publicJustification: null, publicJustificationPreview: '' })}
                                                style={{
                                                    padding: '1.5rem',
                                                    borderRadius: '1rem',
                                                    border: `2px solid ${formData.enterpriseType === 'private' ? c.accentPrimary : c.borderColor}`,
                                                    background: formData.enterpriseType === 'private' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <Building size={36} color={formData.enterpriseType === 'private' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                                <strong style={{ display: 'block', fontSize: '1.05rem' }}>Privé</strong>
                                                <p style={{ fontSize: '0.8rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>Entreprise privée</p>
                                            </div>

                                            <div
                                                onClick={() => setFormData({ ...formData, enterpriseType: 'public' })}
                                                style={{
                                                    padding: '1.5rem',
                                                    borderRadius: '1rem',
                                                    border: `2px solid ${formData.enterpriseType === 'public' ? c.accentPrimary : c.borderColor}`,
                                                    background: formData.enterpriseType === 'public' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <Landmark size={36} color={formData.enterpriseType === 'public' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                                <strong style={{ display: 'block', fontSize: '1.05rem' }}>Public</strong>
                                                <p style={{ fontSize: '0.8rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>Structure publique</p>
                                            </div>
                                        </div>

                                        {formData.enterpriseType === 'public' && (
                                            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    📋 Justificatif (obligatoire pour structure publique)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'public')}
                                                    style={{ display: 'none' }}
                                                    id="publicJustif"
                                                />
                                                <label
                                                    htmlFor="publicJustif"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        padding: '1.25rem',
                                                        border: `2px dashed ${formData.publicJustification ? '#10b981' : c.borderColor}`,
                                                        borderRadius: '0.75rem',
                                                        cursor: 'pointer',
                                                        background: formData.publicJustification ? 'rgba(16, 185, 129, 0.1)' : c.bgPrimary
                                                    }}
                                                >
                                                    {formData.publicJustification ? <CheckCircle size={20} color="#10b981" /> : <Upload size={20} />}
                                                    <span style={{ fontWeight: 600 }}>
                                                        {formData.publicJustification ? formData.publicJustification.name : 'Télécharger le justificatif'}
                                                    </span>
                                                </label>
                                                <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.75rem', textAlign: 'center' }}>
                                                    SIRET, attestation, document officiel (PDF, JPG, PNG - max 5 Mo)
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                                Nom de l'établissement
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="ex: Laboratoire BioTech Innovation"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    borderRadius: '0.75rem',
                                                    border: `1px solid ${c.borderColor}`,
                                                    background: c.bgSecondary,
                                                    color: c.textPrimary,
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                                Nombre d'employés / Comptes nécessaires
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10000"
                                                required
                                                value={formData.numberOfEmployees}
                                                onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    borderRadius: '0.75rem',
                                                    border: `1px solid ${c.borderColor}`,
                                                    background: c.bgSecondary,
                                                    color: c.textPrimary,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    textAlign: 'center'
                                                }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.5rem', textAlign: 'center' }}>
                                                💡 Le directeur peut créer et gérer les comptes des employés ou déléguer cette gestion aux chefs d'équipe
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: CHOIX ABONNEMENT */}
                        {step === 2 && (
                            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
                                    Choisissez votre abonnement
                                </h2>
                                <p style={{ textAlign: 'center', color: c.textSecondary, marginBottom: '2rem', fontSize: '0.9rem' }}>
                                    Sélectionnez le cycle de facturation et les modules qui vous conviennent
                                </p>

                                {/* Cycle de facturation */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                                        Cycle de facturation
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.billingCycle === 'monthly' ? c.accentPrimary : c.borderColor}`,
                                                background: formData.billingCycle === 'monthly' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <CreditCard size={32} color={formData.billingCycle === 'monthly' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mensuel</h3>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Paiement chaque mois</p>
                                        </div>

                                        <div
                                            onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.billingCycle === 'annual' ? c.accentPrimary : c.borderColor}`,
                                                background: formData.billingCycle === 'annual' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                textAlign: 'center',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '10px',
                                                background: '#10b981',
                                                color: '#fff',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 700
                                            }}>
                                                -20%
                                            </div>
                                            <TrendingUp size={32} color={formData.billingCycle === 'annual' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Annuel</h3>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Économisez 20%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Type d'abonnement */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                                        Type d'abonnement
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, subscriptionType: 'full', selectedModules: [] })}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.subscriptionType === 'full' ? c.accentPrimary : c.borderColor}`,
                                                background: formData.subscriptionType === 'full' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <Layers size={32} color={formData.subscriptionType === 'full' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Site complet</h3>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '0.75rem' }}>Tous les modules inclus</p>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.accentPrimary }}>2600€</div>
                                            <div style={{ fontSize: '0.75rem', color: c.textSecondary }}>par mois</div>
                                        </div>

                                        <div
                                            onClick={() => setFormData({ ...formData, subscriptionType: 'modules' })}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1rem',
                                                border: `2px solid ${formData.subscriptionType === 'modules' ? c.accentPrimary : c.borderColor}`,
                                                background: formData.subscriptionType === 'modules' ? `${c.accentPrimary}15` : c.bgSecondary,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <Package size={32} color={formData.subscriptionType === 'modules' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Par modules</h3>
                                            <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '0.75rem' }}>Choisissez vos modules</p>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.accentPrimary }}>À partir de 250€</div>
                                            <div style={{ fontSize: '0.75rem', color: c.textSecondary }}>par mois</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sélection des modules */}
                                {formData.subscriptionType === 'modules' && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                                            Sélectionnez vos modules
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {MODULE_OPTIONS.map(module => (
                                                <label
                                                    key={module.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        padding: '1rem',
                                                        borderRadius: '0.75rem',
                                                        border: `1px solid ${formData.selectedModules.includes(module.id) ? c.accentPrimary : c.borderColor}`,
                                                        background: formData.selectedModules.includes(module.id) ? `${c.accentPrimary}10` : c.bgPrimary,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.selectedModules.includes(module.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    selectedModules: [...formData.selectedModules, module.id]
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    selectedModules: formData.selectedModules.filter(m => m !== module.id)
                                                                });
                                                            }
                                                        }}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: c.accentPrimary }}
                                                    />
                                                    <div style={{ color: formData.selectedModules.includes(module.id) ? c.accentPrimary : c.textSecondary }}>
                                                        {module.icon}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <strong style={{ display: 'block', fontSize: '1rem' }}>{module.name}</strong>
                                                        <p style={{ fontSize: '0.8rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>
                                                            {module.description}
                                                        </p>
                                                    </div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: c.accentPrimary }}>
                                                        {module.price}€
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Carte récapitulative du prix */}
                                <div style={{
                                    padding: '1.5rem',
                                    background: `linear-gradient(135deg, ${c.accentPrimary}15, ${c.accentSecondary}15)`,
                                    borderRadius: '1rem',
                                    border: `2px solid ${c.accentPrimary}`,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: c.textSecondary, marginBottom: '0.5rem' }}>
                                        {formData.billingCycle === 'annual' ? 'Prix annuel' : 'Prix mensuel'}
                                    </div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: c.accentPrimary, marginBottom: '0.5rem' }}>
                                        {formData.billingCycle === 'annual' ? cost.annual : cost.monthly}€
                                    </div>
                                    {formData.accountCategory === 'personal' && formData.isStudent && (
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.5rem 1rem',
                                            background: '#10b981',
                                            color: '#fff',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            marginBottom: '0.5rem'
                                        }}>
                                            🎓 Réduction étudiant -50% appliquée
                                        </div>
                                    )}
                                    {formData.billingCycle === 'annual' && (
                                        <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                                            💰 Vous économisez {cost.savings}€ par an
                                        </div>
                                    )}
                                    {formData.accountCategory === 'enterprise' && formData.numberOfEmployees > 1 && (
                                        <div style={{ fontSize: '0.85rem', color: c.textSecondary, marginTop: '0.5rem' }}>
                                            Pour {formData.numberOfEmployees} employés
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: INFORMATIONS PERSONNELLES */}
                        {step === 3 && (
                            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
                                    Vos informations
                                </h2>
                                <p style={{ textAlign: 'center', color: c.textSecondary, marginBottom: '2rem', fontSize: '0.9rem' }}>
                                    Complétez vos informations personnelles
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '15px' : '20px' }}>
                                    <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Nom complet
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text" required
                                                placeholder="ex: Jean Dupont"
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary, fontSize: '1rem' }}
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
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
                                            Téléphone (optionnel)
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+33 6 12 34 56 78"
                                            style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgSecondary, color: c.textPrimary }}
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
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
                                                {passwordStrength.feedback.length > 0 && (
                                                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '4px' }}>
                                                        {passwordStrength.feedback.slice(0, 2).map((fb, i) => (
                                                            <div key={i}>• {fb}</div>
                                                        ))}
                                                    </div>
                                                )}
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

                        {/* STEP 4: RÉSUMÉ ET CONFIRMATION */}
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
                                        <div style={{ position: 'relative' }}>
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
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
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
                                </div>
                                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: c.textSecondary, padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <ShieldCheck size={18} color="#10b981" />
                                    Transaction sécurisée via Odin Gateway
                                </div>
                            </div>
                        )}

                        {/* STEP 4: PAIEMENT ET CONFIRMATION */}
                        {step === 4 && (
                            <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 800 }}>Paiement et Confirmation</h2>

                                {/* Informations de paiement */}
                                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>💳 Informations de paiement</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '15px' : '20px' }}>
                                        <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Titulaire</label>
                                            <input
                                                type="text" required placeholder="NOM PRÉNOM"
                                                style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgPrimary, color: c.textPrimary }}
                                                value={formData.cardHolder} onChange={e => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Numéro de carte</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text" required placeholder="0000 0000 0000 0000" maxLength={19}
                                                    style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgPrimary, color: c.textPrimary, fontSize: '1.1rem', letterSpacing: '0.1em' }}
                                                    value={formData.cardNumber}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                        setFormData({ ...formData, cardNumber: val });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: c.textSecondary, textTransform: 'uppercase' }}>Expire</label>
                                                <input
                                                    type="text" required placeholder="12/28" maxLength={5}
                                                    style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgPrimary, color: c.textPrimary }}
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
                                                    style={{ width: '100%', padding: '16px', borderRadius: '1rem', border: `1px solid ${c.borderColor}`, background: c.bgPrimary, color: c.textPrimary }}
                                                    value={formData.cvv} onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: c.textSecondary, padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                        <ShieldCheck size={18} color="#10b981" />
                                        Transaction sécurisée via Odin Gateway
                                    </div>
                                </div>

                                {/* Récapitulatif */}
                                <div className="card-native" style={{ borderRadius: '1.5rem', overflow: 'hidden', background: c.bgSecondary, border: `1px solid ${c.borderColor}`, marginBottom: '2rem' }}>
                                    <div style={{ padding: '1.5rem', borderBottom: `1px solid ${c.borderColor}`, background: `${c.accentPrimary}10` }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: c.accentPrimary }}>
                                            📋 Récapitulatif de votre commande
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                            <span style={{ color: c.textSecondary }}>Type de compte:</span>
                                            <strong style={{ textAlign: 'right' }}>
                                                {formData.accountCategory === 'enterprise' ? '🏢 Entreprise' : '👤 Personnel'}
                                                {formData.isStudent && ' 🎓'}
                                            </strong>

                                            {formData.accountCategory === 'enterprise' && (
                                                <>
                                                    <span style={{ color: c.textSecondary }}>Établissement:</span>
                                                    <strong style={{ textAlign: 'right' }}>{formData.companyName}</strong>

                                                    <span style={{ color: c.textSecondary }}>Type:</span>
                                                    <strong style={{ textAlign: 'right' }}>
                                                        {formData.enterpriseType === 'public' ? '🏛️ Public' : '🏢 Privé'}
                                                    </strong>

                                                    <span style={{ color: c.textSecondary }}>Nombre d'employés:</span>
                                                    <strong style={{ textAlign: 'right' }}>{formData.numberOfEmployees}</strong>
                                                </>
                                            )}

                                            <span style={{ color: c.textSecondary }}>Nom:</span>
                                            <strong style={{ textAlign: 'right' }}>{formData.fullName}</strong>

                                            <span style={{ color: c.textSecondary }}>Email:</span>
                                            <strong style={{ textAlign: 'right' }}>{formData.email}</strong>

                                            <span style={{ color: c.textSecondary }}>Abonnement:</span>
                                            <strong style={{ textAlign: 'right' }}>
                                                {formData.subscriptionType === 'full' ? '🎁 Site complet' : '📦 Par modules'}
                                            </strong>

                                            {formData.subscriptionType === 'modules' && formData.selectedModules.length > 0 && (
                                                <>
                                                    <span style={{ color: c.textSecondary }}>Modules:</span>
                                                    <div style={{ textAlign: 'right' }}>
                                                        {formData.selectedModules.map(modId => {
                                                            const mod = MODULE_OPTIONS.find(m => m.id === modId);
                                                            return mod ? <div key={modId} style={{ fontSize: '0.85rem' }}>{mod.name}</div> : null;
                                                        })}
                                                    </div>
                                                </>
                                            )}

                                            <span style={{ color: c.textSecondary }}>Facturation:</span>
                                            <strong style={{ textAlign: 'right', color: formData.billingCycle === 'annual' ? '#10b981' : 'inherit' }}>
                                                {formData.billingCycle === 'annual' ? '📅 Annuelle (-20%)' : '📆 Mensuelle'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: c.textSecondary, marginBottom: '0.5rem' }}>
                                            {formData.billingCycle === 'annual' ? 'Total annuel' : 'Montant mensuel'}
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: c.accentPrimary }}>
                                            {formData.billingCycle === 'annual' ? cost.annual : cost.monthly}€
                                        </div>
                                        {formData.accountCategory === 'personal' && formData.isStudent && (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem',
                                                background: '#10b981',
                                                color: '#fff',
                                                borderRadius: '1rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                marginTop: '0.5rem'
                                            }}>
                                                🎓 Réduction étudiant -50% appliquée
                                            </div>
                                        )}
                                        {formData.billingCycle === 'annual' ? (
                                            <>
                                                <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem' }}>
                                                    💰 Économie de {cost.savings}€ incluse
                                                </div>
                                                <div style={{ 
                                                    marginTop: '1rem', 
                                                    padding: '0.75rem', 
                                                    background: 'rgba(16, 185, 129, 0.1)', 
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <div style={{ color: c.textSecondary, marginBottom: '0.25rem' }}>Équivalent mensuel</div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                                                        {Math.round(cost.annual / 12)}€/mois
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ 
                                                marginTop: '1rem', 
                                                padding: '0.75rem', 
                                                background: 'rgba(59, 130, 246, 0.1)', 
                                                borderRadius: '0.5rem',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div style={{ color: c.textSecondary, marginBottom: '0.25rem' }}>Si vous passiez en annuel</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
                                                    Économisez {Math.round(cost.monthly * 12 * 0.2)}€/an
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Conditions d'utilisation */}
                                <div style={{ marginBottom: '1.5rem' }}>
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
                                            J'accepte les <a href="/terms-of-service" target="_blank" style={{ color: c.accentPrimary, textDecoration: 'underline' }}>conditions d'utilisation</a> et je reconnais avoir pris connaissance de la politique de confidentialité
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
                                            J'accepte que mes données soient traitées conformément au <a href="/rgpd" target="_blank" style={{ color: c.accentPrimary, textDecoration: 'underline' }}>RGPD</a> et je consens au traitement de mes données personnelles
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
    );
};

export default Register;
