/**
 * Skill Icons Asset Registry
 * High-definition SVG-based icons for all 47 hero abilities with Dota 2 style formatting.
 * Fully self-contained data URIs with zero external requests.
 */

function makeSvgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '))}`;
}

export const SKILL_ICONS = {
  'stars-agent': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_stars-agent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_stars-agent" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_stars-agent)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_stars-agent)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🔫</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">S.T.A.R.S. Agent</text>
    </svg>
  `),
  'ouroboros': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_ouroboros" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </linearGradient>
        <radialGradient id="aura_ouroboros" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#059669" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_ouroboros)" stroke="#10b981" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_ouroboros)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#10b981" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🧬</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#6ee7b7" text-anchor="middle" dominant-baseline="middle">Ouroboros</text>
    </svg>
  `),
  'wesker-speed': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_wesker-speed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_wesker-speed" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_wesker-speed)" stroke="#6366f1" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_wesker-speed)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#6366f1" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⚡</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#a5b4fc" text-anchor="middle" dominant-baseline="middle">Speed</text>
    </svg>
  `),
  'mastermind': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_mastermind" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_mastermind" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_mastermind)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_mastermind)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">👁️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Mastermind</text>
    </svg>
  `),
  'berserkers-call': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_berserkers-call" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#1c1917" />
        </linearGradient>
        <radialGradient id="aura_berserkers-call" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#dc2626" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#dc2626" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_berserkers-call)" stroke="#ef4444" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_berserkers-call)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#ef4444" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">📢</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fca5a5" text-anchor="middle" dominant-baseline="middle">Berserker's Call</text>
    </svg>
  `),
  'battle-hunger': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_battle-hunger" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c2d12" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <radialGradient id="aura_battle-hunger" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ea580c" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_battle-hunger)" stroke="#f97316" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_battle-hunger)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f97316" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🔥</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fdba74" text-anchor="middle" dominant-baseline="middle">Battle Hunger</text>
    </svg>
  `),
  'counter-helix': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_counter-helix" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#1c1917" />
        </linearGradient>
        <radialGradient id="aura_counter-helix" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#dc2626" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#dc2626" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_counter-helix)" stroke="#ef4444" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_counter-helix)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🪓</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fca5a5" text-anchor="middle" dominant-baseline="middle">Counter Helix</text>
    </svg>
  `),
  'culling-blade': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_culling-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_culling-blade" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_culling-blade)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_culling-blade)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⚔️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Culling Blade</text>
    </svg>
  `),
  'voracity': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_voracity" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_voracity" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_voracity)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_voracity)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🩸</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Ненасытность & К</text>
    </svg>
  `),
  'bouncing-blade': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_bouncing-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_bouncing-blade" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_bouncing-blade)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_bouncing-blade)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🗡️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Танцующий клинок</text>
    </svg>
  `),
  'preparation': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_preparation" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_preparation" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_preparation)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_preparation)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⏱️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Подготовка</text>
    </svg>
  `),
  'shunpo': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_shunpo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_shunpo" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_shunpo)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_shunpo)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💨</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Шунпо</text>
    </svg>
  `),
  'death-lotus': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_death-lotus" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_death-lotus" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_death-lotus)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_death-lotus)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🌸</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Цветок смерти</text>
    </svg>
  `),
  'superhuman': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_superhuman" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#713f12" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="aura_superhuman" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ca8a04" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_superhuman)" stroke="#eab308" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_superhuman)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#eab308" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">✝️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fef08a" text-anchor="middle" dominant-baseline="middle">Сверхчеловеческа</text>
    </svg>
  `),
  'bayonet-throw': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_bayonet-throw" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_bayonet-throw" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_bayonet-throw)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_bayonet-throw)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🗡️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Противовампирски</text>
    </svg>
  `),
  'whirlwind-slash': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_whirlwind-slash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_whirlwind-slash" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_whirlwind-slash)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_whirlwind-slash)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🌪️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Круговая атака</text>
    </svg>
  `),
  'barrier-seal': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_barrier-seal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#713f12" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="aura_barrier-seal" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ca8a04" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_barrier-seal)" stroke="#eab308" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_barrier-seal)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#eab308" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🛡️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fef08a" text-anchor="middle" dominant-baseline="middle">Защитная печать</text>
    </svg>
  `),
  'divine-regen': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_divine-regen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_divine-regen" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_divine-regen)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_divine-regen)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">✨</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Божественная рег</text>
    </svg>
  `),
  'infinity-shield': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_infinity-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_infinity-shield" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_infinity-shield)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_infinity-shield)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">♾️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Infinity</text>
    </svg>
  `),
  'lapse-blue': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_lapse-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0c4a6e" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="aura_lapse-blue" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_lapse-blue)" stroke="#38bdf8" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_lapse-blue)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🔵</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#bae6fd" text-anchor="middle" dominant-baseline="middle">Lapse: Blue</text>
    </svg>
  `),
  'reversal-red': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_reversal-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_reversal-red" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_reversal-red)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_reversal-red)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🔴</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Reversal: Red</text>
    </svg>
  `),
  'hollow-purple': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_hollow-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <radialGradient id="aura_hollow-purple" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_hollow-purple)" stroke="#a855f7" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_hollow-purple)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a855f7" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🟣</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#d8b4fe" text-anchor="middle" dominant-baseline="middle">Hollow Purple</text>
    </svg>
  `),
  'unlimited-void': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_unlimited-void" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_unlimited-void" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_unlimited-void)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_unlimited-void)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🌌</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Domain: Unlimite</text>
    </svg>
  `),
  'king-of-curses': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_king-of-curses" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <radialGradient id="aura_king-of-curses" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_king-of-curses)" stroke="#a855f7" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_king-of-curses)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a855f7" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">👑</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#d8b4fe" text-anchor="middle" dominant-baseline="middle">King of Curses</text>
    </svg>
  `),
  'dismantle': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_dismantle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_dismantle" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_dismantle)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_dismantle)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">✂️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Dismantle</text>
    </svg>
  `),
  'cleave': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_cleave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_cleave" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_cleave)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_cleave)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🔪</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Cleave</text>
    </svg>
  `),
  'furnace-open': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_furnace-open" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c2d12" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <radialGradient id="aura_furnace-open" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ea580c" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_furnace-open)" stroke="#f97316" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_furnace-open)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f97316" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🏹</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fdba74" text-anchor="middle" dominant-baseline="middle">Furnace: Open</text>
    </svg>
  `),
  'malevolent-shrine': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_malevolent-shrine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_malevolent-shrine" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_malevolent-shrine)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_malevolent-shrine)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⛩️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Domain: Malevole</text>
    </svg>
  `),
  'meat-hook': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_meat-hook" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_meat-hook" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_meat-hook)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_meat-hook)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🪝</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">Meat Hook</text>
    </svg>
  `),
  'rot': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_rot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </linearGradient>
        <radialGradient id="aura_rot" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#059669" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_rot)" stroke="#10b981" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_rot)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#10b981" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">☣️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#6ee7b7" text-anchor="middle" dominant-baseline="middle">Rot</text>
    </svg>
  `),
  'flesh-heap': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_flesh-heap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </linearGradient>
        <radialGradient id="aura_flesh-heap" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#059669" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_flesh-heap)" stroke="#10b981" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_flesh-heap)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#10b981" stroke-width="1" stroke-dasharray="4,3" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🥩</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#6ee7b7" text-anchor="middle" dominant-baseline="middle">Flesh Heap</text>
    </svg>
  `),
  'dismember': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_dismember" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_dismember" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_dismember)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_dismember)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🦷</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Dismember</text>
    </svg>
  `),
  'cold-snap': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_cold-snap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0c4a6e" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="aura_cold-snap" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_cold-snap)" stroke="#38bdf8" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_cold-snap)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#38bdf8" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">❄️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#bae6fd" text-anchor="middle" dominant-baseline="middle">Cold Snap</text>
    </svg>
  `),
  'sun-strike': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_sun-strike" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c2d12" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <radialGradient id="aura_sun-strike" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ea580c" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_sun-strike)" stroke="#f97316" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_sun-strike)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f97316" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">☀️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fdba74" text-anchor="middle" dominant-baseline="middle">Sun Strike</text>
    </svg>
  `),
  'chaos-meteor': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_chaos-meteor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c2d12" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <radialGradient id="aura_chaos-meteor" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ea580c" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_chaos-meteor)" stroke="#f97316" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_chaos-meteor)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f97316" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">☄️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fdba74" text-anchor="middle" dominant-baseline="middle">Chaos Meteor</text>
    </svg>
  `),
  'telekinesis': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_telekinesis" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_telekinesis" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_telekinesis)" stroke="#6366f1" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_telekinesis)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#6366f1" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🌀</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#a5b4fc" text-anchor="middle" dominant-baseline="middle">Telekinesis</text>
    </svg>
  `),
  'fade-bolt': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_fade-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_fade-bolt" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_fade-bolt)" stroke="#6366f1" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_fade-bolt)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#6366f1" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⚡</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#a5b4fc" text-anchor="middle" dominant-baseline="middle">Fade Bolt</text>
    </svg>
  `),
  'spell-steal': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_spell-steal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_spell-steal" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_spell-steal)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_spell-steal)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🎭</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Spell Steal</text>
    </svg>
  `),
  'shadowraze-near': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_shadowraze-near" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <radialGradient id="aura_shadowraze-near" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_shadowraze-near)" stroke="#a855f7" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_shadowraze-near)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a855f7" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💣</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#d8b4fe" text-anchor="middle" dominant-baseline="middle">Shadowraze</text>
    </svg>
  `),
  'shadowraze-medium': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_shadowraze-medium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <radialGradient id="aura_shadowraze-medium" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_shadowraze-medium)" stroke="#a855f7" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_shadowraze-medium)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a855f7" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💣</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#d8b4fe" text-anchor="middle" dominant-baseline="middle">Shadowraze</text>
    </svg>
  `),
  'shadowraze-far': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_shadowraze-far" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <radialGradient id="aura_shadowraze-far" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#9333ea" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_shadowraze-far)" stroke="#a855f7" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_shadowraze-far)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a855f7" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💣</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#d8b4fe" text-anchor="middle" dominant-baseline="middle">Shadowraze</text>
    </svg>
  `),
  'requiem-of-souls': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_requiem-of-souls" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_requiem-of-souls" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_requiem-of-souls)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_requiem-of-souls)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💀</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">Requiem of Souls</text>
    </svg>
  `),
  'awp-wallbang': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_awp-wallbang" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_awp-wallbang" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#64748b" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#64748b" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_awp-wallbang)" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_awp-wallbang)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#94a3b8" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🎯</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f8fafc" text-anchor="middle" dominant-baseline="middle">AWP Wallbang</text>
    </svg>
  `),
  'oneway-smoke': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_oneway-smoke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_oneway-smoke" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#64748b" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#64748b" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_oneway-smoke)" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_oneway-smoke)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#94a3b8" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">☁️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f8fafc" text-anchor="middle" dominant-baseline="middle">One-Way Smoke</text>
    </svg>
  `),
  'flashbang': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_flashbang" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="aura_flashbang" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#64748b" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#64748b" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_flashbang)" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_flashbang)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#94a3b8" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💥</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f8fafc" text-anchor="middle" dominant-baseline="middle">Flashbang</text>
    </svg>
  `),
  'clutch-master': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_clutch-master" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_clutch-master" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_clutch-master)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_clutch-master)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🏆</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">1v5 Clutch Maste</text>
    </svg>
  `),
  'judgement': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_judgement" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#713f12" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="aura_judgement" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#ca8a04" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ca8a04" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_judgement)" stroke="#eab308" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_judgement)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#eab308" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">⚖️</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fef08a" text-anchor="middle" dominant-baseline="middle">JUDGEMENT!</text>
    </svg>
  `),
  'thy-end-is-now': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_thy-end-is-now" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_thy-end-is-now" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_thy-end-is-now)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_thy-end-is-now)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">👊</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">THY END IS NOW!</text>
    </svg>
  `),
  'prepare-thyself': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_prepare-thyself" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="aura_prepare-thyself" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#71717a" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#71717a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_prepare-thyself)" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_prepare-thyself)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="none" />
      

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">🐍</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#f4f4f5" text-anchor="middle" dominant-baseline="middle">PREPARE THYSELF!</text>
    </svg>
  `),
  'crush': makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
      <defs>
        <linearGradient id="bg_crush" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#0c0a09" />
        </linearGradient>
        <radialGradient id="aura_crush" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#d97706" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Base Tile -->
      <rect width="80" height="80" rx="10" fill="url(#bg_crush)" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="2" y="2" width="76" height="76" rx="8" fill="url(#aura_crush)" />
      
      <!-- Inner Rune Frame -->
      <circle cx="40" cy="36" r="24" fill="rgba(0,0,0,0.4)" stroke="#f59e0b" stroke-width="1" stroke-dasharray="none" />
      <circle cx="40" cy="36" r="27" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.7" />

      <!-- Center Icon Glyph -->
      <text x="40" y="44" font-size="26" text-anchor="middle">💥</text>

      <!-- Bottom Skill Name Banner -->
      <rect x="4" y="62" width="72" height="14" rx="4" fill="rgba(10,10,15,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      <text x="40" y="72" font-size="7.5" font-family="system-ui, sans-serif" font-weight="bold" fill="#fde68a" text-anchor="middle" dominant-baseline="middle">CRUSH!</text>
    </svg>
  `),
};

export function getSkillIcon(skillId) {
  return SKILL_ICONS[skillId] || makeSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><rect width="80" height="80" rx="10" fill="#1e293b" stroke="#64748b" /><text x="40" y="46" font-size="26" text-anchor="middle">✨</text></svg>`);
}
