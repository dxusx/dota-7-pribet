// Status Effects and Crowd Control System

export const STATUS_TYPES = {
  STUN: 'STUN',
  SLOW: 'SLOW',
  ROOT: 'ROOT',
  SILENCE: 'SILENCE',
  BLEED: 'BLEED',
  BURN: 'BURN',
  POISON: 'POISON',
  HASTE: 'HASTE',
  MAGIC_IMMUNE: 'MAGIC_IMMUNE',
  TAUNT: 'TAUNT',
  DEAD: 'DEAD'
};

export const STATUS_DEFINITIONS = {
  [STATUS_TYPES.STUN]: {
    name: 'Оглушение (Stun)',
    icon: '💫',
    color: '#fbbf24',
    cannotAct: true,
    cannotMove: true,
    cannotCast: true,
    desc: 'Персонаж оглушен: не может двигаться и совершать действия.'
  },
  [STATUS_TYPES.SLOW]: {
    name: 'Замедление (Slow)',
    icon: '❄️',
    color: '#60a5fa',
    speedMultiplier: 0.5,
    desc: 'Скорость перемещения снижена на 50%.'
  },
  [STATUS_TYPES.ROOT]: {
    name: 'Опутывание (Root)',
    icon: '🕸️',
    color: '#34d399',
    cannotMove: true,
    desc: 'Персонаж обездвижен: не может перемещаться.'
  },
  [STATUS_TYPES.SILENCE]: {
    name: 'Безмолвие (Silence)',
    icon: '🤐',
    color: '#c084fc',
    cannotCast: true,
    desc: 'Персонаж не может использовать способности.'
  },
  [STATUS_TYPES.BLEED]: {
    name: 'Кровотечение (Bleed)',
    icon: '🩸',
    color: '#f87171',
    tickDamage: 12,
    damageType: 'PHYSICAL',
    desc: 'Получает 12 физ. урона в начале каждого хода.'
  },
  [STATUS_TYPES.BURN]: {
    name: 'Горение (Burn)',
    icon: '🔥',
    color: '#fb923c',
    tickDamage: 18,
    damageType: 'MAGIC',
    desc: 'Получает 18 маг. урона в начале каждого хода.'
  },
  [STATUS_TYPES.POISON]: {
    name: 'Яд (Poison)',
    icon: '🧪',
    color: '#a3e635',
    tickDamage: 10,
    damageType: 'PURE',
    desc: 'Получает 10 чистого урона в начале каждого хода.'
  },
  [STATUS_TYPES.HASTE]: {
    name: 'Ускорение (Haste)',
    icon: '⚡',
    color: '#facc15',
    speedMultiplier: 2.0,
    desc: 'Скорость перемещения удвоена.'
  },
  [STATUS_TYPES.MAGIC_IMMUNE]: {
    name: 'Невосприимчивость к магии (BKB)',
    icon: '🛡️',
    color: '#eab308',
    isBuff: true,
    desc: 'Иммунитет к магическому урону и эффектам контроля.'
  },
  [STATUS_TYPES.TAUNT]: {
    name: 'Провокация (Taunt)',
    icon: '📢',
    color: '#ef4444',
    desc: 'Обязан атаковать только спровоцировавшего противника.'
  },
  [STATUS_TYPES.DEAD]: {
    name: 'Погиб (Dead)',
    icon: '💀',
    color: '#64748b',
    cannotAct: true,
    cannotMove: true,
    cannotCast: true,
    desc: 'Персонаж пал в бою.'
  }
};

// Apply status to unit or refresh duration
export function applyStatus(unit, statusType, duration = 1, metadata = {}) {
  // If unit has magic immunity, block incoming debuffs
  const hasMagicImmunity = (unit.statusEffects || []).some(s => s.type === STATUS_TYPES.MAGIC_IMMUNE);
  const def = STATUS_DEFINITIONS[statusType];
  if (hasMagicImmunity && !def?.isBuff && statusType !== STATUS_TYPES.DEAD) {
    return unit;
  }

  const existingStatuses = unit.statusEffects || [];
  const existingIdx = existingStatuses.findIndex(s => s.type === statusType);

  let newStatuses;
  if (existingIdx >= 0) {
    // Refresh / extend duration
    newStatuses = existingStatuses.map((s, idx) => 
      idx === existingIdx ? { ...s, duration: Math.max(s.duration, duration), ...metadata } : s
    );
  } else {
    // Add new status
    newStatuses = [...existingStatuses, { type: statusType, duration, ...metadata }];
  }

  return {
    ...unit,
    statusEffects: newStatuses
  };
}

// Remove a specific status
export function removeStatus(unit, statusType) {
  return {
    ...unit,
    statusEffects: (unit.statusEffects || []).filter(s => s.type !== statusType)
  };
}

// Check unit restrictions
export function canUnitAct(unit) {
  if (!unit || unit.isDead || unit.hp <= 0) return false;
  return !(unit.statusEffects || []).some(s => STATUS_DEFINITIONS[s.type]?.cannotAct);
}

export function canUnitMove(unit) {
  if (!unit || unit.isDead || unit.hp <= 0) return false;
  return !(unit.statusEffects || []).some(s => STATUS_DEFINITIONS[s.type]?.cannotMove);
}

export function canUnitCast(unit) {
  if (!unit || unit.isDead || unit.hp <= 0) return false;
  return !(unit.statusEffects || []).some(s => STATUS_DEFINITIONS[s.type]?.cannotCast);
}

// Get effective movement speed with statuses applied
export function getUnitSpeed(unit) {
  let baseSpeed = unit.speed || unit.stats?.speedClamped || 6;
  if (!canUnitMove(unit)) return 0;

  for (const s of (unit.statusEffects || [])) {
    const mult = STATUS_DEFINITIONS[s.type]?.speedMultiplier;
    if (mult !== undefined) {
      baseSpeed = Math.round(baseSpeed * mult);
    }
  }

  return Math.max(1, baseSpeed);
}

// Tick down statuses at the start of unit's turn and apply periodic damage
export function tickStatuses(unit) {
  if (!unit.statusEffects || unit.statusEffects.length === 0) {
    return { unit, tickDamageList: [] };
  }

  const tickDamageList = [];
  let currentHp = unit.hp ?? unit.maxHp ?? 100;
  const remainingStatuses = [];

  for (const s of unit.statusEffects) {
    const def = STATUS_DEFINITIONS[s.type];
    
    // Apply periodic tick damage (Bleed, Burn, Poison)
    if (def?.tickDamage && currentHp > 0) {
      currentHp = Math.max(0, currentHp - def.tickDamage);
      tickDamageList.push({
        statusType: s.type,
        damage: def.tickDamage,
        damageType: def.damageType
      });
    }

    // Decrement duration
    const newDuration = s.duration - 1;
    if (newDuration > 0 || s.type === STATUS_TYPES.DEAD) {
      remainingStatuses.push({ ...s, duration: newDuration });
    }
  }

  const isDead = currentHp <= 0;
  if (isDead && !remainingStatuses.some(s => s.type === STATUS_TYPES.DEAD)) {
    remainingStatuses.push({ type: STATUS_TYPES.DEAD, duration: 999 });
  }

  const updatedUnit = {
    ...unit,
    hp: currentHp,
    isDead,
    statusEffects: remainingStatuses
  };

  return { unit: updatedUnit, tickDamageList };
}
