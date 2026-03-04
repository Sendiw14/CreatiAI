import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  CanvasNode, CanvasEdge, CanvasState, Viewport,
  CanvasSnapshot, Checkpoint
} from '../types';
import api from '../lib/api';

interface CanvasStore {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeIds: string[];
  selectedNodes: CanvasNode[]; // derived alias
  viewport: Viewport;
  undoStack: CanvasSnapshot[];
  redoStack: CanvasSnapshot[];
  checkpoints: Checkpoint[];
  currentVersion: string;
  isDirty: boolean;
  lastSavedAt: Date | null;
  activeProjectId: string | null;
  isGridVisible: boolean;
  gridVisible: boolean; // alias for isGridVisible
  isWhatIfMode: boolean;

  setProjectId: (id: string) => void;
  addNode: (node: Partial<CanvasNode>) => CanvasNode;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Partial<CanvasEdge>) => void;
  deleteEdge: (id: string) => void;
  setSelectedNodes: (ids: string[]) => void;
  setViewport: (viewport: Viewport) => void;
  undo: () => void;
  redo: () => void;
  pushToUndoStack: () => void;
  saveCheckpoint: (name: string, projectId: string) => Promise<Checkpoint>;
  restoreCheckpoint: (checkpoint: Checkpoint) => void;
  syncToServer: (projectId: string) => Promise<void>;
  loadFromServer: (projectId: string) => Promise<void>;
  toggleGrid: () => void;
  toggleWhatIfMode: () => void;
  groupNodes: (nodeIds: string[], groupName?: string) => void;
  fitView: () => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>()((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  selectedNodes: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  undoStack: [],
  redoStack: [],
  checkpoints: [],
  currentVersion: 'v1.0',
  isDirty: false,
  lastSavedAt: null,
  activeProjectId: null,
  isGridVisible: true,
  gridVisible: true,
  isWhatIfMode: false,

  setProjectId: (id) => set({ activeProjectId: id }),

  addNode: (partial) => {
    get().pushToUndoStack();
    const node: CanvasNode = {
      id: nanoid(),
      projectId: get().activeProjectId || '',
      type: 'text',
      title: 'New idea',
      content: '',
      position: { x: 200, y: 200 },
      width: 220,
      height: 120,
      intentTags: [],
      aiGenerated: false,
      createdBy: 'current_user',
      version: get().currentVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {},
      ...partial,
    };
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true, redoStack: [] }));
    return node;
  },

  updateNode: (id, updates) => {
    get().pushToUndoStack();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
      isDirty: true,
      redoStack: [],
    }));
  },

  deleteNode: (id) => {
    get().pushToUndoStack();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.sourceId !== id && e.targetId !== id),
      selectedNodeIds: s.selectedNodeIds.filter((sid) => sid !== id),
      isDirty: true,
      redoStack: [],
    }));
  },

  addEdge: (partial) => {
    const edge: CanvasEdge = {
      id: nanoid(),
      projectId: get().activeProjectId || '',
      sourceId: partial.sourceId || partial.source || '',
      targetId: partial.targetId || partial.target || '',
      source: partial.source || partial.sourceId || '',
      target: partial.target || partial.targetId || '',
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      ...partial,
    };
    set((s) => ({ edges: [...s.edges, edge], isDirty: true }));
  },

  deleteEdge: (id) => {
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== id),
      isDirty: true,
    }));
  },

  setSelectedNodes: (ids) => set((s) => ({ 
    selectedNodeIds: ids,
    selectedNodes: s.nodes.filter(n => ids.includes(n.id)),
  })),

  setViewport: (viewport) => set({ viewport }),

  pushToUndoStack: () => {
    const { nodes, edges, undoStack } = get();
    const snapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };
    const newStack = [...undoStack, snapshot].slice(-20); // max 20
    set({ undoStack: newStack });
  },

  undo: () => {
    const { undoStack, nodes, edges } = get();
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    const currentSnapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };
    set((s) => ({
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, currentSnapshot],
      isDirty: true,
    }));
  },

  redo: () => {
    const { redoStack, nodes, edges } = get();
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    const currentSnapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };
    set((s) => ({
      nodes: next.nodes,
      edges: next.edges,
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, currentSnapshot],
      isDirty: true,
    }));
  },

  saveCheckpoint: async (name, projectId) => {
    const { nodes, edges, viewport } = get();
    const snapshot: CanvasState = { nodes, edges, viewport };
    const { data } = await api.post(`/api/projects/${projectId}/versions`, {
      name,
      snapshot,
      isCheckpoint: true,
    });
    const checkpoint = data as Checkpoint;
    set((s) => ({ checkpoints: [...s.checkpoints, checkpoint], isDirty: false, lastSavedAt: new Date() }));
    return checkpoint;
  },

  restoreCheckpoint: (checkpoint) => {
    get().pushToUndoStack();
    set({
      nodes: checkpoint.snapshot.nodes,
      edges: checkpoint.snapshot.edges,
      isDirty: true,
    });
  },

  syncToServer: async (projectId) => {
    const { nodes, edges, viewport } = get();
    await api.patch(`/api/projects/${projectId}/canvas`, { nodes, edges, viewport });
    set({ isDirty: false, lastSavedAt: new Date() });
  },

  loadFromServer: async (projectId) => {
    const { data } = await api.get(`/api/projects/${projectId}/canvas`);
    set({
      nodes: data.nodes || [],
      edges: data.edges || [],
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
      isDirty: false,
      lastSavedAt: new Date(),
    });
  },

  toggleGrid: () => set((s) => ({ isGridVisible: !s.isGridVisible, gridVisible: !s.isGridVisible })),

  toggleWhatIfMode: () => set((s) => ({ isWhatIfMode: !s.isWhatIfMode })),

  groupNodes: (nodeIds, groupName = 'Group') => {
    const { nodes } = get();
    const toGroup = nodes.filter((n) => nodeIds.includes(n.id));
    if (toGroup.length < 2) return;
    const minX = Math.min(...toGroup.map((n) => n.position.x)) - 40;
    const minY = Math.min(...toGroup.map((n) => n.position.y)) - 60;
    const maxX = Math.max(...toGroup.map((n) => n.position.x + n.width)) + 40;
    const maxY = Math.max(...toGroup.map((n) => n.position.y + n.height)) + 40;
    const groupId = nanoid();
    const groupNode: CanvasNode = {
      id: groupId,
      projectId: get().activeProjectId || '',
      type: 'group',
      title: groupName,
      content: '',
      position: { x: minX, y: minY },
      width: maxX - minX,
      height: maxY - minY,
      intentTags: [],
      aiGenerated: false,
      createdBy: 'current_user',
      version: get().currentVersion,
      children: nodeIds,
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({
      nodes: [groupNode, ...s.nodes.map((n) => nodeIds.includes(n.id) ? { ...n, groupId } : n)],
      isDirty: true,
    }));
  },

  fitView: () => {
    // Trigger fitView via ReactFlow - handled in component
  },

  clearCanvas: () => {
    get().pushToUndoStack();
    set({ nodes: [], edges: [], isDirty: true });
  },
}));
