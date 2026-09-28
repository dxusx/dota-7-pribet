// Comprehensive Test Scenarios for Combat Rules Engine & Approved Specifications
// Run directly with: node src/game/combatRules.test.js

import {
  calculateHitChance,
  calculateTerrainAdvantage,
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
import { TOWER_TIER_CONFIGS, generateInitialTowers } from '../data/towerData.js';
import { processContinuousTowerAttacks, checkTimedSpawns } from './towersAndCreeps.js';
import { TIME_CONFIG, TERRAIN_CONFIG, CREEP_CONFIG } from '../data/combatConfig.js';
import { createInitialGameState } from './gameState.js';

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
assertClose(calculateHitChance(20, 10), 0.5, 'Hit=20, Agility=10 gives exactly 50% hit chance');
assertClose(calculateHitChance(20, 5), 0.75, 'Hit=20, Agility=5 gives exactly 75% hit chance');
assertClose(calculateHitChance(100, 0), 1.0, 'Hit=100, Agility=0 gives 100% hit chance');

// -----------------------------------------------------------------
// 2. calculateTerrainAdvantage() (High Ground: both directions, ranged vs melee)
// -----------------------------------------------------------------
console.log('\n--- 2. calculateTerrainAdvantage() & rollHit() ---');
// Direction 1: Low Ground -> High Ground Ranged (Disadvantage, 30% miss)
const lowToHighRanged = calculateTerrainAdvantage(
  { elevation: 0, range: 4 },
  { elevation: 1 }
);
assert(lowToHighRanged.relation === 'LOW_TO_HIGH', 'Low to High relation correctly identified');
assert(lowToHighRanged.isRanged === true, 'Ranged attacker correctly identified');
assertClose(lowToHighRanged.missChance, 0.30, 'Ranged uphill suffers 30% miss chance');
assert(lowToHighRanged.hasDisadvantage === true, 'Ranged uphill marked with disadvantage');

// Direction 1b: Low Ground -> High Ground Melee (0% miss, melee does NOT miss uphill)
const lowToHighMelee = calculateTerrainAdvantage(
  { elevation: 0, range: 1 },
  { elevation: 1 }
);
assert(lowToHighMelee.isRanged === false, 'Melee attacker correctly identified');
assert(lowToHighMelee.missChance === 0.0, 'Melee uphill suffers 0% miss chance');
assert(lowToHighMelee.hasDisadvantage === false, 'Melee uphill has no disadvantage');

// Direction 2: High Ground -> Low Ground (Advantage, +15% hit bonus, 0% miss)
const highToLowAdv = calculateTerrainAdvantage(
  { elevation: 1, range: 4 },
  { elevation: 0 }
);
assert(highToLowAdv.relation === 'HIGH_TO_LOW', 'High to Low relation correctly identified');
assert(highToLowAdv.hasAdvantage === true, 'Downhill attack marked with advantage');
assertClose(highToLowAdv.hitBonus, 0.15, 'Downhill attack grants +15% hit bonus');
assert(highToLowAdv.missChance === 0.0, 'Downhill attack has 0% miss chance');

// Direction 3: Equal elevation
const equalAdv = calculateTerrainAdvantage(
  { elevation: 0, range: 4 },
  { elevation: 0 }
);
assert(equalAdv.relation === 'EQUAL', 'Equal elevation relation correctly identified');
assert(equalAdv.missChance === 0.0 && equalAdv.hitBonus === 0.0, 'Equal elevation has no modifier');

// rollHit with Terrain Advantage:
// Downhill hit with +15% bonus: base 40% + 15% = 55% effective hit chance
const downhillHit = rollHit(0.40, { terrainAdvantage: highToLowAdv, randomFn: () => 0.50 });
assert(downhillHit.isHit === true, 'Downhill +15% bonus converts 50% roll into a hit');

// Uphill ranged hit: base hit passes, but 30% miss check triggers
let callCount = 0;
const uphillMissRollFn = () => {
  callCount++;
  return callCount === 1 ? 0.30 : 0.10; // 1st roll hits base (0.30 < 0.50), 2nd roll triggers 30% uphill miss (0.10 < 0.30)
};
const uphillMiss = rollHit(0.50, { terrainAdvantage: lowToHighRanged, randomFn: uphillMissRollFn });
assert(
  uphillMiss.isHit === false && uphillMiss.missedDueToHighGround === true && uphillMiss.reason === 'HIGH_GROUND_MISS',
  'Ranged uphill attack misses when 30% high ground check triggers'
);

// -----------------------------------------------------------------
// 3. rollDamage()
// -----------------------------------------------------------------
console.log('\n--- 3. rollDamage(averageDamage, randomFn) ---');
const minDmg = rollDamage(100, () => 0.0);
assertClose(minDmg, 75, 'Roll at lower bound yields 75% of average damage');

const maxDmg = rollDamage(100, () => 1.0);
assertClose(maxDmg, 125, 'Roll at upper bound yields 125% of average damage');

const midDmg = rollDamage(100, () => 0.5);
assertClose(midDmg, 100, 'Roll at midpoint yields 100% of average damage');

// -----------------------------------------------------------------
// 4. rollCritical()
// -----------------------------------------------------------------
console.log('\n--- 4. rollCritical(rolledDamage, critChance, critMultiplier, randomFn) ---');
const critHit = rollCritical(100, 0.05, 2.0, () => 0.04);
assert(critHit.isCrit === true && critHit.damage === 200, 'Roll below 0.05 triggers 2x critical damage');

const normalHit = rollCritical(100, 0.05, 2.0, () => 0.06);
assert(normalHit.isCrit === false && normalHit.damage === 100, 'Roll above 0.05 deals normal 1x damage');

// -----------------------------------------------------------------
// 5. calculateArmorMultiplier()
// -----------------------------------------------------------------
console.log('\n--- 5. calculateArmorMultiplier(penetration, armor) ---');
assert(calculateArmorMultiplier(15, 10) === 1.0, 'Penetration > Armor yields multiplier 1.0');
assert(calculateArmorMultiplier(10, 10) === 1.0, 'Penetration == Armor yields multiplier 1.0');
assert(calculateArmorMultiplier(5, 0) === 1.0, 'Armor <= 0 yields multiplier 1.0');

assertClose(calculateArmorMultiplier(10, 20), 0.5, 'Penetration 10 vs Armor 20 yields 0.5 multiplier');
assertClose(calculateArmorMultiplier(20, 50), 0.4, 'T1 Penetration 20 vs Armor 50 yields 0.4 multiplier');

// -----------------------------------------------------------------
// 6. calculateFinalDamage()
// -----------------------------------------------------------------
console.log('\n--- 6. calculateFinalDamage(rolledDamage, damageMultiplier) ---');
assert(calculateFinalDamage(100, 1.0) === 100, '100 damage with 1.0 multiplier is 100');
assert(calculateFinalDamage(100, 0.5) === 50, '100 damage with 0.5 multiplier is 50');
assert(calculateFinalDamage(0, 0.5) === 0, '0 damage produces 0');

// -----------------------------------------------------------------
// 7. canPerformAction() (Time System & 2s Movement)
// -----------------------------------------------------------------
console.log('\n--- 7. canPerformAction(remainingTime, actionTimeCost) ---');
assert(canPerformAction(8.0, 3.0) === true, 'Can perform 3s attack when 8s remain');
assert(canPerformAction(8.0, 2.0) === true, 'Can perform 2s move when 8s remain');
assert(canPerformAction(2.0, 2.0) === true, 'Can perform 2s move when exactly 2s remain');
assert(canPerformAction(1.9, 2.0) === false, 'Cannot perform 2s move when only 1.9s remain');
assert(TIME_CONFIG.ACTION_TIME_COSTS.MOVE === 2.0, 'Movement time is strictly 2.0s in config');

// -----------------------------------------------------------------
// 8. getNextCreepWave()
// -----------------------------------------------------------------
console.log('\n--- 8. getNextCreepWave(waveIndex) ---');
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

// -----------------------------------------------------------------
// 9. canSpawnNeutralCamp()
// -----------------------------------------------------------------
console.log('\n--- 9. canSpawnNeutralCamp(camp, mapObjects) ---');
const testCamp = { id: 'camp_1', r: 50, c: 50 };
assert(canSpawnNeutralCamp(testCamp, []) === true, 'Camp with no objects nearby can spawn');
assert(canSpawnNeutralCamp(testCamp, [{ r: 10, c: 10, isDead: false }]) === true, 'Camp with objects outside radius can spawn');
assert(canSpawnNeutralCamp(testCamp, [{ r: 51, c: 51, isDead: false }]) === false, 'Camp occupied by living creature cancels spawn');
assert(canSpawnNeutralCamp(testCamp, [{ r: 51, c: 51, isDead: true }]) === true, 'Camp containing only dead corpse does not block spawn');

// -----------------------------------------------------------------
// 10. Tower Stats & Specifications Verification
// -----------------------------------------------------------------
console.log('\n--- 10. Tower Stats Verification ---');
const t1 = TOWER_TIER_CONFIGS[1];
assert(
  t1.hp === 1000 && t1.armor === 50 && t1.vision === 11 && t1.averageDamage === 30 &&
  t1.critDamage === 60 && t1.range === 10 && t1.penetration === 20 && t1.hit === 15 && t1.attackPeriod === 4,
  'T1 stats: 1000 HP / 50 armor / 11 vision / 30 damage / 60 crit / 10 range / 20 penetration / 15 hit / 4 sec'
);

const t2 = TOWER_TIER_CONFIGS[2];
assert(
  t2.hp === 1500 && t2.armor === 75 && t2.vision === 11 && t2.averageDamage === 60 &&
  t2.critDamage === 120 && t2.range === 10 && t2.penetration === 40 && t2.hit === 30 && t2.attackPeriod === 4,
  'T2 stats: 1500 / 75 / 11 / 60 / 120 / 10 / 40 / 30 / 4 sec'
);

const t3 = TOWER_TIER_CONFIGS[3];
assert(
  t3.hp === 2000 && t3.armor === 75 && t3.vision === 11 && t3.averageDamage === 90 &&
  t3.critDamage === 180 && t3.range === 10 && t3.penetration === 60 && t3.hit === 45 && t3.attackPeriod === 4,
  'T3 stats: 2000 / 75 / 11 / 90 / 180 / 10 / 60 / 45 / 4 sec'
);

const t4 = TOWER_TIER_CONFIGS[4];
assert(
  t4.hp === 2500 && t4.armor === 75 && t4.vision === 11 && t4.averageDamage === 90 &&
  t4.critDamage === 180 && t4.range === 10 && t4.penetration === 60 && t4.hit === 45 && t4.attackPeriod === 4,
  'T4 stats: 2500 / 75 / 11 / 90 / 180 / 10 / 60 / 45 / 4 sec'
);

const throne = TOWER_TIER_CONFIGS.throne;
assert(throne.hp === 3000 && throne.armor === 50, 'Throne stats: 3000 HP / 50 armor');
assert(t1.size.width === 2 && t1.size.height === 2 && t1.immobile === true, 'Tower size: 2x2, immobile');

// -----------------------------------------------------------------
// 11. Continuous Tower Attack Timing
// -----------------------------------------------------------------
console.log('\n--- 11. Continuous Tower Attack Timing (every 4 seconds) ---');
const testTowers = [
  {
    id: 'test_tower_1',
    name: 'Test Tower',
    team: 'radiant',
    r: 10,
    c: 10,
    range: 10,
    attackPeriod: 4,
    nextAttackTime: 4,
    currentHp: 1000,
    averageDamage: 30,
    penetration: 20,
    hit: 15,
    isDead: false
  }
];

const testHeroes = [
  {
    id: 'enemy_hero',
    name: 'Enemy Target',
    team: 'dire',
    r: 10,
    c: 12, // 2 cells away (within range 10)
    hp: 100,
    maxHp: 100,
    armor: 10,
    agility: 5,
    isDead: false
  }
];

// At gameTime = 2s (less than nextAttackTime 4s) -> tower does NOT attack
const resAt2s = processContinuousTowerAttacks(testTowers, testHeroes, [], 2);
assert(resAt2s.logs.length === 0, 'Tower does not attack before its nextAttackTime (at 2s)');

// At gameTime = 4.5s (reaches nextAttackTime 4s) -> tower attacks!
const resAt4s = processContinuousTowerAttacks(testTowers, testHeroes, [], 4.5);
assert(resAt4s.logs.length > 0, 'Tower attacks when continuous gameTime reaches nextAttackTime (4s)');
assert(resAt4s.updatedTowers[0].nextAttackTime === 8, 'Tower advances nextAttackTime by 4s to 8s');

// -----------------------------------------------------------------
// 12. Creep Timed Spawns (Initial 0, First Wave at 60s, Neutrals at 120s)
// -----------------------------------------------------------------
console.log('\n--- 12. Creep Timed Spawns ---');
const initialGameState = createInitialGameState();
assert(initialGameState.creeps.length === 0, 'createInitialGameState has 0 initial creeps');
assert(initialGameState.gameTimeSeconds === 0, 'Initial gameTimeSeconds is 0');

// checkTimedSpawns at t=30s -> no creeps spawned
const spawnAt30 = checkTimedSpawns([], [], null, 30, 0, 0, 0, 1);
assert(spawnAt30.creeps.length === 0, 'No creeps spawn before 60 seconds (t=30s)');
assert(spawnAt30.creepWaveIndex === 0, 'Creep wave index remains 0 at t=30s');

// checkTimedSpawns at t=60s -> first lane creep wave spawns (30 creeps: 3 lanes * 2 teams * 5 creeps)
const spawnAt60 = checkTimedSpawns([], [], null, 60, 0, 0, 0, 1);
assert(spawnAt60.creeps.length === 30, 'First lane creep wave spawns at 60s (exactly 30 creeps: 3 lanes x 2 teams x 5 creeps)');
assert(spawnAt60.lastCreepSpawnTime === 60, 'lastCreepSpawnTime updated to 60s');
assert(spawnAt60.creepWaveIndex === 1, 'creepWaveIndex incremented to 1');
const wave0Ranged = spawnAt60.creeps.filter(c => c.creepRole === 'ranged').length;
const wave0Melee = spawnAt60.creeps.filter(c => c.creepRole === 'melee').length;
assert(wave0Ranged === 6, 'Wave 0 contains exactly 6 ranged creeps (1 per lane per team * 6)');
assert(wave0Melee === 24, 'Wave 0 contains exactly 24 melee creeps (4 per lane per team * 6)');

// checkTimedSpawns at t=120s -> wave 2 spawns (30 lane creeps) + neutral camps spawn
const spawnAt120 = checkTimedSpawns(spawnAt60.creeps, [], null, 120, spawnAt60.lastCreepSpawnTime, spawnAt60.lastNeutralSpawnTime, spawnAt60.creepWaveIndex, 2);
assert(spawnAt120.creepWaveIndex === 2, 'creepWaveIndex incremented to 2 at 120s');
assert(spawnAt120.lastNeutralSpawnTime === 120, 'lastNeutralSpawnTime recorded as 120s');
const totalLaneCreeps120 = spawnAt120.creeps.filter(c => !c.isNeutral).length;
const totalNeutralCreeps120 = spawnAt120.creeps.filter(c => c.isNeutral).length;
assert(totalLaneCreeps120 === 60, 'Total lane creeps is 60 after second wave (30 + 30)');
assert(totalNeutralCreeps120 > 0, 'Neutral camps spawned creeps at 120s');

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL REVISED SPECIFICATION TESTS PASSED!\n');
}
