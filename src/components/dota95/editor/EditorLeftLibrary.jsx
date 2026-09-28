import React, { useState } from 'react';
import { 
  HERO_TEMPLATES, CREEP_TEMPLATES, TOWER_TEMPLATES, OBJECT_TYPES 
} from '../../../data/editorTemplates.js';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  ChevronLeft, ChevronRight, Plus, Search, Layers, Swords, Shield
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
      className={`absolute top-12 left-2 bottom-40 z-30 transition-all duration-200 pointer-events-auto flex flex-col select-none ${
        isOpen ? 'w-64' : 'w-8'
      }`}
    >
      <div className="relative w-full h-full bg-[#0e1015] border border-[#2b2d39] shadow-[0_4px_24px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        
        {/* PANEL HEADER */}
        <div className="h-8 bg-[#14161f] border-b border-[#2b2d39] px-2 flex items-center justify-between shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {isOpen ? (
            <div className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-[#dfb652]" />
              <span className="font-fantasy font-black text-[#dfb652] text-[11px] tracking-wider uppercase">
                OBJECT ROSTER
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Swords className="w-3.5 h-3.5 text-[#dfb652]" />
            </div>
          )}

          <button
            onClick={onToggleOpen}
            className="w-5 h-5 flex items-center justify-center text-[#7e8392] hover:text-white bg-[#0a0b0e] border border-[#262832] cursor-pointer"
            title={isOpen ? 'Свернуть ростер' : 'Развернуть ростер'}
          >
            {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* CATEGORY TABS (HEROES, CREEPS, TOWERS) */}
            <div className="grid grid-cols-3 bg-[#08090d] p-1 gap-1 border-b border-[#22242e] shrink-0">
              <button
                onClick={() => setActiveTab('heroes')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'heroes'
                    ? 'bg-[#1e202b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'bg-[#101218] border-[#20222c] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                HEROES ({HERO_TEMPLATES.length})
              </button>

              <button
                onClick={() => setActiveTab('creeps')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'creeps'
                    ? 'bg-[#1e202b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'bg-[#101218] border-[#20222c] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                CREEPS ({CREEP_TEMPLATES.length})
              </button>

              <button
                onClick={() => setActiveTab('towers')}
                className={`py-1 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border ${
                  activeTab === 'towers'
                    ? 'bg-[#1e202b] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : 'bg-[#101218] border-[#20222c] text-[#6d717f] hover:text-[#c4c7d4]'
                }`}
              >
                TOWERS ({TOWER_TEMPLATES.length})
              </button>
            </div>

            {/* SEARCH BOX */}
            <div className="p-1.5 border-b border-[#22242e] bg-[#0b0c10] shrink-0">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#565966]" />
                <input
                  type="text"
                  placeholder="ПОИСК..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#13151c] border border-[#262834] pl-7 pr-2 py-1 text-[10px] font-mono text-[#e1e4ed] placeholder-[#565966] focus:outline-none focus:border-[#dfb652]"
                />
              </div>
            </div>

            {/* DOTA ROSTER LIST */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 bg-[#0b0c10]">
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
                    className="group relative flex items-center justify-between p-1 bg-[#12141b] hover:bg-[#181a24] border border-[#22242f] hover:border-[#dfb652]/70 cursor-grab active:cursor-grabbing transition-colors"
                    title={`Перетащите ${tpl.name} на карту`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Rectangular Dota Hero/Unit Portrait */}
                      <div className={`w-9 h-10 bg-black border shrink-0 flex items-center justify-center relative overflow-hidden ${
                        isRadiant ? 'border-[#1b5e3f]' : isDire ? 'border-[#8a2424]' : 'border-[#8a681c]'
                      }`}>
                        {tpl.avatar ? (
                          <img 
                            src={getAssetUrl(tpl.avatar)} 
                            alt={tpl.name} 
                            className="w-full h-full object-cover object-top pointer-events-none" 
                          />
                        ) : (
                          <span className="text-lg select-none pointer-events-none">{tpl.icon}</span>
                        )}
                        {/* Tiny team corner mark */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                          isRadiant ? 'bg-[#34d399]' : isDire ? 'bg-[#f87171]' : 'bg-[#dfb652]'
                        }`} />
                      </div>

                      {/* Hero Info */}
                      <div className="flex flex-col min-w-0 pr-1">
                        <div className="text-[11px] font-fantasy font-black text-[#e8ebf5] leading-tight truncate group-hover:text-[#dfb652]">
                          {tpl.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[8px] font-mono font-black uppercase px-1 py-0.2 border ${
                            isRadiant 
                              ? 'bg-[#0f291c] border-[#1b5e3f] text-[#34d399]' 
                              : isDire 
                              ? 'bg-[#301213] border-[#8a2424] text-[#f87171]' 
                              : 'bg-[#2b220d] border-[#8a681c] text-[#dfb652]'
                          }`}>
                            {isRadiant ? 'RAD' : isDire ? 'DIRE' : 'NEUT'}
                          </span>
                          {tpl.role && (
                            <span className="text-[9px] font-mono text-[#6c707f] truncate">
                              {tpl.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compact Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddObjectToCenter(tpl);
                      }}
                      className="px-2 py-1 bg-gradient-to-b from-[#382b13] to-[#201809] hover:from-[#4a3a1a] hover:to-[#2c220d] border border-[#a17920] text-[#fce89e] text-[9px] font-mono font-black uppercase flex items-center gap-0.5 cursor-pointer shrink-0 transition-colors shadow"
                      title={`Добавить ${tpl.name} на карту`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>ADD</span>
                    </button>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-6 text-[10px] font-mono text-[#5b5f6e]">
                  Объекты не найдены
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
