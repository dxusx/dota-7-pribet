// Usable Items with Real Game Effects
import { applyHeal } from './damage.js';
import { applyStatus, STATUS_TYPES } from './statuses.js';

export const ITEM_DEFINITIONS = {
  blink: {
    id: 'blink',
    name: 'Blink Dagger',
    icon: '🗡️',
    cost: 2250,
    cooldown: 3,
    range: 12,
    targetType: 'GROUND',
    desc: 'Мгновенно перемещает героя на расстояние до 12 клеток.',
    execute: (caster, targetPos) => {
      return {
        updatedCaster: { ...caster, r: targetPos.r, c: targetPos.c },
        log: `🗡️ ${caster.name} совершил Blink на клетку [${targetPos.r}, ${targetPos.c}]!`
      };
    }
  },

  bkb: {
    id: 'bkb',
    name: 'Black King Bar',
    icon: '🛡️',
    cost: 4050,
    cooldown: 5,
    targetType: 'SELF',
    desc: 'Дает невосприимчивость к магии и эффектам контроля на 2 хода.',
    execute: (caster) => {
      const updated = applyStatus(caster, STATUS_TYPES.MAGIC_IMMUNE, 2);
      return {
        updatedCaster: updated,
        log: `🛡️ ${caster.name} активировал Black King Bar (Иммунитет к магии на 2 хода)!`
      };
    }
  },

  satanic: {
    id: 'satanic',
    name: 'Satanic',
    icon: '🩸',
    cost: 5050,
    cooldown: 4,
    targetType: 'SELF',
    desc: 'Восстанавливает 45 HP и усиливает вампиризм.',
    execute: (caster) => {
      const updated = applyHeal(caster, 45);
      return {
        updatedCaster: updated,
        log: `🩸 ${caster.name} активировал Satanic (+45 HP)!`
      };
    }
  },

  salve: {
    id: 'salve',
    name: 'Healing Salve',
    icon: '🩹',
    cost: 100,
    cooldown: 2,
    targetType: 'SELF',
    desc: 'Восстанавливает 35 HP.',
    execute: (caster) => {
      const updated = applyHeal(caster, 35);
      return {
        updatedCaster: updated,
        log: `🩹 ${caster.name} использовал Healing Salve (+35 HP)!`
      };
    }
  },

  tp: {
    id: 'tp',
    name: 'Town Portal Scroll',
    icon: '📜',
    cost: 100,
    cooldown: 5,
    targetType: 'SELF',
    desc: 'Телепортирует героя на фонтан родной базы.',
    execute: (caster) => {
      // Radiant base fountain (88, 6), Dire base fountain (6, 88)
      const basePos = caster.team === 'radiant' ? { r: 88, c: 6 } : { r: 6, c: 88 };
      return {
        updatedCaster: { ...caster, r: basePos.r, c: basePos.c },
        log: `🌀 ${caster.name} телепортировался на Фонтан [${basePos.r}, ${basePos.c}]!`
      };
    }
  }
};

// Execute item effect
export function executeItem(itemId, caster, targetPos = null) {
  const item = ITEM_DEFINITIONS[itemId];
  if (!item) return { success: false, reason: 'Предмет не найден!' };

  const result = item.execute(caster, targetPos);
  return {
    success: true,
    item,
    updatedCaster: result.updatedCaster,
    log: result.log
  };
}
