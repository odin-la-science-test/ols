import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, StickyNote } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  color: string;
}

const LabNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const saved = localStorage.getItem('lab_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  const saveNote = () => {
    if (!title.trim() || !content.trim()) {
      alert('Titre et contenu requis');
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString('fr-FR'),
      color: selectedColor
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('lab_notes', JSON.stringify(updated));
    
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  const deleteNote = (id: number) => {
    if (confirm('Supprimer cette note ?')) {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      localStorage.setItem('lab_notes', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/hugin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notes de Labo</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Nouvelle note
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la note" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contenu</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu de la note..." rows={6} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '1rem', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Couleur</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: selectedColor === color ? '3px solid var(--text-primary)' : 'none', background: color, cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={saveNote} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={20} /> Enregistrer
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
            <StickyNote size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Aucune note
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Créez votre première note de labo
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {notes.map(note => (
              <div key={note.id} style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: `4px solid ${note.color}`, position: 'relative' }}>
                <button onClick={() => deleteNote(note.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={18} />
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', paddingRight: '2rem' }}>
                  {note.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {note.date}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabNotes;
