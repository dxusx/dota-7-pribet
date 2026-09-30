import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canPerformAction,
  deductActionTime,
  rollDamage,
  calculateArmorMultiplier,
  calculateHitChance,
  getTerrainAccuracyModifier,
  resolveAttack,
  getRespawnDelayTurns,
  TURN_DURATION_SECONDS,
} from './combatRules.js';
import { TOWER_STATS } from './towerData.js';
import { CREEP_STATS, LANE_WAVE_FORMATIONS, NEUTRAL_CAMP_FORMATIONS } from './creepData.js';
import { HEROES_ROSTER } from './heroesData.js';

test('1. Time System mechanics', () => {
  assert.equal(TURN_DURATION_SECONDS, 8.0);
  assert.equal(canPerformAction(8.0, 2.0), true);
  assert.equal(canPerformAction(1.5, 2.0), false);
  assert.equal(deductActionTime(8.0, 2.5), 5.5);
  assert.equal(deductActionTime(1.0, 2.0), 0);
});

test('2. Damage variance 75% - 125%', () => {
  const avg = 100;
  // min roll (rng = 0)
  const minDmg = rollDamage(avg, () => 0.0);
  assert.equal(minDmg, 75);

  // max roll (rng = 1)
  const maxDmg = rollDamage(avg, () => 1.0);
  assert.equal(maxDmg, 125);

  // mid roll (rng = 0.5)
  const midDmg = rollDamage(avg, () => 0.5);
  assert.equal(midDmg, 100);
});

test('3. Armor and Penetration formulas', () => {
  // Penetration >= Armor -> 100% full damage
  assert.equal(calculateArmorMultiplier(50, 50), 1.0);
  assert.equal(calculateArmorMultiplier(30, 50), 1.0);
  assert.equal(calculateArmorMultiplier(0, 10), 1.0);

  // Penetration < Armor -> x / n
  // Pen 20 vs Armor 50 -> 20 / 50 = 0.4
  assert.equal(calculateArmorMultiplier(50, 20), 0.4);
  // Pen 10 vs Armor 40 -> 10 / 40 = 0.25
  assert.equal(calculateArmorMultiplier(40, 10), 0.25);
});

test('4. Agility and Hit evasion formulas', () => {
  // Agility >= Hit -> Guaranteed evasion (hit chance = 0)
  assert.equal(calculateHitChance(50, 50), 0.0);
  assert.equal(calculateHitChance(30, 40), 0.0);

  // Agility < Hit -> Evasion is n / x, Hit chance is 1 - n / x
  // Hit 50, Agility 10 -> Evade 10/50 = 0.2 -> Hit = 0.8
  assert.equal(calculateHitChance(50, 10), 0.8);

  // Hit 100, Agility 25 -> Evade 25/100 = 0.25 -> Hit = 0.75
  assert.equal(calculateHitChance(100, 25), 0.75);
});

test('5. High Ground Advantage', () => {
  // Attacking uphill as ranged -> 30% miss penalty (0.70 multiplier)
  assert.equal(getTerrainAccuracyModifier(0, 1, true), 0.70);
  assert.equal(getTerrainAccuracyModifier(1, 2, true), 0.70);

  // Attacking downhill -> advantage
  assert.equal(getTerrainAccuracyModifier(2, 1, true), 1.15);

  // Same level -> neutral 1.0
  assert.equal(getTerrainAccuracyModifier(1, 1, true), 1.0);
});

test('6. Fountain Respawn Delay formula', () => {
  assert.equal(getRespawnDelayTurns(1), 1);
  assert.equal(getRespawnDelayTurns(15), 1);
  assert.equal(getRespawnDelayTurns(16), 2);
  assert.equal(getRespawnDelayTurns(30), 2);
  assert.equal(getRespawnDelayTurns(31), 3);
  assert.equal(getRespawnDelayTurns(45), 3);
  assert.equal(getRespawnDelayTurns(46), 4);
});

test('7. Tower Specifications from Google Doc', () => {
  assert.equal(TOWER_STATS.T1.hp, 1000);
  assert.equal(TOWER_STATS.T1.armor, 50);
  assert.equal(TOWER_STATS.T1.damage, 30);
  assert.equal(TOWER_STATS.T1.attackPeriod, 4.0);

  assert.equal(TOWER_STATS.T2.hp, 1500);
  assert.equal(TOWER_STATS.T2.armor, 75);
  assert.equal(TOWER_STATS.T2.damage, 60);

  assert.equal(TOWER_STATS.T3.hp, 2000);
  assert.equal(TOWER_STATS.T4.hp, 2500);
  assert.equal(TOWER_STATS.THRONE.hp, 3000);
});

test('8. Creep Formations & Roster Integrity', () => {
  assert.equal(LANE_WAVE_FORMATIONS.length, 4);
  assert.deepEqual(LANE_WAVE_FORMATIONS[0], { ranged: 1, melee: 4 });
  assert.equal(NEUTRAL_CAMP_FORMATIONS.length, 4);

  assert.equal(CREEP_STATS[1].melee.hp, 100);
  assert.equal(CREEP_STATS[1].ranged.hp, 80);
  assert.equal(CREEP_STATS[5].melee.hp, 500);

  assert.equal(HEROES_ROSTER.length, 12);
  const wesker = HEROES_ROSTER.find(h => h.id === 'wesker');
  assert.ok(wesker);
  assert.equal(wesker.stats.hp, 100);
  assert.equal(wesker.stats.ranged.damage, 40);

  const axe = HEROES_ROSTER.find(h => h.id === 'axe');
  assert.ok(axe);
  assert.equal(axe.stats.armor, 5);
});
