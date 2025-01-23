"use client";

import { useState, useCallback } from "react";
import {
  Node,
  Edge,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  updateEdge,
  NodeChange,
  EdgeChange,
} from "reactflow";

type WorkflowHook = {
  nodes: Node[];
  edges: Edge[];
  addNode: (
    id: string,
    label: string,
    position: { x: number; y: number }
  ) => void;
  resetWorkflow: () => void;

  // Fonctions de gestion pour React Flow
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // (Optionnel) autres fonctions si besoin
  updateNode: (id: string, newData: object) => void;
  removeNode: (id: string) => void;
  addConnection: (params: Connection) => void;
  updateConnection: (oldEdge: Edge, newConnection: Edge) => void;
  removeConnection: (id: string) => void;
};

const nodeConfigByType: Record<
  string,
  {
    defaultLabel: string;
    defaultData?: any;
    defaultPosition?: { x: number; y: number };
  }
> = {
  email: {
    defaultLabel: "Nœud Email",
    defaultData: { description: "Envoyer un email..." },
  },
  slack: {
    defaultLabel: "Nœud Slack",
    defaultData: { description: "Envoyer un message Slack..." },
  },
  openai: {
    defaultLabel: "Nœud OpenAI",
    defaultData: { description: "Requête vers ChatGPT/AI..." },
  },
  // ... vous pouvez ajouter d'autres types
};

export default function useWorkflow(): WorkflowHook {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // --- FONCTIONS REACT FLOW ---

  // 1. Gestion du drag, de la sélection, etc. via applyNodeChanges
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Appliquer les changements de position, sélection, etc.
    setNodes((nds) => applyNodeChanges(changes, nds));

    // Gérer la suppression
    changes.forEach((change) => {
      if (change.type === "remove") {
        const removedNodeId = change.id;
        // Supprimer tous les edges reliés à ce node
        setEdges((eds) =>
          eds.filter(
            (edge) =>
              edge.source !== removedNodeId && edge.target !== removedNodeId
          )
        );
      }
    });
  }, []);

  // 2. Gestion des changements d'edges (ex : suppression, mise à jour)
  const onEdgesChange = useCallback((changes) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  }, []);

  // 3. Gestion de la création d'une connexion entre 2 nœuds
  const onConnect = useCallback((connection) => {
    setEdges((currentEdges) => addEdge(connection, currentEdges));
  }, []);

  // --- FONCTIONS PERSONNALISÉES ---

  // Ajouter un nouveau nœud
  const addNode = useCallback(
    (nodeType: string, label?: string, data?: any) => {
      setNodes((nds) => {
        const id = `${nodeType}-${nds.length + 1}`;

        // Récupère la config du type si elle existe
        const config = nodeConfigByType[nodeType] || {
          defaultLabel: nodeType,
          defaultData: {},
        };

        return [
          ...nds,
          {
            id,
            type: nodeType,
            position: { x: Math.random() * 600, y: Math.random() * 400 },
            data: {
              label: label || config.defaultLabel,
              ...config.defaultData, // Fusionne la data par défaut
              ...data, // Surcharge avec la data passée en param
              onEdit: (nodeId: string) => {
                // Ouvrir une modal, un form, etc.
                alert(`Éditer le nœud : ${nodeId}`);
              },
              onRemove: (nodeId: string) => {
                alert(`Remove le nœud : ${nodeId}`);
                removeNode(nodeId);
              },
            },
          },
        ];
      });
    },
    []
  );

  // Mettre à jour les données d'un nœud
  const updateNode = useCallback((id: string, newData: object) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...node.data, ...newData },
            }
          : node
      )
    );
  }, []);

  // Supprimer un nœud et les edges associés
  const removeNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  }, []);

  // Ajouter manuellement un edge (peut servir si on veut créer des edges programmatiquement)
  const addConnection = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  // Mettre à jour un edge (ex : changer de source/target)
  const updateConnection = useCallback((oldEdge: Edge, newConnection: Edge) => {
    setEdges((eds) => updateEdge(oldEdge, newConnection, eds));
  }, []);

  // Supprimer un edge par son id
  const removeConnection = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  // Réinitialiser le workflow (supprime nœuds et edges)
  const resetWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  return {
    nodes,
    edges,
    addNode,
    updateNode,
    removeNode,
    addConnection,
    updateConnection,
    removeConnection,
    resetWorkflow,

    // Fonctions pour React Flow
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}
