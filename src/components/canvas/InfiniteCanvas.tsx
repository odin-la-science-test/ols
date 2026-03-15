import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Arrow, Text, Transformer, Group, Image as KonvaImage } from 'react-konva';
import { useCanvasStore, type CanvasNode } from '../../store/canvasStore';
import { BioAssetRenderer } from './BioAssets';
import useImage from 'use-image';

const URLImage = ({ url, ...props }: any) => {
  const [image] = useImage(url || '', 'anonymous');
  return <KonvaImage image={image} {...props} />;
};

const InfiniteCanvas = forwardRef((props, ref) => {
  const { nodes, addNode, updateNode, selectedId, selectNode, currentTool } = useCanvasStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    exportToImage: () => {
      if (stageRef.current) {
        // Hide transformer for clean export
        const oldTransformerNodes = transformerRef.current?.nodes() || [];
        transformerRef.current?.nodes([]);
        
        const dataURL = stageRef.current.toDataURL({ 
          pixelRatio: 2,
          quality: 1
        });
        
        const link = document.createElement('a');
        link.download = `biorender-export-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Restore transformer
        if (oldTransformerNodes.length > 0) {
          transformerRef.current?.nodes(oldTransformerNodes);
        }
      }
    }
  }));

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && stageRef.current) {
        stageRef.current.width(containerRef.current.offsetWidth);
        stageRef.current.height(containerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      selectNode(null);
      
      // If a tool is active, place a new node
      if (currentTool !== 'select') {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const stagePos = {
          x: (pos.x - stage.x()) / stage.scaleX(),
          y: (pos.y - stage.y()) / stage.scaleY(),
        };

        const newNode: CanvasNode = {
          id: Math.random().toString(36).substr(2, 9),
          type: currentTool as any,
          x: stagePos.x,
          y: stagePos.y,
          fill: '#6366f1',
          width: 100,
          height: 100,
          radius: 50,
          rotation: 0,
          opacity: 1,
          text: currentTool === 'text' ? 'Double clic pour éditer' : undefined,
          fontSize: 14,
        };
        addNode(newNode);
      }
    }
  };

  const renderNode = (node: CanvasNode) => {
    const commonProps = {
      id: node.id,
      key: node.id,
      x: node.x,
      y: node.y,
      rotation: node.rotation || 0,
      opacity: node.opacity ?? 1,
      draggable: true,
      onClick: () => selectNode(node.id),
      onDragEnd: (e: any) => {
        updateNode(node.id, { x: e.target.x(), y: e.target.y() });
      },
      onTransformEnd: (e: any) => {
        const node_ = e.target;
        const scaleX = node_.scaleX();
        const scaleY = node_.scaleY();
        node_.scaleX(1);
        node_.scaleY(1);
        
        updateNode(node.id, {
          x: node_.x(),
          y: node_.y(),
          width: Math.max(5, (node.width || 100) * scaleX),
          height: Math.max(5, (node.height || 100) * scaleY),
          rotation: node_.rotation()
        });
      }
    };

    switch (node.type) {
      case 'rectangle':
        return <Rect {...commonProps} width={node.width || 100} height={node.height || 100} fill={node.fill} cornerRadius={4} />;
      case 'circle':
        return <Circle {...commonProps} radius={node.radius || 50} fill={node.fill} />;
      case 'arrow':
        return <Arrow {...commonProps} points={[0, 0, 50, 50]} fill={node.fill} stroke={node.fill} strokeWidth={4} />;
      case 'text':
        return <Text {...commonProps} text={node.text || ''} fontSize={node.fontSize || 14} fill={node.fill || '#1f2937'} />;
      case 'svg_asset':
        return (
          <Group 
            {...commonProps} 
            onClick={(e) => {
              e.cancelBubble = true;
              selectNode(node.id);
            }}
          >
            <BioAssetRenderer assetId={node.assetId || ''} color={node.fill} size={node.width || 100} />
          </Group>
        );
      case 'svg_url':
        return (
          <URLImage 
            {...commonProps} 
            url={node.url} 
            width={node.width || 100} 
            height={node.height || 100} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: '#f0f2f5', overflow: 'hidden', position: 'relative' }}>
      
      {/* Dynamic Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
        backgroundSize: `${20 * scale}px ${20 * scale}px`,
        backgroundPosition: `${position.x}px ${position.y}px`,
        pointerEvents: 'none',
        opacity: 0.4
      }} />

      <Stage
        ref={stageRef}
        width={800}
        height={600}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable={currentTool === 'select'}
      >
        <Layer>
          {nodes.map(renderNode)}
          {selectedId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      
      {/* Floating Zoom Controls */}
      <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <div style={{ backgroundColor: 'white', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <button onClick={() => setScale(s => s * 1.1)} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#4b5563' }}>+</button>
          <div style={{ width: '1px', backgroundColor: '#e5e7eb' }}></div>
          <span style={{ fontSize: '12px', color: '#4b5563', padding: '0 8px', alignSelf: 'center', fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
          <div style={{ width: '1px', backgroundColor: '#e5e7eb' }}></div>
          <button onClick={() => setScale(s => s * 0.9)} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#4b5563' }}>-</button>
        </div>
        <button 
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
          style={{ backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 600, color: '#4b5563', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer' }}
        >
          Recentrer
        </button>
      </div>

      {/* Tool Hint */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#4f46e5', color: 'white', padding: '6px 12px', borderRadius: 'full', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}>
        Outil actif : {currentTool.toUpperCase()}
      </div>
    </div>
  );
});

export default InfiniteCanvas;
