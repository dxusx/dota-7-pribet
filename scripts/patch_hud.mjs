import fs from 'fs';

const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update footer height
content = content.replace('className="h-24 bg-slate-950/95', 'className="h-28 bg-slate-950/95');

// 2. Replace activeHero avatar with large portrait and stat plaques
const targetSearch = `{/* Left Column: Active Hero Profile */}
          <div className="flex items-center gap-3 w-64 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-lg shrink-0">
              {activeHero.avatarSymbol}
            </div>`;

const newHeroProfile = `{/* Left Column: Active Hero Profile */}
          <div className="flex items-center gap-3 w-80 shrink-0">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/90 shadow-lg shadow-amber-500/20 shrink-0 relative bg-slate-900 cursor-pointer hover:border-amber-300 transition-all"
              onClick={() => setTargetPos({ x: activeHero.x, y: activeHero.y })}
              title="Центрировать камеру на герое"
            >
              <img src={getHeroPortrait(activeHero.id)} alt={activeHero.name} className="w-full h-full object-cover" />
            </div>`;

if (content.includes(targetSearch)) {
  content = content.replace(targetSearch, newHeroProfile);
  console.log('Replaced hero avatar block');
} else {
  console.log('Warning: targetSearch not found');
}

// 3. Add Wesker stance toggle and stat plaques
const statsSearch = `<div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span className="text-emerald-400 font-bold">HP: {activeHero.hp}/{activeHero.maxHp}</span>
                <span className="text-blue-400 font-bold">MP: {activeHero.mana}/{activeHero.maxMana}</span>
                <span>🛡️ {activeHero.armor}</span>
                <span className="text-amber-300 font-bold bg-amber-500/10 px-1 rounded border border-amber-500/20" title="Скорость героя (клеток в ход) и доступно шагов">
                  🦶 {activeHero.speed} кл/ход ({maxSteps} ш.)
                </span>
              </div>`;

const newStatsBlock = `<div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-bold">HP: {activeHero.hp}/{activeHero.maxHp}</span>
                <span className="text-blue-400 font-bold">MP: {activeHero.mana}/{activeHero.maxMana}</span>
                {activeHero.id === 'wesker' && (
                  <button
                    onClick={() => {
                      const toggleSkill = activeHero.skills.find(s => s.id === 'stars-agent');
                      if (toggleSkill) handleSkillClick(toggleSkill);
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1"
                    title="Переключить стойку Вескера (Пистолет / Ближний бой)"
                  >
                    {activeHero.stats?.weaponMode === 'ranged' ? '🔫 Дальний' : '👊 Ближний'}
                  </button>
                )}
              </div>

              {/* Stat Plaques */}
              <div className="grid grid-cols-6 gap-1 text-[9px] font-mono text-center mt-1">
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Урон">
                  <span className="text-slate-400 block text-[7px]">АТК</span>
                  <span className="text-red-400 font-bold">{activeHero.damage}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Броня">
                  <span className="text-slate-400 block text-[7px]">БРО</span>
                  <span className="text-blue-400 font-bold">{activeHero.armor}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Ловкость">
                  <span className="text-slate-400 block text-[7px]">ЛОВ</span>
                  <span className="text-emerald-400 font-bold">{activeHero.agility || 15}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Пробитие брони">
                  <span className="text-slate-400 block text-[7px]">ПРОБ</span>
                  <span className="text-rose-400 font-bold">{activeHero.penetration || 0}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Дальность атаки">
                  <span className="text-slate-400 block text-[7px]">ДАЛЬ</span>
                  <span className="text-purple-400 font-bold">{activeHero.range}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded px-0.5 py-0.5" title="Скорость">
                  <span className="text-slate-400 block text-[7px]">СКОР</span>
                  <span className="text-amber-300 font-bold">{activeHero.speed}</span>
                </div>
              </div>`;

if (content.includes(statsSearch)) {
  content = content.replace(statsSearch, newStatsBlock);
  console.log('Replaced stats block');
} else {
  console.log('Warning: statsSearch not found');
}

// 4. Update skill buttons to show getSkillIcon(skill.id)
const skillBtnOld = `className={\`h-16 w-20 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all text-left relative overflow-hidden \${
                      isTargetingThis
                        ? 'bg-purple-600 border-purple-300 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-400'
                        : isPassive
                        ? 'bg-slate-900/60 border-slate-800 opacity-60 cursor-default'
                        : onCooldown || !hasMana || !hasTime
                        ? 'bg-slate-900/80 border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900/90 border-slate-700 hover:border-amber-400 hover:bg-slate-800'
                    }\`}
                  >`;

const skillBtnNew = `className={\`h-16 w-16 rounded-xl border flex flex-col items-center justify-between p-1 transition-all text-left relative overflow-hidden shrink-0 group \${
                      isTargetingThis
                        ? 'border-purple-300 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-400'
                        : isPassive
                        ? 'border-slate-800 opacity-70 cursor-default'
                        : onCooldown || !hasMana || !hasTime
                        ? 'border-slate-800 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 hover:border-amber-400 hover:scale-105 shadow-md'
                    }\`}
                  >
                    {/* Background SVG Skill Icon */}
                    <img
                      src={getSkillIcon(skill.id)}
                      alt={skill.name}
                      className="absolute inset-0 w-full h-full object-cover -z-0 opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 -z-0" />`;

if (content.includes(skillBtnOld)) {
  content = content.replace(skillBtnOld, skillBtnNew);
  console.log('Replaced skill button background');
} else {
  console.log('Warning: skillBtnOld not found');
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx successfully patched!');
