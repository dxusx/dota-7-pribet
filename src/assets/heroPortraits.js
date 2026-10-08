/**
 * Hero Portraits Asset Registry:
 * High-definition SVG-based portraits and raster image mapping for all 12 characters.
 * Ensures instant, reliable, zero-broken-link rendering across all screen sizes and canvas tokens.
 */

// Helper to construct crisp SVG data URI
function makeSvgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '))}`;
}

export const HERO_PORTRAITS = {
  // 1. Albert Wesker
  wesker: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="weskerBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <linearGradient id="weskerHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#ca8a04" />
        </linearGradient>
        <radialGradient id="redEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="70%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#weskerBg)" />
      <!-- Black Coat High Collar -->
      <path d="M20,120 L35,80 L50,95 L60,88 L70,95 L85,80 L100,120 Z" fill="#090d16" stroke="#334155" stroke-width="1.5" />
      <path d="M30,80 L15,62 L38,72 Z" fill="#1e293b" />
      <path d="M90,80 L105,62 L82,72 Z" fill="#1e293b" />
      <!-- Face -->
      <polygon points="40,42 80,42 75,78 60,90 45,78" fill="#fde68a" />
      <polygon points="60,90 45,78 75,78" fill="#fcd34d" opacity="0.6" />
      <!-- Slicked-back Blonde Hair -->
      <path d="M38,44 Q35,22 60,18 Q85,22 82,44 Q75,32 60,30 Q45,32 38,44 Z" fill="url(#weskerHair)" stroke="#a16207" stroke-width="1" />
      <!-- Dark Sunglasses -->
      <polygon points="42,48 58,48 56,60 44,60" fill="#020617" stroke="#475569" stroke-width="1" />
      <polygon points="62,48 78,48 76,60 64,60" fill="#020617" stroke="#475569" stroke-width="1" />
      <line x1="58" y1="52" x2="62" y2="52" stroke="#475569" stroke-width="1.5" />
      <!-- Glowing Red Eyes behind glasses -->
      <circle cx="50" cy="54" r="2.5" fill="url(#redEye)" />
      <circle cx="70" cy="54" r="2.5" fill="url(#redEye)" />
      <!-- Uroboros tendril accents -->
      <path d="M15,95 Q8,80 16,68 Q24,78 15,95 Z" fill="#020617" stroke="#ef4444" stroke-width="0.8" />
      <path d="M105,95 Q112,80 104,68 Q96,78 105,95 Z" fill="#020617" stroke="#ef4444" stroke-width="0.8" />
    </svg>
  `),

  // 2. Axe (Mogul Khan)
  axe: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="axeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#1c1917" />
        </linearGradient>
        <linearGradient id="axeSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#991b1b" />
        </linearGradient>
        <linearGradient id="steelBlade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#axeBg)" />
      <!-- Massive Shoulders -->
      <path d="M15,120 Q30,80 60,88 Q90,80 105,120 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2" />
      <!-- Spiked Iron Pauldrons -->
      <polygon points="12,88 28,68 35,92" fill="#334155" stroke="#94a3b8" stroke-width="1" />
      <polygon points="108,88 92,68 85,92" fill="#334155" stroke="#94a3b8" stroke-width="1" />
      <!-- Red Face -->
      <polygon points="38,36 82,36 78,76 60,92 42,76" fill="url(#axeSkin)" stroke="#7f1d1d" stroke-width="1.5" />
      <!-- Warpaint Tattoos -->
      <path d="M42,42 L55,58 L46,68" stroke="#1c1917" stroke-width="2.5" fill="none" />
      <path d="M78,42 L65,58 L74,68" stroke="#1c1917" stroke-width="2.5" fill="none" />
      <!-- Fierce Brows & White Eyes -->
      <polygon points="42,46 56,52 44,53" fill="#450a0a" />
      <polygon points="78,46 64,52 76,53" fill="#450a0a" />
      <circle cx="49" cy="51" r="2.5" fill="#f8fafc" />
      <circle cx="71" cy="51" r="2.5" fill="#f8fafc" />
      <!-- Braided Topknot Hair -->
      <path d="M54,36 Q60,12 66,36 Z" fill="#1c1917" />
      <circle cx="60" cy="18" r="4" fill="#b45309" />
      <!-- Roaring Mouth with Tusks -->
      <polygon points="48,70 72,70 68,82 52,82" fill="#450a0a" />
      <polygon points="50,82 53,74 56,82" fill="#f8fafc" />
      <polygon points="70,82 67,74 64,82" fill="#f8fafc" />
      <!-- Battle Axe Silhouette in BG -->
      <path d="M92,15 Q115,25 105,48 Q95,35 90,38 Z" fill="url(#steelBlade)" stroke="#cbd5e1" stroke-width="1" />
    </svg>
  `),

  // 3. Katarina
  katarina: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="katBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2a0815" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="katHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#881337" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#katBg)" />
      <!-- Dark Noxian Armor -->
      <path d="M25,120 L40,84 L60,94 L80,84 L95,120 Z" fill="#1e1b4b" stroke="#e11d48" stroke-width="1.2" />
      <!-- Flowing Crimson Hair (Back) -->
      <path d="M22,35 Q15,75 32,95 L40,65 Z" fill="url(#katHair)" />
      <path d="M98,35 Q105,75 88,95 L80,65 Z" fill="url(#katHair)" />
      <!-- Face -->
      <polygon points="42,40 78,40 72,74 60,86 48,74" fill="#fecdd3" />
      <!-- Eye Scar over left eye -->
      <line x1="72" y1="42" x2="68" y2="60" stroke="#be123c" stroke-width="1.8" />
      <!-- Emerald Eyes -->
      <circle cx="52" cy="52" r="2.8" fill="#10b981" />
      <circle cx="68" cy="52" r="2.8" fill="#10b981" />
      <!-- Fierce Hair Bangs -->
      <path d="M38,40 Q60,18 82,40 Q68,36 60,48 Q52,36 38,40 Z" fill="url(#katHair)" stroke="#9f1239" stroke-width="0.8" />
      <!-- Crossed Noxian Daggers -->
      <line x1="18" y1="18" x2="42" y2="46" stroke="#e2e8f0" stroke-width="2.5" />
      <polygon points="18,18 24,16 26,24" fill="#fb7185" />
      <line x1="102" y1="18" x2="78" y2="46" stroke="#e2e8f0" stroke-width="2.5" />
      <polygon points="102,18 96,16 94,24" fill="#fb7185" />
    </svg>
  `),

  // 4. Alexander Anderson
  anderson: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="anderBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141c2e" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#anderBg)" />
      <!-- Catholic Priest Vestments -->
      <path d="M22,120 L38,82 L60,92 L82,82 L98,120 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
      <rect x="56" y="82" width="8" height="10" fill="#f8fafc" />
      <!-- Face -->
      <polygon points="40,38 80,38 76,74 60,88 44,74" fill="#fde68a" />
      <!-- Blonde Spiky Hair -->
      <path d="M36,40 Q35,20 60,16 Q85,20 84,40 L76,32 L68,36 L60,28 L52,36 L44,32 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
      <!-- Round Glasses with Brilliant Glint -->
      <circle cx="50" cy="50" r="9" fill="none" stroke="#f8fafc" stroke-width="2" />
      <circle cx="70" cy="50" r="9" fill="none" stroke="#f8fafc" stroke-width="2" />
      <line x1="59" y1="50" x2="61" y2="50" stroke="#f8fafc" stroke-width="2" />
      <circle cx="50" cy="50" r="3" fill="#38bdf8" />
      <circle cx="70" cy="50" r="3" fill="#38bdf8" />
      <polygon points="48,46 54,46 51,54" fill="#ffffff" opacity="0.8" />
      <!-- Maniacal Grin -->
      <path d="M48,68 Q60,80 72,68 Z" fill="#450a0a" stroke="#dc2626" stroke-width="1" />
      <!-- Crossed Blessed Bayonets -->
      <line x1="12" y1="108" x2="48" y2="40" stroke="#cbd5e1" stroke-width="3" />
      <line x1="108" y1="108" x2="72" y2="40" stroke="#cbd5e1" stroke-width="3" />
      <!-- Holy Cross on Chest -->
      <line x1="60" y1="98" x2="60" y2="114" stroke="#fbbf24" stroke-width="2.5" />
      <line x1="54" y1="104" x2="66" y2="104" stroke="#fbbf24" stroke-width="2.5" />
    </svg>
  `),

  // 5. Gojo Satoru
  gojo: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="gojoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0369a1" />
          <stop offset="100%" stop-color="#082f49" />
        </linearGradient>
        <radialGradient id="sixEyesGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="70%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0c4a6e" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#gojoBg)" />
      <!-- Jujutsu High Dark Uniform & High Collar -->
      <path d="M20,120 L36,80 L52,90 L60,86 L68,90 L84,80 L100,120 Z" fill="#090d16" stroke="#1e293b" stroke-width="1.8" />
      <polygon points="56,86 64,86 60,94" fill="#38bdf8" />
      <!-- Neck & Face -->
      <polygon points="42,40 78,40 74,76 60,88 46,76" fill="#fef08a" opacity="0.9" />
      <!-- Spiky Snow-White Hair -->
      <path d="M32,46 Q24,18 42,16 Q48,6 60,8 Q72,6 78,16 Q96,18 88,46 Q78,28 60,26 Q42,28 32,46 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
      <path d="M38,40 L44,22 L50,38 L58,16 L64,36 L72,20 L78,40 Z" fill="#ffffff" />
      <!-- Black Blindfold with Subtle Fabric Weave -->
      <polygon points="38,44 82,44 80,62 40,62" fill="#09090b" stroke="#27272a" stroke-width="1.2" />
      <!-- Glowing Blue Peek of Six Eyes -->
      <circle cx="50" cy="53" r="3.2" fill="url(#sixEyesGlow)" />
      <circle cx="50" cy="53" r="1.2" fill="#ffffff" />
      <circle cx="70" cy="53" r="3.2" fill="url(#sixEyesGlow)" />
      <circle cx="70" cy="53" r="1.2" fill="#ffffff" />
      <!-- Confident Smirk -->
      <path d="M52,72 Q60,76 68,71" stroke="#090d16" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <!-- Limitless Space Sparkles -->
      <circle cx="24" cy="28" r="2" fill="#38bdf8" />
      <circle cx="96" cy="34" r="2.5" fill="#38bdf8" />
      <circle cx="88" cy="80" r="1.5" fill="#bae6fd" />
    </svg>
  `),

  // 6. Ryomen Sukuna
  sukuna: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="sukunaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#180505" />
        </linearGradient>
        <linearGradient id="sukunaHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fb7185" />
          <stop offset="100%" stop-color="#e11d48" />
        </linearGradient>
        <radialGradient id="demonEye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="80%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#sukunaBg)" />
      <!-- White Kimono with Dark Edging -->
      <path d="M22,120 L38,82 L60,94 L82,82 L98,120 Z" fill="#f8fafc" stroke="#1c1917" stroke-width="2" />
      <polygon points="52,86 68,86 60,104" fill="#09090b" />
      <!-- Face -->
      <polygon points="40,38 80,38 74,76 60,88 46,76" fill="#fde68a" />
      <!-- Spiked Pink/Salmon Hair (Slicked Back) -->
      <path d="M36,42 Q30,16 60,12 Q90,16 84,42 Q76,26 60,24 Q44,26 36,42 Z" fill="url(#sukunaHair)" stroke="#be123c" stroke-width="1" />
      <!-- Sukuna's Cursed Markings (Black Tattoos) -->
      <path d="M50,28 L60,34 L70,28" stroke="#09090b" stroke-width="2.5" fill="none" />
      <circle cx="60" cy="38" r="2.5" fill="#09090b" />
      <!-- Cheek Tattoos -->
      <path d="M42,56 L47,60 L44,68" stroke="#09090b" stroke-width="2" fill="none" />
      <path d="M78,56 L73,60 L76,68" stroke="#09090b" stroke-width="2" fill="none" />
      <line x1="56" y1="60" x2="64" y2="60" stroke="#09090b" stroke-width="1.8" />
      <!-- Primary Piercing Red Eyes -->
      <polygon points="44,48 56,52 48,54" fill="url(#demonEye)" />
      <polygon points="76,48 64,52 72,54" fill="url(#demonEye)" />
      <!-- Secondary Eyes (Sukuna's 4 Eyes) -->
      <polygon points="45,55 52,57 47,59" fill="#ef4444" />
      <polygon points="75,55 68,57 73,59" fill="#ef4444" />
      <!-- Wicked Sinister Grin -->
      <path d="M48,72 Q60,82 72,72" stroke="#450a0a" stroke-width="2.2" fill="none" />
      <!-- Blood Splatter Accents -->
      <circle cx="28" cy="74" r="2" fill="#ef4444" opacity="0.7" />
      <circle cx="94" cy="24" r="2.5" fill="#ef4444" opacity="0.7" />
    </svg>
  `),

  // 7. Pudge (The Butcher)
  pudge: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="pudgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14281d" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <linearGradient id="pudgeSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#65a30d" />
          <stop offset="100%" stop-color="#3f6212" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#pudgeBg)" />
      <!-- Rotting Massive Body -->
      <path d="M15,120 Q30,75 60,82 Q90,75 105,120 Z" fill="#4d7c0f" stroke="#1a2e05" stroke-width="2" />
      <!-- Stitched Head -->
      <ellipse cx="60" cy="56" rx="28" ry="26" fill="url(#pudgeSkin)" stroke="#365314" stroke-width="2" />
      <!-- Stitches Across Face -->
      <path d="M40,42 Q60,50 78,42" stroke="#1c1917" stroke-width="2" fill="none" />
      <line x1="46" y1="43" x2="48" y2="49" stroke="#78350f" stroke-width="1.8" />
      <line x1="58" y1="45" x2="60" y2="51" stroke="#78350f" stroke-width="1.8" />
      <line x1="70" y1="43" x2="72" y2="49" stroke="#78350f" stroke-width="1.8" />
      <!-- Ghoulish Yellow Mismatched Eyes -->
      <circle cx="48" cy="52" r="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
      <circle cx="49" cy="52" r="2" fill="#000000" />
      <circle cx="72" cy="50" r="3.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
      <circle cx="72" cy="50" r="1.5" fill="#000000" />
      <!-- Gaping Stitched Maw -->
      <polygon points="46,66 74,66 70,78 50,78" fill="#450a0a" stroke="#262626" stroke-width="1.5" />
      <polygon points="50,66 53,72 56,66" fill="#f8fafc" />
      <polygon points="64,78 67,72 70,78" fill="#f8fafc" />
      <!-- Meat Hook on Side -->
      <path d="M88,24 Q108,35 102,62 Q96,52 86,52 Z" fill="#94a3b8" stroke="#ef4444" stroke-width="1.5" />
    </svg>
  `),

  // 8. Invoker (The Arsenal Magus)
  invoker: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="invBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
        <radialGradient id="quasOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#67e8f9" />
          <stop offset="100%" stop-color="#0284c7" />
        </radialGradient>
        <radialGradient id="wexOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f472b6" />
          <stop offset="100%" stop-color="#c026d3" />
        </radialGradient>
        <radialGradient id="exortOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#ea580c" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#invBg)" />
      <!-- Ornate Crimson Mantle -->
      <path d="M20,120 L38,78 L60,86 L82,78 L100,120 Z" fill="#991b1b" stroke="#eab308" stroke-width="2" />
      <!-- High Collar Spikes -->
      <polygon points="34,78 18,52 38,68" fill="#7f1d1d" stroke="#facc15" stroke-width="1" />
      <polygon points="86,78 102,52 82,68" fill="#7f1d1d" stroke="#facc15" stroke-width="1" />
      <!-- Elven Face -->
      <polygon points="42,38 78,38 74,72 60,84 46,72" fill="#fef08a" />
      <!-- Glowing Eyes -->
      <circle cx="52" cy="50" r="2.5" fill="#e0f2fe" />
      <circle cx="68" cy="50" r="2.5" fill="#e0f2fe" />
      <!-- Golden Elven Hair -->
      <path d="M38,40 Q35,18 60,16 Q85,18 82,40 Q74,26 60,26 Q46,26 38,40 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
      <path d="M38,40 L30,68 L42,54 Z" fill="#fde047" />
      <path d="M82,40 L90,68 L78,54 Z" fill="#fde047" />
      <!-- Floating Quas / Wex / Exort Orbs -->
      <circle cx="26" cy="30" r="8" fill="url(#quasOrb)" stroke="#ffffff" stroke-width="1" />
      <circle cx="60" cy="12" r="8" fill="url(#wexOrb)" stroke="#ffffff" stroke-width="1" />
      <circle cx="94" cy="30" r="8" fill="url(#exortOrb)" stroke="#ffffff" stroke-width="1" />
    </svg>
  `),

  // 9. Rubick (The Grand Magus)
  rubick: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="rubBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="100%" stop-color="#022c22" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#rubBg)" />
      <!-- Arcane Robes -->
      <path d="M22,120 L40,80 L60,88 L80,80 L98,120 Z" fill="#047857" stroke="#34d399" stroke-width="1.8" />
      <!-- Pointed Jester Hood & Curved Antlers -->
      <path d="M36,44 Q20,12 38,24 Q50,30 54,38 Z" fill="#065f46" stroke="#10b981" stroke-width="1" />
      <path d="M84,44 Q100,12 82,24 Q70,30 66,38 Z" fill="#065f46" stroke="#10b981" stroke-width="1" />
      <!-- Mask Base -->
      <polygon points="40,38 80,38 72,74 60,86 48,74" fill="#0f172a" stroke="#10b981" stroke-width="2" />
      <!-- Glowing Emerald Eyes -->
      <polygon points="46,48 56,48 51,56" fill="#34d399" />
      <circle cx="51" cy="52" r="2.5" fill="#ffffff" />
      <polygon points="64,48 74,48 69,56" fill="#34d399" />
      <circle cx="69" cy="52" r="2.5" fill="#ffffff" />
      <!-- Swirling Arcane Runes -->
      <circle cx="60" cy="70" r="4" fill="none" stroke="#6ee7b7" stroke-width="1.5" />
    </svg>
  `),

  // 10. Shadow Fiend (Nevermore)
  sf: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="sfBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="sfFire" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="60%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#7f1d1d" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#sfBg)" />
      <!-- Demonic Shadow Horns -->
      <path d="M38,40 Q15,10 25,32 Q35,42 42,48 Z" fill="#020617" stroke="#ef4444" stroke-width="1.2" />
      <path d="M82,40 Q105,10 95,32 Q85,42 78,48 Z" fill="#020617" stroke="#ef4444" stroke-width="1.2" />
      <!-- Shadow Body -->
      <path d="M25,120 Q35,76 60,82 Q85,76 95,120 Z" fill="#09090b" stroke="#7f1d1d" stroke-width="2" />
      <!-- Obsidian Face Plate -->
      <polygon points="42,38 78,38 74,72 60,84 46,72" fill="#020617" stroke="#ef4444" stroke-width="1.5" />
      <!-- Burning Fiery Core & Slit Eyes -->
      <polygon points="46,48 56,52 48,54" fill="url(#sfFire)" />
      <polygon points="74,48 64,52 72,54" fill="url(#sfFire)" />
      <!-- Molten Fire Chest Cavity (Souls) -->
      <path d="M50,90 Q60,80 70,90 Q65,108 60,112 Q55,108 50,90 Z" fill="url(#sfFire)" stroke="#f59e0b" stroke-width="1" />
    </svg>
  `),

  // 11. m0NESY (Ilya Osipov)
  monesy: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g2Bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#g2Bg)" />
      <!-- G2 Esports Jersey -->
      <path d="M22,120 L38,82 L60,90 L82,82 L98,120 Z" fill="#09090b" stroke="#eab308" stroke-width="2" />
      <polygon points="54,92 66,92 60,102" fill="#eab308" />
      <!-- Face -->
      <polygon points="42,40 78,40 74,74 60,86 46,74" fill="#fde68a" />
      <!-- Dark Messy Hair -->
      <path d="M38,42 Q36,20 60,18 Q84,20 82,42 Q72,30 60,32 Q48,30 38,42 Z" fill="#27272a" />
      <!-- Esports Gaming Headset -->
      <path d="M34,42 Q30,16 60,14 Q90,16 86,42" fill="none" stroke="#eab308" stroke-width="4" stroke-linecap="round" />
      <rect x="28" y="40" width="8" height="18" rx="4" fill="#eab308" />
      <rect x="84" y="40" width="8" height="18" rx="4" fill="#eab308" />
      <!-- Focused Eyes -->
      <circle cx="52" cy="52" r="2.5" fill="#3b82f6" />
      <circle cx="68" cy="52" r="2.5" fill="#3b82f6" />
      <!-- Sniper Crosshair in background -->
      <circle cx="60" cy="52" r="28" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
      <line x1="60" y1="20" x2="60" y2="84" stroke="#ef4444" stroke-width="0.8" opacity="0.6" />
      <line x1="28" y1="52" x2="92" y2="52" stroke="#ef4444" stroke-width="0.8" opacity="0.6" />
    </svg>
  `),

  // 12. Minos Prime (Ultrakill)
  minos: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="minosBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#082f49" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="cyanSoul" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="70%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#minosBg)" />
      <!-- Translucent Glowing Cyan Silhouette -->
      <path d="M25,120 L40,82 L60,88 L80,82 L95,120 Z" fill="url(#cyanSoul)" stroke="#e0f2fe" stroke-width="2" />
      <!-- Head -->
      <ellipse cx="60" cy="54" rx="22" ry="26" fill="url(#cyanSoul)" stroke="#7dd3fc" stroke-width="2" />
      <!-- Crown of Thorns -->
      <path d="M42,34 L46,40 L54,32 L60,40 L66,32 L74,40 L78,34" fill="none" stroke="#f8fafc" stroke-width="2.5" />
      <!-- The Iconic Face Void (Hole where face should be) -->
      <ellipse cx="60" cy="56" rx="12" ry="14" fill="#020617" stroke="#38bdf8" stroke-width="2" />
    </svg>
  `),

  // 13. Schrödinger
  schrodinger: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="scBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#scBg)" />
      <!-- Cat ears & hair -->
      <polygon points="32,28 44,14 48,34" fill="#e2e8f0" stroke="#38bdf8" stroke-width="1.5" />
      <polygon points="88,28 76,14 72,34" fill="#e2e8f0" stroke="#38bdf8" stroke-width="1.5" />
      <circle cx="60" cy="56" r="26" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
      <!-- Quantum smile & eyes -->
      <path d="M48,52 Q52,48 54,52" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
      <path d="M72,52 Q68,48 66,52" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
      <path d="M52,66 Q60,74 68,66" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
      <!-- Collar -->
      <rect x="36" y="86" width="48" height="24" rx="6" fill="#0284c7" />
    </svg>
  `),

  // 14. Alucard
  alucard: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="alBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#alBg)" />
      <!-- Crimson fedora / hat -->
      <path d="M15,48 Q60,20 105,48 Q60,40 15,48 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5" />
      <ellipse cx="60" cy="38" rx="28" ry="12" fill="#b91c1c" />
      <!-- Face & orange-tinted vampire glasses -->
      <circle cx="60" cy="62" r="22" fill="#f1f5f9" />
      <circle cx="50" cy="58" r="6" fill="#ea580c" stroke="#7c2d12" stroke-width="1.5" />
      <circle cx="70" cy="58" r="6" fill="#ea580c" stroke="#7c2d12" stroke-width="1.5" />
      <line x1="56" y1="58" x2="64" y2="58" stroke="#7c2d12" stroke-width="1.5" />
      <!-- Crimson high trenchcoat -->
      <path d="M25,120 L40,82 L60,90 L80,82 L95,120 Z" fill="#7f1d1d" stroke="#991b1b" stroke-width="2" />
    </svg>
  `),

  // 15. Gabriel
  gabriel: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="gbBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#gbBg)" />
      <!-- Archangel golden helmet with cross visor -->
      <polygon points="40,24 80,24 86,66 60,82 34,66" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" />
      <!-- Glowing blue/white cross visor -->
      <line x1="60" y1="36" x2="60" y2="70" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
      <line x1="46" y1="50" x2="74" y2="50" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
      <!-- Golden breastplate -->
      <path d="M28,120 L42,86 L60,94 L78,86 L92,120 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2" />
    </svg>
  `),
};

export const HERO_AVATAR_FILES = {
  wesker: './avatars/wesker_avatar.png',
  axe: './avatars/axe_avatar.png',
  katarina: './avatars/katarina_avatar.svg',
  anderson: './avatars/anderson_avatar.svg',
  gojo: './avatars/gojo_avatar.png',
  sukuna: './avatars/sukuna_avatar.png',
  pudge: './avatars/pudge_avatar.png',
  invoker: './avatars/invoker_avatar.png',
  rubick: './avatars/rubick_avatar.png',
  sf: './avatars/sf_avatar.png',
  monesy: './avatars/monesy_avatar.png',
  minos: './avatars/minos_avatar.png',
  schrodinger: './avatars/schrodinger_avatar.svg',
  alucard: './avatars/alucard_avatar.svg',
  gabriel: './avatars/gabriel_avatar.svg',
};

/**
 * Returns portrait URL for a hero id, with safe fallback.
 */
export function getHeroPortrait(heroId) {
  return HERO_PORTRAITS[heroId] || HERO_PORTRAITS.wesker;
}

// Preloaded image cache for smooth Canvas rendering
const heroImageCache = new Map();

export function getHeroCanvasImage(heroId) {
  if (heroImageCache.has(heroId)) {
    return heroImageCache.get(heroId);
  }
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  img.src = getHeroPortrait(heroId);
  heroImageCache.set(heroId, img);
  return img;
}

// Preload all character portraits in browser environment
if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
  Object.keys(HERO_PORTRAITS).forEach(id => {
    getHeroCanvasImage(id);
  });
}

