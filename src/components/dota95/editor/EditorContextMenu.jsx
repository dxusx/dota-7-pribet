import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, Crosshair, RefreshCw, X } from 'lucide-react';

export default function EditorContextMenu({
  x,
  y,
  object,
  onClose,
  onDuplicate,
  onDelete,
  onToggleTeam,
  onCenterCamera
}) {
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!object) return null;

  return (
    <div
      ref={menuRef}
      style={{ 
        left: Math.min(window.innerWidth - 170, Math.max(10, x)), 
        top: Math.min(window.innerHeight - 190, Math.max(10, y)) 
      }}
      className="fixed z-50 w-44 bg-[#111216] border-2 border-[#2b2d38] shadow-[0_4px_20px_rgba(0,0,0,0.9)] p-1 flex flex-col gap-0.5 select-none"
    >
      {/* Title */}
      <div className="px-2 py-1 bg-[#181920] border-b border-[#262832] flex items-center justify-between">
        <span className="text-[11px] font-fantasy font-black text-[#dfb652] truncate">
          {object.name}
        </span>
        <button 
          onClick={onClose} 
          className="text-[#6c707f] hover:text-white p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Actions */}
      <button
        onClick={() => {
          onCenterCamera(object.y, object.x);
          onClose();
        }}
        className="w-full px-2 py-1 text-left text-[10px] font-mono text-[#c4c7d4] hover:bg-[#1a1b22] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Crosshair className="w-3 h-3 text-[#38bdf8]" />
        <span>FOCUS CAMERA</span>
      </button>

      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-2 py-1 text-left text-[10px] font-mono text-[#c4c7d4] hover:bg-[#1a1b22] hover:text-[#dfb652] flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Copy className="w-3 h-3 text-[#dfb652]" />
        <span>DUPLICATE [Ctrl+D]</span>
      </button>

      <button
        onClick={() => {
          onToggleTeam();
          onClose();
        }}
        className="w-full px-2 py-1 text-left text-[10px] font-mono text-[#c4c7d4] hover:bg-[#1a1b22] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <RefreshCw className="w-3 h-3 text-[#a78bfa]" />
        <span>CHANGE TEAM</span>
      </button>

      <div className="h-px bg-[#262832] my-0.5"></div>

      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-2 py-1 text-left text-[10px] font-mono text-[#fca5a5] hover:bg-[#381113] hover:text-[#fecaca] flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Trash2 className="w-3 h-3 text-[#ef4444]" />
        <span>DELETE [DEL]</span>
      </button>
    </div>
  );
}
