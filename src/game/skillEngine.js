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

    logMessage = `${caster.name} применил [Berserker's Call], спровоцировав ${tauntedCount} врагов!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: "🪓 BERSERKER'S CALL!", color: '#f97316' });
  }

  // 4. Battle Hunger (Axe targeted DoT & slow)
  else if (skill.id === 'battle-hunger' && targetHero) {
    const damage = 20;
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, speed: Math.max(1, h.speed - 2), isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} наложил [Battle Hunger] на ${targetHero.name}: -${damage} HP и замедление!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `-${damage} HP (Замедление)`, color: '#ea580c' });
  }

  // 5. Culling Blade (Axe Ultimate execution)
  else if (skill.id === 'culling-blade' && targetHero) {
    const damage = 100;
    let resetCooldown = false;

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

    if (resetCooldown) {
      logMessage += ` Добивание! Перезарядка сброшена!`;
      floatingTexts.push({ x: caster.x, y: caster.y, text: 'ДОБИВАНИЕ! КД сброшен!', color: '#22c55e' });
    }
  }

  // 6. Shunpo (Katarina Teleport + Strike)
  else if (skill.id === 'shunpo' && targetTile) {
    const damage = 25;
    // Find closest enemy near destination
    let hitEnemy = null;
    let minDist = 3.0;

    updatedHeroes = updatedHeroes.map(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.sqrt((h.x - targetTile.x) ** 2 + (h.y - targetTile.y) ** 2);
        if (dist <= minDist) {
          minDist = dist;
          hitEnemy = h;
        }
      }
      return h;
    });

    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === caster.instanceId) {
        return { ...h, x: targetTile.x, y: targetTile.y };
      }
      if (hitEnemy && h.instanceId === hitEnemy.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });

    logMessage = `${caster.name} телепортировался с помощью [Шунпо] в [${targetTile.x}, ${targetTile.y}]`;
    floatingTexts.push({ x: targetTile.x, y: targetTile.y, text: '🗡️ ШУНПО!', color: '#f43f5e' });
    if (hitEnemy) {
      floatingTexts.push({ x: hitEnemy.x, y: hitEnemy.y, text: `-${damage}`, color: '#ef4444' });
    }
  }

  // 7. Bouncing Blade (Katarina)
  else if (skill.id === 'bouncing-blade' && targetHero) {
    const damage = 40;
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} метнул [Танцующий клинок] в ${targetHero.name}: -${damage} урона!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🗡️ -${damage}`, color: '#f43f5e' });
  }

  // 8. Death Lotus (Katarina Ultimate AoE)
  else if (skill.id === 'death-lotus') {
    const radius = 5;
    let hitCount = 0;
    updatedHeroes = updatedHeroes.map(h => {
      if (!h.isDead && h.faction !== caster.faction) {
        const dist = Math.sqrt((h.x - caster.x) ** 2 + (h.y - caster.y) ** 2);
        if (dist <= radius) {
          hitCount++;
          const dmg = 45;
          const newHp = Math.max(0, h.hp - dmg);
          floatingTexts.push({ x: h.x, y: h.y, text: `🌸 -${dmg} (Страшные раны -40%)`, color: '#e11d48' });
          return { ...h, hp: newHp, isDead: newHp <= 0, grievousWounds: 0.4 };
        }
      }
      return h;
    });
    logMessage = `${caster.name} применил [Цветок смерти] по ${hitCount} врагам!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '🌸 DEATH LOTUS!', color: '#e11d48' });
  }

  // 9. Bayonet Throw (Anderson)
  else if (skill.id === 'bayonet-throw' && targetHero) {
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
  }

  // 10. Whirlwind Slash (Anderson AoE)
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
    logMessage = `${caster.name} совершил [Круговую атаку]: 50 урона по всем в радиусе 2!`;
    floatingTexts.push({ x: caster.x, y: caster.y, text: '⚔️ КРУГОВАЯ АТАКА!', color: '#eab308' });
  }

  // 11. Divine Regeneration (Anderson Ultimate)
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

  // 12. Meat Hook (Pudge: pull enemy to Pudge)
  else if (skill.id === 'meat-hook' && targetHero) {
    const damage = 60;
    // Pull target to tile adjacent to Pudge
    const pullX = caster.x > targetHero.x ? caster.x - 1 : caster.x < targetHero.x ? caster.x + 1 : caster.x;
    const pullY = caster.y > targetHero.y ? caster.y - 1 : caster.y < targetHero.y ? caster.y + 1 : caster.y;

    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} притянул ${targetHero.name} [Meat Hook]: -${damage} урона!`;
    floatingTexts.push({ x: pullX, y: pullY, text: `🪝 HOOK! -${damage}`, color: '#84cc16' });
  }

  // 13. Lapse: Blue (Gojo pull)
  else if (skill.id === 'lapse-blue' && targetHero) {
    const damage = 45;
    const pullX = Math.round((targetHero.x + caster.x) / 2);
    const pullY = Math.round((targetHero.y + caster.y) / 2);

    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, x: pullX, y: pullY, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} применил [Lapse: Blue] на ${targetHero.name}: -${damage} урона и притяжение!`;
    floatingTexts.push({ x: pullX, y: pullY, text: `🔵 BLUE! -${damage}`, color: '#38bdf8' });
  }

  // 14. Dismantle / Cleave (Sukuna)
  else if ((skill.id === 'dismantle' || skill.id === 'cleave') && targetHero) {
    const damage = skill.id === 'cleave' ? 45 : 40;
    updatedHeroes = updatedHeroes.map(h => {
      if (h.instanceId === targetHero.instanceId) {
        const newHp = Math.max(0, h.hp - damage);
        return { ...h, hp: newHp, isDead: newHp <= 0 };
      }
      return h;
    });
    logMessage = `${caster.name} рассёк ${targetHero.name} [${skill.name}]: -${damage} урона!`;
    floatingTexts.push({ x: targetHero.x, y: targetHero.y, text: `🩸 -${damage}`, color: '#dc2626' });
  }

  // Generic fallback for other skills
  else if (targetHero) {
    const damage = skill.damage || 40;
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

  return {
    success: true,
    newRemainingTime,
    updatedHeroes,
    floatingTexts,
    logMessage,
  };
}
