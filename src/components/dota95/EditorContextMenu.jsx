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
      style={{ left: Math.min(window.innerWidth - 180, Math.max(10, x)), top: Math.min(window.innerHeight - 200, Math.max(10, y)) }}
      className="fixed z-50 w-48 bg-[#0e131d]/95 border-2 border-[#2b394e] rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-auto select-none"
    >
      {/* Object Title */}
      <div className="px-2 py-1 border-b border-slate-700/60 flex items-center justify-between">
        <span className="text-xs font-fantasy font-black text-amber-400 truncate">
          {object.name}
        </span>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white p-0.5 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Menu Actions */}
      <button
        onClick={() => {
          onCenterCamera(object.y, object.x);
          onClose();
        }}
        className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-mono text-slate-200 hover:bg-[#1a2333] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
        <span>Центрировать</span>
      </button>

      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-mono text-slate-200 hover:bg-[#1a2333] hover:text-amber-300 flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-amber-400" />
        <span>Дублировать [Ctrl+D]</span>
      </button>

      <button
        onClick={() => {
          onToggleTeam();
          onClose();
        }}
        className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-mono text-slate-200 hover:bg-[#1a2333] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
        <span>Сменить сторону</span>
      </button>

      <div className="h-px bg-slate-800 my-0.5"></div>

      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-mono text-rose-300 hover:bg-rose-950/80 hover:text-rose-200 flex items-center gap-2 cursor-pointer transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        <span>Удалить [Del]</span>
      </button>
    </div>
  );
}
