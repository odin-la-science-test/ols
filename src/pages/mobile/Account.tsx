import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building, ChevronRight, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import MobileBottomNav from '../../components/MobileBottomNav';
import Avatar from '../../components/Avatar';
import '../../styles/mobile-app.css';

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  name?: string;
}

const MobileAccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [refreshAvatar, setRefreshAvatar] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData>({});

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setEditedUser(userData);
      } catch (error) {
        const userData = { email: userStr };
        setUser(userData);
        setEditedUser(userData);
      }
    }
  }, [refreshAvatar]);

  const handleSave = () => {
    localStorage.setItem('currentUser', JSON.stringify(editedUser));
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user || {});
    setIsEditing(false);
  };

  const accountFields = [
    {
      icon: User,
      label: 'Prénom',
      key: 'firstName',
      value: user?.firstName || 'Non défini',
      placeholder: 'Entrez votre prénom'
    },
    {
      icon: User,
      label: 'Nom',
      key: 'lastName',
      value: user?.lastName || 'Non défini',
      placeholder: 'Entrez votre nom'
    },
    {
      icon: Mail,
      label: 'Email',
      key: 'email',
      value: user?.email || 'Non défini',
      placeholder: 'email@example.com',
      disabled: true
    },
    {
      icon: Phone,
      label: 'Téléphone',
      key: 'phone',
      value: user?.phone || 'Non défini',
      placeholder: '+33 6 12 34 56 78'
    },
    {
      icon: Building,
      label: 'Département',
      key: 'department',
      value: user?.department || 'Non défini',
      placeholder: 'Votre département'
    }
  ];

  return (
    <div className="mobile-container">
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mobile-text)',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="mobile-title" style={{ marginBottom: 0 }}>Mon Profil</h1>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--mobile-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <Edit size={16} />
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="mobile-content">
        <div className="mobile-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Avatar 
              email={user?.email}
              name={user?.firstName || user?.name}
              size={80}
              editable={true}
              onImageChange={() => setRefreshAvatar(prev => prev + 1)}
            />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)' }}>
            {user?.email || 'email@example.com'}
          </p>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Informations personnelles
        </h2>

        {accountFields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div
              key={index}
              className="mobile-list-item"
              style={{ marginBottom: '0.75rem', cursor: field.disabled ? 'default' : 'pointer' }}
            >
              <div className="mobile-icon mobile-icon-primary" style={{ width: '40px', height: '40px' }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.25rem' }}>
                  {field.label}
                </p>
                {isEditing && !field.disabled ? (
                  <input
                    type="text"
                    value={editedUser[field.key as keyof UserData] || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--mobile-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--mobile-text)',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {field.value}
                  </p>
                )}
              </div>
              {!isEditing && !field.disabled && (
                <ChevronRight size={20} style={{ color: 'var(--mobile-text-secondary)' }} />
              )}
            </div>
          );
        })}

        {isEditing && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={handleCancel}
              className="mobile-btn"
              style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              <X size={20} />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="mobile-btn mobile-btn-primary"
              style={{ flex: 1 }}
            >
              <Save size={20} />
              Enregistrer
            </button>
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--mobile-text-secondary)', marginBottom: '0.5rem' }}>
            💡 Astuce
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            Cliquez sur la photo de profil pour la modifier. Les informations sont sauvegardées automatiquement.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--mobile-text-secondary)' }}>
            Odin La Science v1.0.0
          </p>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MobileAccountPage;
