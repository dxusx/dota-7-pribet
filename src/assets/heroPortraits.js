const portraitSvg = (name, colors) => {
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const [primary, secondary, glow] = colors;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="bg" cx="35%" cy="25%"><stop stop-color="${glow}"/><stop offset="1" stop-color="${primary}"/></radialGradient>
      <linearGradient id="cloak" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${secondary}"/><stop offset="1" stop-color="${primary}"/></linearGradient>
      <filter id="shadow"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <rect width="128" height="128" rx="22" fill="url(#bg)"/>
    <circle cx="64" cy="53" r="30" fill="#f1c7a5" opacity=".96"/>
    <path d="M28 119c5-31 19-43 36-43s31 12 36 43" fill="url(#cloak)"/>
    <path d="M34 48c2-27 17-37 34-37 18 0 31 13 28 39-10-12-19-18-32-18-10 0-20 5-30 16Z" fill="${secondary}"/>
    <circle cx="52" cy="55" r="4" fill="#111827"/><circle cx="76" cy="55" r="4" fill="#111827"/>
    <path d="M52 70c8 5 16 5 24 0" fill="none" stroke="#7f1d1d" stroke-width="3" stroke-linecap="round"/>
    <path d="M45 87h38" stroke="${glow}" stroke-width="3" opacity=".8"/>
    <text x="64" y="113" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">${initials}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const HERO_PORTRAITS = {
  wesker: portraitSvg('Albert Wesker', ['#111827', '#7f1d1d', '#ef4444']),
  axe: portraitSvg('Axe', ['#451a03', '#991b1b', '#f97316']),
  katarina: portraitSvg('Катарина', ['#4c0519', '#9f1239', '#fb7185']),
  anderson: portraitSvg('Александр Андерсон', ['#422006', '#713f12', '#facc15']),
  gojo: portraitSvg('Satoru Gojo', ['#172554', '#1d4ed8', '#67e8f9']),
  sukuna: portraitSvg('Ryomen Sukuna', ['#450a0a', '#991b1b', '#fca5a5']),
  pudge: portraitSvg('Pudge', ['#052e16', '#166534', '#84cc16']),
  invoker: portraitSvg('Invoker', ['#312e81', '#7c3aed', '#f0abfc']),
  rubick: portraitSvg('Rubick', ['#064e3b', '#047857', '#6ee7b7']),
  sf: portraitSvg('Shadow Fiend', ['#18181b', '#3f3f46', '#a78bfa']),
  monesy: portraitSvg('m0NESY', ['#172554', '#1e40af', '#93c5fd']),
  minos: portraitSvg('Minos Prime', ['#3f1d0b', '#c2410c', '#fed7aa']),
};

export function getHeroPortrait(heroOrId) {
  const id = typeof heroOrId === 'string' ? heroOrId : heroOrId?.defId;
  return HERO_PORTRAITS[id] || HERO_PORTRAITS.wesker;
}
