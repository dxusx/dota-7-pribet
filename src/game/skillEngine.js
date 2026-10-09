/**
 * Skill Execution Engine for 100x100 Dota Tactical Game:
 * Implements concrete, intuitive gameplay logic for hero skills:
 * - SELF: instant buffs, toggles, weapon switches
 * - TARGET_ENEMY: targeted projectile / attack / damage / pull
 * - AREA_OF_EFFECT: circular or square radius bursts
 * - TELEPORT: dashes / blink strikes
 * - GLOBAL: full map targeting (e.g. Sun Strike)
 */

import { resolveAttack, deductActionTime, canPerformAction } from './combatRules.js';
import { MAP_SIZE } from '../map/dotaMapData.js';

export function executeSkill({
  skill,
  caster,
  targetTile = null,
  targetHero = null,
  targetCreep = null,
  gameState,
  mapData,
}) {
  const { remainingTurnTime } = gameState;
  const timeCost = skill.timeCost || 0;
  const manaCost = skill.manaCost || 0;

  if (caster.mana < manaCost) {
    return { success: false, reason: 'Недостаточно маны!' };
  }
  if (!canPerformAction(remainingTurnTime, timeCost)) {
    return { success: false, reason: `Не хватает времени! Нужно ${timeCost}с, осталось ${remainingTurnTime}с` };
  }
  if (skill.currentCooldown > 0) {
    return { success: false, reason: 'Способность на перезарядке!' };
  }

  // Strict Target Validation Guards
  const isEnemyHeroOnly =
    skill.id === 'spell-steal' ||
    skill.id === 'mind-control' ||
    skill.id === 'divine-rapier' ||
    skill.id === 'prion';

  if (isEnemyHeroOnly) {
    if (!targetHero || targetHero.isDead) {
      return { success: false, reason: 'Нужно выбрать вражеского героя!' };
    }
    if (caster.faction && targetHero.faction === caster.faction) {
      return { success: false, reason: 'Нельзя применить на союзника!' };
    }
  }

  const isPointSkill =
    skill.id === 'meat-hook' ||
    skill.id === 'shunpo' ||
    skill.id === 'barrier-seal' ||
    skill.id === 'sun-strike' ||
    skill.id === 'chaos-meteor' ||
    skill.id === 'shadowraze-near' ||
    skill.id === 'shadowraze-medium' ||
    skill.id === 'shadowraze-far' ||
    skill.id === 'awp-wallbang' ||
    skill.id === 'oneway-smoke' ||
    skill.id === 'flashbang' ||
    skill.id === 'furnace-open' ||
    skill.id === 'hollow-purple' ||
    skill.id === 'everywhere-nowhere' ||
    skill.id === 'light-speed' ||
    skill.id === 'prepare-thyself' ||
    skill.id === 'crush';

  const isSelfSkill =
    skill.id === 'stars-agent' ||
    skill.id === 'mastermind' ||
    skill.id === 'ouroboros' ||
    skill.id === 'wesker-speed' ||
    skill.id === 'berserkers-call' ||
    skill.id === 'counter-helix' ||
    skill.id === 'voracity' ||
    skill.id === 'preparation' ||
    skill.id === 'death-lotus' ||
    skill.id === 'superhuman' ||
    skill.id === 'whirlwind-slash' ||
    skill.id === 'divine-regen' ||
    skill.id === 'infinity-shield' ||
    skill.id === 'unlimited-void' ||
    skill.id === 'king-of-curses' ||
    skill.id === 'malevolent-shrine' ||
    skill.id === 'rot' ||
    skill.id === 'flesh-heap' ||
    skill.id === 'requiem-of-souls' ||
    skill.id === 'clutch-master' ||
    skill.id === 'dead-alive' ||
    skill.id === 'last-cat-live' ||
    skill.id === 'army-of-souls' ||
    skill.id === 'cromwell-seal-2' ||
    skill.id === 'cromwell-seal-1' ||
    skill.id === 'cromwell-seal-0' ||
    skill.id === 'angel-rage' ||
    skill.id === 'angel-power';

  const isUnitTarget =
    !isSelfSkill &&
    !isPointSkill &&
    !isEnemyHeroOnly;

  if (isUnitTarget) {
    const targetUnit = targetHero || targetCreep;
    if (!targetUnit || targetUnit.isDead) {
      return { success: false, reason: 'Нужно выбрать цель (вражеского героя или крипа)!' };
    }
    if (caster.faction && targetUnit.faction && targetUnit.faction === caster.faction) {
      return { success: false, reason: 'Нельзя применить на союзника!' };
    }
  }

  let updatedHeroes = [...gameState.heroes];
  let updatedCreeps = [...(gameState.creeps || [])];
  let floatingTexts = [];
  let logMessage = '';

  // 1. S.T.A.R.S. Agent (Wesker weapon toggle)
  if (skill.id === 'stars-agent') {
    const newMode = caster.stats.weaponMode === 'ranged' ? 'melee' : 'ranged';
    const activeStats = newMode === 'ranged' ? caster.stats.ranged : caster.stats.melee;

    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return {
          ...h,
          stats: { ...h.stats, weaponMode: newMode },
          damage: activeStats.damage,
          range: activeStats.range,
          period: activeStats.period,
          penetration: activeStats.penetration,
          hit: activeStats.hit,
        };
      }
      return h;
    });

    logMessage = `${caster.name} переключил оружие на ${newMode === 'ranged' ? 'Пистолет (дальний бой)' : 'Кулаки (ближний бой)'}`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: `Оружие: ${newMode === 'ranged' ? 'Пистолет' : 'Кулаки'}`, color: '#38bdf8' });
  }

  // 2. Mastermind (Wesker Ultimate: invulnerability & speed boost)
  else if (skill.id === 'mastermind') {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return {
          ...h,
          speed: h.speed * 2,
          isInvulnerable: true,
        };
      }
      return h;
    });
    logMessage = `${caster.name} активировал [Mastermind]: скорость x2 и абсолютное уклонение!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '⚡ MASTERMIND!', color: '#ef4444' });
  }

  // 3. Berserker's Call (Axe AoE Taunt radius 2)
  else if (skill.id === 'berserkers-call') {
    const radius = skill.radius || 2;
    let tauntedCount = 0;

    updatedHeroes = updatedHeroes.map(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.abs(h.x - caster.x) + Math.abs(h.y - caster.y);
        if (dist <= radius) {
          tauntedCount++;
          floatingTexts.push({ x: h.x, y: h.y, text: 'ПРОВОКАЦИЯ!', color: '#f97316' });
          return { ...h, isTaunted: true };
        }
      }
      return h;
    });

    updatedCreeps = updatedCreeps.map(c => {
      if (!c.isDead && c.faction !== caster.faction) {
        const dist = Math.abs(c.x - caster.x) + Math.abs(c.y - caster.y);
        if (dist <= radius) {
          tauntedCount++;
          floatingTexts.push({ x: c.x, y: c.y, text: 'ПРОВОКАЦИЯ!', color: '#f97316' });
        }
      }
      return c;
    });

    logMessage = `${caster.name} применил [Berserker's Call], спровоцировав ${tauntedCount} врагов!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: "🪓 BERSERKER'S CALL!", color: '#f97316' });
  }

  // 4. Battle Hunger (Axe targeted DoT & slow)
  else if (skill.id === 'battle-hunger' && (targetHero || targetCreep)) {
    const damage = 20;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, speed: Math.max(1, h.speed - 2), isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} наложил [Battle Hunger] на ${targetHero.name}: -${damage} HP и замедление!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `-${damage} HP (Замедление)`, color: '#ea580c' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} наложил [Battle Hunger] на крипа: -${damage} HP!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `-${damage} HP`, color: '#ea580c' });
    }
  }

  // 5. Culling Blade (Axe Ultimate execution)
  else if (skill.id === 'culling-blade' && (targetHero || targetCreep)) {
    const damage = 100;
    let resetCooldown = false;

    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          if (newHp <= 0) resetCooldown = true;
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} разрубил ${targetHero.name} [Culling Blade]: -${damage} урона!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🪓 CULLING BLADE! -${damage}`, color: '#dc2626' });
    } else if (targetCreep) {
      resetCooldown = true;
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} разрубил крипа [Culling Blade]: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `🪓 CULLING BLADE! -${damage}`, color: '#dc2626' });
    }

    if (resetCooldown) {
      logMessage += ` Добивание! Перезарядка сброшена!`;
      floatingTexts.push({ x: caster.x, y: caster.y, text: 'ДОБИВАНИЕ! КД сброшен!', color: '#22c55e' });
    }
  }

  // 6. Preparation (Katarina: toss dagger & gain +50% move speed)
  else if (skill.id === 'preparation') {
    const newSpeed = Math.round(caster.speed * 1.5);
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, speed: newSpeed };
      }
      return h;
    });
    logMessage = `${caster.name} применила [Подготовка]: скорость +50% (до ${newSpeed} шагов в ход)!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: `🗡️ ПОДГОТОВКА! Скорость: ${newSpeed} шагов`, color: '#f43f5e' });
  }

  // 7. Shunpo (Katarina Teleport + Strike)
  else if (skill.id === 'shunpo' && targetTile) {
    const damage = 25;
    let hitHero = null;
    let hitCreep = null;
    let minDist = 3.0;

    updatedHeroes.forEach(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.hypot(h.x - targetTile.x, h.y - targetTile.y);
        if (dist <= minDist) {
          minDist = dist;
          hitHero = h;
          hitCreep = null;
        }
      }
    });

    updatedCreeps.forEach(c => {
      if (!c.isDead && c.faction !== caster.faction) {
        const dist = Math.hypot(c.x - targetTile.x, c.y - targetTile.y);
        if (dist <= minDist) {
          minDist = dist;
          hitCreep = c;
          hitHero = null;
        }
      }
    });

    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, x: targetTile.x, y: targetTile.y };
      }
      if (hitHero && h.instanceId === hitHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });

    if (hitCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === hitCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
    }

    logMessage = `${caster.name} телепортировался с помощью [Шунпо] в [${targetTile.x}, ${targetTile.y}]`;
    floatingTexts.push({ x: targetTile.x, y: targetTile.y, text: '🗡️ ШУНПО!', color: '#f43f5e' });
    if (hitHero) floatingTexts.push({ x: hitHero.x, y: hitHero.y, text: `-${damage}`, color: '#ef4444' });
    if (hitCreep) floatingTexts.push({ x: hitCreep.x, y: hitCreep.y, text: `-${damage}`, color: '#ef4444' });
  }

  // 8. Bouncing Blade (Katarina)
  else if (skill.id === 'bouncing-blade' && (targetHero || targetCreep)) {
    const damage = 40;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} метнул [Танцующий клинок] в ${targetHero.name}: -${damage} урона!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🗡️ -${damage}`, color: '#f43f5e' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} метнул [Танцующий клинок] в крипа: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `🗡️ -${damage}`, color: '#f43f5e' });
    }
  }

  // 9. Death Lotus (Katarina Ultimate AoE)
  else if (skill.id === 'death-lotus') {
    const radius = 5;
    let hitCount = 0;
    const dmg = 45;
    updatedHeroes = updatedHeroes.map(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.hypot(h.x - caster.x, h.y - caster.y);
        if (dist <= radius) {
          hitCount++;
          const newHp = Math.max(0, h.hp - dmg);
          floatingTexts.push({ x: h.x, y: h.y, text: `🌸 -${dmg} (Страшные раны -40%)`, color: '#e11d48' });
          return { ...h, hp: newHp, isDead: newHp <= 0, grievousWounds: 0.4 };
        }
      }
      return h;
    });

    updatedCreeps = updatedCreeps.map(c => {
      if (!c.isDead && c.faction !== caster.faction) {
        const dist = Math.hypot(c.x - caster.x, c.y - caster.y);
        if (dist <= radius) {
          hitCount++;
          const newHp = Math.max(0, c.hp - dmg);
          floatingTexts.push({ x: c.x, y: c.y, text: `🌸 -${dmg}`, color: '#e11d48' });
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
      }
      return c;
    });

    logMessage = `${caster.name} применил [Цветок смерти] по ${hitCount} врагам!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '🌸 DEATH LOTUS!', color: '#e11d48' });
  }

  // 10. Bayonet Throw (Anderson)
  else if (skill.id === 'bayonet-throw' && (targetHero || targetCreep)) {
    if (targetHero) {
      const damage = Math.max(20, Math.round(targetHero.hp * 0.20));
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} бросил [Противовампирский штык] в ${targetHero.name}: -${damage} урона и замедление!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `✝️ -${damage} HP`, color: '#eab308' });
    } else if (targetCreep) {
      const damage = 35;
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} бросил [Противовампирский штык] в крипа: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `✝️ -${damage} HP`, color: '#eab308' });
    }
  }

  // 11. Whirlwind Slash (Anderson AoE)
  else if (skill.id === 'whirlwind-slash') {
    const radius = 2;
    const damage = 50;
    updatedHeroes = updatedHeroes.map(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.abs(h.x - caster.x) + Math.abs(h.y - caster.y);
        if (dist <= radius) {
          const newHp = Math.max(0, h.hp - damage);
          floatingTexts.push({ x: h.x, y: h.y, text: `-${damage}`, color: '#eab308' });
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
      }
      return h;
    });

    updatedCreeps = updatedCreeps.map(c => {
      if (!c.isDead && c.faction !== caster.faction) {
        const dist = Math.abs(c.x - caster.x) + Math.abs(c.y - caster.y);
        if (dist <= radius) {
          const newHp = Math.max(0, c.hp - damage);
          floatingTexts.push({ x: c.x, y: c.y, text: `-${damage}`, color: '#eab308' });
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
      }
      return c;
    });

    logMessage = `${caster.name} совершил [Круговую атаку]: 50 урона по всем в радиусе 2!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '⚔️ КРУГОВАЯ АТАКА!', color: '#eab308' });
  }

  // 12. Divine Regeneration (Anderson Ultimate)
  else if (skill.id === 'divine-regen') {
    const healAmount = Math.round((caster.maxHp - caster.hp) * 0.35) + 30;
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return {
          ...h,
          hp: Math.min(h.maxHp, h.hp + healAmount),
          damage: h.damage + 10,
          speed: h.speed + 2,
        };
      }
      return h;
    });
    logMessage = `${caster.name} активировал [Божественную регенерацию]: +${healAmount} HP, +10 урона!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: `✨ +${healAmount} HP!`, color: '#22c55e' });
  }

  // 13. Meat Hook (Pudge: pull enemy to Pudge)
  else if (skill.id === 'meat-hook' && (targetHero || targetCreep)) {
    const damage = 60;
    const target = targetHero || targetCreep;
    const pullX = caster.x > target.x ? caster.x - 1 : caster.x < target.x ? caster.x + 1 : caster.x;
    const pullY = caster.y > target.y ? caster.y - 1 : caster.y < target.y ? caster.y + 1 : caster.y;

    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} притянул ${targetHero.name} [Meat Hook]: -${damage} урона!`;
    } else {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} притянул крипа [Meat Hook]: -${damage} урона!`;
    }
    floatingTexts.push({ x: pullX, y: pullY, text: `🪝 HOOK! -${damage}`, color: '#84cc16' });
  }

  // 13.5 Dismember (Pudge Ultimate: damage, heal, and silence)
  else if (skill.id === 'dismember' && (targetHero || targetCreep)) {
    const damage = 90;
    const heal = 60;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, statuses: { ...(h.statuses || {}), silence: { duration: 3.0 } }, isDead: newHp <= 0 };
        }
        if (h.instanceId === caster.instanceId) {
          return { ...h, hp: Math.min(h.maxHp, h.hp + heal) };
        }
        return h;
      });
      logMessage = `${caster.name} терзает ${targetHero.name} [Dismember]: -${damage} урона, +${heal} HP!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🥩 DISMEMBER! -${damage}`, color: '#84cc16' });
      floatingTexts.push({ x: caster.x, y: caster.y, text: `+${heal} HP`, color: '#22c55e' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === caster.instanceId) {
          return { ...h, hp: Math.min(h.maxHp, h.hp + heal) };
        }
        return h;
      });
      logMessage = `${caster.name} сожрал крипа [Dismember]: -${damage} урона, +${heal} HP!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `🥩 -${damage}`, color: '#84cc16' });
      floatingTexts.push({ x: caster.x, y: caster.y, text: `+${heal} HP`, color: '#22c55e' });
    }
  }

  // 14. Lapse: Blue (Gojo pull)
  else if (skill.id === 'lapse-blue' && (targetHero || targetCreep)) {
    const damage = 45;
    const target = targetHero || targetCreep;
    const pullX = Math.round((target.x + caster.x) / 2);
    const pullY = Math.round((target.y + caster.y) / 2);

    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} применил [Lapse: Blue] на ${targetHero.name}: -${damage} урона и притяжение!`;
    } else {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} применил [Lapse: Blue] на крипа: -${damage} урона!`;
    }
    floatingTexts.push({ x: pullX, y: pullY, text: `🔵 BLUE! -${damage}`, color: '#38bdf8' });
  }

  // 15. Dismantle / Cleave (Sukuna)
  else if ((skill.id === 'dismantle' || skill.id === 'cleave') && (targetHero || targetCreep)) {
    const damage = skill.id === 'cleave' ? 45 : 40;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} рассёк ${targetHero.name} [${skill.name}]: -${damage} урона!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🩸 -${damage}`, color: '#dc2626' });
    } else {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} рассёк крипа [${skill.name}]: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `🩸 -${damage}`, color: '#dc2626' });
    }
  }

  // --- 13. Schrödinger Skills ---
  else if (skill.id === 'everywhere-nowhere' && targetTile) {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, x: targetTile.x, y: targetTile.y, quantumReturn: { x: caster.x, y: caster.y } };
      }
      return h;
    });
    logMessage = `${caster.name} совершил квантовый скачок [Everywhere & Nowhere] в [${targetTile.x}, ${targetTile.y}]!`;
    floatingTexts.push({ x: targetTile.x, y: targetTile.y, text: '🌀 КВАНТОВЫЙ СКАЧОК', color: '#38bdf8' });
  } else if (skill.id === 'prion') {
    logMessage = `${caster.name} применил [Prion], вселившись в сознание цели!`;
    floatingTexts.push({ x: targetHero ? targetHero.x : caster.x, y: targetHero ? targetHero.y : caster.y, text: '👁️ PRION VISION', color: '#a855f7' });
  } else if (skill.id === 'mind-control' && targetHero) {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        return {
          ...h,
          statuses: {
            ...(h.statuses || {}),
            silence: { duration: 8.0 },
          },
        };
      }
      return h;
    });
    logMessage = `${caster.name} наложил [Mind Control] на ${targetHero.name}: наложено БЕЗМОЛВИЕ!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: '🤐 БЕЗМОЛВИЕ (Silence)', color: '#8b5cf6' });
  } else if (skill.id === 'last-cat-live') {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, hp: Math.round(h.maxHp * 0.70) };
      }
      return h;
    });
    logMessage = `${caster.name} активировал [Last Cat Live]: квантовое бессмертие кота, восстановление до 70% HP!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '🐱 LAST CAT LIVE!', color: '#38bdf8' });
  }

  // --- Rubick Skills ---
  else if (skill.id === 'spell-steal') {
    if (!targetHero) return { success: false, reason: 'Нужно выбрать вражеского героя!' };
    const candidate = (targetHero.skills || []).find(s => s.type !== 'PASSIVE' && s.id !== 'spell-steal') || targetHero.skills?.[0];
    if (!candidate) return { success: false, reason: 'У цели нет подходящих способностей для кражи!' };
    const stolen = { ...candidate, currentCooldown: 0, isStolen: true };
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        const filtered = (h.skills || []).filter(s => !s.isStolen);
        return { ...h, skills: [...filtered, stolen] };
      }
      return h;
    });
    logMessage = `${caster.name} украл способность [${stolen.name}] у ${targetHero.name}!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: '✨ СПОСОБНОСТЬ УКРАДЕНА!', color: '#10b981' });
    floatingTexts.push({ x: caster.x, y: caster.y, text: `✨ +${stolen.name}`, color: '#10b981' });
  } else if (skill.id === 'telekinesis' && (targetHero || targetCreep)) {
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          return {
            ...h,
            statuses: { ...(h.statuses || {}), stun: { duration: 2.0 } },
          };
        }
        return h;
      });
      logMessage = `${caster.name} поднял ${targetHero.name} [Telekinesis]: оглушение!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: '🌀 ТЕЛЕКИНЕЗ (Оглушение)', color: '#10b981' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          return { ...c, isStunned: true };
        }
        return c;
      });
      logMessage = `${caster.name} поднял крипа [Telekinesis]!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: '🌀 ТЕЛЕКИНЕЗ', color: '#10b981' });
    }
  } else if (skill.id === 'fade-bolt' && (targetHero || targetCreep)) {
    const damage = 45;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, damage: Math.max(1, Math.round(h.damage * 0.85)), isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} поразил ${targetHero.name} [Fade Bolt]: -${damage} урона и -15% атаки!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `⚡ -${damage} (Атака -15%)`, color: '#10b981' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, damage: Math.max(1, Math.round(c.damage * 0.85)), isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} поразил крипа [Fade Bolt]: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `⚡ -${damage}`, color: '#10b981' });
    }
  } else if (skill.id === 'cold-snap' && (targetHero || targetCreep)) {
    const damage = 25;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, statuses: { ...(h.statuses || {}), stun: { duration: 1.0 } }, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} применил [Cold Snap] на ${targetHero.name}: -${damage} урона и заморозка!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `❄️ COLD SNAP! -${damage}`, color: '#38bdf8' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} применил [Cold Snap] на крипа: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `❄️ -${damage}`, color: '#38bdf8' });
    }
  }

  // --- 14. Alucard Skills ---
  else if (skill.id === 'blood-drain' && (targetHero || targetCreep)) {
    const souls = caster.soulsCount || 0;
    const healAmount = 20 + souls * 3;
    const damage = 40;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        if (h.instanceId === caster.instanceId) {
          const newHp = Math.min(h.maxHp, h.hp + healAmount);
          return { ...h, hp: newHp, bloodThirst: (h.bloodThirst || 0) + 1 };
        }
        return h;
      });
      logMessage = `${caster.name} применил [Вытягивание крови] к ${targetHero.name}: -${damage} HP, +${healAmount} исцеления!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `-${damage}`, color: '#dc2626' });
      floatingTexts.push({ x: caster.x, y: caster.y, text: `+${healAmount} HP`, color: '#22c55e' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === caster.instanceId) {
          const newHp = Math.min(h.maxHp, h.hp + Math.round(healAmount * 0.35));
          return { ...h, hp: newHp };
        }
        return h;
      });
      logMessage = `${caster.name} вытянул кровь из крипа: -${damage} HP!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `-${damage}`, color: '#dc2626' });
    }
  } else if (skill.id === 'cromwell-seal-2') {
    const selfHpCost = Math.round(caster.maxHp * 0.08);
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, hp: Math.max(1, h.hp - selfHpCost) };
      }
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.hypot(h.x - caster.x, h.y - caster.y);
        if (dist <= 5.5) {
          floatingTexts.push({ x: h.x, y: h.y, text: '-25 (Цербер)', color: '#dc2626' });
          const newHp = Math.max(0, h.hp - 25);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
      }
      return h;
    });
    logMessage = `${caster.name} активировал [Печать Кромвеля 2]: призыв Церберов поразил врагов вокруг!`;
  } else if (skill.id === 'cromwell-seal-1') {
    const selfHpCost = Math.round(caster.hp * 0.20);
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return {
          ...h,
          hp: Math.max(1, h.hp - selfHpCost),
          isInvulnerable: true,
          speed: Math.round(h.speed * 1.35),
        };
      }
      return h;
    });
    logMessage = `${caster.name} активировал [Печать Кромвеля 1]: форма кровавого облака (+35% скорости)!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '🌫️ ОБЛАКО ТУМАНА', color: '#dc2626' });
  } else if (skill.id === 'cromwell-seal-0') {
    for (let i = 0; i < 2; i++) {
      updatedCreeps.push({
        id: `alucard_soul_creep_${Date.now()}_${i}`,
        faction: caster.faction,
        type: 'MELEE',
        level: 1,
        hp: 100,
        maxHp: 100,
        damage: 20,
        range: 1,
        armor: 1,
        x: Math.max(0, Math.min(MAP_SIZE - 1, caster.x + (i === 0 ? 1 : -1))),
        y: caster.y,
        nextAttackTime: (gameState.gameTimeSeconds || 0) + 4.0,
      });
    }
    logMessage = `${caster.name} высвободил [Печать Кромвеля 0]: призыв 2 душ-крипов!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '👻 АРМИЯ ДУШ', color: '#991b1b' });
  }

  // --- 15. Gabriel Skills ---
  else if (skill.id === 'light-speed' && targetTile) {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, x: targetTile.x, y: targetTile.y };
      }
      return h;
    });
    logMessage = `${caster.name} совершил [Light Speed] телепорт в [${targetTile.x}, ${targetTile.y}]!`;
    floatingTexts.push({ x: targetTile.x, y: targetTile.y, text: '⚡ LIGHT SPEED!', color: '#fbbf24' });
  } else if (skill.id === 'divine-spear' && (targetHero || targetCreep)) {
    const damage = 60;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} пронзил ${targetHero.name} [Divine Spear] на ${damage} урона!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `-${damage} (Копьё)`, color: '#fbbf24' });
    } else if (targetCreep) {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} пронзил крипа [Divine Spear] на ${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `-${damage} (Копьё)`, color: '#fbbf24' });
    }
  } else if (skill.id === 'divine-rapier' && targetHero) {
    const damage = 120;
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} нанес 4 удара [Divine Rapier] по ${targetHero.name} на ${damage} урона!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `⚔️ -${damage} (Рапира)`, color: '#fbbf24' });
  } else if (skill.id === 'divine-axe' && (targetHero || targetCreep)) {
    const damage = 50;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} метнул [Divine Axe] во врага на ${damage} урона (100 пробития)!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🪓 -${damage} (100 Пробития)`, color: '#fbbf24' });
    }
  } else if (skill.id === 'angel-power') {
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, damage: h.damage * 2, speed: h.speed * 2, penetration: 50 };
      }
      return h;
    });
  } else if (targetHero || targetCreep) {
    const damage = skill.damage || 40;
    if (targetHero) {
      updatedHeroes = updatedHeroes.map(h => {
        if (h.instanceId === targetHero.instanceId) {
          const newHp = Math.max(0, h.hp - damage);
          return { ...h, hp: newHp, isDead: newHp <= 0 };
        }
        return h;
      });
      logMessage = `${caster.name} применил [${skill.name}] по ${targetHero.name}: -${damage} урона!`;
      floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `✨ -${damage}`, color: '#a855f7' });
    } else {
      updatedCreeps = updatedCreeps.map(c => {
        if (c.id === targetCreep.id) {
          const newHp = Math.max(0, c.hp - damage);
          return { ...c, hp: newHp, isDead: newHp <= 0 };
        }
        return c;
      });
      logMessage = `${caster.name} применил [${skill.name}] по крипу: -${damage} урона!`;
      floatingTexts.push({ x: targetCreep.x, y: targetCreep.y, text: `✨ -${damage}`, color: '#a855f7' });
    }
  } else {
    logMessage = `${caster.name} применил [${skill.name}]!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: `✨ ${skill.name}`, color: '#a855f7' });
  }

  // Deduct mana, apply cooldown, deduct turn time
  updatedHeroes = updatedHeroes.map(h => {
    if (h.instanceId === caster.instanceId) {
      const newSkills = h.skills.map(s => {
        if (s.id === skill.id) {
          return { ...s, currentCooldown: s.cooldown || 16.0 };
        }
        return s;
      });
      return {
        ...h,
        mana: Math.max(0, h.mana - manaCost),
        skills: newSkills,
      };
    }
    return h;
  });

  const newRemainingTime = deductActionTime(remainingTurnTime, timeCost);

  // Filter dead creeps
  updatedCreeps = updatedCreeps.filter(c => !c.isDead && c.hp > 0);

  return {
    success: true,
    newRemainingTime,
    updatedHeroes,
    updatedCreeps,
    floatingTexts,
    logMessage,
  };
}
