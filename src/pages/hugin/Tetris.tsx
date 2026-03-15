import { useRef, useEffect } from 'react';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Tetris.css';

// Canvas dimensions
const WIDTH = 400;
const HEIGHT = 600;
const TOPBAR_HEIGHT = 80;

// Grid dimensions
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;
const CENTER_X = Math.floor(COLS / 2);

// Frame rate
const FRAME_RATE = 1000 / 20;

// Types
type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
type Color = string;
type KeyboardKey = 'left' | 'right' | 'down' | 'space' | 'rotate' | null;
type Position = { x: number; y: number };
type Row = Color | null;
type Field = Row[][];

type Piece = {
    type: PieceType;
    color: Color;
    positions: Position[];
    center: number;
};

type TetrisGame = {
    isGameOver: boolean;
    score: number;
    rowsScored: number;
    piece: Piece;
    ghost: Piece;
    field: Field;
    fallRate: number;
    lastTick: number;
    keyboardKey: KeyboardKey | null;
};

const Tetris = () => {
    const navigate = useNavigate();
    
    // Game State
    const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    const [activePiece, setActivePiece] = useState<{ pos: { x: number, y: number }, shape: number[][], color: string, type: PieceType } | null>(null);
    const [nextPieceType, setNextPieceType] = useState<PieceType>(Object.keys(TETROMINOES)[Math.floor(Math.random() * 7)] as PieceType);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const speedRef = useRef(INITIAL_SPEED);

    // Helpers
    const getRandomPiece = useCallback(() => {
        const types = Object.keys(TETROMINOES) as PieceType[];
        const type = nextPieceType;
        setNextPieceType(types[Math.floor(Math.random() * types.length)]);
        return {
            pos: { x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type].shape[0].length / 2), y: 0 },
            shape: TETROMINOES[type].shape,
            color: TETROMINOES[type].color,
            type
        };
    }, [nextPieceType]);

    const checkCollision = useCallback((pos: { x: number, y: number }, shape: number[][], currentGrid: string[][]) => {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = pos.x + x;
                    const newY = pos.y + y;
                    
                    if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                    if (newY >= 0 && currentGrid[newY][newX] !== '') return true;
                }
            }
        }
        return false;
    }, []);

    const rotate = useCallback((matrix: number[][]) => {
        const rotated = matrix[0].map((_, index) => matrix.map(col => col[index]).reverse());
        return rotated;
    }, []);

    const spawnPiece = useCallback(() => {
        const newPiece = getRandomPiece();
        if (checkCollision(newPiece.pos, newPiece.shape, grid)) {
            setIsGameOver(true);
            return;
        }
        setActivePiece(newPiece);
    }, [getRandomPiece, checkCollision, grid]);

    const clearLines = useCallback((currentGrid: string[][]) => {
        let clearedCount = 0;
        const newGrid = currentGrid.filter(row => {
            const isFull = row.every(cell => cell !== '');
            if (isFull) clearedCount++;
            return !isFull;
        });

        while (newGrid.length < ROWS) {
            newGrid.unshift(Array(COLS).fill(''));
        }

        if (clearedCount > 0) {
            const points = [0, 100, 300, 500, 800][clearedCount] * level;
            setScore(prev => prev + points);
            setLines(prev => {
                const newLines = prev + clearedCount;
                if (Math.floor(newLines / 10) > Math.floor(prev / 10)) {
                    setLevel(l => l + 1);
                    speedRef.current = Math.max(MIN_SPEED, INITIAL_SPEED - (level * SPEED_INCREMENT));
                }
                return newLines;
            });
        }

        return newGrid;
    }, [level]);

    const lockPiece = useCallback(() => {
        if (!activePiece) return;

        const newGrid = grid.map(row => [...row]);
        activePiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const gridY = activePiece.pos.y + y;
                    const gridX = activePiece.pos.x + x;
                    if (gridY >= 0) {
                        newGrid[gridY][gridX] = activePiece.color;
                    }
                }
            });
        });

        const finalGrid = clearLines(newGrid);
        setGrid(finalGrid);
        setActivePiece(null);
        spawnPiece();
    }, [activePiece, grid, spawnPiece, clearLines]);

    const move = useCallback((dir: { x: number, y: number }) => {
        if (!activePiece || isGameOver || isPaused) return;

        const newPos = { x: activePiece.pos.x + dir.x, y: activePiece.pos.y + dir.y };
        if (!checkCollision(newPos, activePiece.shape, grid)) {
            setActivePiece(prev => prev ? { ...prev, pos: newPos } : null);
        } else if (dir.y > 0) {
            lockPiece();
        }
    }, [activePiece, isGameOver, isPaused, checkCollision, grid, lockPiece]);

    const handleRotate = useCallback(() => {
        if (!activePiece || isGameOver || isPaused) return;

        const rotatedShape = rotate(activePiece.shape);
        if (!checkCollision(activePiece.pos, rotatedShape, grid)) {
            setActivePiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
        }
    }, [activePiece, isGameOver, isPaused, rotate, checkCollision, grid]);

    const handleKey = useCallback((e: KeyboardEvent) => {
        if (isGameOver) return;

        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '];
        if (keys.includes(e.key)) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowLeft': move({ x: -1, y: 0 }); break;
            case 'ArrowRight': move({ x: 1, y: 0 }); break;
            case 'ArrowDown': move({ x: 0, y: 1 }); break;
            case 'ArrowUp': handleRotate(); break;
            case ' ': // Hard drop
                if (!activePiece) return;
                let currentY = activePiece.pos.y;
                while (!checkCollision({ x: activePiece.pos.x, y: currentY + 1 }, activePiece.shape, grid)) {
                    currentY++;
                }
                setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: currentY } } : null);
                // We need to trigger lockPiece immediately after this state update, but for now we let the loop handle it
                break;
            case 'p': setIsPaused(prev => !prev); break;
        }
    }, [activePiece, grid, isGameOver, move, handleRotate, checkCollision]);

    // Game Loop
    useEffect(() => {
        if (isGameOver || isPaused) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return;
        }

        if (!activePiece) {
            spawnPiece();
            return;
        }

        gameLoopRef.current = setInterval(() => {
            move({ x: 0, y: 1 });
        }, speedRef.current);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [activePiece, isGameOver, isPaused, spawnPiece, move]);

    // Input listening
    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    const resetGame = () => {
        setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
        setScore(0);
        setLevel(1);
        setLines(0);
        setIsGameOver(false);
        setIsPaused(false);
        speedRef.current = INITIAL_SPEED;
        setActivePiece(null);
    };

    return (
        <div className="tetris-container">
            <Navbar />
            
            <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                    <Gamepad2 size={40} className="text-gradient" />
                    <h1 className="text-gradient" style={{ fontSize: '3rem', margin: 0, fontWeight: 900 }}>TETRIS</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Original Scientific Break</p>
            </header>

            <div className="tetris-layout">
                {/* Score & Level (Left) */}
                <div className="tetris-sidebar">
                    <div className="tetris-info-panel">
                        <div className="info-label"><Trophy size={14} style={{ marginRight: 5 }} /> Score</div>
                        <div className="info-value" style={{ color: '#ffcc00' }}>{score}</div>
                    </div>
                    
                    <div className="tetris-info-panel">
                        <div className="info-label"><Gauge size={14} style={{ marginRight: 5 }} /> Level</div>
                        <div className="info-value" style={{ color: '#00ccff' }}>{level}</div>
                    </div>

                    <div className="tetris-info-panel">
                        <div className="info-label">Lines</div>
                        <div className="info-value">{lines}</div>
                    </div>
                </div>

                {/* Main Board */}
                <div style={{ position: 'relative' }}>
                    <div className="tetris-board">
                        {grid.map((row, y) => (
                            row.map((cell, x) => {
                                // Draw active piece
                                let color = cell;
                                if (activePiece) {
                                    const { pos, shape, color: pieceColor } = activePiece;
                                    if (y >= pos.y && y < pos.y + shape.length &&
                                        x >= pos.x && x < pos.x + shape[0].length) {
                                        if (shape[y - pos.y][x - pos.x] !== 0) {
                                            color = pieceColor;
                                        }
                                    }
                                }
                                
                                return (
                                    <div 
                                        key={`${y}-${x}`} 
                                        className={`tetris-cell ${color ? 'filled' : ''}`}
                                        style={{ backgroundColor: color ? `${color}44` : '', color: color, borderColor: color ? color : '' }}
                                    />
                                );
                            })
                        ))}
                    </div>

                    {isPaused && !isGameOver && (
                        <div className="game-over-overlay">
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>PAUSE</h2>
                            <button className="btn-restart" onClick={() => setIsPaused(false)}>
                                <Play size={20} style={{ marginRight: 10 }} /> Reprendre
                            </button>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="game-over-overlay">
                            <h2 className="game-over-title">GAME OVER</h2>
                            <div className="tetris-info-panel" style={{ background: 'transparent', border: 'none', marginBottom: '20px' }}>
                                <div className="info-label">Final Score</div>
                                <div className="info-value" style={{ fontSize: '2.5rem' }}>{score}</div>
                            </div>
                            <button className="btn-restart" onClick={resetGame}>
                                <RotateCcw size={20} style={{ marginRight: 10 }} /> Rejouer
                            </button>
                        </div>
                    )}
                </div>

                {/* Next Piece & Controls (Right) */}
                <div className="tetris-sidebar">
                    <div className="tetris-info-panel">
                        <div className="info-label">Suivant</div>
                        <div className="preview-grid">
                            {TETROMINOES[nextPieceType].shape.map((row, y) => (
                                row.map((cell, x) => (
                                    <div 
                                        key={`next-${y}-${x}`}
                                        className={`preview-cell ${cell ? 'filled' : ''}`}
                                        style={{ backgroundColor: cell ? `${TETROMINOES[nextPieceType].color}aa` : 'transparent', color: TETROMINOES[nextPieceType].color }}
                                    />
                                ))
                            ))}
                        </div>
                    </div>

                    <div className="tetris-controls-hint">
                        <strong>Contrôles :</strong><br />
                        ← → : Déplacement<br />
                        ↑ : Rotation<br />
                        ↓ : Descente rapide<br />
                        Espace : Chute libre<br />
                        P : Pause
                    </div>

                    <button 
                        onClick={() => navigate('/hugin')} 
                        className="btn-primary" 
                        style={{ width: '100%', marginTop: 'auto', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <ArrowLeft size={16} style={{ marginRight: 8 }} /> Retour Hugin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tetris;
