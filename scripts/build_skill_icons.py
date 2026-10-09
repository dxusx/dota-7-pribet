import os
import base64
import json

# Official skills with downloaded PNGs
official_skills = {
    'berserkers-call': 'public/skills/berserkers-call.png',
    'battle-hunger': 'public/skills/battle-hunger.png',
    'counter-helix': 'public/skills/counter-helix.png',
    'culling-blade': 'public/skills/culling-blade.png',
    'meat-hook': 'public/skills/meat-hook.png',
    'rot': 'public/skills/rot.png',
    'flesh-heap': 'public/skills/flesh-heap.png',
    'dismember': 'public/skills/dismember.png',
    'cold-snap': 'public/skills/cold-snap.png',
    'sun-strike': 'public/skills/sun-strike.png',
    'chaos-meteor': 'public/skills/chaos-meteor.png',
    'telekinesis': 'public/skills/telekinesis.png',
    'fade-bolt': 'public/skills/fade-bolt.png',
    'spell-steal': 'public/skills/spell-steal.png',
    'shadowraze-near': 'public/skills/shadowraze-near.png',
    'shadowraze-medium': 'public/skills/shadowraze-medium.png',
    'shadowraze-far': 'public/skills/shadowraze-far.png',
    'requiem-of-souls': 'public/skills/requiem-of-souls.png',
    'voracity': 'public/skills/voracity.png',
    'bouncing-blade': 'public/skills/bouncing-blade.png',
    'preparation': 'public/skills/preparation.png',
    'shunpo': 'public/skills/shunpo.png',
    'death-lotus': 'public/skills/death-lotus.png'
}

def make_official_svg(skill_id, png_path):
    with open(png_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><clipPath id="c_{skill_id}"><rect width="80" height="80" rx="10"/></clipPath></defs><rect width="80" height="80" rx="10" fill="#090b10" stroke="#f59e0b" stroke-width="1.5"/><g clip-path="url(#c_{skill_id})"><image href="data:image/png;base64,{b64}" width="80" height="80" preserveAspectRatio="xMidYMid slice"/></g></svg>"""

# Custom vector designs for the remaining 43 skills
custom_svg_glyphs = {
    # Albert Wesker
    'stars-agent': ('#1e293b', '#eab308', 'S.T.A.R.S.', """
      <polygon points="40,10 47,24 62,26 50,37 54,52 40,44 26,52 30,37 18,26 33,24" fill="#ca8a04" stroke="#fef08a" stroke-width="1"/>
      <circle cx="40" cy="33" r="8" fill="#0f172a" stroke="#ca8a04" stroke-width="1"/>
      <polygon points="40,27 42,31 46,31 43,34 44,38 40,36 36,38 37,34 34,31 38,31" fill="#fef08a"/>
    """),
    'ouroboros': ('#022c22', '#22c55e', 'OUROBOROS', """
      <path d="M 28 35 C 16 35 16 20 28 20 C 40 20 40 50 52 50 C 64 50 64 35 52 35 C 40 35 40 20 28 20 Z" fill="none" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>
      <path d="M 28 35 C 16 35 16 20 28 20 C 40 20 40 50 52 50 C 64 50 64 35 52 35" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
      <circle cx="28" cy="20" r="3" fill="#f97316"/>
      <circle cx="52" cy="50" r="3.5" fill="#ea580c"/>
      <circle cx="40" cy="35" r="2.5" fill="#ef4444"/>
    """),
    'wesker-speed': ('#1e1b4b', '#818cf8', 'SPEED', """
      <line x1="8" y1="20" x2="35" y2="20" stroke="#6366f1" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <line x1="5" y1="28" x2="25" y2="28" stroke="#818cf8" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      <polygon points="26,26 40,29 54,26 52,38 41,37 39,37 28,38" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
      <circle cx="34" cy="33" r="2.5" fill="#ef4444"/>
      <circle cx="46" cy="33" r="2.5" fill="#ef4444"/>
      <path d="M 22 36 L 58 36 L 50 42 L 14 42 Z" fill="#ef4444" opacity="0.3"/>
    """),
    'mastermind': ('#450a0a', '#f59e0b', 'MASTERMIND', """
      <circle cx="40" cy="34" r="20" fill="#1c1917" stroke="#78716c" stroke-width="1"/>
      <path d="M 40 34 L 40 14 A 20 20 0 0 1 54.14 19.86 Z" fill="#dc2626"/>
      <path d="M 40 34 L 54.14 19.86 A 20 20 0 0 1 60 34 Z" fill="#f8fafc"/>
      <path d="M 40 34 L 60 34 A 20 20 0 0 1 54.14 48.14 Z" fill="#dc2626"/>
      <path d="M 40 34 L 54.14 48.14 A 20 20 0 0 1 40 54 Z" fill="#f8fafc"/>
      <path d="M 40 34 L 40 54 A 20 20 0 0 1 25.86 48.14 Z" fill="#dc2626"/>
      <path d="M 40 34 L 25.86 48.14 A 20 20 0 0 1 20 34 Z" fill="#f8fafc"/>
      <path d="M 40 34 L 20 34 A 20 20 0 0 1 25.86 19.86 Z" fill="#dc2626"/>
      <path d="M 40 34 L 25.86 19.86 A 20 20 0 0 1 40 14 Z" fill="#f8fafc"/>
      <circle cx="40" cy="34" r="6" fill="#1c1917" stroke="#f59e0b" stroke-width="1.5"/>
    """),

    # Alexander Anderson
    'superhuman': ('#0b192c', '#38bdf8', 'SUPERHUMAN', """
      <rect x="36" y="12" width="8" height="42" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <rect x="23" y="24" width="34" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <circle cx="40" cy="28" r="4" fill="#fbbf24"/>
      <path d="M 20 48 Q 40 40 60 48" stroke="#f8fafc" stroke-width="2" fill="none" stroke-dasharray="2,2"/>
    """),
    'bayonet-throw': ('#0f172a', '#94a3b8', 'BAYONET', """
      <g transform="translate(40,33) rotate(45)">
        <polygon points="-3,-22 3,-22 2,12 -2,12" fill="#e2e8f0" stroke="#64748b"/>
        <rect x="-7" y="12" width="14" height="4" rx="1" fill="#ca8a04"/>
        <rect x="-2" y="16" width="4" height="10" fill="#475569"/>
      </g>
      <g transform="translate(40,33) rotate(-45)">
        <polygon points="-3,-22 3,-22 2,12 -2,12" fill="#e2e8f0" stroke="#64748b"/>
        <rect x="-7" y="12" width="14" height="4" rx="1" fill="#ca8a04"/>
        <rect x="-2" y="16" width="4" height="10" fill="#475569"/>
      </g>
    """),
    'whirlwind-slash': ('#1e1b4b', '#a855f7', 'WHIRLWIND', """
      <circle cx="40" cy="34" r="20" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-dasharray="25,10"/>
      <circle cx="40" cy="34" r="14" fill="none" stroke="#e879f9" stroke-width="2" stroke-dasharray="15,8"/>
      <path d="M 25 22 Q 40 10 55 22" stroke="#f8fafc" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 55 46 Q 40 58 25 46" stroke="#f8fafc" stroke-width="3" fill="none" stroke-linecap="round"/>
    """),
    'barrier-seal': ('#172554', '#3b82f6', 'BARRIER', """
      <rect x="22" y="16" width="14" height="18" fill="#f8fafc" stroke="#3b82f6" rx="1"/>
      <rect x="44" y="16" width="14" height="18" fill="#f8fafc" stroke="#3b82f6" rx="1"/>
      <rect x="22" y="36" width="14" height="18" fill="#f8fafc" stroke="#3b82f6" rx="1"/>
      <rect x="44" y="36" width="14" height="18" fill="#f8fafc" stroke="#3b82f6" rx="1"/>
      <circle cx="40" cy="35" r="16" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,2"/>
    """),
    'divine-regen': ('#052e16', '#22c55e', 'HELENA NAIL', """
      <polygon points="38,10 42,10 41,50 39,50" fill="#e2e8f0" stroke="#fbbf24" stroke-width="1.2"/>
      <circle cx="40" cy="32" r="10" fill="none" stroke="#16a34a" stroke-width="2"/>
      <path d="M 28 32 Q 40 22 52 32 Q 40 42 28 32" fill="#22c55e" opacity="0.3"/>
      <circle cx="40" cy="32" r="4" fill="#fbbf24"/>
    """),

    # Satoru Gojo
    'infinity-shield': ('#021a2e', '#38bdf8', 'INFINITY', """
      <path d="M 26 34 C 18 24 18 44 26 34 C 36 22 44 46 54 34 C 62 24 62 44 54 34 C 44 22 36 46 26 34 Z" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="40" cy="34" r="22" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="3,3"/>
      <circle cx="40" cy="34" r="15" fill="none" stroke="#7dd3fc" stroke-width="0.8"/>
    """),
    'lapse-blue': ('#031940', '#60a5fa', 'LAPSE: BLUE', """
      <circle cx="40" cy="34" r="18" fill="#1d4ed8" opacity="0.4"/>
      <path d="M 40 18 A 16 16 0 0 1 56 34" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>
      <path d="M 40 50 A 16 16 0 0 1 24 34" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="34" r="6" fill="#1e40af" stroke="#93c5fd" stroke-width="2"/>
      <circle cx="40" cy="34" r="2" fill="#ffffff"/>
    """),
    'reversal-red': ('#45070a', '#ef4444', 'REVERSAL: RED', """
      <circle cx="40" cy="34" r="16" fill="#b91c1c" opacity="0.4"/>
      <line x1="40" y1="14" x2="40" y2="54" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="20" y1="34" x2="60" y2="34" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="26" y1="20" x2="54" y2="48" stroke="#ef4444" stroke-width="2"/>
      <line x1="26" y1="48" x2="54" y2="20" stroke="#ef4444" stroke-width="2"/>
      <circle cx="40" cy="34" r="5" fill="#f87171" stroke="#ffffff" stroke-width="1.5"/>
    """),
    'hollow-purple': ('#240046', '#c084fc', 'PURPLE', """
      <circle cx="40" cy="34" r="18" fill="#7e22ce" stroke="#c084fc" stroke-width="2"/>
      <circle cx="32" cy="28" r="8" fill="#2563eb" opacity="0.6"/>
      <circle cx="48" cy="40" r="8" fill="#dc2626" opacity="0.6"/>
      <path d="M 20 20 L 60 48" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="40" cy="34" r="6" fill="#f3e8ff"/>
    """),
    'unlimited-void': ('#05050d', '#a855f7', 'UNLIMITED VOID', """
      <ellipse cx="40" cy="34" rx="24" ry="14" fill="#0f0f23" stroke="#a855f7" stroke-width="1.5"/>
      <circle cx="40" cy="34" r="10" fill="#1e1b4b" stroke="#c084fc" stroke-width="1.5"/>
      <circle cx="40" cy="34" r="4" fill="#f8fafc"/>
      <circle cx="28" cy="30" r="1" fill="#e9d5ff"/>
      <circle cx="52" cy="38" r="1.2" fill="#e9d5ff"/>
      <circle cx="46" cy="26" r="0.8" fill="#e9d5ff"/>
      <circle cx="34" cy="42" r="1" fill="#e9d5ff"/>
    """),

    # Ryomen Sukuna
    'king-of-curses': ('#3b0713', '#ef4444', 'KING OF CURSES', """
      <ellipse cx="32" cy="26" rx="4" ry="2.5" fill="#ef4444"/>
      <ellipse cx="48" cy="26" rx="4" ry="2.5" fill="#ef4444"/>
      <ellipse cx="30" cy="36" rx="5" ry="3" fill="#dc2626" stroke="#fca5a5" stroke-width="1"/>
      <ellipse cx="50" cy="36" rx="5" ry="3" fill="#dc2626" stroke="#fca5a5" stroke-width="1"/>
      <path d="M 34 46 Q 40 50 46 46" stroke="#000000" stroke-width="2" fill="none"/>
    """),
    'dismantle': ('#1f0307', '#f87171', 'DISMANTLE', """
      <line x1="16" y1="18" x2="64" y2="50" stroke="#f87171" stroke-width="3" stroke-linecap="round"/>
      <line x1="22" y1="12" x2="68" y2="44" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="12" y1="28" x2="58" y2="56" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    """),
    'cleave': ('#1c0208', '#ef4444', 'CLEAVE', """
      <line x1="15" y1="20" x2="65" y2="48" stroke="#ef4444" stroke-width="2"/>
      <line x1="65" y1="20" x2="15" y2="48" stroke="#ef4444" stroke-width="2"/>
      <line x1="20" y1="15" x2="20" y2="53" stroke="#f87171" stroke-width="1.5"/>
      <line x1="60" y1="15" x2="60" y2="53" stroke="#f87171" stroke-width="1.5"/>
      <line x1="40" y1="12" x2="40" y2="56" stroke="#ffffff" stroke-width="2"/>
    """),
    'furnace-open': ('#431407', '#f97316', 'FUGA: OPEN', """
      <path d="M 40 14 Q 50 26 44 36 Q 52 38 40 54 Q 28 38 36 36 Q 30 26 40 14 Z" fill="#ea580c" stroke="#fef08a" stroke-width="1.5"/>
      <circle cx="40" cy="38" r="5" fill="#fef08a"/>
      <line x1="22" y1="36" x2="58" y2="36" stroke="#fbbf24" stroke-width="2"/>
    """),
    'malevolent-shrine': ('#2e020d', '#f59e0b', 'SHRINE', """
      <path d="M 22 28 Q 40 22 58 28 L 54 36 L 26 36 Z" fill="#7f1d1d" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="28" y="36" width="24" height="16" fill="#1c1917" stroke="#991b1b"/>
      <circle cx="34" cy="44" r="2" fill="#ef4444"/>
      <circle cx="46" cy="44" r="2" fill="#ef4444"/>
      <path d="M 18 24 Q 22 18 28 20" stroke="#f59e0b" stroke-width="2" fill="none"/>
      <path d="M 62 24 Q 58 18 52 20" stroke="#f59e0b" stroke-width="2" fill="none"/>
    """),

    # m0NESY
    'awp-wallbang': ('#14281d', '#22c55e', 'AWP WALLBANG', """
      <circle cx="40" cy="33" r="18" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      <line x1="40" y1="12" x2="40" y2="54" stroke="#22c55e" stroke-width="1.5"/>
      <line x1="19" y1="33" x2="61" y2="33" stroke="#22c55e" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="4" fill="none" stroke="#ef4444" stroke-width="1.5"/>
      <polygon points="38,31 42,31 41,36 39,36" fill="#fef08a"/>
    """),
    'oneway-smoke': ('#1e293b', '#94a3b8', 'ONE-WAY SMOKE', """
      <ellipse cx="40" cy="34" rx="22" ry="14" fill="#64748b" opacity="0.6"/>
      <circle cx="32" cy="30" r="12" fill="#94a3b8" opacity="0.5"/>
      <circle cx="48" cy="32" r="10" fill="#475569" opacity="0.7"/>
      <rect x="36" y="24" width="8" height="18" rx="2" fill="#0f172a" stroke="#cbd5e1" stroke-width="1"/>
    """),
    'flashbang': ('#422006', '#fbbf24', 'FLASHBANG', """
      <circle cx="40" cy="33" r="8" fill="#ffffff" stroke="#fef08a" stroke-width="2"/>
      <line x1="40" y1="14" x2="40" y2="52" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="21" y1="33" x2="59" y2="33" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="27" y1="20" x2="53" y2="46" stroke="#fde047" stroke-width="1.8"/>
      <line x1="27" y1="46" x2="53" y2="20" stroke="#fde047" stroke-width="1.8"/>
    """),
    'clutch-master': ('#2e1065', '#f59e0b', '1v5 CLUTCH', """
      <polygon points="24,30 28,20 34,26 40,16 46,26 52,20 56,30" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/>
      <rect x="24" y="30" width="32" height="6" fill="#d97706"/>
      <circle cx="40" cy="44" r="6" fill="#fef08a"/>
      <text x="40" y="47" font-size="8" font-family="sans-serif" font-weight="bold" fill="#000000" text-anchor="middle">★</text>
    """),

    # Minos Prime
    'judgement': ('#041f38', '#38bdf8', 'JUDGEMENT!', """
      <path d="M 40 22 C 32 12 18 20 28 32 L 40 46 L 52 32 C 62 20 48 12 40 22 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="40" cy="32" r="5" fill="#f0f9ff"/>
      <line x1="24" y1="46" x2="56" y2="46" stroke="#38bdf8" stroke-width="2"/>
    """),
    'thy-end-is-now': ('#032147', '#60a5fa', 'THY END IS NOW!', """
      <circle cx="30" cy="28" r="8" fill="#2563eb" stroke="#93c5fd" stroke-width="1"/>
      <circle cx="50" cy="32" r="8" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1"/>
      <circle cx="38" cy="42" r="9" fill="#3b82f6" stroke="#dbeafe" stroke-width="1.5"/>
    """),
    'prepare-thyself': ('#021a36', '#38bdf8', 'PREPARE THYSELF!', """
      <circle cx="40" cy="34" r="16" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <path d="M 28 34 Q 40 22 52 34 Q 40 46 28 34" fill="#0284c7"/>
      <circle cx="40" cy="34" r="4" fill="#f8fafc"/>
    """),
    'crush': ('#381e05', '#f59e0b', 'CRUSH!', """
      <polygon points="34,16 46,16 44,38 36,38" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/>
      <line x1="20" y1="44" x2="60" y2="44" stroke="#d97706" stroke-width="3"/>
      <line x1="24" y1="48" x2="36" y2="44" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="44" y1="44" x2="56" y2="48" stroke="#f59e0b" stroke-width="1.5"/>
    """),

    # Schrödinger
    'everywhere-nowhere': ('#130826', '#c084fc', 'NOWHERE', """
      <polygon points="26,38 32,20 40,30 48,20 54,38" fill="#7e22ce" stroke="#c084fc" stroke-width="1.5"/>
      <circle cx="34" cy="36" r="2" fill="#f0abfc"/>
      <circle cx="46" cy="36" r="2" fill="#f0abfc"/>
      <path d="M 20 44 Q 40 42 60 44" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3,2" fill="none"/>
    """),
    'prion': ('#032414', '#22c55e', 'PRION', """
      <circle cx="40" cy="32" r="6" fill="#16a34a" stroke="#86efac" stroke-width="1.5"/>
      <circle cx="28" cy="24" r="4" fill="#15803d"/>
      <circle cx="52" cy="24" r="4" fill="#15803d"/>
      <circle cx="32" cy="42" r="4.5" fill="#15803d"/>
      <circle cx="48" cy="42" r="4.5" fill="#15803d"/>
      <line x1="40" y1="32" x2="28" y2="24" stroke="#4ade80" stroke-width="1.5"/>
      <line x1="40" y1="32" x2="52" y2="24" stroke="#4ade80" stroke-width="1.5"/>
      <line x1="40" y1="32" x2="32" y2="42" stroke="#4ade80" stroke-width="1.5"/>
      <line x1="40" y1="32" x2="48" y2="42" stroke="#4ade80" stroke-width="1.5"/>
    """),
    'dead-alive': ('#1a1a2e', '#e2e8f0', 'DEAD & ALIVE', """
      <!-- Left side: Cat -->
      <path d="M 40 18 L 28 24 L 32 38 L 40 44 Z" fill="#818cf8"/>
      <!-- Right side: Skull -->
      <path d="M 40 18 L 50 22 L 48 38 L 40 44 Z" fill="#64748b"/>
      <circle cx="34" cy="30" r="2" fill="#38bdf8"/>
      <circle cx="45" cy="30" r="2.5" fill="#0f172a"/>
      <line x1="40" y1="16" x2="40" y2="48" stroke="#ffffff" stroke-width="1.5"/>
    """),
    'mind-control': ('#1f0d3d', '#a855f7', 'MIND CONTROL', """
      <circle cx="40" cy="33" r="18" fill="none" stroke="#a855f7" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="12" fill="none" stroke="#c084fc" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="6" fill="none" stroke="#e9d5ff" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="2" fill="#ffffff"/>
    """),
    'last-cat-live': ('#2e1065', '#f59e0b', 'LAST CAT LIVE', """
      <path d="M 24 32 Q 40 44 56 32" stroke="#f59e0b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="24" r="3" fill="#fef08a"/>
      <circle cx="50" cy="24" r="3" fill="#fef08a"/>
      <circle cx="40" cy="16" r="2" fill="#fbbf24"/>
      <circle cx="20" cy="20" r="1.5" fill="#fbbf24"/>
      <circle cx="60" cy="20" r="1.5" fill="#fbbf24"/>
    """),

    # Alucard
    'army-of-souls': ('#18040a', '#ef4444', 'ARMY OF SOULS', """
      <ellipse cx="28" cy="22" rx="4" ry="2" fill="#ef4444"/>
      <ellipse cx="52" cy="24" rx="3.5" ry="2" fill="#ef4444"/>
      <ellipse cx="38" cy="32" rx="5" ry="3" fill="#dc2626"/>
      <ellipse cx="24" cy="40" rx="3" ry="1.5" fill="#ef4444"/>
      <ellipse cx="54" cy="38" rx="4" ry="2" fill="#ef4444"/>
      <ellipse cx="40" cy="46" rx="4" ry="2" fill="#dc2626"/>
    """),
    'blood-drain': ('#3f020a', '#ef4444', 'BLOOD DRAIN', """
      <polygon points="26,18 32,18 29,36" fill="#f8fafc" stroke="#dc2626"/>
      <polygon points="48,18 54,18 51,36" fill="#f8fafc" stroke="#dc2626"/>
      <path d="M 29 36 Q 29 48 35 44" stroke="#ef4444" stroke-width="2" fill="none"/>
      <path d="M 51 36 Q 51 48 45 44" stroke="#ef4444" stroke-width="2" fill="none"/>
    """),
    'cromwell-seal-2': ('#110207', '#dc2626', 'CROMWELL 2', """
      <path d="M 24 40 C 24 24 34 20 40 20 C 46 20 56 24 56 40 C 50 42 40 46 24 40 Z" fill="#1c1917" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="34" cy="30" r="2.5" fill="#ef4444"/>
      <circle cx="46" cy="30" r="2.5" fill="#ef4444"/>
      <polygon points="36,40 40,36 44,40" fill="#ffffff"/>
    """),
    'cromwell-seal-1': ('#0f0f1c', '#a855f7', 'CROMWELL 1', """
      <path d="M 20 34 Q 30 20 40 30 Q 50 20 60 34 Q 50 48 40 38 Q 30 48 20 34 Z" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
      <circle cx="40" cy="34" r="4" fill="#ef4444"/>
    """),
    'cromwell-seal-0': ('#26020c', '#f59e0b', 'CROMWELL 0', """
      <circle cx="40" cy="33" r="20" fill="none" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="40" cy="33" r="17" fill="none" stroke="#f59e0b" stroke-width="1"/>
      <polygon points="40,16 48,43 25,26 55,26 32,43" fill="none" stroke="#dc2626" stroke-width="1.5"/>
    """),

    # Gabriel
    'light-speed': ('#332502', '#fbbf24', 'LIGHT SPEED', """
      <polygon points="40,12 44,28 60,32 46,40 50,56 40,46 30,56 34,40 20,32 36,28" fill="#fef08a" stroke="#ca8a04"/>
      <circle cx="40" cy="34" r="5" fill="#ffffff"/>
    """),
    'divine-spear': ('#2d2003', '#facc15', 'DIVINE SPEAR', """
      <line x1="22" y1="50" x2="58" y2="18" stroke="#fef08a" stroke-width="2.5"/>
      <polygon points="56,16 62,14 60,20" fill="#fde047"/>
      <line x1="18" y1="46" x2="54" y2="14" stroke="#ca8a04" stroke-width="1.5"/>
    """),
    'divine-rapier': ('#291e04', '#fde047', 'DIVINE RAPIER', """
      <line x1="40" y1="12" x2="40" y2="44" stroke="#ffffff" stroke-width="2"/>
      <line x1="32" y1="44" x2="48" y2="44" stroke="#facc15" stroke-width="2"/>
      <rect x="38" y="46" width="4" height="8" fill="#ca8a04"/>
      <circle cx="40" cy="22" r="3" fill="#fef08a"/>
    """),
    'divine-axe': ('#362103', '#f59e0b', 'DIVINE AXE', """
      <line x1="40" y1="14" x2="40" y2="54" stroke="#78350f" stroke-width="3"/>
      <path d="M 40 22 C 30 14 22 24 40 36 Z" fill="#facc15" stroke="#ca8a04"/>
      <path d="M 40 22 C 50 14 58 24 40 36 Z" fill="#facc15" stroke="#ca8a04"/>
    """),
    'angel-rage': ('#3d070b', '#ef4444', 'ANGEL RAGE', """
      <path d="M 28 22 Q 40 16 52 22 L 48 38 L 40 44 L 32 38 Z" fill="#991b1b" stroke="#f87171" stroke-width="1.5"/>
      <line x1="34" y1="28" x2="38" y2="30" stroke="#fef08a" stroke-width="2"/>
      <line x1="46" y1="28" x2="42" y2="30" stroke="#fef08a" stroke-width="2"/>
      <path d="M 20 28 Q 24 16 32 20" stroke="#ef4444" stroke-width="2" fill="none"/>
      <path d="M 60 28 Q 56 16 48 20" stroke="#ef4444" stroke-width="2" fill="none"/>
    """),
    'angel-power': ('#3b2904', '#f59e0b', 'ANGEL POWER', """
      <circle cx="40" cy="26" r="10" fill="none" stroke="#fef08a" stroke-width="2"/>
      <path d="M 20 38 Q 30 24 40 34 Q 50 24 60 38" fill="none" stroke="#facc15" stroke-width="3"/>
      <path d="M 24 46 Q 32 36 40 42 Q 48 36 56 46" fill="none" stroke="#eab308" stroke-width="2"/>
    """)
}

def make_custom_svg(skill_id, bg_color, border_color, label, glyph_content):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="bg_{skill_id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="{bg_color}"/><stop offset="100%" stop-color="#05070b"/></linearGradient></defs><rect width="80" height="80" rx="10" fill="url(#bg_{skill_id})" stroke="{border_color}" stroke-width="1.5"/><circle cx="40" cy="34" r="25" fill="rgba(0,0,0,0.3)" stroke="{border_color}" stroke-width="0.8" opacity="0.6"/>{glyph_content.strip()}<rect x="4" y="62" width="72" height="14" rx="3" fill="rgba(10,12,18,0.88)" stroke="{border_color}" stroke-width="0.6"/><text x="40" y="72" font-size="7" font-family="system-ui, sans-serif" font-weight="bold" fill="#f8fafc" text-anchor="middle" dominant-baseline="middle">{label}</text></svg>"""

out_lines = [
    "/**",
    " * Skill Icons Asset Registry",
    " * Complete registry for all 66 hero skills:",
    " * - 23 Official icons from Dota 2 and League of Legends (embedded base64 SVG)",
    " * - 43 Hand-crafted custom vector icons for all other abilities",
    " */",
    "",
    "function makeSvgDataUri(svgContent) {",
    "  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim().replace(/\\s+/g, ' '))}`;",
    "}",
    "",
    "export const SKILL_ICONS = {"
]

# Generate official
for skill_id, path in official_skills.items():
    svg = make_official_svg(skill_id, path)
    out_lines.append(f"  '{skill_id}': makeSvgDataUri(`{svg}`),")

# Generate custom
for skill_id, (bg, border, label, glyph) in custom_svg_glyphs.items():
    svg = make_custom_svg(skill_id, bg, border, label, glyph)
    out_lines.append(f"  '{skill_id}': makeSvgDataUri(`{svg}`),")

out_lines.append("};")
out_lines.append("")
out_lines.append("export function getSkillIcon(skillId) {")
out_lines.append("  return SKILL_ICONS[skillId] || makeSvgDataUri(`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 80 80\" width=\"80\" height=\"80\"><rect width=\"80\" height=\"80\" rx=\"10\" fill=\"#1e293b\" stroke=\"#64748b\" /><circle cx=\"40\" cy=\"40\" r=\"16\" fill=\"none\" stroke=\"#94a3b8\" stroke-width=\"2\"/><polygon points=\"40,30 48,46 32,46\" fill=\"#94a3b8\"/></svg>`);")
out_lines.append("}")
out_lines.append("")

with open('src/assets/skillIcons.js', 'w', encoding='utf-8') as f:
    f.write("\n".join(out_lines))

print(f"Generated src/assets/skillIcons.js with {len(official_skills) + len(custom_svg_glyphs)} icons!")
