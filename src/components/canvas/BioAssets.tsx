import React from 'react';
import { Group, Path, Rect, Circle, Line, Text } from 'react-konva';

// Helper for the "Y" shape of an antibody
const Antibody = ({ color = '#4f46e5', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      {/* Heavy chains */}
      <Path
        data="M50,80 L50,40 L20,10 M50,40 L80,10"
        stroke={color}
        strokeWidth={8}
        lineCap="round"
        lineJoin="round"
      />
      {/* Light chains */}
      <Path
        data="M35,25 L20,10 M65,25 L80,10"
        stroke={color}
        strokeWidth={8}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );
};

const Beaker = ({ color = '#93c5fd', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      {/* Liquid */}
      <Rect x={20} y={50} width={60} height={40} fill={color} opacity={0.6} cornerRadius={[0, 0, 5, 5]} />
      {/* Glass Outline */}
      <Path
        data="M20,20 L20,90 Q20,95 25,95 L75,95 Q80,95 80,90 L80,20 M15,20 L85,20"
        stroke="#4b5563"
        strokeWidth={3}
        lineCap="round"
      />
      {/* Scale lines */}
      <Line points={[30, 40, 45, 40]} stroke="#9ca3af" strokeWidth={1} />
      <Line points={[30, 60, 45, 60]} stroke="#9ca3af" strokeWidth={1} />
      <Line points={[30, 80, 45, 80]} stroke="#9ca3af" strokeWidth={1} />
    </Group>
  );
};

const Erlenmeyer = ({ color = '#6ee7b7', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      {/* Liquid */}
      <Path
        data="M35,40 L20,90 Q20,95 25,95 L75,95 Q80,95 80,90 L65,40 Z"
        fill={color}
        opacity={0.6}
      />
      {/* Glass Outline */}
      <Path
        data="M40,15 L40,40 L20,90 Q20,95 25,95 L75,95 Q80,95 80,90 L60,40 L60,15 M35,15 L65,15"
        stroke="#4b5563"
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );
};

const DNA = ({ color = '#f87171', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      <Path
        data="M20,20 Q50,50 20,80 M80,20 Q50,50 80,80"
        stroke={color}
        strokeWidth={4}
        lineCap="round"
      />
      <Line points={[35, 35, 65, 35]} stroke={color} strokeWidth={2} opacity={0.5} />
      <Line points={[50, 50, 50, 50]} stroke={color} strokeWidth={2} opacity={0.5} />
      <Line points={[35, 65, 65, 65]} stroke={color} strokeWidth={2} opacity={0.5} />
    </Group>
  );
};

const Cell = ({ color = '#facc15', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      <Path
        data="M50,10 Q90,10 90,50 Q90,90 50,90 Q10,90 10,50 Q10,10 50,10"
        fill={color}
        opacity={0.3}
        stroke={color}
        strokeWidth={2}
      />
      <Circle x={50} y={50} radius={15} fill={color} opacity={0.8} />
      <Circle x={60} y={40} radius={5} fill="#ffffff" opacity={0.3} />
    </Group>
  );
};

const LabTower = ({ color = '#6366f1', size = 80 }) => {
  const scale = size / 100;
  return (
    <Group scaleX={scale} scaleY={scale}>
      <Rect x={30} y={20} width={40} height={70} fill="#e5e7eb" stroke="#4b5563" strokeWidth={2} />
      <Rect x={35} y={30} width={10} height={10} fill="#ffffff" stroke="#9ca3af" />
      <Rect x={55} y={30} width={10} height={10} fill="#ffffff" stroke="#9ca3af" />
      <Rect x={35} y={50} width={10} height={10} fill="#ffffff" stroke="#9ca3af" />
      <Rect x={55} y={50} width={10} height={10} fill="#ffffff" stroke="#9ca3af" />
      <Rect x={40} y={75} width={20} height={15} fill="#4b5563" />
    </Group>
  );
};

export const BioAssetRenderer = ({ assetId, color, size = 80 }: { assetId: string, color?: string, size?: number }) => {
  switch (assetId) {
    case 'antibody': return <Antibody color={color} size={size} />;
    case 'beaker': return <Beaker color={color} size={size} />;
    case 'flask': return <Erlenmeyer color={color} size={size} />;
    case 'dna': return <DNA color={color} size={size} />;
    case 'cell_animal': return <Cell color={color} size={size} />;
    case 'tower': return <LabTower color={color} size={size} />;
    default: return <Rect x={0} y={0} width={size} height={size} fill={color || '#e5e7eb'} cornerRadius={8} />;
  }
};
