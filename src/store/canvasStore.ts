import { create } from 'zustand';
import * as Y from 'yjs';
import { io } from 'socket.io-client';

const ROOM_ID = 'biorender-room-1';
// Note: In production, this would use an environment variable
const socket = io('http://localhost:3001');

// Yjs Setup for Real-time
export const doc = new Y.Doc();
export const yNodes = doc.getMap('nodes');

// Sync from Server on Connection
socket.on('connect', () => {
  console.log('Connected to collaboration server');
  socket.emit('join-room', ROOM_ID);
});

socket.on('sync-update', (update: ArrayBuffer | Uint8Array) => {
  Y.applyUpdate(doc, new Uint8Array(update), socket);
});

// Broadcast local changes to Server
doc.on('update', (update, origin) => {
  if (origin !== socket) {
    socket.emit('sync-update', { room: ROOM_ID, update });
  }
});

export interface CanvasNode {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text' | 'svg_asset' | 'svg_url';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  assetId?: string;
  url?: string;
  opacity?: number;
  index?: number;
}

export type EditorTool = 'select' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'image';

interface CanvasState {
  nodes: CanvasNode[];
  selectedId: string | null;
  currentTool: EditorTool;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, attrs: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  reorderNode: (id: string, direction: 'front' | 'back') => void;
  selectNode: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  syncFromYjs: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  selectedId: null,
  currentTool: 'select',

  addNode: (node) => {
    const { nodes } = get();
    const maxIndex = nodes.length > 0 ? Math.max(...nodes.map(n => n.index || 0)) : 0;
    yNodes.set(node.id, { ...node, index: maxIndex + 1 });
  },

  updateNode: (id, attrs) => {
    const currentNode = yNodes.get(id) as CanvasNode;
    if (currentNode) {
      yNodes.set(id, { ...currentNode, ...attrs });
    }
  },

  deleteNode: (id) => {
    yNodes.delete(id);
    set({ selectedId: null });
  },

  reorderNode: (id, direction) => {
    const { nodes } = get();
    const currentNode = yNodes.get(id) as CanvasNode;
    if (!currentNode) return;

    if (direction === 'front') {
      const maxIndex = nodes.length > 0 ? Math.max(...nodes.map(n => n.index || 0)) : 0;
      yNodes.set(id, { ...currentNode, index: maxIndex + 1 });
    } else {
      const minIndex = nodes.length > 0 ? Math.min(...nodes.map(n => n.index || 0)) : 0;
      yNodes.set(id, { ...currentNode, index: minIndex - 1 });
    }
  },

  selectNode: (id) => set({ selectedId: id }),

  setTool: (tool) => set({ currentTool: tool }),

  // Called when external Yjs changes arrive via WebSocket
  syncFromYjs: () => {
    const rawNodes = Array.from(yNodes.values()) as CanvasNode[];
    const sortedNodes = rawNodes.sort((a, b) => (a.index || 0) - (b.index || 0));
    set({ nodes: sortedNodes });
  }
}));

// Bind Yjs changes to Zustand
yNodes.observe(() => {
  useCanvasStore.getState().syncFromYjs();
});
