import React, { useState } from 'react';
import { 
  HERO_TEMPLATES, CREEP_TEMPLATES, TOWER_TEMPLATES, OBJECT_TYPES 
} from '../../data/editorTemplates.js';
import { getAssetUrl } from '../../utils/assetUrl.js';
import { 
  ChevronLeft, ChevronRight, Plus, Swords, Shield, 
  Sparkles, Layers, Search 
} from 'lucide-react';

export default function EditorLeftLibrary({
  isOpen,
  onToggleOpen,
  onAddObjectToCenter,
  onStartLibraryDrag
}) {
  const [activeTab, setActiveTab] = useState('heroes'); // 'heroes' | 'creeps' | 'towers'
  const [searchQuery, setSearchQuery] = useState('');

  // Get active templates list
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
      className={`absolute top-13 left-2 bottom-48 z-30 transition-all duration-300 pointer-events-auto flex flex-col ${
        isOpen ? 'w-64' : 'w-10'
      }`}
    >
      <div className="relative w-full h-full bg-[#0c1017]/95 border-2 border-[#263348] rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
        
        {/* PANEL HEADER WITH TOGGLE BUTTON */}
        <div className="h-10 bg-gradient-to-r from-[#141b26] to-[#0f141e] border-b border-[#263348] px-2.5 flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-fantasy font-black text-amber-400 text-xs tracking-wider uppercase">
                БИБЛИОТЕКА
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
          )}

          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            title={isOpen ? 'Свернуть панель библиотеки' : 'Развернуть панель библиотеки'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <>
            {/* CATEGORY TABS (HEROES, CREEPS, TOWERS) */}
            <div className="grid grid-cols-3 p-1.5 gap-1 bg-[#090d14] border-b border-[#202a3c]">
              <button
                onClick={() => setActiveTab('heroes')}
                className={`py-1 rounded text-[11px] font-mono font-bold flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  activeTab === 'heroes' 
                    ? 'bg-amber-500 text-black shadow' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b26]'
                }`}
              >
                <span>Герои</span>
                <span className="text-[9px] opacity-80">({HERO_TEMPLATES.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('creeps')}
                className={`py-1 rounded text-[11px] font-mono font-bold flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  activeTab === 'creeps' 
                    ? 'bg-amber-500 text-black shadow' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b26]'
                }`}
              >
                <span>Крипы</span>
                <span className="text-[9px] opacity-80">({CREEP_TEMPLATES.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('towers')}
                className={`py-1 rounded text-[11px] font-mono font-bold flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  activeTab === 'towers' 
                    ? 'bg-amber-500 text-black shadow' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b26]'
                }`}
              >
                <span>Вышки</span>
                <span className="text-[9px] opacity-80">({TOWER_TEMPLATES.length})</span>
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="p-2 border-b border-[#202a3c]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Поиск объекта..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111722] border border-[#253247] rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* TEMPLATES LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="text-[10px] text-slate-400 font-mono px-1 pb-1">
                Перетащите на карту или нажмите «+»:
              </div>

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
                    className="group relative flex items-center justify-between p-1.5 rounded-lg bg-[#111622] hover:bg-[#182030] border border-[#232f42] hover:border-amber-400/80 cursor-grab active:cursor-grabbing transition-all shadow"
                    title={`Перетащите ${tpl.name} на карту`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Avatar / Icon preview */}
                      <div className={`relative w-8 h-8 rounded overflow-hidden border bg-black flex items-center justify-center shrink-0 ${
                        isRadiant ? 'border-emerald-500/80' : isDire ? 'border-rose-500/80' : 'border-amber-500/80'
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
                        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">
                          {tpl.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate flex items-center gap-1">
                          <span className={isRadiant ? 'text-emerald-400' : isDire ? 'text-rose-400' : 'text-amber-400'}>
                            {isRadiant ? '● Radiant' : isDire ? '● Dire' : '● Neutral'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddObjectToCenter(tpl);
                      }}
                      className="w-6 h-6 rounded bg-[#1c2436] hover:bg-amber-500 hover:text-black text-slate-300 border border-[#2b3a52] flex items-center justify-center cursor-pointer transition-colors shadow"
                      title={`Добавить ${tpl.name} в центр экрана`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  Ничего не найдено
                </div>
              )}
            </div>

            {/* PANEL FOOTER HINT */}
            <div className="p-2 bg-[#090d14] border-t border-[#202a3c] text-[10px] font-mono text-slate-400 text-center">
              💡 Drag & Drop на любую клетку карты
            </div>
          </>
        )}

      </div>
    </aside>
  );
}
