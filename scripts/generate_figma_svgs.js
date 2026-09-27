import fs from 'fs';
import path from 'path';

const outDir = './public/figma_cards';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to escape XML
function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSvgCard({ name, title, universe, themeColor, accentColor, skills, stats, level = 1 }) {
  const width = 4200;
  const height = 6200;

  let skillsSvg = '';
  let curY = 1200;

  skills.forEach((skill, idx) => {
    const isUlt = skill.isUltimate;
    const titleText = `${isUlt ? 'Ульта' : `Скилл ${idx + 1}`} “${skill.name}”`;
    
    skillsSvg += `
      <!-- Skill ${idx + 1} -->
      <g transform="translate(150, ${curY})">
        <rect width="3900" height="420" rx="30" fill="#0d1117" stroke="${isUlt ? accentColor : '#30363d'}" stroke-width="${isUlt ? '12' : '6'}" />
        <text x="60" y="110" font-family="Inter, sans-serif" font-size="130" font-weight="bold" fill="${isUlt ? '#fbbf24' : '#e6edf3'}">${esc(titleText)}</text>
        <text x="60" y="240" font-family="Inter, sans-serif" font-size="95" fill="#8b949e">
          <tspan x="60" dy="0">${esc(skill.descLine1 || skill.desc || '')}</tspan>
          <tspan x="60" dy="120">${esc(skill.descLine2 || '')}</tspan>
        </text>
      </g>
    `;
    curY += 500;
  });

  const statsSvg = `
    <!-- Stats Block -->
    <g transform="translate(150, ${curY + 50})">
      <rect width="3900" height="900" rx="40" fill="#0a0c10" stroke="#30363d" stroke-width="8" />
      <text x="80" y="160" font-family="Inter, sans-serif" font-size="140" font-weight="bold" fill="${accentColor}">ХАРАКТЕРИСТИКИ:</text>
      
      <text x="80" y="340" font-family="Inter, monospace" font-size="105" fill="#e6edf3">
        <tspan x="80" dy="0">ХП: ${stats.hp} (рег: ${stats.hpRegen})   |   МАНА: ${stats.mana} (вос: ${stats.manaRegen})</tspan>
        <tspan x="80" dy="150">УРОН: ${stats.damage} (период: ${stats.period})   |   КРИТ: ${stats.crit}   |   ДАЛЬНОСТЬ: ${stats.range} кл</tspan>
        <tspan x="80" dy="150">ПРОБИТИЕ: ${stats.penetration}   |   МЕТКОСТЬ: ${stats.accuracy}%   |   СКОРОСТЬ: ${stats.speed} кл</tspan>
        <tspan x="80" dy="150">БРОНЯ: ${stats.armor}   |   ЛОВКОСТЬ: ${stats.agility}</tspan>
      </text>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect width="${width}" height="${height}" rx="60" fill="${themeColor}" />
  <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="45" stroke="${accentColor}" stroke-width="20" stroke-opacity="0.6" />

  <!-- Header Header -->
  <text x="150" y="320" font-family="Inter, sans-serif" font-size="90" font-weight="bold" fill="${accentColor}" letter-spacing="10">${esc(universe.toUpperCase())}</text>
  <text x="150" y="550" font-family="Inter, sans-serif" font-size="240" font-weight="900" fill="#ffffff">${esc(name)}</text>
  <text x="150" y="720" font-family="Inter, sans-serif" font-size="110" font-style="italic" fill="#94a3b8">${esc(title)}</text>

  <!-- Level Badge -->
  <g transform="translate(${width - 450}, 150)">
    <circle cx="160" cy="160" r="150" fill="#047857" stroke="#34d399" stroke-width="15" />
    <text x="160" y="215" font-family="Inter, sans-serif" font-size="160" font-weight="bold" fill="#ffffff" text-anchor="middle">${level}</text>
  </g>

  <!-- Skills -->
  ${skillsSvg}

  <!-- Stats -->
  ${statsSvg}
</svg>`;
}

// 1. Invoker Card
const invokerCard = generateSvgCard({
  name: "Invoker",
  title: "The Arsenal Magus / Древнейший Магистр",
  universe: "Dota 2",
  themeColor: "#11141c",
  accentColor: "#fbbf24",
  skills: [
    { name: "Quas / Wex / Exort", descLine1: "Сферы льда, молнии и огня. Quas дает регенерацию HP, Wex дает скорость,", descLine2: "Exort увеличивает урон атак и заклинаний. Каст: мгновенно. 0 маны." },
    { name: "Sun Strike [EEE]", descLine1: "Глобальный луч солнца в ЛЮБУЮ точку всей 2D карты: 120/240/360/480 ЧИСТОГО урона!", descLine2: "Игнорирует всю броню цели. Применение 2 сек. 150 маны. Перезарядка 20 сек." },
    { name: "Chaos Meteor [EEW]", descLine1: "Обрушивает метеорит, катящийся вперед на 8 клеток: 150/250/350 урона при падении", descLine2: "плюс периодическое горение 50/сек на 4 сек. Каст 1.5 сек. 175 маны. КД 40 сек." },
    { name: "Deafening Blast [QWE]", descLine1: "Звуковая волна отталкивает всех врагов на 4 клетки, наносит 80/160/240 урона", descLine2: "и ПОЛНОСТЬЮ ОБЕЗОРУЖИВАЕТ врагов на 4/6/8 сек! Каст 1 сек. 150 маны. КД 32 сек." },
    { name: "Tornado [WWQ]", descLine1: "Вихрь на 12/16/20/24 клетки. Поднимает врагов в воздух на 2/3/4 сек (неуязвимы и оглушены),", descLine2: "наносит 80/140/200 урона и развеивает все эффекты. Каст 1 сек. 125 маны. КД 20 сек." },
    { name: "EMP [WWW]", descLine1: "Электромагнитный взрыв в радиусе 4 кл: сжигает 50/100/150/200 маны и наносит чистый урон,", descLine2: "равный сожженной мане. Восстанавливает 50% маны Инвокеру. Каст 2 сек. КД 24 сек." },
    { name: "Cold Snap [QQQ]", descLine1: "Замораживает противника на 2/4/6/8 сек. При получении любого урона цель повторно", descLine2: "оглушается на 0.4 сек. Каст 0 сек. 75 маны. КД 12 сек. Активное." },
    { isUltimate: true, name: "Invoke (Синтез Заклинания)", descLine1: "Синтезирует текущие 3 активные сферы в выбранное заклинание (все 10 комбинаций).", descLine2: "Каст 0 сек. Перезарядка: 8 / 4 / 1 секунда. Мана: 20 / 10 / 0." }
  ],
  stats: {
    hp: 100, hpRegen: "+2/ход (+Quas)", mana: 150, manaRegen: "+15/ход",
    damage: "45 (+Exort)", period: 4, crit: 75, range: 15,
    penetration: 10, accuracy: "40% (+Wex)", speed: "6 (+Wex)", armor: 2, agility: 2
  }
});
fs.writeFileSync(path.join(outDir, 'invoker_figma_card.svg'), invokerCard);

// 2. Satoru Gojo Card
const gojoCard = generateSvgCard({
  name: "Satoru Gojo",
  title: "The Honored One / Сильнейший Маг Современности",
  universe: "Jujutsu Kaisen",
  themeColor: "#090d16",
  accentColor: "#38bdf8",
  skills: [
    { name: "Infinity (Бесконечность)", descLine1: "Пространство вокруг Годжо делится: любые атаки и снаряды замедляются перед попаданием.", descLine2: "Снижает входящий урон на 50/60/70/80% и дает 40% шанса уклонения. Пассивное." },
    { name: "Lapse: Blue (Синий: Схождение)", descLine1: "Точка сжатия пространства: стягивает всех врагов в радиусе 3 клеток к центру", descLine2: "и наносит 60/120/180/240 урона. Применение 1 сек. 50/75/100/125 ПЭ. КД 16/12/8/4 сек." },
    { name: "Reversal: Red (Красный: Расхождение)", descLine1: "Колоссальная сила отталкивания обратной энергии: отбрасывает цель на 6 клеток назад", descLine2: "с уроном 70/140/210/280. Применение 1 сек. 60/85/110/135 ПЭ. КД 16/12/8/4 сек." },
    { name: "Hollow Purple (Фиолетовый: Аннигиляция)", descLine1: "Мнимая масса летит через 15 клеток поля боя и полностью стирает всё на пути:", descLine2: "150/300/450/600 ЧИСТОГО урона! Пробивает любые укрытия. Каст 2 сек. КД 32/24/16/12 сек." },
    { isUltimate: true, name: "Domain: Unlimited Void (Необъятная Пустота)", descLine1: "Расширение Территории на область 5x5 клеток. В мозг врагов обрушивается бесконечная информация:", descLine2: "ПОЛНЫЙ ПАРАЛИЧ (100% оглушение) на 8/16/24 сек (1/2/3 хода). Каст 0 сек. КД 120/90/60 сек." }
  ],
  stats: {
    hp: 120, hpRegen: "+5/ход", mana: 200, manaRegen: "+20/ход",
    damage: "60 (Black Flash)", period: 4, crit: 120, range: 15,
    penetration: 25, accuracy: 95, speed: 7, armor: 10, agility: 5
  }
});
fs.writeFileSync(path.join(outDir, 'gojo_figma_card.svg'), gojoCard);

// 3. Ryomen Sukuna Card
const sukunaCard = generateSvgCard({
  name: "Ryomen Sukuna",
  title: "King of Curses / Король Проклятий",
  universe: "Jujutsu Kaisen",
  themeColor: "#1c0a0a",
  accentColor: "#ef4444",
  skills: [
    { name: "King of Curses (Король Проклятий)", descLine1: "ПОЛНЫЙ ИММУНИТЕТ к ядам, кровотечениям и гниению (Rot Пуджа не работает!).", descLine2: "За каждого убитого врага поглощает палец: +10% к макс. ХП и урону. Пассивное." },
    { name: "Dismantle (Рассечение)", descLine1: "Невидимый летящий разрез на расстояние до 15 клеток. Наносит 50/100/150/200", descLine2: "физического урона с бронепробитием 30. Каст 0 сек. 40/50/60/70 ПЭ. КД 8/6/4/2 сек." },
    { name: "Cleave (Расщепление)", descLine1: "Разрез, подстраивающийся под плотность цели: ПОЛНОСТЬЮ ИГНОРИРУЕТ 100% БРОНИ цели", descLine2: "и наносит 60/120/180/240 чистого урона! Каст 1 сек. 60/80/100/120 ПЭ. КД 12/10/8/6 сек." },
    { name: "Furnace: «Open» (Божественное Пламя)", descLine1: "Сукуна произносит «Откройся» (Fuuga) и выпускает пылающую стрелу, взрывающую область", descLine2: "5x5 клеток пламенем: 100/200/300/400 урона по площади. Каст 2 сек. КД 24/20/16/12 сек." },
    { isUltimate: true, name: "Domain: Malevolent Shrine (Зловещая Гробница)", descLine1: "Открытая Территория без барьера радиусом 8 клеток. Каждый ход наносит шквал из сотен ударов", descLine2: "Dismantle и Cleave: 80/140/200 урона каждый ход по всем врагам! Длительность 16 сек. КД 100/80/60 сек." }
  ],
  stats: {
    hp: 150, hpRegen: "+5/ход", mana: 200, manaRegen: "+15/ход",
    damage: 65, period: 4, crit: 130, range: 15,
    penetration: 30, accuracy: 60, speed: 6, armor: 8, agility: 4
  }
});
fs.writeFileSync(path.join(outDir, 'sukuna_figma_card.svg'), sukunaCard);

console.log('SVG cards generated in public/figma_cards!');
