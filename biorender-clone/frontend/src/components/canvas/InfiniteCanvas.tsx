'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import { useCanvasStore } from '@/store/canvasStore';

export default function InfiniteCanvas() {
  const { nodes, addNode, updateNode, selectedId, selectNode } = useCanvasStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    // Initial resize to fill container
    if (containerRef.current && stageRef.current) {
      stageRef.current.width(containerRef.current.offsetWidth);
      stageRef.current.height(containerRef.current.offsetHeight);
    }
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(newScale);

    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleDragEnd = (e: any, id: string) => {
    updateNode(id, { x: e.target.x(), y: e.target.y() });
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-gray-50 overflow-hidden">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable
        onDragStart={() => selectNode(null)} // Deselect when panning
        onClick={(e) => {
          // Deselect when clicking on empty stage
          if (e.target === e.target.getStage()) {
            selectNode(null);
          }
        }}
      >
        <Layer>
          {nodes.map((node) => {
            if (node.type === 'rectangle') {
              return (
                <Rect
                  key={node.id}
                  x={node.x}
                  y={node.y}
                  width={100}
                  height={100}
                  fill={node.fill || '#3b82f6'}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, node.id)}
                  onClick={() => selectNode(node.id)}
                  stroke={selectedId === node.id ? '#blue' : ''}
                  strokeWidth={selectedId === node.id ? 2 : 0}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      
      {/* Test UI Actions */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => addNode({ id: Math.random().toString(36).substr(2, 9), type: 'rectangle', x: 100, y: 100, fill: '#ef4444' })}
        >
          Add Rectangle
        </button>
      </div>
    </div>
  );
}
