import { useState, useEffect } from 'react';

interface SplashToHomeAnimationProps {
  onComplete: () => void;
  children?: React.ReactNode;
}

const SplashToHomeAnimation = ({ onComplete, children }: SplashToHomeAnimationProps) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Attendre 1500ms puis commencer l'expansion
    const expandTimer = setTimeout(() => {
      setIsExpanding(true);
    }, 1500);

    // Afficher le contenu pendant l'expansion
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 2500);

    // Terminer l'animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(contentTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Calculer les dimensions pour que l'hexagone remplisse l'écran
  const finalWidth = isExpanding ? '100vw' : '200px';
  const finalHeight = isExpanding ? '100vh' : '200px';
  const borderRadius = isExpanding ? '0%' : '0%';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#0b1120',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Hexagone qui s'agrandit pour remplir l'écran */}
      <div
        style={{
          position: 'absolute',
          width: finalWidth,
          height: finalHeight,
          background: '#0b1120',
          transition: 'all 2.5s cubic-bezier(0.65, 0, 0.35, 1)',
          clipPath: isExpanding 
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' // Rectangle (écran complet)
            : 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagone
          border: isExpanding ? 'none' : '4px solid #3b82f6',
          boxShadow: isExpanding ? 'none' : '0 0 40px rgba(59, 130, 246, 0.6)',
          willChange: 'width, height, clip-path'
        }}
      />

      {/* Logo "O" qui disparaît */}
      <div
        style={{
          position: 'absolute',
          fontSize: '80px',
          fontWeight: 900,
          color: '#3b82f6',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: isExpanding ? 0 : 1,
          transition: 'opacity 1s ease-out',
          zIndex: 2,
          textShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
          pointerEvents: 'none'
        }}
      >
        O
      </div>

      {/* Contenu de la page qui apparaît progressivement */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 1.5s ease-in',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SplashToHomeAnimation;
