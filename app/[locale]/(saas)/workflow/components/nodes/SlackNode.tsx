"use client";

import React from "react";
import { Handle, Position } from "reactflow";

export default function SlackNode({ data }: any) {
  return (
    <div className="min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-sm p-3 relative">
      <div className="flex items-center mb-2">
        {/* Icône Slack (ex : emoji 🗨 ou SVG Slack si vous avez) */}
        <span className="text-pink-500 mr-2">🗨️</span>
        <span className="font-bold text-gray-700">Slack</span>
      </div>
      <p className="text-sm text-gray-600">
        {data.label || "Envoyer un message Slack..."}
      </p>

      <Handle
        type="source"
        position={Position.Right}
        className="bg-pink-500 !w-3 !h-3 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="bg-pink-500 !w-3 !h-3 border-2 border-white"
      />
    </div>
  );
}
