# Modifications à apporter à Register.tsx

## Changements dans formData

```typescript
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
```

## ÉTAPE 1 : Remplacer le contenu actuel

Au lieu du système de sélection de type de compte (director, department_head, etc.), mettre :

1. Deux grandes cartes : "Personnel" et "Entreprise"
2. Si Personnel sélectionné :
   - Checkbox "Je suis étudiant" (50% de réduction)
   - Si coché : Upload carte étudiante obligatoire
3. Si Entreprise sélectionné :
   - Deux boutons : "Privé" ou "Public"
   - Si Public : Upload justificatif obligatoire
   - Input : Nom de l'établissement
   - Input : Nombre d'employés

## ÉTAPE 2 : Nouvelle étape - Choix abonnement

Remplacer l'étape actuelle "Détails" par :

1. Cycle de facturation :
   - Radio button "Mensuel"
   - Radio button "Annuel" (20% de réduction)

2. Type d'abonnement :
   - Radio button "Site complet" (2600€/mois)
   - Radio button "Par modules"
   
3. Si "Par modules" sélectionné :
   - Checkbox Munin Atlas (250€)
   - Checkbox Hugin Core (450€)
   - Checkbox Hugin Lab (850€)
   - Checkbox Hugin Analysis (1200€)

4. Carte récapitulative du prix :
   - Prix de base
   - Réduction étudiant si applicable (-50%)
   - Nombre d'employés si entreprise (×N)
   - Réduction annuelle si applicable (-20%)
   - Prix final

## ÉTAPE 3 : Garder mais simplifier

L'étape actuelle "Détails" devient "Informations personnelles" :
- Nom complet
- Email
- Mot de passe (avec indicateur de force)
- Confirmer mot de passe
- Téléphone (optionnel)

Supprimer les champs :
- companyName (déjà demandé en étape 1)
- sections
- employees (déjà demandé en étape 1)

## ÉTAPE 4 : Fusionner Paiement + Validation

Garder l'étape paiement actuelle mais ajouter à la fin :
- Récapitulatif complet de la commande
- Checkbox CGU
- Checkbox RGPD
- Bouton "Finaliser l'inscription"

## Fonction calculatePrice() à modifier

```typescript
const calculatePrice = () => {
    let basePrice = 0;
    
    // Prix de base selon abonnement
    if (formData.subscriptionType === 'full') {
        basePrice = 2600;
    } else {
        const prices = { munin: 250, hugin_core: 450, hugin_lab: 850, hugin_analysis: 1200 };
        basePrice = formData.selectedModules.reduce((sum, mod) => sum + (prices[mod] || 0), 0);
    }
    
    // Réduction étudiant
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
        monthly: monthlyPrice,
        annual: annualPrice,
        savings: formData.billingCycle === 'annual' ? Math.round(monthlyPrice * 12 * 0.2) : 0
    };
};
```

## Validation nextStep() à modifier

```typescript
const nextStep = () => {
    if (step === 1) {
        if (!formData.accountCategory) {
            showToast('Sélectionnez un type de compte', 'error');
            return;
        }
        if (formData.accountCategory === 'personal' && formData.isStudent && !formData.studentCardImage) {
            showToast('Carte étudiante requise', 'error');
            return;
        }
        if (formData.accountCategory === 'enterprise') {
            if (!formData.enterpriseType) {
                showToast('Sélectionnez le type d\'entreprise', 'error');
                return;
            }
            if (formData.enterpriseType === 'public' && !formData.publicJustification) {
                showToast('Justificatif requis pour structure publique', 'error');
                return;
            }
            if (!formData.companyName) {
                showToast('Nom de l\'établissement requis', 'error');
                return;
            }
        }
    }
    
    if (step === 2) {
        if (formData.subscriptionType === 'modules' && formData.selectedModules.length === 0) {
            showToast('Sélectionnez au moins un module', 'error');
            return;
        }
    }
    
    if (step === 3) {
        if (!isValidEmail(formData.email)) {
            showToast('Email invalide', 'error');
            return;
        }
        if (passwordStrength.score < 4) {
            showToast('Mot de passe trop faible', 'error');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showToast('Mots de passe différents', 'error');
            return;
        }
    }
    
    setStep(s => s + 1);
};
```

## Fonction handleFileUpload à ajouter

```typescript
const handleFileUpload = (file: File, type: 'student' | 'public') => {
    if (file.size > 5 * 1024 * 1024) {
        showToast('Fichier trop volumineux (max 5 Mo)', 'error');
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
```

## Ordre des étapes

1. Type de compte (Personnel/Entreprise)
2. Choix abonnement (Mensuel/Annuel + Modules/Complet)
3. Informations personnelles (Nom, Email, Mot de passe)
4. Paiement + Validation (Carte + CGU/RGPD)

## Indicateur de progression

Garder les 4 cercles mais changer les labels si nécessaire.
