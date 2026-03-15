import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Layers, Crosshair, MapPin, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { MaterialItem } from '../../types/labInventoryAdvanced';
import { getStatusColor } from '../../services/inventoryService';

interface LabStorageMap3DProps {
  items: MaterialItem[];
  onLocateItem: (item: MaterialItem) => void;
  card: (extra?: React.CSSProperties) => React.CSSProperties;
  btn: (color: string, extra?: React.CSSProperties) => React.CSSProperties;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const ROOM_SIZE = 20;
const WALL_HEIGHT = 4;
const PADDING = 2;

// Auto-layout logic for rooms
function layoutRooms(items: MaterialItem[]) {
  const roomsMap = new Map<string, { name: string; building: string; items: MaterialItem[] }>();
  
  items.forEach(item => {
    const loc = item.location;
    if (!loc.room || !loc.building) return;
    const key = `${loc.building}|${loc.room}`;
    if (!roomsMap.has(key)) roomsMap.set(key, { name: loc.room, building: loc.building, items: [] });
    roomsMap.get(key)!.items.push(item);
  });

  const rooms = Array.from(roomsMap.values());
  const gridX = Math.ceil(Math.sqrt(rooms.length));
  
  return rooms.map((r, i) => {
    const gx = i % gridX;
    const gz = Math.floor(i / gridX);
    return {
      ...r,
      x: gx * (ROOM_SIZE + PADDING) - (gridX * ROOM_SIZE) / 2,
      z: gz * (ROOM_SIZE + PADDING),
    };
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export const LabStorageMap3D: React.FC<LabStorageMap3DProps> = ({ items, onLocateItem, card }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  
  const [targetItem, setTargetItem] = useState<MaterialItem | null>(null);

  const roomsData = useMemo(() => layoutRooms(items), [items]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialization
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);

    // Grid Floor
    const grid = new THREE.GridHelper(100, 50, 0x334155, 0x1e293b);
    scene.add(grid);

    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, depthWrite: false });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // State for engine
    const meshesMap = new Map<string, THREE.Mesh>();
    const state = {
      animFrame: 0,
      targetCamPos: new THREE.Vector3(0, 30, 40),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      currentCamPos: new THREE.Vector3(0, 30, 40),
      currentLookAt: new THREE.Vector3(0, 0, 0),
      isSearching: false,
      searchTimer: 0,
      highlightMesh: null as THREE.Mesh | null,
      
      // Orbit controls
      isDragging: false,
      lastMouse: { x: 0, y: 0 },
      theta: 0,
      phi: Math.PI / 4,
      radius: 50,
      center: new THREE.Vector3(0, 0, 0),
    };

    // Build Rooms
    roomsData.forEach(room => {
      // Room Floor
      const roomFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
        new THREE.MeshPhongMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 })
      );
      roomFloor.rotation.x = -Math.PI / 2;
      roomFloor.position.set(room.x, 0.01, room.z);
      roomFloor.receiveShadow = true;
      scene.add(roomFloor);

      // Simple Walls (Wireframe for visibility)
      const wallGeo = new THREE.BoxGeometry(ROOM_SIZE, WALL_HEIGHT, ROOM_SIZE);
      const edges = new THREE.EdgesGeometry(wallGeo);
      const wallLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 }));
      wallLines.position.set(room.x, WALL_HEIGHT / 2, room.z);
      scene.add(wallLines);

      // Group items by furniture
      const furnitureMap = new Map<string, MaterialItem[]>();
      room.items.forEach(v => {
        const key = v.location.furniture || 'Vrac';
        if (!furnitureMap.has(key)) furnitureMap.set(key, []);
        furnitureMap.get(key)!.push(v);
      });

      // Render Furniture (Abstract Boxes)
      let fIndex = 0;
      furnitureMap.forEach((itemsInFurn, furnName) => {
        const isCryo = itemsInFurn.some(i => i.isCryogenic);
        
        // Find worst status
        let worstStatus = 'BON';
        for (const item of itemsInFurn) {
          if (item.stock.status === 'RUPTURE') { worstStatus = 'RUPTURE'; break; }
          if (item.stock.status === 'CRITIQUE') { worstStatus = 'CRITIQUE'; }
          else if (item.stock.status === 'LIMITE' && worstStatus !== 'CRITIQUE') { worstStatus = 'LIMITE'; }
        }

        const colorHex = parseInt(getStatusColor(worstStatus as any).replace('#', ''), 16);
        
        // Layout inside room
        const row = Math.floor(fIndex / 4);
        const col = fIndex % 4;
        const fx = room.x - ROOM_SIZE/2 + 2 + col * 4;
        const fz = room.z - ROOM_SIZE/2 + 2 + row * 4;
        
        const furnMesh = new THREE.Mesh(
          new THREE.BoxGeometry(2, 3, 2),
          new THREE.MeshPhongMaterial({ 
            color: isCryo ? 0x06b6d4 : 0x334155,
            emissive: colorHex,
            emissiveIntensity: worstStatus === 'BON' ? 0.1 : 0.4,
            transparent: true,
            opacity: 0.9
          })
        );
        furnMesh.position.set(fx, 1.5, fz);
        furnMesh.castShadow = true;
        
        // Save references
        itemsInFurn.forEach(item => meshesMap.set(item.id, furnMesh));
        
        scene.add(furnMesh);
        fIndex++;
      });
    });

    // Render Loop
    const animate = () => {
      state.animFrame = requestAnimationFrame(animate);

      // Camera lerp
      if (state.isSearching) {
        state.currentCamPos.lerp(state.targetCamPos, 0.05);
        state.currentLookAt.lerp(state.targetLookAt, 0.05);
        camera.position.copy(state.currentCamPos);
        camera.lookAt(state.currentLookAt);
        
        // Highlight pulse
        if (state.highlightMesh) {
          const t = Date.now() / 150;
          state.highlightMesh.scale.setScalar(1 + Math.sin(t) * 0.1);
        }
      } else {
        // Orbit mode
        state.targetCamPos.x = state.center.x + state.radius * Math.sin(state.phi) * Math.sin(state.theta);
        state.targetCamPos.y = state.center.y + state.radius * Math.cos(state.phi);
        state.targetCamPos.z = state.center.z + state.radius * Math.sin(state.phi) * Math.cos(state.theta);
        
        state.currentCamPos.lerp(state.targetCamPos, 0.1);
        state.currentLookAt.lerp(state.center, 0.1);
        camera.position.copy(state.currentCamPos);
        camera.lookAt(state.currentLookAt);
      }

      renderer.render(scene, camera);
    };
    animate();

    engineRef.current = { renderer, camera, scene, state, meshesMap };

    // Interaction handlers
    const onPointerDown = (e: PointerEvent) => {
      state.isDragging = true;
      state.lastMouse = { x: e.clientX, y: e.clientY };
      state.isSearching = false; // cancel search camera override
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.lastMouse.x;
      const dy = e.clientY - state.lastMouse.y;
      state.lastMouse = { x: e.clientX, y: e.clientY };
      
      if (e.buttons === 2 || e.shiftKey) {
        // Pan
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        state.center.addScaledVector(right, -dx * 0.1);
        state.center.addScaledVector(up, dy * 0.1);
      } else {
        // Orbit
        state.theta -= dx * 0.01;
        state.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, state.phi - dy * 0.01));
      }
    };
    const onPointerUp = () => state.isDragging = false;
    const onWheel = (e: WheelEvent) => {
      state.radius = Math.max(10, Math.min(100, state.radius + e.deltaY * 0.05));
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointerleave', onPointerUp);
    dom.addEventListener('wheel', onWheel);

    const onResize = () => {
      const nw = mountRef.current?.clientWidth || w;
      const nh = mountRef.current?.clientHeight || h;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointerleave', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(state.animFrame);
      renderer.dispose();
      mountRef.current?.removeChild(dom);
    };
  }, [roomsData]);

  // Handle Find Object command
  useEffect(() => {
    if (!targetItem || !engineRef.current) return;
    
    const { state, meshesMap } = engineRef.current;
    const targetMesh = meshesMap.get(targetItem.id);
    
    if (targetMesh) {
      // Reset previous highlight
      if (state.highlightMesh) state.highlightMesh.scale.setScalar(1);
      
      const pos = targetMesh.position;
      state.isSearching = true;
      state.targetLookAt.copy(pos);
      
      // Arc camera move
      state.targetCamPos.set(pos.x + 8, pos.y + 6, pos.z + 8);
      state.highlightMesh = targetMesh;
      
      // Update orbit center so it orbits around this new target smoothly
      state.center.copy(pos);
      state.radius = 15;
    }
  }, [targetItem]);

  const handleResetView = () => {
    if (!engineRef.current) return;
    const { state } = engineRef.current;
    if (state.highlightMesh) state.highlightMesh.scale.setScalar(1);
    state.highlightMesh = null;
    state.isSearching = false;
    state.center.set(0, 0, 0);
    state.radius = 50;
    state.theta = 0;
    state.phi = Math.PI / 4;
    setTargetItem(null);
  };

  return (
    <div style={card({ padding: 0, overflow: 'hidden', height: '100%', minHeight: '600px', display: 'flex' })}>
      
      {/* 3D Viewport */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Overlay Controls */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <div style={{ backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} /> Bon
            </span>
            <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Alerte
            </span>
            <span style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#06b6d4' }} /> Cryo
            </span>
          </div>
          <button onClick={handleResetView} style={{ padding: '0.5rem', backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', color: '#60a5fa', borderRadius: '8px', cursor: 'pointer' }} title="Reset Vue">
            <Layers size={18} />
          </button>
        </div>
        
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(15,23,42,0.8)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary,#94a3b8)', fontSize: '0.75rem', maxWidth: '300px' }}>
          <strong>Navigation 3D :</strong>
          <br/>• Clic Principal + Glisser : Tourner la vue
          <br/>• Clic Droit + Glisser (ou Shift) : Déplacer la vue
          <br/>• Molette : Zoom
        </div>

        {targetItem && (
          <div style={{ position: 'absolute', left: '50%', top: '2rem', transform: 'translateX(-50%)', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '0.75rem 1.5rem', borderRadius: '2rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <MapPin size={18} /> Cible localisée : {targetItem.name}
            <button onClick={() => setTargetItem(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex', padding: 0 }}><X size={16}/></button>
          </div>
        )}
      </div>

      {/* Sidebar: Find Item */}
      <div style={{ width: '300px', borderLeft: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.4)', padding: '1.25rem', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: 'var(--text-primary,#f8fafc)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crosshair size={18} color="#6366f1" /> Localiser
        </h3>
        
        {roomsData.map(room => (
          <div key={`${room.building}|${room.name}`} style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(99,102,241,0.3)', textTransform: 'uppercase' }}>
              {room.building} - {room.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {room.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTargetItem(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', backgroundColor: targetItem?.id === item.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${targetItem?.id === item.id ? '#6366f1' : 'transparent'}`, color: targetItem?.id === item.id ? '#fff' : 'var(--text-secondary,#94a3b8)', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getStatusColor(item.stock.status) }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.location.furniture}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {roomsData.length === 0 && (
          <div style={{ color: 'var(--text-secondary,#94a3b8)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            Aucun emplacement renseigné pour les items de l'inventaire.
          </div>
        )}
      </div>

    </div>
  );
};
