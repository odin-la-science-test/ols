import { useState, useEffect } from 'react';

interface SplashToHomeAnimationProps {
  onComplete: () => void;
}

const SplashToHomeAnimation = ({ onComplete }: SplashToHomeAnimationProps) => {
  const [stage, setStage] = useState<'splash' | 'expanding' | 'complete'>('splash');

  useEffect(() => {
    // Afficher le splash pendant 1.5s
    const splashTimer = setTimeout(() => {
      setStage('expanding');
    }, 1500);

    // Terminer l'animation après 2.5s total
    const completeTimer = setTimeout(() => {
      setStage('complete');
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'complete') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: stage === 'expanding' ? 'expandToPage 1s ease-out forwards' : 'none'
      }}
    >
      <div
        style={{
          width: stage === 'splash' ? '200px' : '100%',
          height: stage === 'splash' ? '200px' : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: stage === 'expanding' ? 'scale(10)' : 'scale(1)',
          opacity: stage === 'expanding' ? 0 : 1
        }}
      >
        {/* Hexagone avec bordure bleue */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(0, 245, 255, 0.5))'
          }}
        >
          {/* Hexagone */}
          <polygon
            points="100,20 170,60 170,140 100,180 30,140 30,60"
            fill="#000000"
            stroke="#00f5ff"
            strokeWidth="3"
          />
          
          {/* Logo "O" */}
          <text
            x="100"
            y="125"
            fontSize="80"
            fontWeight="800"
            fill="#00f5ff"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            O
          </text>
        </svg>
      </div>

      <style>{`
        @keyframes expandToPage {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashToHomeAnimation;
