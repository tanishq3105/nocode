import { create } from 'zustand';
import { FlowState, Node, Edge } from '../types/flow';

export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  
  addNode: (node) => 
    set((state) => ({ nodes: [...state.nodes, node] })),
    
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...data } : node
      ),
    })),

  updateNodes: (nodes) =>
    set(() => ({ nodes })),
    
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),
    
  addEdge: (edge) =>
    set((state) => ({ edges: [...state.edges, edge] })),
    
  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),
}));