import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Copy, Check } from 'lucide-react';

const UnitConverter = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('g');
  const [toUnit, setToUnit] = useState('mg');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const units = {
    mass: [
      { value: 'kg', label: 'Kilogramme (kg)', factor: 1000 },
      { value: 'g', label: 'Gramme (g)', factor: 1 },
      { value: 'mg', label: 'Milligramme (mg)', factor: 0.001 },
      { value: 'µg', label: 'Microgramme (µg)', factor: 0.000001 },
      { value: 'ng', label: 'Nanogramme (ng)', factor: 0.000000001 }
    ],
    volume: [
      { value: 'L', label: 'Litre (L)', factor: 1 },
      { value: 'mL', label: 'Millilitre (mL)', factor: 0.001 },
      { value: 'µL', label: 'Microlitre (µL)', factor: 0.000001 }
    ],
    concentration: [
      { value: 'M', label: 'Molaire (M)', factor: 1 },
      { value: 'mM', label: 'Millimolaire (mM)', factor: 0.001 },
      { value: 'µM', label: 'Micromolaire (µM)', factor: 0.000001 },
      { value: 'nM', label: 'Nanomolaire (nM)', factor: 0.000000001 }
    ]
  };

  const allUnits = [...units.mass, ...units.volume, ...units.concentration];

  const convert = () => {
    if (!value || isNaN(Number(value))) {
      setResult('Valeur invalide');
      return;
    }

    const from = allUnits.find(u => u.value === fromUnit);
    const to = allUnits.find(u => u.value === toUnit);

    if (!from || !to) {
      setResult('Unités incompatibles');
      return;
    }

    const baseValue = Number(value) * from.factor;
    const convertedValue = baseValue / to.factor;
    setResult(convertedValue.toExponential(4));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/hugin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Convertisseur d'Unités
          </h1>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Valeur
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez une valeur"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                De
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                {allUnits.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
              <ArrowRightLeft size={24} color="var(--primary-color)" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Vers
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                {allUnits.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
          >
            Convertir
          </button>

          {result && (
            <div style={{
              padding: '1.5rem',
              borderRadius: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid var(--primary-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Résultat
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {result} {toUnit}
                </div>
              </div>
              <button
                onClick={copyResult}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--primary-color)',
                  background: 'transparent',
                  color: 'var(--primary-color)',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
