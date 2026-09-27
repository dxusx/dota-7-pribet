import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { MAP_SIZE } from '../../data/dotaMapData';
import { playClickSound } from '../../utils/sound';

export default function DotaMinimap({ 
  heroes, 
  heroPositions, 
  activeHeroId, 
  onSelectHero,
  onMinimapClick 
}) {
  const handleSvgClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const ratioX = Math.max(0, Math.min(1, clickX / rect.width));
    const ratioY = Math.max(0, Math.min(1, clickY / rect.height));
    const targetC = Math.round(ratioX * (MAP_SIZE - 1));
    const targetR = Math.round(ratioY * (MAP_SIZE - 1));
    onMinimapClick && onMinimapClick({ r: targetR, c: targetC });
  };

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 bg-[#0c1017] border-2 border-[#2b3548] rounded-tl-lg shadow-2xl overflow-hidden select-none cursor-crosshair">
      
      {/* 2D Minimap Terrain Background */}
      <svg 
        className="w-full h-full" 
        viewBox="0 0 100 100"
        onClick={handleSvgClick}
      >
        
        {/* Dire Base Background (Top-Right) */}
        <polygon points="0,0 100,0 100,100" fill="#201519" />

        {/* Radiant Base Background (Bottom-Left) */}
        <polygon points="0,0 0,100 100,100" fill="#14241b" />

        {/* River (Diagonal Blue Ribbon) */}
        <line x1="0" y1="20" x2="100" y2="80" stroke="#1d4ed8" strokeWidth="6" opacity="0.65" />

        {/* Top Lane */}
        <path d="M 12 88 L 12 12 L 88 12" fill="none" stroke="#475569" strokeWidth="4" opacity="0.6" />

        {/* Mid Lane */}
        <line x1="12" y1="88" x2="88" y2="12" stroke="#475569" strokeWidth="4" opacity="0.6" />

        {/* Bot Lane */}
        <path d="M 12 88 L 88 88 L 88 12" fill="none" stroke="#475569" strokeWidth="4" opacity="0.6" />

        {/* Roshan Pit */}
        <circle cx="36" cy="36" r="3.5" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />

        {/* Radiant Ancient & Towers */}
        <rect x="14" y="80" width="5" height="5" fill="#10b981" />
        <circle cx="28" cy="72" r="2" fill="#10b981" /> {/* Mid T1 */}
        <circle cx="12" cy="50" r="2" fill="#10b981" /> {/* Top T1 */}
        <circle cx="50" cy="88" r="2" fill="#10b981" /> {/* Bot T1 */}

        {/* Dire Ancient & Towers */}
        <rect x="80" y="14" width="5" height="5" fill="#ef4444" />
        <circle cx="72" cy="28" r="2" fill="#ef4444" /> {/* Mid T1 */}
        <circle cx="50" cy="12" r="2" fill="#ef4444" /> {/* Top T1 */}
        <circle cx="88" cy="50" r="2" fill="#ef4444" /> {/* Bot T1 */}

        {/* Heroes on Minimap */}
        {heroPositions.map((pos) => {
          const hero = heroes.find(h => h.id === pos.heroId);
          if (!hero) return null;

          const cx = (pos.c / (MAP_SIZE - 1)) * 88 + 6;
          const cy = (pos.r / (MAP_SIZE - 1)) * 88 + 6;
          const isSelected = pos.heroId === activeHeroId;
          const isRadiant = pos.team === 'radiant';

          return (
            <g 
              key={pos.heroId} 
              className="cursor-pointer"
              onClick={() => { playClickSound(); onSelectHero(pos.heroId); }}
            >
              {isSelected && (
                <circle cx={cx} cy={cy} r="6" fill="none" stroke="#facc15" strokeWidth="1.5" className="animate-ping" />
              )}
              <circle 
                cx={cx} 
                cy={cy} 
                r={isSelected ? "4.5" : "3.5"} 
                fill={isRadiant ? "#10b981" : "#ef4444"} 
                stroke={isSelected ? "#fef08a" : "#000000"} 
                strokeWidth="1.5" 
              />
              <text 
                x={cx} 
                y={cy + 1} 
                fontSize="3" 
                fill="#ffffff" 
                fontWeight="bold" 
                textAnchor="middle" 
                alignmentBaseline="middle"
              >
                {hero.name.substring(0, 1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Minimap Label */}
      <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-400/80 bg-black/60 px-1 py-0.5 rounded pointer-events-none">
        КАРТА ДОТЫ
      </div>

    </div>
  );
}
