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

  // Generic fallback for other skills
  else if (targetHero || targetCreep) {
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
