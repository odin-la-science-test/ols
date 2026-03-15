import { create } from 'zustand';
import * as Y from 'yjs';
import { io } from 'socket.io-client';

const ROOM_ID = 'biorender-room-1';
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

interface CanvasNode {
  id: string;
  type: 'rectangle' | 'circle' | 'svg_asset' | 'text';
  x: number;
  y: number;
  fill?: string;
  text?: string;
  assetId?: string;
}

interface CanvasState {
  nodes: CanvasNode[];
  selectedId: string | null;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, attrs: Partial<CanvasNode>) => void;
  selectNode: (id: string | null) => void;
  syncFromYjs: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  selectedId: null,

  addNode: (node) => {
    // Only update Yjs; the observer will update the Zustand state
    yNodes.set(node.id, node);
  },

  updateNode: (id, attrs) => {
    const currentNode = yNodes.get(id) as CanvasNode;
    if (currentNode) {
      yNodes.set(id, { ...currentNode, ...attrs });
    }
  },

  selectNode: (id) => set({ selectedId: id }),

  // Called when external Yjs changes arrive via WebSocket
  syncFromYjs: () => {
    const rawNodes = Array.from(yNodes.values()) as CanvasNode[];
    set({ nodes: rawNodes });
  }
}));

// Bind Yjs changes to Zustand
yNodes.observe(() => {
  useCanvasStore.getState().syncFromYjs();
});
