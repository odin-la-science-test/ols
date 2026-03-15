import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { getEquipments } from '../../services/equipmentService';
import type { Equipment } from '../../types/reservationSystem';

interface RoomMap3DProps {
  roomId?: string; // Optionnel : pour filtrer sur une salle spécifique
  onEquipmentClick: (eq: Equipment) => void;
}

// Composant représentant un équipement individuel dans l'espace 3D
function EquipmentNode({ eq, onClick }: { eq: Equipment, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation simple au survol
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        (eq.position3D?.y || 0) + (hovered ? 0.2 : 0),
        0.1
      );
    }
  });

  // Détermination de la couleur en fonction de l'état
  let color = '#3b82f6'; // Bleu par défaut
  let pulseColor = '#60a5fa';

  if (eq.condition === 'OUT_OF_ORDER') {
    color = '#ef4444'; // Rouge
    pulseColor = '#fca5a5';
  } else if (eq.condition === 'MAINTENANCE') {
    color = '#f59e0b'; // Orange
    pulseColor = '#fcd34d';
  } else if (eq.condition === 'AVAILABLE') {
    color = '#10b981'; // Vert
    pulseColor = '#34d399';
  }

  // Geometry en fonction de la catégorie
  const isPrinter = eq.category === 'Imprimante 3D';
  const isLaser = eq.category === 'Laser';
  
  const width = isLaser ? 2 : 1;
  const depth = isLaser ? 1.5 : 1;
  const height = isPrinter ? 1.5 : 0.8;

  return (
    <group position={[eq.position3D?.x || 0, eq.position3D?.y || 0, eq.position3D?.z || 0]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={hovered ? pulseColor : color}
          roughness={0.2}
          metalness={0.5}
          emissive={hovered ? pulseColor : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
        
        {/* Label 3D */}
        <Text
          position={[0, height / 2 + 0.3, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {eq.name}
        </Text>
        
        {/* HTML Tag on hover */}
        {hovered && (
          <Html position={[0, height / 2 + 0.8, 0]} center>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: `1px solid ${color}`,
              color: 'white',
              pointerEvents: 'none',
              width: 'max-content',
              maxWidth: '250px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                {eq.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {eq.condition === 'AVAILABLE' ? '🔴 Cliquez pour réserver' : '⚠️ Maintenance ou HS'}
              </div>
            </div>
          </Html>
        )}
      </mesh>

      {/* Ombre sous l'objet (faké pour la perf) */}
      <mesh position={[0, - (eq.position3D?.y || 0) + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.5, depth + 0.5]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

// Environnement de la salle
function RoomEnvironment() {
  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      
      {/* Grille */}
      <gridHelper args={[20, 20, '#334155', '#0f172a']} />
      
      {/* Murs (simulés par des lignes) */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[20, 4, 0.2]} />
        <meshStandardMaterial color="#0f172a" opacity={0.5} transparent />
      </mesh>
      <mesh position={[-10, 2, 0]}>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#0f172a" opacity={0.5} transparent />
      </mesh>

      {/* Tables simulées */}
      <mesh position={[-2, 0.4, 1]}>
        <boxGeometry args={[5, 0.8, 2]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[2, 0.4, 1]}>
        <boxGeometry args={[5, 0.8, 2]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function RoomMap3D({ roomId, onEquipmentClick }: RoomMap3DProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    let eqs = getEquipments();
    if (roomId) {
      eqs = eqs.filter(e => e.roomId === roomId);
    }
    setEquipments(eqs);
  }, [roomId]);

  return (
    <div style={{ width: '100%', height: '600px', background: '#020617', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1rem' }}>Salles & Équipements 3D</h3>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <li><span style={{ color: '#10b981' }}>■</span> Vert : Disponible</li>
          <li><span style={{ color: '#f59e0b' }}>■</span> Orange : Maintenance</li>
          <li><span style={{ color: '#ef4444' }}>■</span> Rouge : Hors-Service</li>
        </ul>
      </div>

      <Canvas camera={{ position: [5, 8, 8], fov: 50 }} shadows>
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#6366f1" />

        <RoomEnvironment />

        {equipments.map(eq => (
          (eq.position3D) && (
            <EquipmentNode 
              key={eq.id} 
              eq={eq} 
              onClick={() => onEquipmentClick(eq)} 
            />
          )
        ))}

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.05} // Empêche de passer sous le sol
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
