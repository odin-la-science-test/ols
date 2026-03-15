// =============================================================================
// CryoKeeper 3D — Three.js 3D Scene
// Visualise les congélateurs, étagères et boîtes en 3D
// =============================================================================

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Freezer3D, CryoBox3D } from './types';

interface CryoScene3DProps {
  freezer: Freezer3D | null;
  boxes: CryoBox3D[];
  isFreezerOpen: boolean;
  onFreezerClick: () => void;
  onBoxClick: (boxId: string) => void;
}

// ─── Geometry Helpers ─────────────────────────────────────────────────────────

const FREEZER_W = 3.0;
const FREEZER_H = 4.5;
const FREEZER_D = 2.5;
const BOX_SIZE  = 0.38;
const SHELF_GAP = 0.8;

function buildFreezerBody(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x1a1f4e,
    specular: 0x334488,
    shininess: 60,
    transparent: true,
    opacity: 0.95,
  });

  const wallMat = new THREE.MeshPhongMaterial({
    color: 0x0d1133,
    specular: 0x223366,
    shininess: 30,
  });

  // Back wall
  const back = new THREE.Mesh(new THREE.BoxGeometry(FREEZER_W, FREEZER_H, 0.08), wallMat);
  back.position.set(0, 0, -FREEZER_D / 2);
  group.add(back);

  // Left wall
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, FREEZER_H, FREEZER_D), wallMat);
  left.position.set(-FREEZER_W / 2, 0, 0);
  group.add(left);

  // Right wall
  const right = left.clone();
  right.position.set(FREEZER_W / 2, 0, 0);
  group.add(right);

  // Top wall
  const top = new THREE.Mesh(new THREE.BoxGeometry(FREEZER_W, 0.08, FREEZER_D), wallMat);
  top.position.set(0, FREEZER_H / 2, 0);
  group.add(top);

  // Bottom wall
  const bottom = top.clone();
  bottom.position.set(0, -FREEZER_H / 2, 0);
  group.add(bottom);

  // Outer frame (visible body)
  const outerFrame = new THREE.Mesh(
    new THREE.BoxGeometry(FREEZER_W + 0.2, FREEZER_H + 0.2, FREEZER_D + 0.1),
    bodyMat,
  );
  outerFrame.renderOrder = -1;
  group.add(outerFrame);

  return group;
}

function buildDoor(color: string): THREE.Group {
  const group = new THREE.Group();

  const hex = parseInt(color.replace('#', ''), 16);
  const doorMat = new THREE.MeshPhongMaterial({
    color: hex,
    specular: 0xaaaaff,
    shininess: 80,
    transparent: true,
    opacity: 0.88,
  });
  const door = new THREE.Mesh(new THREE.BoxGeometry(FREEZER_W + 0.25, FREEZER_H + 0.25, 0.18), doorMat);
  door.position.set(0, 0, FREEZER_D / 2 + 0.09);
  group.add(door);

  // Handle
  const handleMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 100 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(FREEZER_W / 2 - 0.25, 0, FREEZER_D / 2 + 0.22);
  group.add(handle);

  // Temperature display
  const dispMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), dispMat);
  disp.position.set(-0.5, FREEZER_H / 2 - 0.3, FREEZER_D / 2 + 0.2);
  group.add(disp);

  // Pivot for door hinge is at left edge
  group.position.set(FREEZER_W / 2, 0, 0);

  return group;
}

function buildShelf(y: number): THREE.Mesh {
  const mat = new THREE.MeshPhongMaterial({
    color: 0x22304a,
    specular: 0x4455aa,
    shininess: 40,
    transparent: true,
    opacity: 0.85,
  });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(FREEZER_W - 0.2, 0.06, FREEZER_D - 0.2), mat);
  shelf.position.y = y;
  return shelf;
}

function buildBox(color: string, x: number, y: number, z: number): THREE.Mesh {
  const hex = parseInt(color.replace('#', ''), 16);
  const mat = new THREE.MeshPhongMaterial({
    color: hex,
    specular: 0xffffff,
    shininess: 50,
    transparent: true,
    opacity: 0.9,
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE * 0.6, BOX_SIZE), mat);
  box.position.set(x, y, z);
  return box;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CryoScene3D: React.FC<CryoScene3DProps> = ({
  freezer, boxes, isFreezerOpen, onFreezerClick, onBoxClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    doorGroup: THREE.Group | null;
    boxMeshes: Map<string, THREE.Mesh>;
    animFrame: number;
    doorAngle: number;
    targetDoorAngle: number;
    isPointerDown: boolean;
    lastPointer: { x: number; y: number };
    cameraTheta: number;
    cameraPhi: number;
    cameraR: number;
  } | null>(null);

  // ─── Init Three.js ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x050818, 0.06);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(6, 3, 8);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0x334488, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x6366f1, 0.6, 20);
    rimLight.position.set(-4, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x06b6d4, 0.3, 15);
    fillLight.position.set(0, -3, 5);
    scene.add(fillLight);

    // Grid floor
    const grid = new THREE.GridHelper(20, 20, 0x1a2040, 0x0d1030);
    grid.position.y = -FREEZER_H / 2 - 0.15;
    scene.add(grid);

    sceneRef.current = {
      renderer, scene, camera,
      doorGroup: null,
      boxMeshes: new Map(),
      animFrame: 0,
      doorAngle: 0,
      targetDoorAngle: 0,
      isPointerDown: false,
      lastPointer: { x: 0, y: 0 },
      cameraTheta: Math.atan2(8, 6),
      cameraPhi: Math.atan2(3, Math.sqrt(100)),
      cameraR: Math.sqrt(36 + 9 + 64),
    };

    // Resize handler
    const onResize = () => {
      if (!mountRef.current || !sceneRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      sceneRef.current.camera.aspect = nw / nh;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animFrame);
        sceneRef.current.renderer.dispose();
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ─── Rebuild scene when freezer/boxes change ──────────────────────────────

  useEffect(() => {
    if (!sceneRef.current || !freezer) return;
    const { scene } = sceneRef.current;

    // Clear existing scene objects (keep lights + grid)
    const toRemove: THREE.Object3D[] = [];
    scene.traverse(obj => {
      if (obj.userData.cryo3d) toRemove.push(obj);
    });
    toRemove.forEach(obj => scene.remove(obj));
    sceneRef.current.boxMeshes.clear();

    // Freezer body
    const bodyGroup = buildFreezerBody();
    bodyGroup.userData.cryo3d = true;
    bodyGroup.userData.type = 'body';
    scene.add(bodyGroup);

    // Door (pivot from left hinge)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-FREEZER_W / 2, 0, 0);
    doorPivot.userData.cryo3d = true;
    doorPivot.userData.type = 'door';

    const doorGroup = buildDoor(freezer.color);
    doorPivot.add(doorGroup);
    scene.add(doorPivot);
    sceneRef.current.doorGroup = doorPivot;

    // Shelves
    const shelfCount = Math.min(freezer.capacity, 6);
    const startY = (FREEZER_H / 2) - SHELF_GAP;
    for (let i = 0; i < shelfCount; i++) {
      const shelfY = startY - i * SHELF_GAP;
      const shelf = buildShelf(shelfY);
      shelf.userData.cryo3d = true;
      shelf.userData.type = 'shelf';
      shelf.userData.shelfIndex = i;
      scene.add(shelf);
    }

    // Boxes on shelves
    const boxesForFreezer = boxes.filter(b => b.freezerId === freezer.id);
    for (const box of boxesForFreezer) {
      if (box.shelfIndex >= shelfCount) continue;
      const shelfY = startY - box.shelfIndex * SHELF_GAP;
      const slotX = (box.position?.x ?? 0) * 0.45 - 0.9;
      const slotZ = (box.position?.y ?? 0) * 0.45 - 0.45;
      const boxMesh = buildBox(box.color, slotX, shelfY + 0.3, slotZ);
      boxMesh.userData.cryo3d = true;
      boxMesh.userData.type = 'box';
      boxMesh.userData.boxId = box.id;
      boxMesh.castShadow = true;
      scene.add(boxMesh);
      sceneRef.current.boxMeshes.set(box.id, boxMesh);
    }
  }, [freezer, boxes]);

  // ─── Animate door based on isFreezerOpen ─────────────────────────────────

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.targetDoorAngle = isFreezerOpen ? -Math.PI * 0.7 : 0;
  }, [isFreezerOpen]);

  // ─── Render loop ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!sceneRef.current) return;
    const state = sceneRef.current;

    const animate = () => {
      state.animFrame = requestAnimationFrame(animate);

      // Door animation
      if (state.doorGroup) {
        const diff = state.targetDoorAngle - state.doorAngle;
        if (Math.abs(diff) > 0.001) {
          state.doorAngle += diff * 0.08;
          state.doorGroup.rotation.y = state.doorAngle;
        }
      }

      // Box hover pulse (subtle scale)
      state.boxMeshes.forEach(mesh => {
        const t = Date.now() / 1000;
        mesh.scale.y = 1 + Math.sin(t * 2 + mesh.id) * 0.02;
      });

      state.renderer.render(state.scene, state.camera);
    };

    animate();
    return () => cancelAnimationFrame(state.animFrame);
  }, []);

  // ─── Pointer orbit controls ───────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!sceneRef.current) return;
    sceneRef.current.isPointerDown = true;
    sceneRef.current.lastPointer = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!sceneRef.current?.isPointerDown) return;
    const dx = e.clientX - sceneRef.current.lastPointer.x;
    const dy = e.clientY - sceneRef.current.lastPointer.y;
    sceneRef.current.lastPointer = { x: e.clientX, y: e.clientY };
    sceneRef.current.cameraTheta -= dx * 0.008;
    sceneRef.current.cameraPhi = Math.max(
      0.1, Math.min(Math.PI / 2 - 0.05,
      sceneRef.current.cameraPhi - dy * 0.006,
    ));
    const { cameraTheta, cameraPhi, cameraR, camera } = sceneRef.current;
    camera.position.x = cameraR * Math.cos(cameraPhi) * Math.sin(cameraTheta);
    camera.position.y = cameraR * Math.sin(cameraPhi);
    camera.position.z = cameraR * Math.cos(cameraPhi) * Math.cos(cameraTheta);
    camera.lookAt(0, 0, 0);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.isPointerDown = false;
  }, []);

  // ─── Click detection ──────────────────────────────────────────────────────

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!sceneRef.current || !mountRef.current) return;
    const { renderer, camera, scene, boxMeshes } = sceneRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check box meshes first
    const boxMeshArray = Array.from(boxMeshes.values());
    const boxIntersects = raycaster.intersectObjects(boxMeshArray);
    if (boxIntersects.length > 0) {
      const hit = boxIntersects[0].object;
      const boxId = hit.userData.boxId;
      if (boxId) { onBoxClick(boxId); return; }
    }

    // Check door / body = open freezer
    const allObjs: THREE.Object3D[] = [];
    scene.traverse(obj => { if (obj.userData.cryo3d) allObjs.push(obj); });
    const bodyIntersects = raycaster.intersectObjects(allObjs, true);
    if (bodyIntersects.length > 0) { onFreezerClick(); }
  }, [onBoxClick, onFreezerClick]);

  // ─── Zoom scroll ──────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!sceneRef.current) return;
    sceneRef.current.cameraR = Math.max(5, Math.min(18, sceneRef.current.cameraR + e.deltaY * 0.01));
    const { cameraTheta, cameraPhi, cameraR, camera } = sceneRef.current;
    camera.position.x = cameraR * Math.cos(cameraPhi) * Math.sin(cameraTheta);
    camera.position.y = cameraR * Math.sin(cameraPhi);
    camera.position.z = cameraR * Math.cos(cameraPhi) * Math.cos(cameraTheta);
    camera.lookAt(0, 0, 0);
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
    />
  );
};

export default CryoScene3D;
