# Dota 7 Pribet

> Пошаговая тактическая дуэль на классической карте DotA (100x100) с ростером героев, тайм-банком, механикой возвышенностей и крипами.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://dxusx.github.io/dota-7-pribet/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-success)](https://github.com/dxusx/dota-7-pribet)

---

## 🌐 Играть онлайн

Проект автоматически развертывается и доступен по адресу:  
👉 **[https://dxusx.github.io/dota-7-pribet/](https://dxusx.github.io/dota-7-pribet/)**

---

## 📖 Об игре

**Dota 7 Pribet** переосмысляет классическую карту DotA как пошаговую тактическую стратегию (turn-based tactical RPG). Игроки управляют героями Света (Radiant) и Тьмы (Dire), координируют действия со спавнящимися волнами крипов, контролируют возвышенности, сражаются в лесу с нейтралами и охотятся за Рошаном.

### Ключевые механики

- ⏱ **Тайм-банк (Time Bank & Initiative):** Каждый ход герой получает банк времени (8.0 секунд). Любое действие — передвижение, базовая атака, применение способностей — расходует секунды хода.
- ⛰ **Перепад высот (High Ground Advantage):** Карта разделена на уровни рельефа (Река — низина, Лес/Базы — возвышенность, Т3-башни — цитадели). Атака с низины на возвышенность имеет штраф к шансу попадания (25% промаха).
- 🎲 **Боевая система и формулы:**
  - **Дисперсия урона:** Базовый урон распределяется в диапазоне ±25% (75%–125%).
  - **Броня и пробитие:** Физическое сопротивление рассчитывается по формуле брони с учетом параметра пробития (Penetration).
  - **Ловкость и уклонение:** За каждые 7 единиц ловкости дается +1% шанса уклонения от физических атак.
- 👹 **Два логова Рошана (Миграция День / Ночь):** Рошан перемещается между северо-западным и юго-восточным логовом при смене времени суток.
- ⚔️ **Волны крипов:** Спавн отрядов крипов (3 мечника + 1 маг) каждые несколько ходов по 3 линиям (Top, Mid, Bot) со строгим сохранением боевого строя.
- 🌲 **Лесные лагеря (Neutral Camps):** Разноуровневые лагеря нейтральных крипов для фарма золота и опыта.
- 🏛 **Башни и Трон:** Крепостные башни 2x2 и Древние (Ancients) 4x4 со своими характеристиками прочности, брони и дальности атаки.

---

## 👥 Ростер героев

В игре представлены 12 уникальных персонажей со своими портретами, способностями, иконками и анимациями:

| Герой | Роль | Основные способности |
|---|---|---|
| **Albert Wesker** | Ассасин / Мобильный | Dual Stance (Смена стойки: Пистолет/Кулаки), Dash, Regeneration |
| **Axe (Mogul Khan)** | Танк / Инициатор | Berserker's Call, Battle Hunger, Counter Helix, Culling Blade |
| **Shadow Fiend** | Магический керри | Shadowraze (Койлы), Necromastery, Presence of Dark Lord, Requiem of Souls |
| **Invoker (Kael)** | Кастер широкого профиля | Sun Strike, Chaos Meteor, Deafening Blast, EMP |
| **Satoru Gojo** | Контроллер / Ультимейт маг | Infinity (Абсолютный барьер), Lapse Blue (Стяжка), Reversal Red, Hollow Purple |
| **Ryomen Sukuna** | Мили-берсерк | Dismantle, Cleave, Fire Arrow, Malevolent Shrine (Гробница) |
| **Kunkka (Admiral)** | Контроль / Зонящий | Torrent, Tidebringer, X Marks the Spot, Ghostship |
| **Alchemist** | Фармер / Берсерк | Acid Spray, Unstable Concoction, Greevil's Greed, Chemical Rage |
| **Pudge (Butcher)** | Ганкер / Дизейблер | Meat Hook, Rot, Flesh Heap, Dismember |
| **Zeus (Lord of Heaven)** | Глобальный маг | Arc Lightning, Lightning Bolt, Heavenly Jump, Thundergod's Wrath |
| **Anti-Mage (Magina)** | Анти-маг керри | Mana Break, Blink, Counterspell, Mana Void |
| **Sniper (Kardel)** | Дальнобойный снайпер | Shrapnel, Headshot, Take Aim, Assassinate |

---

## 🛠 Стек технологий

- **Фреймворк:** [React 19](https://react.dev/)
- **Сборщик:** [Vite 8](https://vite.dev/)
- **Стилизация:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Графика и рендер карты:** HTML5 2D Canvas (оптимизированный тайловый рендерер, система зума и панорамирования)
- **Иконки и интерфейс:** [Lucide React](https://lucide.dev/), векторная SVG-графика для всех способностей и портретов
- **Тестирование:** Встроенный Node.js Test Runner (`node:test`, `node:assert/strict`)

---

## 📁 Структура проекта

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions автодеплой на GitHub Pages
├── public/
│   └── portraits/              # Графические ассеты
├── src/
│   ├── assets/
│   │   ├── heroPortraits.js    # Портреты всех 12 героев (SVG Data URI + кэш)
│   │   └── skillIcons.js       # Иконки всех способностей и ультимейтов
│   ├── components/
│   │   ├── DotaMapCanvas.jsx   # Основной 2D Canvas холст карты (тайлы, юниты, высоты)
│   │   └── Minimap.jsx         # Интерактивная миникарта
│   ├── game/
│   │   ├── combatRules.js      # Формулы боя, урона, брони, возвышенностей, тайм-банка
│   │   ├── combatRules.test.js # Автотесты механик и целостности ассетов
│   │   ├── creepData.js        # Данные крипов, волн и лесных лагерей
│   │   ├── gameState.js        # Состояние матча, ходы, таймеры
│   │   ├── heroesData.js       # Характеристики, статы и баланс 12 героев
│   │   ├── skillEngine.js      # Движок исполнения активных и пассивных скиллов
│   │   └── towerData.js        # Характеристики башен и Древних (Ancients)
│   ├── map/
│   │   └── dotaMapData.js      # Сетка 100x100, типы террейна, карта высот, спавны
│   ├── App.jsx                 # Главный компонент HUD, боевая панель, таймлайн
│   ├── main.jsx                # Точка входа React
│   └── index.css               # Стили Tailwind
├── AGENTS.md                   # Инженерный регламент верификации и TDD-протокол
├── package.json                # Зависимости и скрипты
├── vite.config.js              # Конфигурация Vite
└── README.md                   # Документация проекта
```

---

## 🚀 Быстрый запуск

### Требования
- Node.js 20+
- npm 10+

### Установка зависимостей
```bash
npm install
```

### Запуск локального dev-сервера
```bash
npm run dev
```
После запуска откройте [http://localhost:5173](http://localhost:5173).

### Сборка проекта
```bash
npm run build
```
Собранные статические файлы будут сохранены в директорию `dist/`.

### Предпросмотр сборки
```bash
npm run preview
```

### Запуск тестов
```bash
npm test
```
Выполняет 13 наборов верификационных тестов игровых формул, баланса, боевых правил, формирования отрядов крипов и целостности графических ассетов.

---

## 🛡 Протокол верификации и качество кода

В репозитории действует строгий инженерный протокол ([AGENTS.md](./AGENTS.md)):
1. **Fail-First:** Любые изменения механик предваряются созданием падающего теста.
2. **Терминальная верификация:** Задача считается выполненной только при чистом прогоне всех тестов (`npm test` exit code 0).
3. **Целостность ассетов:** Все 12 героев и более 48 способностей покрыты тестами валидности ссылок и форматов графики.

---

## 📜 Лицензия

Распространяется под лицензией MIT.
