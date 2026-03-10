import { useState } from 'react';
import { Book, BookOpen, FileText, Search, Filter, ArrowLeft, Download, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { UniversityCard } from '../../../components/university/UniversityCard';
import type { LibraryItem } from '../../../types/university';

const LibraryCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [items] = useState<LibraryItem[]>([
    {
      id: '1',
      type: 'book',
      title: 'Biologie Moléculaire de la Cellule',
      authors: ['Bruce Alberts', 'Alexander Johnson', 'Julian Lewis'],
      publisher: 'Garland Science',
      publicationDate: new Date('2022-01-15'),
      isbn: '978-0815344643',
      subjects: ['Biologie', 'Biologie Moléculaire', 'Cellule'],
      copies: [
        { id: 'C1', location: 'Salle A - Rayon 12', status: 'available' },
        { id: 'C2', location: 'Salle A - Rayon 12', status: 'borrowed', dueDate: new Date('2024-07-01') },
        { id: 'C3', location: 'Salle A - Rayon 12', status: 'available' }
      ]
    },
    {
      id: '2',
      type: 'journal',
      title: 'Nature Biotechnology',
      authors: ['Nature Publishing Group'],
      publisher: 'Nature',
      publicationDate: new Date('2024-03-01'),
      subjects: ['Biotechnologie', 'Recherche'],
      copies: [
        { id: 'J1', location: 'Périodiques - Rayon 3', status: 'available' }
      ]
    },
    {
      id: '3',
      type: 'ebook',
      title: 'Introduction à la Microbiologie',
      authors: ['Gerard Tortora', 'Berdell Funke'],
      publisher: 'Pearson',
      publicationDate: new Date('2023-06-10'),
      isbn: '978-0134605180',
      subjects: ['Microbiologie', 'Bactériologie'],
      copies: [
        { id: 'E1', location: 'Ressource numérique', status: 'available' }
      ]
    },
    {
      id: '4',
      type: 'thesis',
      title: 'Étude des mécanismes de résistance aux antibiotiques',
      authors: ['Marie Dupont'],
      publisher: 'Université Paris-Saclay',
      publicationDate: new Date('2023-12-15'),
      subjects: ['Microbiologie', 'Antibiotiques', 'Résistance'],
      copies: [
        { id: 'T1', location: 'Thèses - Rayon 5', status: 'available' }
      ]
    },
    {
      id: '5',
      type: 'article',
      title: 'CRISPR-Cas9: A Revolutionary Gene Editing Tool',
      authors: ['Jennifer Doudna', 'Emmanuelle Charpentier'],
      publisher: 'Science',
      publicationDate: new Date('2023-08-20'),
      doi: '10.1126/science.1258096',
      subjects: ['Génétique', 'CRISPR', 'Édition génomique'],
      copies: [
        { id: 'A1', location: 'Base de données en ligne', status: 'available' }
      ]
    },
    {
      id: '6',
      type: 'book',
      title: 'Chimie Organique',
      authors: ['Paula Yurkanis Bruice'],
      publisher: 'Pearson',
      publicationDate: new Date('2022-09-01'),
      isbn: '978-0134042282',
      subjects: ['Chimie', 'Chimie Organique'],
      copies: [
        { id: 'C4', location: 'Salle B - Rayon 8', status: 'reserved' },
        { id: 'C5', location: 'Salle B - Rayon 8', status: 'available' }
      ]
    }
  ]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    const hasAvailable = item.copies.some(c => c.status === 'available');
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && hasAvailable) ||
                         (filterStatus === 'borrowed' && !hasAvailable);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: items.length,
    books: items.filter(i => i.type === 'book').length,
    ebooks: items.filter(i => i.type === 'ebook').length,
    available: items.filter(i => i.copies.some(c => c.status === 'available')).length
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      book: 'Livre',
      journal: 'Revue',
      article: 'Article',
      thesis: 'Thèse',
      ebook: 'E-book'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      book: '#3b82f6',
      journal: '#10b981',
      article: '#f59e0b',
      thesis: '#8b5cf6',
      ebook: '#ec4899'
    };
    return colors[type] || '#6366f1';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      borrowed: 'Emprunté',
      reserved: 'Réservé',
      maintenance: 'Maintenance'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: '#10b981',
      borrowed: '#f59e0b',
      reserved: '#3b82f6',
      maintenance: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getAvailableCopies = (item: LibraryItem) => {
    return item.copies.filter(c => c.status === 'available').length;
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/hugin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={20} />
          Retour à Hugin
        </button>

        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Book size={40} />
            Bibliothèque Universitaire
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Catalogue et ressources numériques
          </p>
        </header>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Book size={24} style={{ color: 'var(--accent-hugin)' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                {stats.total}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total ressources
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <BookOpen size={24} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.books}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Livres physiques
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <FileText size={24} style={{ color: '#ec4899' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ec4899' }}>
                {stats.ebooks}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              E-books
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.available}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Disponibles
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un livre, auteur, sujet..."
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les types</option>
            <option value="book">Livres</option>
            <option value="ebook">E-books</option>
            <option value="journal">Revues</option>
            <option value="article">Articles</option>
            <option value="thesis">Thèses</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="borrowed">Emprunté</option>
          </select>
        </div>

        {/* Items Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="card glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => alert(`Détails de "${item.title}" - Fonctionnalité à venir`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {item.authors.join(', ')}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {item.publisher} • {item.publicationDate.getFullYear()}
                  </p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: `${getTypeColor(item.type)}20`,
                  border: `1px solid ${getTypeColor(item.type)}`,
                  borderRadius: '1rem',
                  color: getTypeColor(item.type),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {getTypeLabel(item.type)}
                </span>
              </div>

              {item.isbn && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  ISBN: {item.isbn}
                </div>
              )}

              {item.doi && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  DOI: {item.doi}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {item.subjects.slice(0, 3).map((subject, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.25rem 0.6rem',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--accent-hugin)'
                    }}
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {getAvailableCopies(item)} / {item.copies.length} exemplaire{item.copies.length > 1 ? 's' : ''}
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    background: `${getStatusColor(getAvailableCopies(item) > 0 ? 'available' : 'borrowed')}20`,
                    border: `1px solid ${getStatusColor(getAvailableCopies(item) > 0 ? 'available' : 'borrowed')}`,
                    borderRadius: '0.5rem',
                    color: getStatusColor(getAvailableCopies(item) > 0 ? 'available' : 'borrowed'),
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {getAvailableCopies(item) > 0 ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {item.type === 'ebook' || item.type === 'article' ? (
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Accéder à la ressource - Fonctionnalité à venir');
                      }}
                    >
                      <ExternalLink size={16} />
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Réserver - Fonctionnalité à venir');
                      }}
                      disabled={getAvailableCopies(item) === 0}
                    >
                      Réserver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="card glass-panel" style={{ 
            padding: '3rem', 
            textAlign: 'center'
          }}>
            <Book size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aucune ressource trouvée
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryCatalog;
