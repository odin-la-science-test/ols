import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Eye, Database, UserCheck, FileText, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';

const RGPD = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const c = theme.colors;

    const sections = [
        {
            icon: <Shield size={24} />,
            title: '1. Introduction',
            content: `Odin la Science s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.

Cette politique explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles.

Responsable du traitement :
Odin la Science
[Adresse]
Email : privacy@odinlascience.com`
        },
        {
            icon: <Database size={24} />,
            title: '2. Données collectées',
            content: `2.1. Données d'identification
• Nom et prénom
• Adresse email
• Numéro de téléphone (optionnel)
• Nom de l'organisation
• Fonction/Poste

2.2. Données de connexion
• Adresse IP
• Type de navigateur
• Système d'exploitation
• Historique de navigation sur la plateforme
• Cookies et technologies similaires

2.3. Données scientifiques
• Données de recherche téléchargées
• Résultats d'analyses
• Protocoles et notes de laboratoire
• Fichiers et documents

2.4. Données de paiement
• Informations de carte bancaire (traitées par notre prestataire de paiement sécurisé)
• Historique des transactions
• Factures`
        },
        {
            icon: <Eye size={24} />,
            title: '3. Finalités du traitement',
            content: `Nous utilisons vos données pour :

3.1. Fourniture du service
• Créer et gérer votre compte
• Fournir l'accès aux fonctionnalités
• Traiter vos paiements
• Assurer le support technique

3.2. Amélioration du service
• Analyser l'utilisation de la plateforme
• Développer de nouvelles fonctionnalités
• Optimiser les performances

3.3. Communication
• Envoyer des notifications importantes
• Informer des mises à jour
• Répondre à vos demandes

3.4. Sécurité
• Prévenir la fraude
• Détecter les activités suspectes
• Assurer la conformité légale`
        },
        {
            icon: <Lock size={24} />,
            title: '4. Base légale du traitement',
            content: `Nous traitons vos données sur les bases légales suivantes :

• Exécution du contrat : Pour fournir nos services
• Intérêt légitime : Pour améliorer nos services et assurer la sécurité
• Consentement : Pour les communications marketing (optionnel)
• Obligation légale : Pour respecter nos obligations fiscales et comptables`
        },
        {
            icon: <UserCheck size={24} />,
            title: '5. Vos droits',
            content: `Conformément au RGPD, vous disposez des droits suivants :

5.1. Droit d'accès
Vous pouvez demander une copie de vos données personnelles.

5.2. Droit de rectification
Vous pouvez corriger vos données inexactes ou incomplètes.

5.3. Droit à l'effacement
Vous pouvez demander la suppression de vos données dans certaines conditions.

5.4. Droit à la limitation
Vous pouvez demander la limitation du traitement de vos données.

5.5. Droit à la portabilité
Vous pouvez recevoir vos données dans un format structuré et lisible.

5.6. Droit d'opposition
Vous pouvez vous opposer au traitement de vos données pour des raisons légitimes.

5.7. Droit de retirer votre consentement
Vous pouvez retirer votre consentement à tout moment.

Pour exercer vos droits, contactez-nous à : privacy@odinlascience.com`
        },
        {
            icon: <Shield size={24} />,
            title: '6. Sécurité des données',
            content: `Nous mettons en œuvre des mesures de sécurité robustes :

6.1. Mesures techniques
• Chiffrement SSL/TLS pour toutes les communications
• Chiffrement AES-256 des données sensibles au repos
• Authentification à deux facteurs (2FA)
• Pare-feu et systèmes de détection d'intrusion
• Sauvegardes quotidiennes chiffrées

6.2. Mesures organisationnelles
• Accès restreint aux données (principe du moindre privilège)
• Formation du personnel à la sécurité
• Audits de sécurité réguliers
• Procédures de gestion des incidents

6.3. Hébergement
Nos serveurs sont hébergés dans l'Union Européenne chez des prestataires certifiés ISO 27001.`
        },
        {
            icon: <Database size={24} />,
            title: '7. Conservation des données',
            content: `Nous conservons vos données pendant les durées suivantes :

• Données de compte : Pendant la durée de votre abonnement + 3 ans
• Données scientifiques : Selon vos paramètres (suppression possible à tout moment)
• Données de paiement : 10 ans (obligation légale comptable)
• Logs de connexion : 12 mois
• Cookies : 13 mois maximum

Après ces périodes, vos données sont supprimées ou anonymisées de manière irréversible.`
        },
        {
            icon: <FileText size={24} />,
            title: '8. Partage des données',
            content: `Nous ne vendons jamais vos données personnelles.

Nous pouvons partager vos données avec :

8.1. Prestataires de services
• Hébergement (serveurs UE)
• Paiement (prestataire certifié PCI-DSS)
• Support technique
• Analyse (données anonymisées)

Tous nos prestataires sont soumis à des obligations contractuelles strictes de confidentialité.

8.2. Obligations légales
Nous pouvons divulguer vos données si requis par la loi ou pour :
• Répondre à une demande judiciaire
• Protéger nos droits légaux
• Prévenir la fraude`
        },
        {
            icon: <Eye size={24} />,
            title: '9. Cookies et technologies similaires',
            content: `Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme.

9.1. Cookies essentiels (obligatoires)
• Authentification et gestion de session
• Sécurité et prévention de la fraude
• Préférences de sécurité
• Fonctionnement technique du site

9.2. Cookies fonctionnels (optionnels)
• Mémorisation de vos préférences (thème, langue)
• Sauvegarde de vos favoris et raccourcis
• Personnalisation de l'interface

9.3. Cookies analytiques (optionnels)
• Analyse de l'utilisation du site
• Statistiques de performance
• Amélioration de l'expérience utilisateur
• Identification des problèmes techniques

9.4. Cookies marketing (optionnels)
• Personnalisation des contenus
• Mesure de l'efficacité des campagnes
• Publicités ciblées (si applicable)

9.5. Gestion des cookies
Vous pouvez gérer vos préférences de cookies à tout moment via :
• Le bandeau de consentement lors de votre première visite
• Les paramètres de votre navigateur
• Notre page de gestion des cookies

9.6. Durée de conservation
• Cookies de session : Supprimés à la fermeture du navigateur
• Cookies persistants : Maximum 13 mois
• Cookie de consentement : 12 mois

9.7. Refus des cookies
Vous pouvez refuser les cookies non essentiels sans impact sur les fonctionnalités principales du site. Cependant, certaines fonctionnalités avancées peuvent être limitées.`
        },
        {
            icon: <AlertTriangle size={24} />,
            title: '10. Transferts internationaux',
            content: `Vos données sont stockées et traitées dans l'Union Européenne.

En cas de transfert hors UE (rare), nous garantissons un niveau de protection adéquat via :
• Clauses contractuelles types de la Commission Européenne
• Certification Privacy Shield (si applicable)
• Décision d'adéquation de la Commission Européenne`
        },
        {
            icon: <UserCheck size={24} />,
            title: '11. Mineurs',
            content: `Nos services ne sont pas destinés aux personnes de moins de 18 ans.

Si vous avez moins de 18 ans, vous devez obtenir le consentement de vos parents ou tuteurs légaux avant d'utiliser la plateforme.`
        },
        {
            icon: <FileText size={24} />,
            title: '12. Modifications de la politique',
            content: `Nous pouvons modifier cette politique de confidentialité.

Les modifications importantes seront notifiées par :
• Email
• Notification sur la plateforme
• Bannière d'information

La version mise à jour sera toujours disponible sur cette page avec la date de dernière modification.`
        },
        {
            icon: <Mail size={24} />,
            title: '13. Contact et réclamations',
            content: `13.1. Délégué à la Protection des Données (DPO)
Email : dpo@odinlascience.com
Adresse : [Adresse]

13.2. Exercice de vos droits
Pour toute demande concernant vos données personnelles :
Email : privacy@odinlascience.com

Nous nous engageons à répondre dans un délai de 30 jours.

13.3. Réclamation auprès de la CNIL
Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL :

Commission Nationale de l'Informatique et des Libertés (CNIL)
3 Place de Fontenoy
TSA 80715
75334 PARIS CEDEX 07
Téléphone : 01 53 73 22 22
Site web : www.cnil.fr`
        },
        {
            icon: <CheckCircle size={24} />,
            title: '14. Informations complémentaires',
            content: `14.1. Profilage
Nous n'effectuons pas de profilage automatisé ou de prise de décision automatisée ayant des effets juridiques.

14.2. Données sensibles
Nous ne collectons pas de données sensibles (origine raciale, opinions politiques, données de santé, etc.) sauf si nécessaire pour le service et avec votre consentement explicite.

14.3. Transparence
Nous nous engageons à être transparents sur nos pratiques de traitement des données.

Dernière mise à jour : 19 février 2026
Version : 1.0`
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
                        background: `linear-gradient(135deg, #10b981, #059669)`,
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px rgba(16, 185, 129, 0.4)`
                    }}>
                        <Shield size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        marginBottom: '1rem',
                        background: `linear-gradient(135deg, #10b981, #059669)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Politique de Confidentialité (RGPD)
                    </h1>
                    <p style={{
                        color: c.textSecondary,
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Protection de vos données personnelles conformément au RGPD
                    </p>
                    <div style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#10b981'
                        }}>
                            🇪🇺 Conforme RGPD
                        </div>
                        <div style={{
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#3b82f6'
                        }}>
                            🔒 Données chiffrées
                        </div>
                        <div style={{
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#8b5cf6'
                        }}>
                            📅 Mise à jour : 19/02/2026
                        </div>
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
                                    background: `rgba(16, 185, 129, 0.15)`,
                                    borderRadius: '0.75rem',
                                    color: '#10b981',
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
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Shield size={24} color="#10b981" />
                        <p style={{
                            color: c.textPrimary,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            margin: 0
                        }}>
                            Vos données sont protégées
                        </p>
                    </div>
                    <p style={{
                        color: c.textSecondary,
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem'
                    }}>
                        Pour toute question sur le traitement de vos données personnelles,
                        <br />
                        contactez notre DPO à dpo@odinlascience.com
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '1rem 2rem',
                                background: `linear-gradient(135deg, #10b981, #059669)`,
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: `0 4px 12px rgba(16, 185, 129, 0.4)`,
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            J'accepte et je m'inscris
                        </button>
                        <button
                            onClick={() => window.open('mailto:privacy@odinlascience.com')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'transparent',
                                border: `1px solid ${c.borderColor}`,
                                borderRadius: '0.75rem',
                                color: c.textPrimary,
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = c.bgSecondary;
                                e.currentTarget.style.borderColor = c.accentPrimary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = c.borderColor;
                            }}
                        >
                            Nous contacter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RGPD;
