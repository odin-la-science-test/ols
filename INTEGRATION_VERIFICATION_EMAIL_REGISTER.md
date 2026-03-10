# 🔐 Intégration de la Vérification Email dans Register

## 🎯 Objectif

Ajouter une étape de vérification par email dans le processus d'inscription pour vérifier que l'email est valide avant de créer le compte.

## 📋 Flux Actuel vs Nouveau Flux

### Flux Actuel
1. Étape 1 : Type de compte
2. Étape 2 : Choix abonnement
3. Étape 3 : Infos personnelles
4. Étape 4 : Paiement
5. ✅ Compte créé immédiatement

### Nouveau Flux (avec vérification)
1. Étape 1 : Type de compte
2. Étape 2 : Choix abonnement
3. Étape 3 : Infos personnelles
4. **Étape 3.5 : Vérification email** ⭐ NOUVEAU
   - Envoi du code par email
   - Saisie du code à 6 chiffres
   - Validation du code
5. Étape 4 : Paiement
6. ✅ Compte créé après vérification

## 🔧 Modifications à Apporter

### 1. Ajouter l'Import du Service Email

```typescript
import EmailService from '../services/emailService';
import { generateVerificationCode } from '../utils/securityEnhancements';
```

### 2. Ajouter les États pour la Vérification

```typescript
const [verificationStep, setVerificationStep] = useState(false);
const [verificationCode, setVerificationCode] = useState('');
const [generatedCode, setGeneratedCode] = useState('');
const [codeExpiry, setCodeExpiry] = useState<number>(0);
const [codeInputs, setCodeInputs] = useState(['', '', '', '', '', '']);
const [isVerifying, setIsVerifying] = useState(false);
const [canResend, setCanResend] = useState(false);
const [resendTimer, setResendTimer] = useState(60);
```

### 3. Modifier la Logique de Soumission de l'Étape 3

Au lieu de passer directement à l'étape 4, envoyer le code :

```typescript
const handleStep3Submit = async () => {
    // Validation des champs
    if (!formData.email || !formData.password || !formData.fullName) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await SecureStorage.getItem(`user_profile_${formData.email.toLowerCase()}`);
    if (existingUser) {
        showToast('Cet email est déjà utilisé', 'error');
        return;
    }

    // Générer et envoyer le code
    const code = generateVerificationCode();
    setGeneratedCode(code);
    setCodeExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
        const success = await EmailService.sendVerificationCode(formData.email, code);
        if (success) {
            setVerificationStep(true);
            showToast('Code envoyé à votre email', 'success');
            startResendTimer();
        } else {
            showToast('Erreur lors de l\'envoi du code', 'error');
        }
    } catch (error) {
        console.error('Erreur envoi code:', error);
        showToast('Erreur lors de l\'envoi du code', 'error');
    }
};
```

### 4. Ajouter la Fonction de Vérification du Code

```typescript
const handleVerifyCode = async () => {
    const enteredCode = codeInputs.join('');
    
    if (enteredCode.length !== 6) {
        showToast('Veuillez entrer le code complet', 'error');
        return;
    }

    if (Date.now() > codeExpiry) {
        showToast('Le code a expiré', 'error');
        return;
    }

    setIsVerifying(true);

    if (enteredCode === generatedCode) {
        showToast('Email vérifié avec succès !', 'success');
        setVerificationStep(false);
        setStep(4); // Passer à l'étape paiement
    } else {
        showToast('Code incorrect', 'error');
        setCodeInputs(['', '', '', '', '', '']);
    }

    setIsVerifying(false);
};
```

### 5. Ajouter la Fonction de Renvoi du Code

```typescript
const handleResendCode = async () => {
    if (!canResend) return;

    const code = generateVerificationCode();
    setGeneratedCode(code);
    setCodeExpiry(Date.now() + 5 * 60 * 1000);

    try {
        const success = await EmailService.sendVerificationCode(formData.email, code);
        if (success) {
            showToast('Nouveau code envoyé', 'success');
            setCanResend(false);
            startResendTimer();
        } else {
            showToast('Erreur lors de l\'envoi', 'error');
        }
    } catch (error) {
        showToast('Erreur lors de l\'envoi', 'error');
    }
};

const startResendTimer = () => {
    setResendTimer(60);
    setCanResend(false);
    
    const interval = setInterval(() => {
        setResendTimer(prev => {
            if (prev <= 1) {
                clearInterval(interval);
                setCanResend(true);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
};
```

### 6. Ajouter le Composant de Vérification Email

```typescript
const renderEmailVerification = () => {
    const timeLeft = Math.max(0, Math.floor((codeExpiry - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            padding: '2rem',
            background: c.surface,
            borderRadius: ds.borderRadius.lg,
            boxShadow: ds.shadows.lg
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Mail size={48} color={c.primary} style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: c.text, marginBottom: '0.5rem' }}>
                    Vérifiez votre email
                </h2>
                <p style={{ color: c.textSecondary, fontSize: '0.9rem' }}>
                    Nous avons envoyé un code à 6 chiffres à<br/>
                    <strong>{formData.email}</strong>
                </p>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                {codeInputs.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            const newInputs = [...codeInputs];
                            newInputs[index] = value;
                            setCodeInputs(newInputs);
                            
                            if (value && index < 5) {
                                const nextInput = document.querySelector(
                                    `input[name="code-${index + 1}"]`
                                ) as HTMLInputElement;
                                nextInput?.focus();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
                                const prevInput = document.querySelector(
                                    `input[name="code-${index - 1}"]`
                                ) as HTMLInputElement;
                                prevInput?.focus();
                            }
                        }}
                        name={`code-${index}`}
                        style={{
                            width: '50px',
                            height: '60px',
                            fontSize: '24px',
                            textAlign: 'center',
                            border: `2px solid ${digit ? c.primary : c.border}`,
                            borderRadius: ds.borderRadius.md,
                            background: c.background,
                            color: c.text,
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                ))}
            </div>

            <div style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem',
                color: c.textSecondary,
                fontSize: '0.9rem'
            }}>
                {timeLeft > 0 ? (
                    <p>
                        ⏱️ Code valide pendant {minutes}:{seconds.toString().padStart(2, '0')}
                    </p>
                ) : (
                    <p style={{ color: c.error }}>
                        ⚠️ Le code a expiré
                    </p>
                )}
            </div>

            <button
                onClick={handleVerifyCode}
                disabled={isVerifying || codeInputs.join('').length !== 6}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: c.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: ds.borderRadius.md,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    opacity: isVerifying || codeInputs.join('').length !== 6 ? 0.5 : 1
                }}
            >
                {isVerifying ? 'Vérification...' : 'Vérifier le code'}
            </button>

            <button
                onClick={handleResendCode}
                disabled={!canResend}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'transparent',
                    color: canResend ? c.primary : c.textSecondary,
                    border: `1px solid ${canResend ? c.primary : c.border}`,
                    borderRadius: ds.borderRadius.md,
                    fontSize: '0.9rem',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    opacity: canResend ? 1 : 0.5
                }}
            >
                {canResend ? 'Renvoyer le code' : `Renvoyer dans ${resendTimer}s`}
            </button>

            <button
                onClick={() => setVerificationStep(false)}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'transparent',
                    color: c.textSecondary,
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '1rem'
                }}
            >
                ← Modifier l'email
            </button>
        </div>
    );
};
```

### 7. Modifier le Rendu Principal

```typescript
// Dans le return principal, après l'étape 3 et avant l'étape 4
{step === 3 && !verificationStep && (
    // ... contenu actuel de l'étape 3
)}

{step === 3 && verificationStep && renderEmailVerification()}

{step === 4 && (
    // ... contenu actuel de l'étape 4
)}
```

## ✅ Avantages

1. **Sécurité** : Vérifie que l'email est valide et appartient à l'utilisateur
2. **Anti-spam** : Empêche les inscriptions avec des emails invalides
3. **Expérience utilisateur** : Interface claire et intuitive
4. **Flexibilité** : Fonctionne avec Resend ou en mode mock

## 🚀 Prochaines Étapes

1. Implémenter les modifications dans Register.tsx
2. Tester le flux complet
3. Vérifier que les emails arrivent bien
4. Tester le mode mock également

---

**Temps estimé** : 10-15 minutes  
**Complexité** : Moyenne  
**Impact** : Améliore grandement la sécurité
