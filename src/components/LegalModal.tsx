import React from 'react';
import { X, FileText, Shield, CheckCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isTerms = type === 'terms';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '1.5rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-color)',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '1.5rem 1.5rem 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isTerms ? (
              <FileText size={28} color="#667eea" />
            ) : (
              <Shield size={28} color="#667eea" />
            )}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isTerms ? "Conditions d'Utilisation" : 'Politique de Confidentialité (RGPD)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '2rem',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            lineHeight: 1.7,
          }}
        >
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '0 0 1.5rem 1.5rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <CheckCircle size={20} />
            J'ai compris
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const TermsContent = () => (
  <div>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      Dernière mise à jour : 17 février 2026
    </p>

    <Section title="1. Acceptation des Conditions">
      <p>
        En accédant et en utilisant Odin La Science, vous acceptez d'être lié par ces conditions
        d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre
        plateforme.
      </p>
    </Section>

    <Section title="2. Description du Service">
      <p>
        Odin La Science est une plateforme scientifique complète offrant des outils pour la
        recherche, la gestion de laboratoire, et l'analyse de données scientifiques. Nos services
        incluent :
      </p>
      <ul>
        <li>Munin Atlas - Encyclopédie scientifique interactive</li>
        <li>Hugin Core - Outils de gestion et collaboration</li>
        <li>Hugin Lab - Gestion de laboratoire avancée</li>
        <li>Hugin Analysis - Outils d'analyse scientifique</li>
      </ul>
    </Section>

    <Section title="3. Comptes Utilisateurs">
      <p>
        Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable
        de :
      </p>
      <ul>
        <li>Maintenir la confidentialité de vos identifiants</li>
        <li>Toutes les activités effectuées sous votre compte</li>
        <li>Notifier immédiatement toute utilisation non autorisée</li>
        <li>Fournir des informations exactes et à jour</li>
      </ul>
    </Section>

    <Section title="4. Utilisation Acceptable">
      <p>Vous vous engagez à NE PAS :</p>
      <ul>
        <li>Utiliser la plateforme à des fins illégales</li>
        <li>Tenter d'accéder à des systèmes non autorisés</li>
        <li>Interférer avec le fonctionnement de la plateforme</li>
        <li>Partager du contenu offensant ou inapproprié</li>
        <li>Violer les droits de propriété intellectuelle</li>
        <li>Utiliser des bots ou scripts automatisés sans autorisation</li>
      </ul>
    </Section>

    <Section title="5. Propriété Intellectuelle">
      <p>
        Tous les contenus, logos, marques et données de la plateforme sont la propriété d'Odin La
        Science ou de ses concédants de licence. Vous conservez la propriété de vos données
        scientifiques, mais nous accordez une licence pour les traiter et les afficher.
      </p>
    </Section>

    <Section title="6. Abonnements et Paiements">
      <p>
        Les abonnements sont facturés mensuellement ou annuellement selon votre choix. Les prix
        peuvent être modifiés avec un préavis de 30 jours. Les remboursements sont possibles dans
        les 14 jours suivant l'achat initial.
      </p>
    </Section>

    <Section title="7. Limitation de Responsabilité">
      <p>
        Odin La Science est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas
        responsables des dommages directs, indirects, ou consécutifs résultant de l'utilisation de
        la plateforme.
      </p>
    </Section>

    <Section title="8. Résiliation">
      <p>
        Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation de
        ces conditions. Vous pouvez résilier votre compte à tout moment depuis les paramètres.
      </p>
    </Section>

    <Section title="9. Modifications">
      <p>
        Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront
        notifiées par email. L'utilisation continue de la plateforme après modification constitue
        votre acceptation.
      </p>
    </Section>

    <Section title="10. Contact">
      <p>
        Pour toute question concernant ces conditions, contactez-nous à :{' '}
        <a href="mailto:legal@odin-la-science.com" style={{ color: '#667eea' }}>
          legal@odin-la-science.com
        </a>
      </p>
    </Section>
  </div>
);

const PrivacyContent = () => (
  <div>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      Dernière mise à jour : 17 février 2026 | Conforme au RGPD (UE) 2016/679
    </p>

    <Section title="1. Responsable du Traitement">
      <p>
        <strong>Odin La Science</strong>
        <br />
        Email : dpo@odin-la-science.com
        <br />
        Délégué à la Protection des Données (DPO) : privacy@odin-la-science.com
      </p>
    </Section>

    <Section title="2. Données Collectées">
      <p>Nous collectons les données suivantes :</p>
      <ul>
        <li>
          <strong>Données d'identification :</strong> Nom, prénom, email, téléphone
        </li>
        <li>
          <strong>Données de connexion :</strong> Adresse IP, logs, cookies
        </li>
        <li>
          <strong>Données d'utilisation :</strong> Historique de navigation, préférences
        </li>
        <li>
          <strong>Données scientifiques :</strong> Données de recherche que vous saisissez
        </li>
        <li>
          <strong>Données de paiement :</strong> Informations de facturation (via processeur
          sécurisé)
        </li>
      </ul>
    </Section>

    <Section title="3. Finalités du Traitement">
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Fournir et améliorer nos services</li>
        <li>Gérer votre compte et votre abonnement</li>
        <li>Communiquer avec vous (support, notifications)</li>
        <li>Assurer la sécurité de la plateforme</li>
        <li>Respecter nos obligations légales</li>
        <li>Analyser l'utilisation pour améliorer l'expérience</li>
      </ul>
    </Section>

    <Section title="4. Base Légale du Traitement">
      <p>Nous traitons vos données sur la base de :</p>
      <ul>
        <li>
          <strong>Contrat :</strong> Exécution du contrat d'abonnement
        </li>
        <li>
          <strong>Consentement :</strong> Pour les cookies non essentiels et marketing
        </li>
        <li>
          <strong>Intérêt légitime :</strong> Sécurité, amélioration des services
        </li>
        <li>
          <strong>Obligation légale :</strong> Conformité fiscale et réglementaire
        </li>
      </ul>
    </Section>

    <Section title="5. Durée de Conservation">
      <ul>
        <li>
          <strong>Données de compte :</strong> Pendant la durée de votre abonnement + 3 ans
        </li>
        <li>
          <strong>Données de facturation :</strong> 10 ans (obligation légale)
        </li>
        <li>
          <strong>Logs de sécurité :</strong> 1 an
        </li>
        <li>
          <strong>Cookies :</strong> 13 mois maximum
        </li>
      </ul>
    </Section>

    <Section title="6. Vos Droits (RGPD)">
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Droit d'accès :</strong> Obtenir une copie de vos données
        </li>
        <li>
          <strong>Droit de rectification :</strong> Corriger vos données inexactes
        </li>
        <li>
          <strong>Droit à l'effacement :</strong> Supprimer vos données ("droit à l'oubli")
        </li>
        <li>
          <strong>Droit à la limitation :</strong> Limiter le traitement de vos données
        </li>
        <li>
          <strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré
        </li>
        <li>
          <strong>Droit d'opposition :</strong> S'opposer au traitement de vos données
        </li>
        <li>
          <strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout
          moment
        </li>
      </ul>
      <p style={{ marginTop: '1rem' }}>
        Pour exercer ces droits, contactez-nous à :{' '}
        <a href="mailto:privacy@odin-la-science.com" style={{ color: '#667eea' }}>
          privacy@odin-la-science.com
        </a>
      </p>
    </Section>

    <Section title="7. Partage des Données">
      <p>Nous ne vendons jamais vos données. Nous les partageons uniquement avec :</p>
      <ul>
        <li>
          <strong>Prestataires de services :</strong> Hébergement, paiement, analytics (sous
          contrat strict)
        </li>
        <li>
          <strong>Autorités légales :</strong> Si requis par la loi
        </li>
        <li>
          <strong>Votre organisation :</strong> Si vous utilisez un compte professionnel
        </li>
      </ul>
    </Section>

    <Section title="8. Transferts Internationaux">
      <p>
        Vos données sont hébergées dans l'Union Européenne. Tout transfert hors UE est encadré par
        des clauses contractuelles types approuvées par la Commission Européenne.
      </p>
    </Section>

    <Section title="9. Sécurité">
      <p>Nous mettons en œuvre des mesures de sécurité robustes :</p>
      <ul>
        <li>Chiffrement AES-256 pour les données sensibles</li>
        <li>Authentification sécurisée avec protection contre la force brute</li>
        <li>Surveillance 24/7 et détection d'intrusion</li>
        <li>Sauvegardes régulières et chiffrées</li>
        <li>Audits de sécurité réguliers</li>
      </ul>
    </Section>

    <Section title="10. Cookies">
      <p>Nous utilisons des cookies pour :</p>
      <ul>
        <li>
          <strong>Essentiels :</strong> Fonctionnement de la plateforme (pas de consentement
          requis)
        </li>
        <li>
          <strong>Fonctionnels :</strong> Mémoriser vos préférences
        </li>
        <li>
          <strong>Analytics :</strong> Comprendre l'utilisation (anonymisés)
        </li>
        <li>
          <strong>Marketing :</strong> Personnaliser le contenu (avec consentement)
        </li>
      </ul>
      <p style={{ marginTop: '1rem' }}>
        Vous pouvez gérer vos préférences de cookies dans les paramètres.
      </p>
    </Section>

    <Section title="11. Mineurs">
      <p>
        Notre service n'est pas destiné aux personnes de moins de 16 ans. Si vous avez connaissance
        qu'un mineur a fourni des données, contactez-nous immédiatement.
      </p>
    </Section>

    <Section title="12. Modifications">
      <p>
        Nous pouvons modifier cette politique. Les modifications importantes seront notifiées par
        email 30 jours avant leur entrée en vigueur.
      </p>
    </Section>

    <Section title="13. Réclamations">
      <p>
        Vous avez le droit de déposer une réclamation auprès de la CNIL (Commission Nationale de
        l'Informatique et des Libertés) :
        <br />
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
          www.cnil.fr
        </a>
      </p>
    </Section>

    <Section title="14. Contact DPO">
      <p>
        Pour toute question concernant vos données personnelles :
        <br />
        Email :{' '}
        <a href="mailto:dpo@odin-la-science.com" style={{ color: '#667eea' }}>
          dpo@odin-la-science.com
        </a>
        <br />
        Délégué à la Protection des Données
        <br />
        Odin La Science
      </p>
    </Section>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h3
      style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: '#667eea',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <CheckCircle size={20} />
      {title}
    </h3>
    <div style={{ paddingLeft: '1.75rem', color: 'var(--text-secondary)' }}>{children}</div>
  </div>
);

export default LegalModal;
