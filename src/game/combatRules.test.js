// Comprehensive Test Scenarios for Combat Rules Engine
// Run directly with: node src/game/combatRules.test.js

import {
  calculateHitChance,
  isAttackingFromLowToHighGround,
  rollHit,
  rollDamage,
  rollCritical,
  calculateArmorMultiplier,
  calculateFinalDamage,
  canPerformAction,
  getNextCreepWave,
  canSpawnNeutralCamp
} from './combatRules.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

function assertClose(actual, expected, testName, epsilon = 0.001) {
  const diff = Math.abs(actual - expected);
  assert(diff <= epsilon, `${testName} (expected ~${expected}, got ${actual})`);
}

console.log('==================================================');
console.log('🧪 RUNNING COMBAT RULES UNIT TEST SUITE');
console.log('==================================================\n');

// -----------------------------------------------------------------
// 1. calculateHitChance()
// -----------------------------------------------------------------
console.log('--- 1. calculateHitChance(hit, agility) ---');
// Agility >= Hit => Dodge is 1.0 => Hit Chance is 0
assert(calculateHitChance(20, 20) === 0, 'Agility equal to Hit produces 0% hit chance (100% dodge)');
assert(calculateHitChance(20, 25) === 0, 'Agility greater than Hit produces 0% hit chance');
assert(calculateHitChance(0, 10) === 0, 'Zero hit produces 0% hit chance');

// Agility < Hit => dodge = agility / hit => hitChance = 1 - dodge
// E.g. hit=20, agility=10 => dodge=0.5 => hitChance=0.5
assertClose(calculateHitChance(20, 10), 0.5, 'Hit=20, Agility=10 gives exactly 50% hit chance');
// E.g. hit=20, agility=5 => dodge=0.25 => hitChance=0.75
assertClose(calculateHitChance(20, 5), 0.75, 'Hit=20, Agility=5 gives exactly 75% hit chance');
// E.g. hit=100, agility=0 => dodge=0 => hitChance=1.0
assertClose(calculateHitChance(100, 0), 1.0, 'Hit=100, Agility=0 gives 100% hit chance');

// -----------------------------------------------------------------
// 2. isAttackingFromLowToHighGround() & rollHit()
// -----------------------------------------------------------------
console.log('\n--- 2. rollHit() & High Ground Modifiers ---');
assert(
  isAttackingFromLowToHighGround({ elevation: 0 }, { elevation: 1 }) === true,
  'Elevation 0 attacking Elevation 1 has high-ground disadvantage'
);
assert(
  isAttackingFromLowToHighGround({ elevation: 1 }, { elevation: 0 }) === false,
  'Elevation 1 attacking Elevation 0 does NOT have disadvantage'
);
assert(
  isAttackingFromLowToHighGround({ elevation: 1 }, { elevation: 1 }) === false,
  'Equal elevation does NOT have disadvantage'
);

// Deterministic rollHit tests using mocked random function
// When random roll is 0.4 and hitChance is 0.5 => hits
const hitResult = rollHit(0.5, { randomFn: () => 0.4 });
assert(hitResult.isHit === true && hitResult.reason === 'HIT', 'Roll 0.4 with 50% hit chance hits');

// When random roll is 0.6 and hitChance is 0.5 => misses
const missResult = rollHit(0.5, { randomFn: () => 0.6 });
assert(missResult.isHit === false && missResult.reason === 'MISSED', 'Roll 0.6 with 50% hit chance misses');

// High ground penalty: base hit passes (0.2 < 0.5), but high ground roll is 0.15 (< 0.30 miss chance) => high ground miss!
let hgCalls = 0;
const hgRollFn = () => {
  hgCalls++;
  return hgCalls === 1 ? 0.2 : 0.15; // 1st roll hits base, 2nd roll triggers 30% high-ground miss
};
const hgMissResult = rollHit(0.5, { hasHighGroundDisadvantage: true, randomFn: hgRollFn });
assert(
  hgMissResult.isHit === false && hgMissResult.missedDueToHighGround === true && hgMissResult.reason === 'HIGH_GROUND_MISS',
  'Base hit fails if high-ground 30% miss check triggers'
);

// High ground penalty: base hit passes (0.2 < 0.5), high ground roll is 0.45 (> 0.30 miss chance) => hit succeeds!
let hgPassCalls = 0;
const hgPassRollFn = () => {
  hgPassCalls++;
  return hgPassCalls === 1 ? 0.2 : 0.45;
};
const hgPassResult = rollHit(0.5, { hasHighGroundDisadvantage: true, randomFn: hgPassRollFn });
assert(
  hgPassResult.isHit === true && hgPassResult.missedDueToHighGround === false,
  'Base hit succeeds through high ground if high-ground roll exceeds 30%'
);

// -----------------------------------------------------------------
// 3. rollDamage()
// -----------------------------------------------------------------
console.log('\n--- 3. rollDamage(averageDamage, randomFn) ---');
// Minimum bound (random = 0.0) -> exactly 75% of averageDamage
const minDmg = rollDamage(100, () => 0.0);
assertClose(minDmg, 75, 'Roll at lower bound yields 75% of average damage');

// Maximum bound (random = 1.0) -> exactly 125% of averageDamage
const maxDmg = rollDamage(100, () => 1.0);
assertClose(maxDmg, 125, 'Roll at upper bound yields 125% of average damage');

// Midpoint (random = 0.5) -> exactly 100% of averageDamage
const midDmg = rollDamage(100, () => 0.5);
assertClose(midDmg, 100, 'Roll at midpoint yields 100% of average damage');

// -----------------------------------------------------------------
// 4. rollCritical()
// -----------------------------------------------------------------
console.log('\n--- 4. rollCritical(rolledDamage, critChance, critMultiplier, randomFn) ---');
// With 5% crit chance, roll 0.04 (< 0.05) is critical (2x damage)
const critHit = rollCritical(100, 0.05, 2.0, () => 0.04);
assert(critHit.isCrit === true && critHit.damage === 200, 'Roll below 0.05 triggers 2x critical damage');

// Roll 0.06 (>= 0.05) is normal hit (1x damage)
const normalHit = rollCritical(100, 0.05, 2.0, () => 0.06);
assert(normalHit.isCrit === false && normalHit.damage === 100, 'Roll above 0.05 deals normal 1x damage');

// -----------------------------------------------------------------
// 5. calculateArmorMultiplier()
// -----------------------------------------------------------------
console.log('\n--- 5. calculateArmorMultiplier(penetration, armor) ---');
// Penetration >= Armor => multiplier = 1.0
assert(calculateArmorMultiplier(15, 10) === 1.0, 'Penetration > Armor yields multiplier 1.0');
assert(calculateArmorMultiplier(10, 10) === 1.0, 'Penetration == Armor yields multiplier 1.0');
assert(calculateArmorMultiplier(5, 0) === 1.0, 'Armor <= 0 yields multiplier 1.0');

// Penetration < Armor => multiplier = penetration / armor
// e.g. penetration=10, armor=20 => multiplier = 0.5
assertClose(calculateArmorMultiplier(10, 20), 0.5, 'Penetration 10 vs Armor 20 yields 0.5 multiplier');
assertClose(calculateArmorMultiplier(5, 20), 0.25, 'Penetration 5 vs Armor 20 yields 0.25 multiplier');

// -----------------------------------------------------------------
// 6. calculateFinalDamage()
// -----------------------------------------------------------------
console.log('\n--- 6. calculateFinalDamage(rolledDamage, damageMultiplier) ---');
assert(calculateFinalDamage(100, 1.0) === 100, '100 damage with 1.0 multiplier is 100');
assert(calculateFinalDamage(100, 0.5) === 50, '100 damage with 0.5 multiplier is 50');
assert(calculateFinalDamage(80, 0.25) === 20, '80 damage with 0.25 multiplier is 20');
assert(calculateFinalDamage(0, 0.5) === 0, '0 damage produces 0');

// -----------------------------------------------------------------
// 7. canPerformAction() (Time System)
// -----------------------------------------------------------------
console.log('\n--- 7. canPerformAction(remainingTime, actionTimeCost) ---');
// Action permitted if remainingTime >= timeCost
assert(canPerformAction(8.0, 3.0) === true, 'Can perform 3s attack when 8s remain');
assert(canPerformAction(3.0, 3.0) === true, 'Can perform 3s attack when exactly 3s remain');
assert(canPerformAction(2.9, 3.0) === false, 'Cannot perform 3s attack when only 2.9s remain');
assert(canPerformAction(0.0, 2.0) === false, 'Cannot perform action with 0s remaining');

// -----------------------------------------------------------------
// 8. getNextCreepWave()
// -----------------------------------------------------------------
console.log('\n--- 8. getNextCreepWave(waveIndex) ---');
// Cycle:
// Wave 0: 1 ranged + 4 melee
// Wave 1: 2 ranged + 3 melee
// Wave 2: 2 ranged + 5 melee
// Wave 3: 4 ranged + 5 melee
// Wave 4: 1 ranged + 4 melee (repeats)
const w0 = getNextCreepWave(0);
assert(w0.rangedCount === 1 && w0.meleeCount === 4, 'Wave 0 (60s): 1 ranged + 4 melee');

const w1 = getNextCreepWave(1);
assert(w1.rangedCount === 2 && w1.meleeCount === 3, 'Wave 1 (120s): 2 ranged + 3 melee');

const w2 = getNextCreepWave(2);
assert(w2.rangedCount === 2 && w2.meleeCount === 5, 'Wave 2 (180s): 2 ranged + 5 melee');

const w3 = getNextCreepWave(3);
assert(w3.rangedCount === 4 && w3.meleeCount === 5, 'Wave 3 (240s): 4 ranged + 5 melee');

const w4 = getNextCreepWave(4);
assert(w4.rangedCount === 1 && w4.meleeCount === 4, 'Wave 4 (300s): cycle repeats (1 ranged + 4 melee)');

const w7 = getNextCreepWave(7);
assert(w7.rangedCount === 4 && w7.meleeCount === 5, 'Wave 7: cycle step 3 (4 ranged + 5 melee)');

// -----------------------------------------------------------------
// 9. canSpawnNeutralCamp()
// -----------------------------------------------------------------
console.log('\n--- 9. canSpawnNeutralCamp(camp, mapObjects) ---');
const testCamp = { id: 'camp_1', r: 50, c: 50 };

// Empty map => can spawn
assert(canSpawnNeutralCamp(testCamp, []) === true, 'Camp with no objects nearby can spawn');

// Map object far away (r=10, c=10) => can spawn
assert(
  canSpawnNeutralCamp(testCamp, [{ r: 10, c: 10, isDead: false }]) === true,
  'Camp with objects outside radius can spawn'
);

// Map object inside radius (distance 1.41 cells <= 2.5) => CANNOT spawn
assert(
  canSpawnNeutralCamp(testCamp, [{ r: 51, c: 51, isDead: false }]) === false,
  'Camp occupied by living creature cancels spawn'
);

// Dead map object inside radius => can spawn
assert(
  canSpawnNeutralCamp(testCamp, [{ r: 51, c: 51, isDead: true }]) === true,
  'Camp containing only dead corpse does not block spawn'
);

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
}
