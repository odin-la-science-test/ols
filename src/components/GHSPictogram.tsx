import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface GHSPictogramProps {
  code: string;
  size?: number;
  name?: string;
}

export const GHSPictogram: React.FC<GHSPictogramProps> = ({ code, size = 32, name }) => {
  const getSymbol = () => {
    switch (code) {
      case 'GHS01': return '💥';
      case 'GHS02': return '🔥';
      case 'GHS03': return '⭕';
      case 'GHS04': return '🗜️';
      case 'GHS05': return '⚗️';
      case 'GHS06': return '☠️';
      case 'GHS07': return '⚠️';
      case 'GHS08': return '🏥';
      case 'GHS09': return '🌍';
      default: return '⚠️';
    }
  };

  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        border: '2px solid #ED1C24',
        borderRadius: '4px',
        fontSize: size * 0.6,
        position: 'relative',
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
      }}
    >
      <span style={{ marginTop: size * 0.15 }}>{getSymbol()}</span>
    </div>
  );
};
