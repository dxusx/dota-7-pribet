// Data-Driven Ability and Spell Execution System
import { mitigateDamage, applyDamage, applyHeal, DAMAGE_TYPES } from './damage.js';
import { applyStatus, STATUS_TYPES } from './statuses.js';
import { getDistance, isInBounds, isTerrainPassable } from './pathfinding.js';

export const TARGET_TYPES = {
  SELF: 'SELF',
  SINGLE_TARGET: 'SINGLE_TARGET',
  AREA: 'AREA',
  LINE: 'LINE',
  GROUND: 'GROUND',
  GLOBAL: 'GLOBAL'
};

// Calculate valid targeting cells for an ability
export function getValidTargetCells(ability, caster, grid, allUnits = []) {
  const range = ability.range || 4;
  const targetType = ability.targetType || (ability.isUltimate ? TARGET_TYPES.AREA : TARGET_TYPES.SINGLE_TARGET);
  const validCells = [];

  if (targetType === TARGET_TYPES.SELF) {
    return [{ r: caster.r, c: caster.c }];
  }

  if (targetType === TARGET_TYPES.GLOBAL) {
    // Return all living enemy units coordinates
    return allUnits
      .filter(u => u.team !== caster.team && !u.isDead)
      .map(u => ({ r: u.r, c: u.c, unitId: u.id }));
  }

  // Iterate cells within Chebyshev or Euclidean range
  for (let dr = -range; dr <= range; dr++) {
    for (let dc = -range; dc <= range; dc++) {
      const tr = caster.r + dr;
      const tc = caster.c + dc;

      if (!isInBounds(tr, tc)) continue;
      const dist = getDistance(caster.r, caster.c, tr, tc);
      if (dist > range) continue;

      if (targetType === TARGET_TYPES.SINGLE_TARGET) {
        // Must contain a valid target unit
        const targetUnit = allUnits.find(u => u.r === tr && u.c === tc && !u.isDead);
        if (targetUnit && targetUnit.id !== caster.id) {
          validCells.push({ r: tr, c: tc, unitId: targetUnit.id });
        }
      } else if (targetType === TARGET_TYPES.GROUND || targetType === TARGET_TYPES.AREA) {
        // Must be a passable cell
        if (isTerrainPassable(tr, tc, grid)) {
          validCells.push({ r: tr, c: tc });
        }
      }
    }
  }

  return validCells;
}

// Universal ability executor
export function executeAbility(ability, caster, targetArg, gameState) {
  const logs = [];
  const manaCost = ability.manaCost || 0;

  // 1. Resource & Cooldown validation
  if (caster.mana < manaCost) {
    return { success: false, reason: 'Недостаточно маны!' };
  }
  if ((caster.cooldowns || {})[ability.id] > 0) {
    return { success: false, reason: 'Способность еще перезаряжается!' };
  }

  // Deduct mana and set cooldown
  const updatedCaster = {
    ...caster,
    mana: Math.max(0, caster.mana - manaCost),
    cooldowns: {
      ...(caster.cooldowns || {}),
      [ability.id]: ability.cooldown || 1
    }
  };

  logs.push({
    type: 'ABILITY_CAST',
    casterName: caster.name,
    abilityName: ability.name,
    manaCost,
    text: `✨ ${caster.name} применил «${ability.name}» (-${manaCost} MP)`
  });

  const allUnits = gameState.heroes || [];
  const updatedUnits = new Map();

  // 2. Resolve Targets based on targetType
  const targetType = ability.targetType || (ability.isUltimate ? TARGET_TYPES.AREA : TARGET_TYPES.SINGLE_TARGET);
  let targets = [];

  if (targetType === TARGET_TYPES.SELF) {
    targets = [updatedCaster];
  } else if (targetType === TARGET_TYPES.SINGLE_TARGET) {
    const targetUnit = typeof targetArg === 'object' && targetArg.id 
      ? allUnits.find(u => u.id === targetArg.id) 
      : allUnits.find(u => u.r === targetArg?.r && u.c === targetArg?.c);
    if (targetUnit) targets = [targetUnit];
  } else if (targetType === TARGET_TYPES.AREA) {
    const centerR = targetArg?.r ?? caster.r;
    const centerC = targetArg?.c ?? caster.c;
    const radius = ability.area || 3;

    targets = allUnits.filter(u => 
      !u.isDead && 
      u.team !== caster.team && 
      getDistance(centerR, centerC, u.r, u.c) <= radius
    );
  } else if (targetType === TARGET_TYPES.GLOBAL) {
    targets = allUnits.filter(u => !u.isDead && u.team !== caster.team);
  }

  // 3. Apply Ability Effects (Damage, Healing, Crowd Control)
  const baseDmg = ability.damage || (ability.isUltimate ? 350 : 150);
  const dmgType = ability.damageType || (ability.id.includes('purple') ? DAMAGE_TYPES.PURE : DAMAGE_TYPES.MAGIC);

  for (const tgt of targets) {
    let currentTgt = tgt.id === updatedCaster.id ? updatedCaster : tgt;

    // Apply Damage
    if (baseDmg > 0 && currentTgt.team !== caster.team) {
      const finalDmg = mitigateDamage(baseDmg, dmgType, currentTgt);
      currentTgt = applyDamage(currentTgt, finalDmg);

      logs.push({
        type: 'DAMAGE',
        targetName: currentTgt.name,
        damage: finalDmg,
        damageType: dmgType,
        text: `💥 «${ability.name}» наносит ${finalDmg} ${dmgType.toLowerCase()} урона по ${currentTgt.name}!`
      });

      if (currentTgt.isDead) {
        logs.push({
          type: 'DEATH',
          targetName: currentTgt.name,
          text: `💀 ${currentTgt.name} был повержен заклинанием «${ability.name}»!`
        });
      }
    }

    // Apply Healing (if healing spell)
    if (ability.healAmount && currentTgt.team === caster.team) {
      currentTgt = applyHeal(currentTgt, ability.healAmount);
      logs.push({
        type: 'HEAL',
        targetName: currentTgt.name,
        heal: ability.healAmount,
        text: `💚 «${ability.name}» восстанавливает ${ability.healAmount} HP для ${currentTgt.name}!`
      });
    }

    // Apply Status Effects (Stun, Silence, Slow, Taunt)
    if (ability.statusEffect) {
      currentTgt = applyStatus(currentTgt, ability.statusEffect, ability.duration || 1);
      logs.push({
        type: 'STATUS',
        targetName: currentTgt.name,
        status: ability.statusEffect,
        text: `🌀 На ${currentTgt.name} наложен эффект: ${ability.statusEffect}!`
      });
    }

    // Specific custom mechanics:
    // Pudge Hook / Gojo Blue: pull target closer!
    if (ability.id === 'hook' || ability.id === 'gojo_blue') {
      const pullDist = 3;
      const dr = Math.sign(caster.r - currentTgt.r);
      const dc = Math.sign(caster.c - currentTgt.c);
      const newR = Math.max(0, Math.min(94, currentTgt.r + dr * pullDist));
      const newC = Math.max(0, Math.min(94, currentTgt.c + dc * pullDist));
      currentTgt = { ...currentTgt, r: newR, c: newC };
      logs.push({
        type: 'MOVE',
        targetName: currentTgt.name,
        text: `🪝 ${currentTgt.name} притянут на клетку [${newR}, ${newC}]!`
      });
    }

    updatedUnits.set(currentTgt.id, currentTgt);
  }

  return {
    success: true,
    updatedCaster: updatedUnits.get(updatedCaster.id) || updatedCaster,
    updatedTargets: Array.from(updatedUnits.values()),
    logs
  };
}
