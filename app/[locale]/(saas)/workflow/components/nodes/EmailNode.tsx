"use client";

import React, { useState, useCallback } from "react";
import { Handle, Position } from "reactflow";

/**
 * EmailNode
 * Nœud personnalisé "Email" avec menu contextuel
 */
export default function EmailNode(props: any) {
  const { data } = props;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  // Clic droit pour afficher le menu
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    console.log("Right click sur le nœud Email"); // Test
    setMenuPos({ x: event.clientX, y: event.clientY });
    setShowMenu(true);
  }, []);

  // Fermer le menu (si on clique ailleurs, etc.)
  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  // Éditer le nœud
  const handleEdit = useCallback(() => {
    if (data.onEdit) {
      data.onEdit(data.id);
    } else {
      alert(`Éditer le nœud: ${data.id || "inconnu"}`);
    }
    setShowMenu(false);
  }, [data]);

  // Supprimer le nœud
  const handleDelete = useCallback(() => {
    if (data.onRemove) {
      data.onRemove(data.id);
    } else {
      alert(`Supprimer le nœud: ${data.id || "inconnu"}`);
    }
    setShowMenu(false);
  }, [data]);

  console.log(data)

  return (
    <div
      className="min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-sm p-3 relative"
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center mb-2">
        {/* Icône Email */}
        <span className="text-blue-500 mr-2">✉️</span>
        <span className="font-bold text-gray-700">Email</span>
      </div>
      <p className="text-sm text-gray-600">
        {data.label || "Envoyer un email..."}
      </p>

      {/* Handles pour connecter ce nœud */}
      <Handle
        type="source"
        position={Position.Right}
        className="bg-blue-500 !w-3 !h-3 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="bg-blue-500 !w-3 !h-3 border-2 border-white"
      />

      {/* Menu contextuel */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-sm shadow-sm"
          style={{ bottom: "-50%", right: "-50%" }}
          // onMouseLeave={closeMenu} // Désactiver temporairement
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
            onClick={handleEdit}
          >
            Éditer
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
            onClick={handleDelete}
          >
            Supprimer
          </div>
        </div>
      )}
    </div>
  );
}
