# Guide de Vérification par Email

## 📧 Système de Vérification à Deux Facteurs

Ce guide explique comment utiliser le système de vérification par email qui envoie automatiquement un code à 6 chiffres à chaque connexion.

## 🎯 Fonctionnalités

- ✅ Génération automatique de codes à 6 chiffres
- ✅ Envoi automatique par email à chaque connexion
- ✅ Interface utilisateur intuitive avec saisie facilitée
- ✅ Expiration automatique après 5 minutes
- ✅ Possibilité de renvoyer le code (cooldown de 60 secondes)
- ✅ Validation en temps réel
- ✅ Notification visuelle de l'envoi du code

## 📁 Fichiers Créés

### 1. `src/utils/securityEnhancements.ts` (Modifié)
Contient la classe `TwoFactorAuth` avec les méthodes :
- `generateCode(userId)` - Génère un code à 6 chiffres
- `sendCodeByEmail(email, code)` - Envoie le code par email
- `generateAndSendCode(email)` - Génère et envoie en une seule opération
- `verifyCode(userId, code)` - Vérifie la validité du code

### 2. `src/components/EmailVerification.tsx`
Composant React pour l'interface de vérification :
- Champs de saisie à 6 chiffres
- Timer d'expiration (5 minutes)
- Bouton de renvoi avec cooldown
- Messages d'erreur et de succès
- Support du copier-coller

### 3. `src/pages/LoginWithVerification.tsx`
Exemple d'intégration dans une page de connexion :
- Formulaire de connexion classique
- Transition vers l'écran de vérification
- Finalisation de la connexion après vérification

## 🚀 Utilisation

### Intégration dans une page de connexion

```typescript
import React, { useState } from 'react';
import EmailVerification from '../components/EmailVerification';
import { TwoFactorAuth } from '../utils/securityEnhancements';

function Login() {
    const [showVerification, setShowVerification] = useState(false);
    const [email, setEmail] = useState('');

    const handleLogin = async (email: string, password: string) => {
        // 1. Vérifier les identifiants
        const isValid = await verifyCredentials(email, password);
        
        if (isValid) {
            // 2. Afficher l'écran de vérification
            setEmail(email);
            setShowVerification(true);
        }
    };

    const handleVerificationSuccess = () => {
        // 3. Finaliser la connexion
        completeLogin();
    };

    if (showVerification) {
        return (
            <EmailVerification
                email={email}
                onVerified={handleVerificationSuccess}
                onCancel={() => setShowVerification(false)}
            />
        );
    }

    return (
        // Formulaire de connexion
    );
}
```

### Intégration dans l'inscription

```typescript
import { TwoFactorAuth } from '../utils/securityEnhancements';

const handleRegister = async (email: string) => {
    // 1. Créer le compte
    await createAccount(email);
    
    // 2. Envoyer le code de vérification
    await TwoFactorAuth.generateAndSendCode(email);
    
    // 3. Afficher l'écran de vérification
    setShowVerification(true);
};
```

## 🔧 Configuration de l'Envoi d'Emails

### Option 1 : Service d'Email Tiers (Recommandé)

Pour un environnement de production, intégrez un service d'email professionnel :

#### SendGrid
```typescript
// Dans sendCodeByEmail()
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        personalizations: [{
            to: [{ email }],
            subject: 'Code de vérification Odin La Science'
        }],
        from: { email: 'noreply@odinlascience.com' },
        content: [{
            type: 'text/html',
            value: `
                <h2>Code de vérification</h2>
                <p>Votre code de vérification est :</p>
                <h1 style="font-size: 32px; letter-spacing: 8px;">${code}</h1>
                <p>Ce code expire dans 5 minutes.</p>
            `
        }]
    })
});
```

#### AWS SES
```typescript
import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'eu-west-1' });

const params = {
    Source: 'noreply@odinlascience.com',
    Destination: { ToAddresses: [email] },
    Message: {
        Subject: { Data: 'Code de vérification' },
        Body: {
            Html: {
                Data: `
                    <h2>Code de vérification</h2>
                    <p>Votre code : <strong>${code}</strong></p>
                `
            }
        }
    }
};

await ses.sendEmail(params).promise();
```

#### Mailgun
```typescript
const formData = new FormData();
formData.append('from', 'Odin La Science <noreply@odinlascience.com>');
formData.append('to', email);
formData.append('subject', 'Code de vérification');
formData.append('html', `<h1>${code}</h1>`);

await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
    method: 'POST',
    headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`
    },
    body: formData
});
```

### Option 2 : API Backend Personnalisée

```typescript
// Frontend
const response = await fetch('/api/send-verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
});

// Backend (Node.js + Express)
app.post('/api/send-verification-code', async (req, res) => {
    const { email, code } = req.body;
    
    // Utiliser nodemailer ou un service d'email
    await sendEmail(email, code);
    
    res.json({ success: true });
});
```

## 🎨 Personnalisation

### Modifier la durée d'expiration

```typescript
// Dans src/utils/securityEnhancements.ts
export class TwoFactorAuth {
    private static readonly CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes au lieu de 5
}
```

### Modifier le cooldown de renvoi

```typescript
// Dans src/components/EmailVerification.tsx
const [resendCooldown, setResendCooldown] = useState(0);

const sendVerificationCode = async () => {
    await TwoFactorAuth.generateAndSendCode(email);
    setResendCooldown(120); // 120 secondes au lieu de 60
};
```

### Personnaliser l'apparence

Le composant utilise le système de thème de l'application. Modifiez les couleurs dans `ThemeContext` pour adapter l'apparence.

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **Expiration des codes** : Les codes expirent après 5 minutes
2. **Codes à usage unique** : Chaque code ne peut être utilisé qu'une seule fois
3. **Rate limiting** : Cooldown de 60 secondes entre les renvois
4. **Logging** : Tous les événements sont enregistrés pour audit
5. **Validation stricte** : Seulement des chiffres acceptés

### Recommandations Supplémentaires

1. **HTTPS obligatoire** : Toujours utiliser HTTPS en production
2. **Stockage sécurisé** : Les codes sont stockés en mémoire, pas en localStorage
3. **Limite de tentatives** : Implémenter un blocage après X tentatives échouées
4. **Notification de connexion** : Envoyer un email de notification après connexion réussie

## 📱 Expérience Utilisateur

### Fonctionnalités UX

- ✅ Auto-focus sur le premier champ
- ✅ Navigation automatique entre les champs
- ✅ Support du copier-coller
- ✅ Vérification automatique quand tous les champs sont remplis
- ✅ Timer visible pour l'expiration
- ✅ Messages d'erreur clairs
- ✅ Animation de succès
- ✅ Notification visuelle de l'envoi

### Accessibilité

- ✅ Labels appropriés
- ✅ Contraste des couleurs
- ✅ Navigation au clavier
- ✅ Messages d'erreur descriptifs

## 🧪 Tests

### Test Manuel

1. Lancer l'application
2. Aller sur la page de connexion avec vérification
3. Entrer des identifiants valides
4. Vérifier que le code s'affiche dans la console et dans une notification
5. Entrer le code dans les champs
6. Vérifier la connexion réussie

### Test du Renvoi

1. Attendre 60 secondes
2. Cliquer sur "Renvoyer le code"
3. Vérifier qu'un nouveau code est généré

### Test d'Expiration

1. Attendre 5 minutes
2. Essayer d'entrer le code
3. Vérifier le message d'erreur "Code expiré"

## 🚨 Dépannage

### Le code ne s'affiche pas
- Vérifier la console du navigateur
- Vérifier que `sendCodeByEmail` est bien appelée
- Vérifier les permissions de notification du navigateur

### Le code est toujours invalide
- Vérifier que l'email utilisé est le même pour la génération et la vérification
- Vérifier que le code n'a pas expiré (5 minutes)
- Vérifier les logs dans la console

### Le bouton de renvoi ne fonctionne pas
- Vérifier que le cooldown de 60 secondes est écoulé
- Vérifier qu'il n'y a pas d'erreur dans la console

## 📝 Notes Importantes

1. **Mode Développement** : Actuellement, le code s'affiche dans une notification visuelle. En production, remplacez cela par un vrai service d'email.

2. **Sécurité** : Ne jamais afficher le code dans la console ou dans l'interface en production.

3. **Performance** : Les codes sont stockés en mémoire. Pour une application distribuée, utilisez Redis ou une base de données.

4. **Scalabilité** : Pour un grand nombre d'utilisateurs, utilisez un service d'email professionnel avec rate limiting.

## 🔄 Migration depuis l'Ancien Système

Si vous avez déjà un système de connexion :

1. Remplacez `Login.tsx` par `LoginWithVerification.tsx`
2. Mettez à jour les routes dans votre routeur
3. Testez avec quelques utilisateurs pilotes
4. Déployez progressivement

## 📞 Support

Pour toute question ou problème :
- Consultez les logs dans `SecurityLogger`
- Vérifiez la console du navigateur
- Testez avec différents navigateurs

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mars 2026
