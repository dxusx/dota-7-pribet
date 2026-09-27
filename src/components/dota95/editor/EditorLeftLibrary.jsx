import React, { useState } from 'react';
import { 
  HERO_TEMPLATES, CREEP_TEMPLATES, TOWER_TEMPLATES, OBJECT_TYPES 
} from '../../../data/editorTemplates.js';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  ChevronLeft, ChevronRight, Plus, Search, Layers 
} from 'lucide-react';

export default function EditorLeftLibrary({
  isOpen,
  onToggleOpen,
  onAddObjectToCenter,
  onStartLibraryDrag
}) {
  const [activeTab, setActiveTab] = useState('heroes'); // 'heroes' | 'creeps' | 'towers'
  const [searchQuery, setSearchQuery] = useState('');

  const templates = activeTab === 'heroes' 
    ? HERO_TEMPLATES 
    : activeTab === 'creeps' 
    ? CREEP_TEMPLATES 
    : TOWER_TEMPLATES;

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside 
      className={`absolute top-12 left-2 bottom-44 z-30 transition-all duration-200 pointer-events-auto flex flex-col ${
        isOpen ? 'w-60' : 'w-8'
      }`}
    >
      <div className="relative w-full h-full bg-[#111216] border border-[#2b2d38] shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* PANEL HEADER */}
        <div className="h-8 bg-[#181920] border-b border-[#2b2d38] px-2 flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#dfb652]" />
              <span className="font-fantasy font-black text-[#dfb652] text-[11px] tracking-wider uppercase">
                OBJECT LIBRARY
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Layers className="w-3.5 h-3.5 text-[#dfb652]" />
            </div>
          )}

          <button
            onClick={onToggleOpen}
            className="w-5 h-5 flex items-center justify-center text-[#7e8392] hover:text-white bg-[#0f1014] border border-[#262832] cursor-pointer"
            title={isOpen ? 'Свернуть библиотеку' : 'Развернуть библиотеку'}
          >
            {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* CATEGORY TABS (HEROES, CREEPS, TOWERS) */}
            <div className="grid grid-cols-3 bg-[#0a0b0d] p-1 gap-1 border-b border-[#22242e]">
              <button
                onClick={() => setActiveTab('heroes')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'heroes'
                    ? 'bg-[#20222b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                    : 'bg-[#13141a] border-[#22242e] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                HEROES ({HERO_TEMPLATES.length})
              </button>

              <button
                onClick={() => setActiveTab('creeps')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'creeps'
                    ? 'bg-[#20222b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                    : 'bg-[#13141a] border-[#22242e] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                CREEPS ({CREEP_TEMPLATES.length})
              </button>

              <button
                onClick={() => setActiveTab('towers')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'towers'
                    ? 'bg-[#20222b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                    : 'bg-[#13141a] border-[#22242e] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                TOWERS ({TOWER_TEMPLATES.length})
              </button>
            </div>

            {/* SEARCH BOX */}
            <div className="p-1.5 border-b border-[#22242e] bg-[#0d0e12]">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#565966]" />
                <input
                  type="text"
                  placeholder="ПОИСК..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#15161d] border border-[#2b2d38] pl-7 pr-2 py-1 text-[10px] font-mono text-[#e1e4ed] placeholder-[#565966] focus:outline-none focus:border-[#dfb652]"
                />
              </div>
            </div>

            {/* TEMPLATES LIST */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 bg-[#0e0f13]">
              {filteredTemplates.map(tpl => {
                const isRadiant = tpl.defaultTeam === 'radiant';
                const isDire = tpl.defaultTeam === 'dire';

                return (
                  <div
                    key={tpl.templateId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', tpl.templateId);
                      onStartLibraryDrag(tpl);
                    }}
                    className="group relative flex items-center justify-between p-1 bg-[#14151b] hover:bg-[#1a1c24] border border-[#252733] hover:border-[#dfb652]/70 cursor-grab active:cursor-grabbing transition-colors"
                    title={`Перетащите ${tpl.name} на карту`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Portrait / Icon slot */}
                      <div className={`w-8 h-8 bg-black border shrink-0 flex items-center justify-center ${
                        isRadiant ? 'border-[#1b5e3f]' : isDire ? 'border-[#8a2424]' : 'border-[#8a681c]'
                      }`}>
                        {tpl.avatar ? (
                          <img 
                            src={getAssetUrl(tpl.avatar)} 
                            alt={tpl.name} 
                            className="w-full h-full object-cover object-top pointer-events-none" 
                          />
                        ) : (
                          <span className="text-base select-none pointer-events-none">{tpl.icon}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col min-w-0">
                        <div className="text-[11px] font-mono font-bold text-[#d2d5e0] truncate group-hover:text-[#dfb652]">
                          {tpl.name}
                        </div>
                        <div className="text-[9px] font-mono text-[#6c707f] truncate">
                          {isRadiant ? 'RADIANT' : isDire ? 'DIRE' : 'NEUTRAL'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddObjectToCenter(tpl);
                      }}
                      className="w-5 h-5 bg-[#1b1c24] hover:bg-[#dfb652] hover:text-black border border-[#2e303d] text-[#a0a4b3] flex items-center justify-center cursor-pointer transition-colors"
                      title="Добавить на карту"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-6 text-[10px] text-[#5c606e] font-mono">
                  НЕ НАЙДЕНО
                </div>
              )}
            </div>

            {/* FOOTER ACTION: [ + ADD OBJECT ] */}
            <div className="p-1.5 bg-[#0a0b0d] border-t border-[#22242e]">
              <button
                onClick={() => {
                  const defaultTpl = filteredTemplates[0] || HERO_TEMPLATES[0];
                  onAddObjectToCenter(defaultTpl);
                }}
                className="w-full py-1 bg-gradient-to-b from-[#2a2c36] to-[#181920] hover:from-[#353744] hover:to-[#20212a] border border-[#3e4152] hover:border-[#dfb652] text-[#d6d9e6] hover:text-[#fce89e] text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              >
                <Plus className="w-3 h-3 text-[#dfb652]" />
                <span>+ ADD OBJECT</span>
              </button>
            </div>
          </>
        )}

      </div>
    </aside>
  );
}
