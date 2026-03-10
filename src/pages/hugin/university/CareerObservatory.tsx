import { useState } from 'react';
import { TrendingUp, Briefcase, MapPin, DollarSign } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const CareerObservatory = () => {
  const [outcomes] = useState([
    {
      graduationYear: 2025,
      programName: 'Master Biotechnologies',
      totalGraduates: 45,
      employmentRate: 92,
      avgSalary: 35000,
      sectors: [
        { sector: 'Pharmaceutique', percentage: 40, avgSalary: 38000 },
        { sector: 'Recherche', percentage: 35, avgSalary: 32000 },
        { sector: 'Agroalimentaire', percentage: 25, avgSalary: 34000 }
      ]
    }
  ]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TrendingUp size={40} />
            Observatoire des Débouchés
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Insertion professionnelle et carrières</p>
        </header>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {outcomes.map((outcome, index) => (
            <div key={index} className="card glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{outcome.programName} - Promotion {outcome.graduationYear}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card glass-panel" style={{ padding: '1.5rem' }}>
                  <Briefcase size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{outcome.employmentRate}%</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Taux d'emploi</div>
                </div>
                <div className="card glass-panel" style={{ padding: '1.5rem' }}>
                  <DollarSign size={24} style={{ color: 'var(--accent-hugin)', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>{outcome.avgSalary}€</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Salaire moyen</div>
                </div>
              </div>

              <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Répartition par secteur</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {outcome.sectors.map((sector, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{sector.sector}</span>
                      <span style={{ color: 'var(--accent-hugin)', fontWeight: 700 }}>{sector.percentage}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${sector.percentage}%`, background: 'var(--accent-hugin)' }} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Salaire moyen: {sector.avgSalary}€
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerObservatory;
