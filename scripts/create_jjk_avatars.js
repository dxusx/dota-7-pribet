import fs from 'fs';

// 1. Satoru Gojo SVG Avatar (Iconic blindfold, white hair, Limitless cyan glow)
const gojoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="gojoGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="blindfold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#gojoGlow)"/>
  <!-- Spiky White Hair -->
  <path d="M40 80 Q60 20 100 20 Q140 20 160 80 Q170 120 150 140 Q130 90 100 70 Q70 90 50 140 Z" fill="#f8fafc"/>
  <path d="M70 40 L85 15 L100 45 L115 15 L130 40 L145 25 L140 60 L60 60 Z" fill="#e2e8f0"/>
  <!-- Face -->
  <path d="M60 85 Q100 160 140 85 Z" fill="#ffe4e6"/>
  <!-- Iconic Black Blindfold -->
  <path d="M50 78 Q100 90 150 78 L152 100 Q100 115 48 100 Z" fill="url(#blindfold)" stroke="#38bdf8" stroke-width="1.5"/>
  <!-- Six Eyes subtle blue spark -->
  <circle cx="80" cy="90" r="2.5" fill="#38bdf8" opacity="0.8"/>
  <circle cx="120" cy="90" r="2.5" fill="#38bdf8" opacity="0.8"/>
  <!-- Mouth / Confident Smirk -->
  <path d="M92 125 Q100 130 108 123" stroke="#be123c" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Collar / High Neck Dark Coat -->
  <path d="M45 155 L100 140 L155 155 L170 200 L30 200 Z" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
</svg>`;

// 2. Ryomen Sukuna SVG Avatar (Cursed tattoos, spiky hair, malevolent red aura)
const sukunaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="sukunaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#991b1b" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#180404" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="#0c0406"/>
  <circle cx="100" cy="100" r="90" fill="url(#sukunaGlow)"/>
  <!-- Spiky Pink/Dark Hair -->
  <path d="M45 80 Q60 15 100 15 Q140 15 155 80 Q165 110 150 135 Q130 90 100 70 Q70 90 50 135 Z" fill="#f43f5e"/>
  <path d="M65 45 L80 15 L95 45 L110 15 L125 45 L140 25 L135 60 L65 60 Z" fill="#e11d48"/>
  <!-- Face -->
  <path d="M60 80 Q100 160 140 80 Z" fill="#fed7aa"/>
  <!-- Red Eyes + 2 Extra Eyes Beneath (4 Eyes) -->
  <circle cx="75" cy="90" r="4" fill="#dc2626"/>
  <circle cx="125" cy="90" r="4" fill="#dc2626"/>
  <circle cx="78" cy="98" r="2.5" fill="#991b1b"/>
  <circle cx="122" cy="98" r="2.5" fill="#991b1b"/>
  <!-- Cursed Markings (Black Tattoos on Forehead and Cheeks) -->
  <path d="M90 65 L100 75 L110 65" stroke="#18181b" stroke-width="3" fill="none"/>
  <line x1="100" y1="50" x2="100" y2="72" stroke="#18181b" stroke-width="3"/>
  <path d="M65 105 L80 108" stroke="#18181b" stroke-width="2.5"/>
  <path d="M135 105 L120 108" stroke="#18181b" stroke-width="2.5"/>
  <!-- Evil Grin -->
  <path d="M85 130 Q100 142 115 130" stroke="#7f1d1d" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Kimono Collar / Robe -->
  <path d="M40 155 L100 145 L160 155 L175 200 L25 200 Z" fill="#1c1917" stroke="#b91c1c" stroke-width="2"/>
</svg>`;

fs.writeFileSync('./public/avatars/gojo_avatar.svg', gojoSvg);
fs.writeFileSync('./public/avatars/sukuna_avatar.svg', sukunaSvg);
console.log('Created Gojo and Sukuna SVG avatars successfully!');
