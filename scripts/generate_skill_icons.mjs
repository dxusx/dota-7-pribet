import fs from 'fs';
import { HEROES_ROSTER } from '../src/game/heroesData.js';

// Style presets based on skill theme
const THEMES = {
  blood: { bg1: '#450a0a', bg2: '#1c1917', border: '#ef4444', iconColor: '#fca5a5' },
  fire: { bg1: '#7c2d12', bg2: '#1e1b4b', border: '#f97316', iconColor: '#fdba74' },
  void: { bg1: '#3b0764', bg2: '#090d16', border: '#a855f7', iconColor: '#d8b4fe' },
  frost: { bg1: '#0c4a6e', bg2: '#020617', border: '#38bdf8', iconColor: '#bae6fd' },
  poison: { bg1: '#064e3b', bg2: '#022c22', border: '#10b981', iconColor: '#6ee7b7' },
  holy: { bg1: '#713f12', bg2: '#1e1b4b', border: '#eab308', iconColor: '#fef08a' },
  sniper: { bg1: '#1e293b', bg2: '#0f172a', border: '#94a3b8', iconColor: '#f8fafc' },
  lightning: { bg1: '#1e1b4b', bg2: '#0f172a', border: '#6366f1', iconColor: '#a5b4fc' },
  blade: { bg1: '#3f3f46', bg2: '#18181b', border: '#e4e4e7', iconColor: '#ffffff' }
};

function getSkillTheme(id) {
  if (id.includes('ouroboros') || id.includes('rot') || id.includes('flesh')) return 'poison';
  if (id.includes('fire') || id.includes('furnace') || id.includes('meteor') || id.includes('sun-strike') || id.includes('battle-hunger')) return 'fire';
  if (id.includes('purple') || id.includes('void') || id.includes('shadow') || id.includes('requiem') || id.includes('shrine') || id.includes('curse')) return 'void';
  if (id.includes('cold') || id.includes('blue') || id.includes('freeze')) return 'frost';
  if (id.includes('divine') || id.includes('holy') || id.includes('cross') || id.includes('superhuman') || id.includes('barrier') || id.includes('judgement')) return 'holy';
  if (id.includes('awp') || id.includes('smoke') || id.includes('flash') || id.includes('clutch')) return 'sniper';
  if (id.includes('telekinesis') || id.includes('fade') || id.includes('steal') || id.includes('speed')) return 'lightning';
  if (id.includes('cull') || id.includes('berserker') || id.includes('helix') || id.includes('blood') || id.includes('dismember')) return 'blood';
  return 'blade';
}

function getSkillSymbol(id) {
  if (id.includes('stars')) return '🔫';
  if (id.includes('ouroboros')) return '🧬';
  if (id.includes('speed')) return '⚡';
  if (id.includes('mastermind')) return '👁️';
  if (id.includes('berserker')) return '📢';
  if (id.includes('battle-hunger')) return '🔥';
  if (id.includes('counter-helix')) return '🪓';
  if (id.includes('culling-blade')) return '⚔️';
  if (id.includes('voracity')) return '🩸';
  if (id.includes('bouncing-blade')) return '🗡️';
  if (id.includes('preparation')) return '⏱️';
  if (id.includes('shunpo')) return '💨';
  if (id.includes('death-lotus')) return '🌸';
  if (id.includes('superhuman')) return '✝️';
  if (id.includes('bayonet')) return '🗡️';
  if (id.includes('whirlwind')) return '🌪️';
  if (id.includes('barrier')) return '🛡️';
  if (id.includes('divine-regen')) return '✨';
  if (id.includes('infinity')) return '♾️';
  if (id.includes('lapse-blue')) return '🔵';
  if (id.includes('reversal-red')) return '🔴';
  if (id.includes('hollow-purple')) return '🟣';
  if (id.includes('unlimited-void')) return '🌌';
  if (id.includes('king-of-curses')) return '👑';
  if (id.includes('dismantle')) return '✂️';
  if (id.includes('cleave')) return '🔪';
  if (id.includes('furnace')) return '🏹';
  if (id.includes('malevolent-shrine')) return '⛩️';
  if (id.includes('hook')) return '🪝';
  if (id.includes('rot')) return '☣️';
  if (id.includes('flesh-heap')) return '🥩';
  if (id.includes('dismember')) return '🦷';
  if (id.includes('cold-snap')) return '❄️';
  if (id.includes('sun-strike')) return '☀️';
  if (id.includes('meteor')) return '☄️';
  if (id.includes('telekinesis')) return '🌀';
  if (id.includes('fade-bolt')) return '⚡';
  if (id.includes('spell-steal')) return '🎭';
  if (id.includes('shadowraze')) return '💣';
  if (id.includes('requiem')) return '💀';
  if (id.includes('awp')) return '🎯';
  if (id.includes('smoke')) return '☁️';
  if (id.includes('flash')) return '💥';
  if (id.includes('clutch')) return '🏆';
  if (id.includes('judgement')) return '⚖️';
  if (id.includes('thy-end')) return '👊';
  if (id.includes('prepare')) return '🐍';
  if (id.includes('crush')) return '💥';
  return '✨';
}

function buildSvg(skill) {
  const theme = THEMES[getSkillTheme(skill.id)] || THEMES.blade;
  const symbol = getSkillSymbol(skill.id);
  const isUlt = skill.type === 'ULTIMATE';
  const isPass = skill.type === 'PASSIVE';
  const borderCol = isUlt ? '#f59e0b' : theme.border;
  const borderWidth = isUlt ? '3' : '1.5';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${theme.bg1}"/><stop offset="100%" stop-color="${theme.bg2}"/></linearGradient></defs><rect width="80" height="80" rx="10" fill="url(%23bg)" stroke="${borderCol}" stroke-width="${borderWidth}"/><circle cx="40" cy="38" r="26" fill="rgba(0,0,0,0.35)" stroke="${borderCol}" stroke-width="1" stroke-dasharray="${isPass ? '3,3' : 'none'}"/><text x="40" y="44" font-size="28" text-anchor="middle">${symbol}</text><rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(0,0,0,0.7)"/><text x="40" y="72" font-size="8" font-family="sans-serif" font-weight="bold" fill="${theme.iconColor}" text-anchor="middle" dominant-baseline="middle">${(skill.name || '').substring(0, 14)}</text></svg>`;
}

const skillEntries = [];
for (const hero of HEROES_ROSTER) {
  for (const skill of hero.skills) {
    const uri = buildSvg(skill);
    skillEntries.push(`  '${skill.id}': \`${uri}\``);
  }
}

const content = `/**
 * Skill Icons Asset Registry
 * SVG-based icons for all hero abilities with Dota 2 style formatting.
 */

export const SKILL_ICONS = {
${skillEntries.join(',\n')}
};

export function getSkillIcon(skillId) {
  return SKILL_ICONS[skillId] || \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><rect width="80" height="80" rx="8" fill="%231e293b" stroke="%23475569"/><text x="40" y="46" font-size="24" text-anchor="middle">✨</text></svg>\`;
}
`;

fs.writeFileSync('src/assets/skillIcons.js', content);
console.log('Successfully generated src/assets/skillIcons.js with', skillEntries.length, 'skills.');
