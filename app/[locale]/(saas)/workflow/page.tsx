"use client";

import React, { useCallback } from "react";
import ReactFlow, { ReactFlowProvider, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import useWorkflow from "@/libs/hooks/useWorkflow";
import EmailNode from "./components/nodes/EmailNode";
import SlackNode from "./components/nodes/SlackNode";
import OpenAiNode from "./components/nodes/OpenAiNode";

// Associe le type "custom" au composant CustomNode
const nodeTypes = {
  email: EmailNode,
  slack: SlackNode,
  openai: OpenAiNode,
};

export default function WorkflowPage() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    resetWorkflow,
  } = useWorkflow();

  // Ajouter un nœud
  const handleAddNode = useCallback(() => {
    const id = `node-${nodes.length + 1}`;
    addNode(id, `Node ${nodes.length + 1}`, {
      x: Math.random() * 500,
      y: Math.random() * 300,
    });
  }, [addNode, nodes.length]);

  // Réinitialiser le workflow
  const handleReset = useCallback(() => resetWorkflow(), [resetWorkflow]);

  return (
    <ReactFlowProvider>
      <div className="flex items-start gap-4 h-full">
        <div className=" flex flex-col gap-2 h-full w-sm border rounded-xl p-4">
          {/* Boutons d'action */}
          <button
            onClick={() => addNode("email")}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm shadow-sm hover:bg-blue-700"
          >
            Add Email Node
          </button>

          <button
            onClick={() => addNode("slack", "Slack Node")}
            className="px-4 py-2 bg-pink-600 text-white rounded-sm shadow-sm hover:bg-pink-700"
          >
            Add Slack Node
          </button>

          <button
            onClick={() =>
              addNode("openai", "OpenAI Node", {
                prompt: "Posez votre question...",
              })
            }
            className="px-4 py-2 bg-green-600 text-white rounded-sm shadow-sm hover:bg-green-700"
          >
            Add OpenAI Node
          </button>
        </div>
        <div className="w-full h-full max-h-screen relative rounded-xl overflow-hidden border">
          {/* Le composant React Flow */}
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodesDraggable
            nodesConnectable
            elementsSelectable
          >
            <Controls />
            <Background gap={16} className="bg-white dark:bg-neutral-800" />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
