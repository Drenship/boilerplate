"use client";

import React from "react";
import { Handle, Position } from "reactflow";

export default function OpenAiNode({ data }: any) {
  return (
    <div className="min-w-[150px] bg-white border border-gray-200 rounded-lg shadow p-3 relative">
      <div className="flex items-center mb-2">
        {/* Icône OpenAI (ex: “🤖” ou un logo custom) */}
        <span className="text-green-600 mr-2">🤖</span>
        <span className="font-bold text-gray-700">OpenAI</span>
      </div>
      <p className="text-sm text-gray-600">
        {data.label || "Requête OpenAI..."}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="bg-green-500 w-3 h-3 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="bg-green-500 w-3 h-3 border-2 border-white"
      />
    </div>
  );
}
