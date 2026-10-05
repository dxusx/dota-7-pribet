import fs from 'fs';
import { HEROES_ROSTER } from '../src/game/heroesData.js';

// Thematic color palettes for skills (Dota 2 styling)
const THEMES = {
  blood: { bg1: '#450a0a', bg2: '#1c1917', border: '#ef4444', glow: '#dc2626', text: '#fca5a5' },
  fire: { bg1: '#7c2d12', bg2: '#18181b', border: '#f97316', glow: '#ea580c', text: '#fdba74' },
  void: { bg1: '#3b0764', bg2: '#090d16', border: '#a855f7', glow: '#9333ea', text: '#d8b4fe' },
  frost: { bg1: '#0c4a6e', bg2: '#020617', border: '#38bdf8', glow: '#0284c7', text: '#bae6fd' },
  poison: { bg1: '#064e3b', bg2: '#022c22', border: '#10b981', glow: '#059669', text: '#6ee7b7' },
  holy: { bg1: '#713f12', bg2: '#1e1b4b', border: '#eab308', glow: '#ca8a04', text: '#fef08a' },
  sniper: { bg1: '#1e293b', bg2: '#0f172a', border: '#94a3b8', glow: '#64748b', text: '#f8fafc' },
  lightning: { bg1: '#1e1b4b', bg2: '#0f172a', border: '#6366f1', glow: '#4f46e5', text: '#a5b4fc' },
  blade: { bg1: '#27272a', bg2: '#09090b', border: '#a1a1aa', glow: '#71717a', text: '#f4f4f5' },
  gold: { bg1: '#451a03', bg2: '#0c0a09', border: '#f59e0b', glow: '#d97706', text: '#fde68a' }
};

function getSkillTheme(id, type) {
  if (type === 'ULTIMATE') return 'gold';
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

function generateSvgBody(skill) {
  const theme = THEMES[getSkillTheme(skill.id, skill.type)];
  const symbol = getSkillSymbol(skill.id);
  const isUlt = skill.type === 'ULTIMATE';
  const isPass = skill.type === 'PASSIVE';
  const borderCol = isUlt ? '#f59e0b' : theme.border;
  const borderWidth = isUlt ? '2.5' : '1.5';
  const shortName = (skill.name || skill.id).replace(/\(.*?\)/g, '').trim().substring(0, 16);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_${skill.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.bg1}" />
          <stop offset="100%" stop-color="${theme.bg2}" />
        </linearGradient>
        <radialGradient id="aura_${skill.id}" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_${skill.id})" stroke="${borderCol}" stroke-width="${borderWidth}" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_${skill.id})" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="${borderCol}" stroke-width="1" stroke-dasharray="${isPass ? '4,3' : 'none'}" />
      ${isUlt ? `<circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />` : ''}

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">${symbol}</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="${theme.text}" text-anchor="middle" dominant-baseline="middle">${shortName}</text>
    </svg>
  `;
}

const lines = [
  `/**`,
  ` * Skill Icons Asset Registry`,
  ` * High-definition SVG-based icons for all 47 hero abilities with Dota 2 style formatting.`,
  ` * Fully self-contained data URIs with zero external requests.`,
  ` */`,
  ``,
  `function makeSvgDataUri(svgContent) {`,
  `  return \`data:image/svg+xml;utf8,\${encodeURIComponent(svgContent.trim().replace(/\\s+/g, ' '))}\`;`,
  `}`,
  ``,
  `export const SKILL_ICONS = {`
];

let count = 0;
for (const hero of HEROES_ROSTER) {
  for (const skill of hero.skills) {
    count++;
    const svg = generateSvgBody(skill);
    lines.push(`  '${skill.id}': makeSvgDataUri(\`${svg}\`),`);
  }
}

lines.push(`};`);
lines.push(``);
lines.push(`export function getSkillIcon(skillId) {`);
lines.push(`  return SKILL_ICONS[skillId] || makeSvgDataUri(\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><rect width="80" height="80" rx="10" fill="#1e293b" stroke="#64748b" /><text x="40" y="46" font-size="26" text-anchor="middle">✨</text></svg>\`);`);
lines.push(`}`);
lines.push(``);

fs.writeFileSync('src/assets/skillIcons.js', lines.join('\n'));
console.log(`Successfully generated src/assets/skillIcons.js with ${count} skills using makeSvgDataUri!`);
