const iconSvg = (label, colors) => {
  const [from, to, accent] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="96" height="96" rx="18" fill="url(#g)"/>
    <circle cx="48" cy="45" r="25" fill="none" stroke="${accent}" stroke-width="4" opacity=".8"/>
    <path d="M48 15v60M18 45h60M27 24l42 42M69 24 27 66" stroke="${accent}" stroke-width="2" opacity=".55"/>
    <text x="48" y="54" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="800">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const palettes = [
  ['#172554', '#2563eb', '#93c5fd'], ['#450a0a', '#dc2626', '#fecaca'],
  ['#422006', '#ea580c', '#fed7aa'], ['#312e81', '#9333ea', '#e9d5ff'],
  ['#052e16', '#16a34a', '#bbf7d0'], ['#083344', '#0891b2', '#a5f3fc'],
  ['#3f1d0b', '#c2410c', '#fed7aa'], ['#4c0519', '#db2777', '#fbcfe8'],
];

const iconLabels = {
  'stars-agent': 'S', ouroboros: 'O', 'wesker-speed': '⚡', mastermind: 'M',
  'berserkers-call': 'A', 'battle-hunger': 'H', 'counter-helix': '↻', 'culling-blade': 'X',
  voracity: 'V', 'bouncing-blade': '✦', preparation: 'P', shunpo: '→', 'death-lotus': '✧',
  superhuman: '+', 'bayonet-throw': '†', 'whirlwind-slash': '↯', 'barrier-seal': '◇', 'divine-regen': '✚',
  'infinity-shield': '∞', 'lapse-blue': 'B', 'reversal-red': 'R', 'hollow-purple': '紫', 'unlimited-void': 'U',
  'king-of-curses': 'K', dismantle: '/', cleave: 'C', 'furnace-open': 'F', 'malevolent-shrine': 'D',
  'meat-hook': '∿', rot: '☠', 'flesh-heap': '◆', dismember: '†',
  'cold-snap': '❄', 'sun-strike': '☀', 'chaos-meteor': '☄',
  telekinesis: '↑', 'fade-bolt': '↝', 'spell-steal': 'S',
  'shadowraze-near': 'N', 'shadowraze-medium': 'M', 'shadowraze-far': 'F', 'requiem-of-souls': 'R',
  'awp-wallbang': '◎', 'oneway-smoke': '◌', flashbang: '✹', 'clutch-master': '★',
  judgement: '!', 'thy-end-is-now': '⚔', 'prepare-thyself': '▲', crush: '▼',
};

export const SKILL_ICONS = Object.fromEntries(
  Object.entries(iconLabels).map(([id, label], index) => [id, iconSvg(label, palettes[index % palettes.length])])
);

export function getSkillIcon(skillOrId) {
  const id = typeof skillOrId === 'string' ? skillOrId : skillOrId?.id;
  if (SKILL_ICONS[id]) return SKILL_ICONS[id];
  const fallback = String(id || '?').slice(0, 2).toUpperCase();
  return iconSvg(fallback, palettes[0]);
}
