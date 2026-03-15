import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 15, y: 15 });
  const gameLoopRef = useRef<number | undefined>(undefined);

  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    foodRef.current = newFood;
  }, [GRID_SIZE]);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    generateFood();
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, [generateFood]);

  const checkCollision = useCallback((head: Position): boolean => {
    // Collision avec les murs
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Collision avec soi-même
    return snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y);
  }, [GRID_SIZE]);

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    const snake = snakeRef.current;
    const head = { ...snake[0] };

    // Déplacer la tête
    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Vérifier les collisions
    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    // Ajouter la nouvelle tête
    snake.unshift(head);

    // Vérifier si on mange la nourriture
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      const newScore = score + 10;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('snake_high_score', newScore.toString());
      }
      generateFood();
    } else {
      // Retirer la queue
      snake.pop();
    }

    // Dessiner
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fond
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grille
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Serpent
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        (segment.x + 1) * CELL_SIZE,
        (segment.y + 1) * CELL_SIZE
      );
      
      if (index === 0) {
        // Tête
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
      } else {
        // Corps
        const opacity = 1 - (index / snake.length) * 0.5;
        gradient.addColorStop(0, `rgba(99, 102, 241, ${opacity})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity})`);
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );

      // Yeux pour la tête
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        const eyeOffset = 6;
        
        if (directionRef.current === 'RIGHT') {
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + 12, eyeSize, eyeSize);
        } else if (directionRef.current === 'LEFT') {
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + 12, eyeSize, eyeSize);
        } else if (directionRef.current === 'UP') {
          ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else {
          ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
        }
      }
    });

    // Nourriture
    const food = foodRef.current;
    const foodGradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    );
    foodGradient.addColorStop(0, '#fbbf24');
    foodGradient.addColorStop(1, '#f59e0b');
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [gameOver, isPaused, score, highScore, checkCollision, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return 'UP';
          case 'ArrowDown':
          case 's':
          case 'S':
            return 'DOWN';
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return 'LEFT';
          case 'ArrowRight':
          case 'd':
          case 'D':
            return 'RIGHT';
          default:
            return null;
        }
      })();

      if (newDirection) {
        e.preventDefault();
        // Empêcher de faire demi-tour
        const opposites: Record<Direction, Direction> = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT'
        };
        if (opposites[directionRef.current] !== newDirection) {
          directionRef.current = newDirection;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, resetGame]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 100);
    gameLoopRef.current = interval as unknown as number;
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
        border: '2px solid #6366f1'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#6366f1' }}>🐍 Snake Game</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
              Easter Egg débloqué!
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #6366f1',
              color: '#6366f1',
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
          justifyContent: 'space-between',
          marginBottom: '1rem',
          color: 'white',
          fontSize: '0.875rem'
        }}>
          <div>Score: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{score}</span></div>
          <div>Record: <span style={{ color: '#6366f1', fontWeight: 700 }}>{highScore}</span></div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            border: '2px solid #6366f1',
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
              <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '1rem', margin: '0.5rem 0' }}>
                Game Over!
              </p>
              <p>Appuyez sur Entrée pour rejouer</p>
            </div>
          ) : isPaused ? (
            <p style={{ color: '#fbbf24', fontWeight: 700 }}>⏸️ Pause (Espace pour reprendre)</p>
          ) : (
            <p>Utilisez les flèches ou WASD • Espace pour pause</p>
          )}
        </div>
      </div>
    </div>
  );
};
