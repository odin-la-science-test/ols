import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Shield, AlertCircle, CheckCircle, Scale } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';

const TermsOfService = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const c = theme.colors;

    const sections = [
        {
            icon: <FileText size={24} />,
            title: '1. Acceptation des conditions',
            content: `En accédant et en utilisant la plateforme Odin la Science, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.`
        },
        {
            icon: <Shield size={24} />,
            title: '2. Description du service',
            content: `Odin la Science est une plateforme scientifique complète comprenant :
            
• Munin Atlas : Encyclopédie scientifique et gestion des entités
• Hugin Lab : Outils de laboratoire, gestion de cultures et analyses
• Modules d'analyse avancée : Spectrométrie, cytométrie, bioinformatique

La plateforme est destinée aux chercheurs, laboratoires et institutions scientifiques.`
        },
        {
            icon: <CheckCircle size={24} />,
            title: '3. Compte utilisateur',
            content: `3.1. Création de compte
Vous devez créer un compte pour accéder aux services. Vous êtes responsable de :
• La confidentialité de vos identifiants
• Toutes les activités effectuées sous votre compte
• La véracité des informations fournies

3.2. Sécurité
Vous devez :
• Choisir un mot de passe fort
• Ne pas partager vos identifiants
• Nous informer immédiatement de toute utilisation non autorisée`
        },
        {
            icon: <Scale size={24} />,
            title: '4. Utilisation acceptable',
            content: `Vous vous engagez à :
• Utiliser la plateforme uniquement à des fins légales et scientifiques
• Ne pas tenter d'accéder à des données non autorisées
• Ne pas perturber le fonctionnement de la plateforme
• Respecter les droits de propriété intellectuelle
• Ne pas utiliser la plateforme pour des activités malveillantes

Sont interdits :
• Le piratage ou tentative d'intrusion
• L'utilisation de bots ou scripts automatisés non autorisés
• La diffusion de contenu illégal ou offensant
• La revente ou redistribution des services`
        },
        {
            icon: <AlertCircle size={24} />,
            title: '5. Propriété intellectuelle',
            content: `5.1. Contenu de la plateforme
Tous les contenus, designs, logos, et fonctionnalités sont la propriété d'Odin la Science et sont protégés par les lois sur la propriété intellectuelle.

5.2. Vos données
Vous conservez tous les droits sur les données que vous téléchargez. En utilisant la plateforme, vous nous accordez une licence pour stocker et traiter vos données dans le cadre du service.

5.3. Données scientifiques
Les données de Munin Atlas proviennent de sources publiques et sont fournies à titre informatif. Elles sont vérifiées par des laboratoires spécialisés partenaires avant d'être validées par nos propres laboratoires, garantissant ainsi un haut niveau de fiabilité.`
        },
        {
            icon: <FileText size={24} />,
            title: '6. Abonnements et paiements',
            content: `6.1. Plans tarifaires
Différents plans sont disponibles selon vos besoins. Les tarifs sont indiqués en euros (€) et peuvent être facturés mensuellement ou annuellement.

6.2. Paiement
Les paiements sont traités de manière sécurisée. Vous acceptez de fournir des informations de paiement exactes.

6.3. Remboursement
Les remboursements sont possibles dans les 14 jours suivant l'achat initial, sauf utilisation intensive du service.

6.4. Résiliation
Vous pouvez résilier votre abonnement à tout moment. L'accès reste actif jusqu'à la fin de la période payée.`
        },
        {
            icon: <Shield size={24} />,
            title: '7. Confidentialité et sécurité',
            content: `7.1. Protection des données
Nous prenons la sécurité de vos données très au sérieux :
• Chiffrement SSL/TLS pour toutes les communications
• Chiffrement des données sensibles au repos
• Sauvegardes régulières et redondantes
• Accès restreint aux données

7.2. Politique de confidentialité
Consultez notre Politique de Confidentialité (RGPD) pour plus de détails sur le traitement de vos données personnelles.`
        },
        {
            icon: <AlertCircle size={24} />,
            title: '8. Limitation de responsabilité',
            content: `8.1. Disponibilité du service
Nous nous efforçons de maintenir la plateforme disponible 24/7, mais ne garantissons pas une disponibilité ininterrompue.

8.2. Exactitude des données
Les données scientifiques sont vérifiées par des laboratoires spécialisés partenaires puis validées par nos propres laboratoires avant publication. Nous nous engageons à maintenir la plus haute qualité et exactitude des informations fournies. Toutefois, l'utilisateur reste responsable de la validation finale des données dans le cadre de ses propres protocoles de recherche.

8.3. Limitation
Dans la mesure permise par la loi, notre responsabilité est limitée au montant payé pour le service au cours des 12 derniers mois.`
        },
        {
            icon: <FileText size={24} />,
            title: '9. Modifications des conditions',
            content: `Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email. L'utilisation continue de la plateforme après modification constitue votre acceptation des nouvelles conditions.`
        },
        {
            icon: <Scale size={24} />,
            title: '10. Droit applicable',
            content: `Ces conditions sont régies par le droit français. Tout litige sera soumis à la juridiction exclusive des tribunaux français.

En cas de conflit entre la version française et toute traduction, la version française prévaut.`
        },
        {
            icon: <CheckCircle size={24} />,
            title: '11. Contact',
            content: `Pour toute question concernant ces conditions d'utilisation :

Email : legal@odinlascience.com
Adresse : [Adresse de l'entreprise]
Téléphone : [Numéro de téléphone]

Dernière mise à jour : 19 février 2026`
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: c.bgPrimary }}>
            <Navbar />
            
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: c.textSecondary,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginBottom: '2rem',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = c.bgSecondary;
                        e.currentTarget.style.color = c.textPrimary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = c.textSecondary;
                    }}
                >
                    <ChevronLeft size={20} />
                    Retour
                </button>

                {/* Title */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    padding: '2rem',
                    background: c.cardBg,
                    borderRadius: '1rem',
                    border: `1px solid ${c.borderColor}`
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`,
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${c.accentPrimary}44`
                    }}>
                        <Scale size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        marginBottom: '1rem',
                        background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Conditions d'utilisation
                    </h1>
                    <p style={{
                        color: c.textSecondary,
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Veuillez lire attentivement ces conditions avant d'utiliser Odin la Science
                    </p>
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                        <p style={{
                            color: c.accentPrimary,
                            fontSize: '0.9rem',
                            margin: 0,
                            fontWeight: 600
                        }}>
                            📅 Dernière mise à jour : 19 février 2026
                        </p>
                    </div>
                </div>

                {/* Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            style={{
                                background: c.cardBg,
                                border: `1px solid ${c.borderColor}`,
                                borderRadius: '1rem',
                                padding: '2rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    padding: '0.75rem',
                                    background: `${c.accentPrimary}15`,
                                    borderRadius: '0.75rem',
                                    color: c.accentPrimary,
                                    flexShrink: 0
                                }}>
                                    {section.icon}
                                </div>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: c.textPrimary,
                                    margin: 0
                                }}>
                                    {section.title}
                                </h2>
                            </div>
                            <div style={{
                                color: c.textSecondary,
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-line'
                            }}>
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '3rem',
                    padding: '2rem',
                    background: c.cardBg,
                    borderRadius: '1rem',
                    border: `1px solid ${c.borderColor}`,
                    textAlign: 'center'
                }}>
                    <p style={{
                        color: c.textSecondary,
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem'
                    }}>
                        En utilisant Odin la Science, vous acceptez ces conditions d'utilisation.
                        <br />
                        Pour toute question, contactez-nous à legal@odinlascience.com
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '1rem 2rem',
                            background: `linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary})`,
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: `0 4px 12px ${c.accentPrimary}44`,
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        J'accepte et je m'inscris
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
