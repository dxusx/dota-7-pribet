/**
 * Bot AI Decision Engine:
 * Autonomous behavior for opposing faction heroes (Dire bots).
 * Follows tactical hierarchy:
 * 1. Health critical (<35%) -> cast self-heal or defensive skill if available.
 * 2. In range for offensive skill -> cast skill on enemy hero.
 * 3. In attack range -> execute basic attack.
 * 4. Outside attack range -> calculate walk step towards closest enemy.
 * 5. Out of turn time (< stepCost or < period) -> END_TURN.
 */

import { canPerformAction, canCastSkills } from './combatRules.js';

export function decideBotAction(botHero, gameState, mapData = null) {
  if (!botHero || botHero.isDead) {
    return { action: 'END_TURN' };
  }

  const remainingTime = gameState?.remainingTurnTime ?? 0;
  if (remainingTime <= 0) {
    return { action: 'END_TURN' };
  }

  const opposingFaction = botHero.faction === 'radiant' ? 'dire' : 'radiant';
  const enemies = (gameState?.heroes || []).filter(h => !h.isDead && h.faction === opposingFaction);
  const enemyCreeps = (gameState?.creeps || []).filter(c => !c.isDead && c.faction === opposingFaction);

  // If no enemies anywhere on map
  if (enemies.length === 0 && enemyCreeps.length === 0) {
    return { action: 'END_TURN' };
  }

  // Find closest enemy hero
  let closestHero = null;
  let minHeroDist = Infinity;
  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - botHero.x, enemy.y - botHero.y);
    if (dist < minHeroDist) {
      minHeroDist = dist;
      closestHero = enemy;
    }
  }

  // 1. Health Critical Defense (< 35% HP)
  const hpRatio = botHero.hp / (botHero.maxHp || 100);
  if (hpRatio < 0.35 && canCastSkills(botHero)) {
    const healSkill = (botHero.skills || []).find(s =>
      s.type !== 'PASSIVE' &&
      (s.currentCooldown || 0) === 0 &&
      botHero.mana >= (s.manaCost || 0) &&
      canPerformAction(remainingTime, s.timeCost || 0) &&
      (s.id === 'divine-regen' || s.id === 'last-cat-live' || s.id === 'cromwell-seal-1')
    );
    if (healSkill) {
      return { action: 'SKILL', skill: healSkill, target: null };
    }
  }

  // 2. Cast Offensive Skill
  if (canCastSkills(botHero) && closestHero) {
    const offensiveSkill = (botHero.skills || []).find(s => {
      if (s.type === 'PASSIVE') return false;
      if ((s.currentCooldown || 0) > 0) return false;
      if (botHero.mana < (s.manaCost || 0)) return false;
      if (!canPerformAction(remainingTime, s.timeCost || 0)) return false;
      const range = s.range || s.radius || 4;
      return minHeroDist <= range + 0.5;
    });

    if (offensiveSkill) {
      return { action: 'SKILL', skill: offensiveSkill, target: closestHero };
    }
  }

  // 3. Basic Attack
  const attackRange = botHero.range || 1;
  const attackTimeCost = botHero.period || 4.0;
  if (closestHero && minHeroDist <= attackRange + 0.5 && canPerformAction(remainingTime, attackTimeCost)) {
    return { action: 'ATTACK', target: closestHero };
  }

  // Check closest creep if no hero in range
  if (enemyCreeps.length > 0) {
    let closestCreep = null;
    let minCreepDist = Infinity;
    for (const creep of enemyCreeps) {
      const dist = Math.hypot(creep.x - botHero.x, creep.y - botHero.y);
      if (dist < minCreepDist) {
        minCreepDist = dist;
        closestCreep = creep;
      }
    }
    if (closestCreep && minCreepDist <= attackRange + 0.5 && canPerformAction(remainingTime, attackTimeCost)) {
      return { action: 'ATTACK', target: closestCreep };
    }
  }

  // 4. Movement towards closest enemy
  const targetUnit = closestHero || enemyCreeps[0];
  if (targetUnit) {
    const dx = Math.sign(targetUnit.x - botHero.x);
    const dy = Math.sign(targetUnit.y - botHero.y);
    const speed = botHero.speed || 6;
    const stepTimeCost = Number((8.0 / speed).toFixed(2));

    if (canPerformAction(remainingTime, stepTimeCost)) {
      let nextX = botHero.x + dx;
      let nextY = botHero.y + dy;
      return {
        action: 'MOVE',
        destination: { x: nextX, y: nextY },
        stepCost: stepTimeCost,
      };
    }
  }

  // 5. If no other action can be performed -> End Turn
  return { action: 'END_TURN' };
}
