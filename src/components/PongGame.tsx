import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PongGameProps {
  onClose: () => void;
}

export const PongGame: React.FC<PongGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 10;

  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVX: 5,
    ballVY: 5,
    playerSpeed: 0
  });

  const keysRef = useRef({ up: false, down: false });

  const resetBall = useCallback(() => {
    const state = gameStateRef.current;
    state.ballX = CANVAS_WIDTH / 2;
    state.ballY = CANVAS_HEIGHT / 2;
    state.ballVX = (Math.random() > 0.5 ? 1 : -1) * 5;
    state.ballVY = (Math.random() - 0.5) * 8;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Déplacer le joueur
    if (keysRef.current.up && state.playerY > 0) {
      state.playerY -= 8;
    }
    if (keysRef.current.down && state.playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
      state.playerY += 8;
    }

    // IA simple
    const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < state.ballY - 35) {
      state.aiY += 6;
    } else if (aiCenter > state.ballY + 35) {
      state.aiY -= 6;
    }
    state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY));

    // Déplacer la balle
    state.ballX += state.ballVX;
    state.ballY += state.ballVY;

    // Rebond haut/bas
    if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
      state.ballVY *= -1;
    }

    // Collision avec paddle joueur
    if (
      state.ballX <= PADDLE_WIDTH &&
      state.ballY + BALL_SIZE >= state.playerY &&
      state.ballY <= state.playerY + PADDLE_HEIGHT
    ) {
      state.ballVX = Math.abs(state.ballVX) * 1.1;
      const hitPos = (state.ballY - state.playerY) / PADDLE_HEIGHT - 0.5;
      state.ballVY = hitPos * 10;
    }

    // Collision avec paddle IA
    if (
      state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
      state.ballY + BALL_SIZE >= state.aiY &&
      state.ballY <= state.aiY + PADDLE_HEIGHT
    ) {
      state.ballVX = -Math.abs(state.ballVX) * 1.1;
      const hitPos = (state.ballY - state.aiY) / PADDLE_HEIGHT - 0.5;
      state.ballVY = hitPos * 10;
    }

    // Point marqué
    if (state.ballX < 0) {
      setScore(prev => {
        const newScore = { ...prev, ai: prev.ai + 1 };
        if (newScore.ai >= 10) {
          setGameOver(true);
        }
        return newScore;
      });
      resetBall();
    } else if (state.ballX > CANVAS_WIDTH) {
      setScore(prev => {
        const newScore = { ...prev, player: prev.player + 1 };
        if (newScore.player >= 10) {
          setGameOver(true);
        }
        return newScore;
      });
      resetBall();
    }

    // Dessiner
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ligne centrale
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddle joueur
    const playerGradient = ctx.createLinearGradient(0, state.playerY, 0, state.playerY + PADDLE_HEIGHT);
    playerGradient.addColorStop(0, '#6366f1');
    playerGradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = playerGradient;
    ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Paddle IA
    const aiGradient = ctx.createLinearGradient(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, CANVAS_WIDTH - PADDLE_WIDTH, state.aiY + PADDLE_HEIGHT);
    aiGradient.addColorStop(0, '#ef4444');
    aiGradient.addColorStop(1, '#f97316');
    ctx.fillStyle = aiGradient;
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Balle
    ctx.fillStyle = '#fbbf24';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fbbf24';
    ctx.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);
    ctx.shadowBlur = 0;
  }, [gameOver, isPaused, resetBall]);

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    state.aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall();
    setScore({ player: 0, ai: 0 });
    setGameOver(false);
    setIsPaused(false);
  }, [resetBall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, resetGame]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameLoop]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: '#0f0f1e',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        border: '2px solid #fbbf24'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fbbf24' }}>🏓 Pong</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
              Easter Egg débloqué!
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #fbbf24',
              color: '#fbbf24',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            Fermer
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '1rem',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 700
        }}>
          <div style={{ color: '#6366f1' }}>{score.player}</div>
          <div style={{ opacity: 0.3 }}>-</div>
          <div style={{ color: '#ef4444' }}>{score.ai}</div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: '2px solid #fbbf24',
            borderRadius: '0.5rem',
            display: 'block'
          }}
        />

        <div style={{
          marginTop: '1rem',
          color: 'white',
          fontSize: '0.75rem',
          textAlign: 'center',
          opacity: 0.7
        }}>
          {gameOver ? (
            <div>
              <p style={{ 
                color: score.player >= 10 ? '#10b981' : '#ef4444', 
                fontWeight: 700, 
                fontSize: '1rem', 
                margin: '0.5rem 0' 
              }}>
                {score.player >= 10 ? '🎉 Victoire!' : '😢 Défaite!'}
              </p>
              <p>Appuyez sur Entrée pour rejouer</p>
            </div>
          ) : isPaused ? (
            <p style={{ color: '#fbbf24', fontWeight: 700 }}>⏸️ Pause (Espace pour reprendre)</p>
          ) : (
            <p>↑↓ ou W/S pour bouger • Espace pour pause • Premier à 10 gagne</p>
          )}
        </div>
      </div>
    </div>
  );
};
