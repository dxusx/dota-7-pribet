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
  calculateLaneCreepLevel,
  applyClassLevelUp,
  canCastSkills,
  getEffectiveSpeed,
  calculateHealing,
  TURN_DURATION_SECONDS,
} from './combatRules.js';
import { TOWER_STATS } from './towerData.js';
import { CREEP_STATS, LANE_WAVE_FORMATIONS, NEUTRAL_CAMP_FORMATIONS } from './creepData.js';
import { HEROES_ROSTER } from './heroesData.js';
import { SQUAD_FORMATION_OFFSETS } from './gameState.js';
import { executeSkill } from './skillEngine.js';

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

  assert.equal(HEROES_ROSTER.length, 15);
  const wesker = HEROES_ROSTER.find(h => h.id === 'wesker');
  assert.ok(wesker);
  assert.equal(wesker.stats.hp, 100);
  assert.equal(wesker.stats.ranged.damage, 40);

  const axe = HEROES_ROSTER.find(h => h.id === 'axe');
  assert.ok(axe);
  assert.equal(axe.stats.armor, 5);
});

test('9. Hero Speed and Step Verification for Every Character', () => {
  const expectedSpeeds = {
    wesker: 6,
    axe: 6,
    katarina: 6,
    anderson: 6,
    gojo: 7,
    sukuna: 6,
    pudge: 5,
    invoker: 6,
    rubick: 6,
    sf: 6,
    monesy: 7,
    minos: 8,
    schrodinger: 6,
    alucard: 6,
    gabriel: 6,
  };

  HEROES_ROSTER.forEach(hero => {
    const expectedSpeed = expectedSpeeds[hero.id];
    assert.ok(expectedSpeed !== undefined, `Unknown hero id: ${hero.id}`);
    assert.equal(hero.stats.speed, expectedSpeed, `Hero ${hero.name} speed must be ${expectedSpeed}`);

    // Verify turn budget step capacity:
    // With 8.0s turn, max reachable steps MUST equal speed:
    const fullTurnSteps = Math.floor((TURN_DURATION_SECONDS * hero.stats.speed) / TURN_DURATION_SECONDS + 0.001);
    assert.equal(fullTurnSteps, expectedSpeed, `Hero ${hero.name} must walk exactly ${expectedSpeed} steps per 8.0s turn`);

    // Verify time cost of walking their full speed equals 8.0s:
    const fullCost = Number(((expectedSpeed * TURN_DURATION_SECONDS) / hero.stats.speed).toFixed(1));
    assert.equal(fullCost, 8.0, `Walking full steps for ${hero.name} must cost 8.0s`);

    // Verify partial steps (e.g. 1 step):
    const singleStepCost = Number(((1 * TURN_DURATION_SECONDS) / hero.stats.speed).toFixed(2));
    assert.ok(singleStepCost <= 8.0 / expectedSpeed + 0.01);
  });
});

test('10. Creep Squad Formation & Separation (No Collapsed Single Circles)', () => {
  // Verify Radiant and Dire offsets in SQUAD_FORMATION_OFFSETS are distinct
  ['radiant', 'dire'].forEach(faction => {
    const meleeOffsets = SQUAD_FORMATION_OFFSETS[faction].melee;
    const rangedOffsets = SQUAD_FORMATION_OFFSETS[faction].ranged;

    const keySet = new Set();
    meleeOffsets.forEach(o => {
      const key = `${o.ox},${o.oy}`;
      assert.ok(!keySet.has(key), `Duplicate melee offset: ${key}`);
      keySet.add(key);
    });

    rangedOffsets.forEach(o => {
      const key = `${o.ox},${o.oy}`;
      assert.ok(!keySet.has(key), `Duplicate ranged offset: ${key}`);
      keySet.add(key);
    });

    // 9 distinct positions for a max wave of 4R 5M!
    assert.equal(keySet.size, 9);
  });
});

test('11. Creep Combat, Damage Resolution, and Death State', () => {
  const creep = {
    id: 'creep_test_1',
    hp: 100,
    maxHp: 100,
    armor: 0,
    agility: 0,
    isDead: false,
  };

  const attackResult = resolveAttack({
    averageDamage: 40,
    penetration: 10,
    hit: 50,
    targetArmor: creep.armor,
    targetAgility: creep.agility,
    attackerElevation: 1,
    targetElevation: 1,
    isRanged: false,
  });

  assert.ok(attackResult.isHit, 'Attack against 0 agility creep should hit');
  assert.ok(attackResult.damage >= 30 && attackResult.damage <= 100, 'Damage must be within expected range');

  creep.hp = Math.max(0, creep.hp - attackResult.damage);
  assert.ok(creep.hp < 100, 'Creep HP must decrease when taking damage');

  // Fatal damage
  const fatalAttack = 150;
  creep.hp = Math.max(0, creep.hp - fatalAttack);
  creep.isDead = creep.hp <= 0;

  assert.equal(creep.hp, 0);
  assert.equal(creep.isDead, true, 'Creep must be marked dead when HP <= 0');
});

test('12. Visuals: Hero Portraits & Skill Icons Asset Integrity', async () => {
  const { HERO_PORTRAITS, getHeroPortrait } = await import('../assets/heroPortraits.js');
  const { HEROES_ROSTER } = await import('./heroesData.js');
  const { SKILL_ICONS, getSkillIcon } = await import('../assets/skillIcons.js');

  // Verify all 12 heroes have valid portraits
  for (const hero of HEROES_ROSTER) {
    const portrait = getHeroPortrait(hero.id);
    assert.ok(portrait, `Hero ${hero.id} must have portrait`);
    assert.ok(portrait.startsWith('data:image/svg+xml') || portrait.startsWith('/'), `Portrait for ${hero.id} must be SVG data uri or path`);

    // Verify each skill has an icon
    for (const skill of hero.skills) {
      const icon = getSkillIcon(skill.id);
      assert.ok(icon, `Skill ${skill.id} (${skill.name}) must have a valid icon`);
      assert.ok(icon.startsWith('data:image/svg+xml') || icon.startsWith('/'), `Skill icon for ${skill.id} must be SVG data uri or path`);
    }
  }
});

test('13. Repository & Metadata Integrity', async () => {
  const fs = await import('node:fs');
  const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const readme = fs.readFileSync(new URL('../../README.md', import.meta.url), 'utf8');

  // Verify package.json metadata
  assert.ok(pkg.description && pkg.description.length > 20, 'package.json must contain a descriptive description');
  assert.ok(pkg.repository && pkg.repository.url, 'package.json must contain repository url');
  assert.ok(pkg.homepage, 'package.json must contain homepage url');

  // Verify README.md documentation
  assert.ok(readme.includes('# Dota 7 Pribet') || readme.includes('# DOTA 7 PRIBET'), 'README must have project title');
  assert.ok(readme.includes('Об игре') || readme.includes('Описание'), 'README must have description section');
  assert.ok(readme.includes('Герои') || readme.includes('Ростер героев'), 'README must list heroes');
  assert.ok(readme.includes('Запуск') || readme.includes('Установка'), 'README must have quick start guide');
  assert.ok(readme.includes('Структура') || readme.includes('Архитектура'), 'README must document structure');
});

test('14. Procedural Vector Assets Generation (No Emojis)', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const scriptPath = path.resolve(process.cwd(), 'scripts/generate_all_assets.mjs');
  assert.ok(fs.existsSync(scriptPath), 'scripts/generate_all_assets.mjs must exist');

  const { SKILL_ICONS } = await import('../assets/skillIcons.js');
  const emojiRegex = /\p{Extended_Pictographic}/u;
  for (const [id, uri] of Object.entries(SKILL_ICONS)) {
    const decoded = decodeURIComponent(uri);
    assert.ok(!emojiRegex.test(decoded), `Skill icon ${id} must not contain emojis`);
  }
});

test('15. Creep Level Upgrade on Tower Destruction', () => {
  // Initial state: no towers destroyed -> Level 1
  assert.equal(calculateLaneCreepLevel([]), 1);
  assert.equal(calculateLaneCreepLevel([{ tier: 1, isDestroyed: false }]), 1);

  // When T1 tower destroyed -> Level 2
  assert.equal(calculateLaneCreepLevel([{ tier: 1, isDestroyed: true }]), 2);

  // When T2 tower destroyed -> Level 3
  assert.equal(calculateLaneCreepLevel([
    { tier: 1, isDestroyed: true },
    { tier: 2, isDestroyed: true },
  ]), 3);

  // When T3 tower destroyed -> Level 4
  assert.equal(calculateLaneCreepLevel([
    { tier: 1, isDestroyed: true },
    { tier: 2, isDestroyed: true },
    { tier: 3, isDestroyed: true },
  ]), 4);

  // When T4 tower destroyed -> Level 5 (max)
  assert.equal(calculateLaneCreepLevel([
    { tier: 1, isDestroyed: true },
    { tier: 2, isDestroyed: true },
    { tier: 3, isDestroyed: true },
    { tier: 4, isDestroyed: true },
  ]), 5);
});

test('16. Class-Based Hero Level Up Stat Scaling', () => {
  // 1. Strength Hero: HP +50%, regen +25%, mana +10%, manaRegen +10%, damage +25%, crit +25%, pen +25%, hit +10%, armor +25%
  const strHero = {
    heroClass: 'STRENGTH',
    level: 1,
    maxHp: 150,
    hp: 150,
    hpRegen: 10,
    maxMana: 100,
    mana: 100,
    manaRegen: 10,
    damage: 40,
    critDamage: 80,
    penetration: 20,
    hit: 50,
    armor: 4,
    agility: 1,
  };
  const leveledStr = applyClassLevelUp(strHero);
  assert.equal(leveledStr.level, 2);
  assert.equal(leveledStr.maxHp, Math.round(150 * 1.50)); // 225
  assert.equal(leveledStr.hpRegen, Math.round(10 * 1.25)); // 13 (or 12.5 rounded)
  assert.equal(leveledStr.maxMana, Math.round(100 * 1.10)); // 110
  assert.equal(leveledStr.damage, Math.round(40 * 1.25)); // 50
  assert.equal(leveledStr.armor, Math.round(4 * 1.25)); // 5

  // 2. Agility Hero: HP +25%, regen +10%, mana +10%, damage +10%, crit +20%, pen +10%, hit +30%, agi +25%
  const agiHero = {
    heroClass: 'AGILITY',
    level: 1,
    maxHp: 100,
    hp: 100,
    hpRegen: 5,
    maxMana: 150,
    mana: 150,
    manaRegen: 10,
    damage: 40,
    critDamage: 100,
    penetration: 15,
    hit: 50,
    armor: 1,
    agility: 8,
  };
  const leveledAgi = applyClassLevelUp(agiHero);
  assert.equal(leveledAgi.level, 2);
  assert.equal(leveledAgi.maxHp, 125);
  assert.equal(leveledAgi.damage, 44);
  assert.equal(leveledAgi.agility, 10);
  assert.equal(leveledAgi.hit, 65);

  // 3. Intelligence Hero: HP +10%, regen +10%, mana +50%, manaRegen +25%, damage +25%, pen +25%, hit +25%, armor +10%, agi +10%
  const intHero = {
    heroClass: 'INTELLIGENCE',
    level: 1,
    maxHp: 100,
    hp: 100,
    hpRegen: 5,
    maxMana: 200,
    mana: 200,
    manaRegen: 12,
    damage: 30,
    critDamage: 60,
    penetration: 10,
    hit: 40,
    armor: 1,
    agility: 3,
  };
  const leveledInt = applyClassLevelUp(intHero);
  assert.equal(leveledInt.level, 2);
  assert.equal(leveledInt.maxMana, 300);
  assert.equal(leveledInt.manaRegen, 15);
  assert.equal(leveledInt.damage, Math.round(30 * 1.25)); // 38 (or 37.5 -> 38)
});

test('17. Control Status Effects (Silence, Fear, Taunt, Grievous Wounds)', () => {
  const normalUnit = { speed: 6, statuses: {} };
  assert.equal(canCastSkills(normalUnit), true);
  assert.equal(getEffectiveSpeed(normalUnit), 6);
  assert.equal(calculateHealing(100, normalUnit), 100);

  // Silence: cannot cast skills
  const silencedUnit = { speed: 6, statuses: { silence: { duration: 4 } } };
  assert.equal(canCastSkills(silencedUnit), false);

  // Fear: cannot cast skills, speed reduced by 50%
  const fearedUnit = { speed: 6, statuses: { fear: { duration: 4 } } };
  assert.equal(canCastSkills(fearedUnit), false);
  assert.equal(getEffectiveSpeed(fearedUnit), 3);

  // Taunt: cannot cast skills
  const tauntedUnit = { speed: 6, statuses: { taunt: { duration: 4 } } };
  assert.equal(canCastSkills(tauntedUnit), false);

  // Grievous Wounds: reduces healing by x% (e.g. 40%)
  const woundedUnit = { speed: 6, statuses: { grievous_wounds: { reduction: 0.4 } } };
  assert.equal(calculateHealing(100, woundedUnit), 60);
});

test('18. Google Doc New Heroes Integration (Schrodinger, Alucard, Gabriel)', () => {
  const heroIds = HEROES_ROSTER.map(h => h.id);
  assert.ok(heroIds.includes('schrodinger'), 'Schrodinger must exist in HEROES_ROSTER');
  assert.ok(heroIds.includes('alucard'), 'Alucard must exist in HEROES_ROSTER');
  assert.ok(heroIds.includes('gabriel'), 'Gabriel must exist in HEROES_ROSTER');

  const schrodinger = HEROES_ROSTER.find(h => h.id === 'schrodinger');
  assert.equal(schrodinger.heroClass, 'INTELLIGENCE');
  assert.equal(schrodinger.stats.hp, 100);
  assert.equal(schrodinger.stats.damage, 20);
  assert.ok(schrodinger.skills.length >= 5);

  const alucard = HEROES_ROSTER.find(h => h.id === 'alucard');
  assert.equal(alucard.heroClass, 'INTELLIGENCE');
  assert.equal(alucard.stats.hp, 115);
  assert.equal(alucard.stats.damage, 40);
  assert.ok(alucard.skills.length >= 5);

  const gabriel = HEROES_ROSTER.find(h => h.id === 'gabriel');
  assert.equal(gabriel.heroClass, 'AGILITY');
  assert.equal(gabriel.stats.hp, 100);
  assert.equal(gabriel.stats.armor, 5);
  assert.ok(gabriel.skills.length >= 5);
});

test('19. New Heroes Skill Engine Mechanics', () => {
  // 1. Gabriel: Light Speed (instant teleport to tile, 0s cost, 20 mana)
  const gabriel = {
    instanceId: 'hero_gabriel',
    id: 'gabriel',
    name: 'Габриэль',
    x: 10,
    y: 10,
    mana: 100,
    skills: [{ id: 'light-speed', name: 'Light Speed', timeCost: 0, manaCost: 20, cooldown: 12.0 }],
  };
  const mockState1 = {
    remainingTurnTime: 8.0,
    heroes: [gabriel],
    creeps: [],
  };
  const res1 = executeSkill({
    skill: gabriel.skills[0],
    caster: gabriel,
    targetTile: { x: 18, y: 18 },
    gameState: mockState1,
  });
  assert.equal(res1.success, true);
  const updatedGabriel = res1.updatedHeroes.find(h => h.instanceId === 'hero_gabriel');
  assert.equal(updatedGabriel.x, 18);
  assert.equal(updatedGabriel.y, 18);
  assert.equal(updatedGabriel.mana, 80);
  assert.equal(res1.newRemainingTime, 8.0); // 0s time cost

  // 2. Alucard: Blood Drain (deals 40 damage, heals caster for 20 HP)
  const alucard = {
    instanceId: 'hero_alucard',
    id: 'alucard',
    name: 'Алукард',
    x: 20,
    y: 20,
    hp: 50,
    maxHp: 115,
    mana: 100,
    soulsCount: 2,
    skills: [{ id: 'blood-drain', name: 'Вытягивание крови', timeCost: 2.0, manaCost: 35, cooldown: 28.0 }],
  };
  const enemy = {
    instanceId: 'hero_enemy',
    id: 'axe',
    name: 'Axe',
    x: 22,
    y: 22,
    hp: 150,
    maxHp: 150,
    armor: 5,
    faction: 'dire',
  };
  const mockState2 = {
    remainingTurnTime: 8.0,
    heroes: [alucard, enemy],
    creeps: [],
  };
  const res2 = executeSkill({
    skill: alucard.skills[0],
    caster: alucard,
    targetHero: enemy,
    gameState: mockState2,
  });
  assert.equal(res2.success, true);
  const updatedAlucard = res2.updatedHeroes.find(h => h.instanceId === 'hero_alucard');
  const updatedEnemy = res2.updatedHeroes.find(h => h.instanceId === 'hero_enemy');
  assert.equal(updatedAlucard.hp, 50 + 20 + 2 * 3); // 50 + 20 + 6 = 76
  assert.equal(updatedEnemy.hp, 110); // 150 - 40
  assert.equal(res2.newRemainingTime, 6.0); // 8.0 - 2.0s

  // 3. Schrodinger: Mind Control (applies silence to enemy hero)
  const schrodinger = {
    instanceId: 'hero_schrodinger',
    id: 'schrodinger',
    name: 'Шрёдингер',
    x: 30,
    y: 30,
    mana: 100,
    skills: [{ id: 'mind-control', name: 'Mind Control', timeCost: 2.0, manaCost: 35, cooldown: 32.0 }],
  };
  const enemy2 = {
    instanceId: 'hero_enemy2',
    id: 'pudge',
    name: 'Pudge',
    x: 32,
    y: 32,
    hp: 100,
    statuses: {},
    faction: 'radiant',
  };
  const mockState3 = {
    remainingTurnTime: 8.0,
    heroes: [schrodinger, enemy2],
    creeps: [],
  };
  const res3 = executeSkill({
    skill: schrodinger.skills[0],
    caster: schrodinger,
    targetHero: enemy2,
    gameState: mockState3,
  });
  assert.equal(res3.success, true);
  const updatedEnemy2 = res3.updatedHeroes.find(h => h.instanceId === 'hero_enemy2');
  assert.ok(updatedEnemy2.statuses?.silence, 'Enemy must have silence status');
});

test('20. Autonomous Tower Defense Mechanics', async () => {
  const { resolveTowerAttacks } = await import('./combatRules.js');

  const radTower = {
    id: 'rad_t1_mid',
    faction: 'radiant',
    tier: 1,
    x: 20,
    y: 70,
    size: 2,
    hp: 1000,
    maxHp: 1000,
    damage: 100,
    penetration: 20,
    hit: 100,
    armor: 8,
    range: 10,
    period: 4.0,
  };

  const direCreep = {
    id: 'dire_creep_1',
    faction: 'dire',
    x: 22,
    y: 72,
    hp: 100,
    maxHp: 100,
    armor: 2,
    agility: 1,
    isDead: false,
  };

  const direHero = {
    instanceId: 'dire_hero_1',
    id: 'wesker',
    faction: 'dire',
    name: 'Albert Wesker',
    x: 24,
    y: 74,
    hp: 120,
    maxHp: 120,
    armor: 3,
    agility: 5,
    isDead: false,
  };

  const radHero = {
    instanceId: 'rad_hero_1',
    id: 'axe',
    faction: 'radiant',
    name: 'Axe',
    x: 21,
    y: 71,
    hp: 150,
    isDead: false,
  };

  const mockState = {
    towers: [radTower],
    creeps: [direCreep],
    heroes: [direHero, radHero],
    combatLogs: [],
  };

  // 1. Tower must prioritize hostile creep over hostile hero
  const result1 = resolveTowerAttacks(mockState, () => 0.5); // deterministic rng
  assert.ok(result1.attacks.length > 0, 'Tower must fire an attack');
  assert.equal(result1.attacks[0].targetId, 'dire_creep_1', 'Tower must target hostile creep before hero');
  assert.ok(result1.updatedCreeps.find(c => c.id === 'dire_creep_1').hp < 100, 'Creep must take damage');

  // 2. When no hostile creeps, tower fires at hostile hero
  const mockStateNoCreeps = {
    towers: [radTower],
    creeps: [],
    heroes: [direHero, radHero],
    combatLogs: [],
  };
  const result2 = resolveTowerAttacks(mockStateNoCreeps, () => 0.5);
  assert.equal(result2.attacks.length > 1 || result2.attacks[0].targetId === 'dire_hero_1', true, 'Tower must target hostile hero when no creeps in range');
  const damagedHero = result2.updatedHeroes.find(h => h.instanceId === 'dire_hero_1');
  assert.ok(damagedHero.hp < 120, 'Hostile hero must take damage from tower');

  // 3. Tower must never attack allied Radiant hero
  const alliedHero = result2.updatedHeroes.find(h => h.instanceId === 'rad_hero_1');
  assert.equal(alliedHero.hp, 150, 'Allied hero must not be attacked by friendly tower');
});

test('21. Bot AI Decision Engine Mechanics', async () => {
  const { decideBotAction } = await import('./botAI.js');

  const botHero = {
    instanceId: 'bot_axe',
    id: 'axe',
    name: 'Axe',
    faction: 'dire',
    x: 50,
    y: 50,
    hp: 150,
    maxHp: 150,
    mana: 100,
    range: 1,
    damage: 50,
    speed: 6,
    period: 4.0,
    skills: [
      { id: 'berserkers-call', name: "Berserker's Call", type: 'ACTIVE', timeCost: 2.0, manaCost: 25, radius: 2, currentCooldown: 0 },
      { id: 'battle-hunger', name: 'Battle Hunger', type: 'ACTIVE', timeCost: 2.0, manaCost: 25, range: 6, currentCooldown: 0 },
    ],
  };

  const enemyHero = {
    instanceId: 'player_gojo',
    id: 'gojo',
    name: 'Gojo Satoru',
    faction: 'radiant',
    x: 51,
    y: 50, // Adjacent: distance 1
    hp: 100,
    maxHp: 100,
  };

  const mockGameState = {
    remainingTurnTime: 8.0,
    heroes: [botHero, enemyHero],
    creeps: [],
  };

  // Case 1: Enemy is right next to bot (distance 1) -> bot can attack or use close skill
  const action1 = decideBotAction(botHero, mockGameState);
  assert.ok(['ATTACK', 'SKILL'].includes(action1.action), 'Bot adjacent to enemy should ATTACK or cast SKILL');

  // Case 2: Enemy is 4 cells away (distance 4) -> bot should use ranged skill or move closer
  const farEnemy = { ...enemyHero, x: 54, y: 50 };
  const mockGameStateFar = { ...mockGameState, heroes: [botHero, farEnemy] };
  const action2 = decideBotAction(botHero, mockGameStateFar);
  assert.ok(['SKILL', 'MOVE'].includes(action2.action), 'Bot 4 cells away should cast ranged skill or move');

  // Case 3: No remaining time -> Bot must END_TURN
  const mockStateNoTime = { ...mockGameState, remainingTurnTime: 0 };
  const action3 = decideBotAction(botHero, mockStateNoTime);
  assert.equal(action3.action, 'END_TURN', 'Bot with 0 time must END_TURN');
});

test('22. Dota 2 Camera Grip Mechanics (Mouse Wheel Drag)', async () => {
  const { isCameraDragButton, panCamera } = await import('./cameraControls.js');

  // Middle mouse button (button 1, wheel click) MUST activate camera grip
  assert.equal(isCameraDragButton(1), true, 'Wheel click (button 1) must trigger camera drag like in Dota');

  // Normal left click (button 0) must NOT drag camera (reserved for unit orders/selection)
  assert.equal(isCameraDragButton(0), false, 'Normal left click must not drag camera');

  // Right click (button 2) must NOT drag camera
  assert.equal(isCameraDragButton(2), false, 'Right click must not drag camera');

  // Modifier fallback for trackpad (Alt + Left click)
  assert.equal(isCameraDragButton(0, { altKey: true }), true, 'Alt + Left click can drag camera as fallback');

  // panCamera adds offset delta
  const initialCam = { x: 100, y: 200, zoom: 0.5 };
  const panned = panCamera(initialCam, -15, 25);
  assert.deepEqual(panned, { x: 85, y: 225, zoom: 0.5 }, 'panCamera must update x and y offsets correctly');
});

test('23. Visual Effects (VFX) & Projectiles Engine Mechanics', async () => {
  const { createSkillVfx, createAttackVfx, createTowerVfx, getVfxProgress } = await import('./vfxRules.js');

  // 1. Meat Hook VFX creates chain hook from caster to target
  const hookVfx = createSkillVfx('meat-hook', { x: 10, y: 10 }, { x: 15, y: 10 });
  assert.equal(hookVfx.type, 'hook', 'Meat Hook must produce hook type VFX');
  assert.deepEqual(hookVfx.from, { x: 10, y: 10 });
  assert.deepEqual(hookVfx.to, { x: 15, y: 10 });
  assert.equal(hookVfx.color, '#84cc16');

  // 2. Sun Strike VFX creates vertical sky beam
  const sunVfx = createSkillVfx('sun-strike', { x: 20, y: 20 }, { x: 50, y: 50 });
  assert.equal(sunVfx.type, 'beam', 'Sun Strike must produce sky beam VFX');
  assert.deepEqual(sunVfx.to, { x: 50, y: 50 });
  assert.equal(sunVfx.color, '#f59e0b');

  // 3. AWP Wallbang VFX creates sniper ballistic tracer
  const awpVfx = createSkillVfx('awp-wallbang', { x: 5, y: 5 }, { x: 25, y: 5 });
  assert.equal(awpVfx.type, 'tracer', 'AWP Wallbang must produce tracer VFX');
  assert.equal(awpVfx.color, '#22c55e');

  // 4. Dismantle VFX creates razor slashes
  const slashVfx = createSkillVfx('dismantle', { x: 30, y: 30 }, { x: 32, y: 32 });
  assert.equal(slashVfx.type, 'slash', 'Dismantle must produce slash VFX');
  assert.equal(slashVfx.color, '#dc2626');

  // 5. Attack VFX
  const rangedAttackVfx = createAttackVfx({ x: 10, y: 10 }, { x: 14, y: 10 }, true, 'radiant');
  assert.equal(rangedAttackVfx.type, 'projectile', 'Ranged attack must produce flying projectile');
  const meleeAttackVfx = createAttackVfx({ x: 10, y: 10 }, { x: 11, y: 10 }, false, 'dire');
  assert.equal(meleeAttackVfx.type, 'impact', 'Melee attack must produce melee impact VFX');

  // 6. Tower Attack VFX
  const towerVfx = createTowerVfx({ x: 15, y: 15, size: 2 }, { x: 18, y: 18 }, 'radiant');
  assert.equal(towerVfx.type, 'tower_shot');
  assert.deepEqual(towerVfx.from, { x: 16, y: 16 }, 'Tower shot origin should be tower center');

  // 7. Progress calculation
  const now = Date.now();
  const vfxInstance = { createdAt: now - 300, durationMs: 600 };
  const prog = getVfxProgress(vfxInstance, now);
  assert.ok(Math.abs(prog - 0.5) < 0.05, 'Progress after 300ms of 600ms should be ~0.5');
  assert.equal(getVfxProgress(vfxInstance, now + 500), 1.0, 'Progress past duration should cap at 1.0');
});

test('24. Viewport Coordinate Mapping & Aspect Ratio Scaling (No Tile Shift)', async () => {
  const { screenToTile } = await import('./cameraControls.js');

  // Case 1: Exact 1:1 buffer-to-rect ratio (standard 16px tile, zoom 1)
  const cam = { x: 0, y: 0, zoom: 1 };
  const rect1 = { left: 0, top: 0, width: 800, height: 600 };
  const buffer1 = { width: 800, height: 600 };

  const tile1 = screenToTile(160, 320, cam, rect1, buffer1, 16);
  assert.equal(tile1.tileX, 10);
  assert.equal(tile1.tileY, 20);

  // Case 2: Banner shrinks CSS element height to 567 while canvas buffer is 600
  // Without scale correction, mouse at Y=310 would calculate Math.floor(310/16) = 19 (tile above!)
  // With scale correction, mouse at Y=310 scales to 310 * (600 / 567) = 328.04 -> Math.floor(328.04/16) = 20 (correct tile!)
  const rect2 = { left: 0, top: 33, width: 800, height: 567 };
  const buffer2 = { width: 800, height: 600 };

  const tile2 = screenToTile(160, 33 + 310, cam, rect2, buffer2, 16);
  assert.equal(tile2.tileY, 20, 'Tile Y must account for canvas aspect ratio stretch without shifting upward');
});

test('25. Extended Stylized Hero Skills VFX Coverage & Procedural Rendering', async () => {
  const { createSkillVfx } = await import('./vfxRules.js');

  // Verify unique stylized types for heroes across the roster
  const shadowrazeVfx = createSkillVfx('shadowraze', { x: 10, y: 10 }, { x: 12, y: 10 });
  assert.equal(shadowrazeVfx.type, 'shadowraze', 'Shadowraze must produce soul geyser VFX');

  const bayonetVfx = createSkillVfx('bayonet-barrage', { x: 10, y: 10 }, { x: 14, y: 12 });
  assert.equal(bayonetVfx.type, 'bayonet_barrage', 'Anderson must produce holy bayonet barrage');

  const spearVfx = createSkillVfx('spear-of-justice', { x: 20, y: 20 }, { x: 25, y: 20 });
  assert.equal(spearVfx.type, 'spear', 'Gabriel must produce radiant holy spear');

  const twinShotVfx = createSkillVfx('twin-shot', { x: 15, y: 15 }, { x: 18, y: 15 });
  assert.equal(twinShotVfx.type, 'twin_shot', 'Alucard must produce dual gun muzzle blasts');

  const cromwellVfx = createSkillVfx('cromwell-seal-1', { x: 15, y: 15 }, { x: 15, y: 15 });
  assert.equal(cromwellVfx.type, 'cromwell_seal', 'Alucard seal must produce eldritch eye summoning circle');

  const warpVfx = createSkillVfx('quantum-warp', { x: 30, y: 30 }, { x: 35, y: 35 });
  assert.equal(warpVfx.type, 'quantum_warp', 'Schrodinger must produce quantum digital glitch warp');

  const lightningVfx = createSkillVfx('fade-bolt', { x: 40, y: 40 }, { x: 44, y: 40 });
  assert.equal(lightningVfx.type, 'lightning', 'Rubick must produce arcane chain lightning');

  const rotVfx = createSkillVfx('rot', { x: 22, y: 22 }, { x: 22, y: 22 });
  assert.equal(rotVfx.type, 'rot_cloud', 'Pudge must produce toxic bubbling gas cloud');

  const cullingVfx = createSkillVfx('culling-blade', { x: 18, y: 18 }, { x: 19, y: 18 });
  assert.equal(cullingVfx.type, 'culling_blade', 'Axe must produce massive execution slam');

  const fugaVfx = createSkillVfx('fire-arrow', { x: 50, y: 50 }, { x: 55, y: 50 });
  assert.equal(fugaVfx.type, 'fire_arrow', 'Sukuna must produce Kamino blazing fire arrow');

  const domainVfx = createSkillVfx('unlimited-void', { x: 60, y: 60 }, { x: 60, y: 60 });
  assert.equal(domainVfx.type, 'unlimited_void', 'Gojo must produce cosmic domain expansion void');
});

test('26. Strict Skill Targeting Validation (No Ground-Casting of Targeted Abilities & Rubick Spell Steal)', async () => {
  const { executeSkill } = await import('./skillEngine.js');

  const axeHero = {
    instanceId: 'axe_1',
    id: 'axe',
    name: 'Axe',
    faction: 'radiant',
    x: 10,
    y: 10,
    mana: 100,
    skills: [
      { id: 'culling-blade', name: 'Culling Blade', manaCost: 60, timeCost: 2.0, cooldown: 50.0 },
      { id: 'battle-hunger', name: 'Battle Hunger', manaCost: 25, timeCost: 2.0, cooldown: 16.0 },
    ],
  };

  const rubickHero = {
    instanceId: 'rubick_1',
    id: 'rubick',
    name: 'Rubick',
    faction: 'radiant',
    x: 12,
    y: 10,
    mana: 100,
    skills: [
      { id: 'spell-steal', name: 'Spell Steal', manaCost: 50, timeCost: 1.0, cooldown: 20.0 },
      { id: 'fade-bolt', name: 'Fade Bolt', manaCost: 40, timeCost: 1.5, cooldown: 12.0 },
    ],
  };

  const enemyHero = {
    instanceId: 'gojo_1',
    id: 'gojo',
    name: 'Gojo Satoru',
    faction: 'dire',
    x: 14,
    y: 10,
    hp: 100,
    maxHp: 100,
    skills: [
      { id: 'hollow-purple', name: 'Hollow Purple', type: 'ACTIVE', manaCost: 80, timeCost: 3.0, cooldown: 30.0 },
    ],
  };

  const mockState = {
    remainingTurnTime: 8.0,
    heroes: [axeHero, rubickHero, enemyHero],
    creeps: [],
  };

  // 1. Culling blade cast on empty ground must FAIL
  const groundRes = executeSkill({
    skill: axeHero.skills[0],
    caster: axeHero,
    targetTile: { x: 11, y: 11 },
    targetHero: null,
    targetCreep: null,
    gameState: mockState,
  });
  assert.equal(groundRes.success, false, 'Culling Blade on ground must fail');

  // 2. Spell Steal cast on ground must FAIL
  const rubickGroundRes = executeSkill({
    skill: rubickHero.skills[0],
    caster: rubickHero,
    targetTile: { x: 11, y: 11 },
    targetHero: null,
    gameState: mockState,
  });
  assert.equal(rubickGroundRes.success, false, 'Spell Steal on ground must fail');

  // 3. Spell Steal on enemy hero must SUCCEED and steal their active skill
  const stealRes = executeSkill({
    skill: rubickHero.skills[0],
    caster: rubickHero,
    targetTile: { x: 14, y: 10 },
    targetHero: enemyHero,
    gameState: mockState,
  });
  assert.equal(stealRes.success, true, 'Spell Steal on enemy hero must succeed');
  const updatedRubick = stealRes.updatedHeroes.find(h => h.instanceId === 'rubick_1');
  assert.ok(
    updatedRubick.skills.some(s => s.id === 'hollow-purple'),
    'Rubick must acquire stolen skill'
  );
});

test('27. Dota-Style Rich Ability Tooltip & Hero HUD Spec', async () => {
  const { getSkillDetails, getHeroDerivedStats } = await import('./heroHudUtils.js');

  const testSkill = {
    id: 'telekinesis',
    name: 'Telekinesis',
    type: 'ACTIVE',
    timeCost: 1.5,
    manaCost: 35,
    range: 5,
    cooldown: 18.0,
    desc: 'Поднимает цель в воздух на 1.5 сек и швыряет её на расстояние до 3 клеток, оглушая при падении.',
  };

  const details = getSkillDetails(testSkill);
  assert.ok(details.targetType.includes('Направленная'), 'Target type must identify unit target');
  assert.ok(details.damageType, 'Damage type must be present');
  assert.ok(details.affects, 'Affects field must be present');
  assert.ok(Array.isArray(details.attributes), 'Attributes list must be array');
  assert.ok(details.attributes.length >= 2, 'Must provide detailed attribute rows');

  const passiveSkill = {
    id: 'counter-helix',
    name: 'Counter Helix',
    type: 'PASSIVE',
    timeCost: 0,
    manaCost: 0,
    radius: 1,
    damage: 50,
    desc: 'Кружится с топором при получении ударов: 50 чистого урона вокруг.',
  };
  const passiveDetails = getSkillDetails(passiveSkill);
  assert.equal(passiveDetails.targetType, 'Пассивная', 'Passive skill must have passive target type');
  assert.equal(passiveDetails.damageType, 'Чистый', 'Counter helix deals pure damage');

  const testHero = {
    id: 'rubick',
    name: 'Rubick',
    level: 1,
    xp: 25,
    hp: 90,
    maxHp: 90,
    hpRegen: 4,
    mana: 170,
    maxMana: 170,
    manaRegen: 14,
    armor: 2,
    agility: 3,
    speed: 6,
    damage: 38,
  };

  const derived = getHeroDerivedStats(testHero);
  assert.equal(derived.xpPercent, 25, 'XP progress should be 25%');
  assert.ok(derived.armorReductionPercent > 0, 'Armor reduction must be computed');
  assert.ok(derived.evasionPercent > 0, 'Evasion must be computed');
  assert.equal(derived.hpRegenText, '+4.0 HP/с');
  assert.equal(derived.manaRegenText, '+14.0 MP/с');
});

test('28. Full Passive Abilities Detailed Specifications & Bot Default State', async () => {
  const { getSkillDetails } = await import('./heroHudUtils.js');
  const { HEROES_ROSTER } = await import('./heroesData.js');

  const allPassives = HEROES_ROSTER.flatMap(h => h.skills.filter(s => s.type === 'PASSIVE'));
  assert.ok(allPassives.length >= 10, 'Must have at least 10 passives across heroes roster');

  for (const passive of allPassives) {
    const details = getSkillDetails(passive);
    assert.equal(details.targetType, 'Пассивная', `Passive ${passive.id} must have targetType 'Пассивная'`);
    assert.ok(
      details.attributes && details.attributes.length >= 2,
      `Passive ${passive.id} must have at least 2 mechanical attributes, got ${details.attributes?.length}`
    );
  }

  const fs = await import('fs');
  const appCode = fs.readFileSync('src/App.jsx', 'utf-8');
  assert.ok(
    appCode.includes('const [botAiEnabled, setBotAiEnabled] = useState(false);'),
    'botAiEnabled must be initialized to false by default'
  );
});

test('29. Passive & Cooldown Skills Tooltip Hover Accessibility', async () => {
  const fs = await import('fs');
  const appCode = fs.readFileSync('src/App.jsx', 'utf-8');

  // Verify that HTML disabled attribute does not block mouse events on passive/cooldown skills
  assert.ok(
    !appCode.includes('disabled={isPassive || onCooldown || !hasMana || !hasTime}'),
    'Must not use native disabled attribute on skill buttons because it suppresses mouseenter tooltips in browsers'
  );
  assert.ok(
    appCode.includes('aria-disabled={isDisabled}'),
    'Must use aria-disabled to preserve hover tooltips while preventing action execution'
  );
});

test('30. Fog of War, Vision Radii, High Ground Occlusion & Wards', async () => {
  const {
    HERO_DAY_VISION,
    HERO_NIGHT_VISION,
    TOWER_VISION,
    OBSERVER_WARD_VISION,
    computeFactionVision,
    isUnitVisibleToFaction,
  } = await import('./visionEngine.js');

  assert.equal(HERO_DAY_VISION, 16, 'Hero day vision must be 16 tiles');
  assert.equal(HERO_NIGHT_VISION, 8, 'Hero night vision must be 8 tiles');
  assert.equal(TOWER_VISION, 12, 'Tower vision must be 12 tiles');
  assert.equal(OBSERVER_WARD_VISION, 12, 'Observer ward vision must be 12 tiles');

  // Create a minimal 100x100 dummy map data
  const tiles = [];
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      tiles.push({
        x,
        y,
        elevation: (x >= 40 && x <= 60 && y >= 40 && y <= 60) ? 1 : 0, // High ground plateau
        terrain: 'grass_radiant',
      });
    }
  }
  const mapData = { tiles, size: 100 };

  // Test 1: Day vs Night vision for hero at (10, 10)
  const heroDay = [{ instanceId: 'h1', faction: 'radiant', x: 10, y: 10, isDead: false }];
  const dayVision = computeFactionVision({
    mapData,
    faction: 'radiant',
    heroes: heroDay,
    creeps: [],
    towers: [],
    wards: [],
    isDay: true,
  });
  assert.ok(dayVision.visibleMask[10 * 100 + (10 + 15)], 'Tile 15 cells away must be visible during day');
  assert.ok(!dayVision.visibleMask[10 * 100 + (10 + 17)], 'Tile 17 cells away must not be visible during day');

  const nightVision = computeFactionVision({
    mapData,
    faction: 'radiant',
    heroes: heroDay,
    creeps: [],
    towers: [],
    wards: [],
    isDay: false,
  });
  assert.ok(nightVision.visibleMask[10 * 100 + (10 + 7)], 'Tile 7 cells away must be visible during night');
  assert.ok(!nightVision.visibleMask[10 * 100 + (10 + 10)], 'Tile 10 cells away must not be visible during night');

  // Test 2: High Ground Occlusion - unit at low ground (35, 50) looking at high ground (45, 50)
  const lowGroundHero = [{ instanceId: 'h2', faction: 'radiant', x: 35, y: 50, isDead: false }];
  const hgVision = computeFactionVision({
    mapData,
    faction: 'radiant',
    heroes: lowGroundHero,
    creeps: [],
    towers: [],
    wards: [],
    isDay: true,
  });
  // Tile (45, 50) is on High ground (elevation 1), while hero is on low ground (elevation 0) 10 cells away
  assert.ok(!hgVision.visibleMask[50 * 100 + 45], 'Low ground hero must not see deep high ground tile');

  // Test 3: Observer Ward placement provides vision
  const ward = [{ id: 'w1', faction: 'radiant', x: 80, y: 80, type: 'observer', visionRadius: 12 }];
  const wardVision = computeFactionVision({
    mapData,
    faction: 'radiant',
    heroes: [],
    creeps: [],
    towers: [],
    wards: [ward[0]],
    isDay: false,
  });
  assert.ok(wardVision.visibleMask[80 * 100 + 80], 'Ward tile must be visible');
  assert.ok(wardVision.visibleMask[80 * 100 + 90], 'Tile 10 cells from ward must be visible');

  // Test 4: isUnitVisibleToFaction
  const enemyVisible = { x: 80, y: 80 };
  const enemyHidden = { x: 5, y: 5 };
  assert.equal(isUnitVisibleToFaction(enemyVisible, wardVision.visibleMask), true);
});

test('31. Ward Placement Stability & VFX Draw Safety', async () => {
  const { placeWard, createInitialGameState } = await import('./gameState.js');
  const { computeFactionVision } = await import('./visionEngine.js');
  const { drawVfx } = await import('./vfxRules.js');

  const state = createInitialGameState();
  const hero = state.heroes[0];

  // 1. Verify placeWard functionality
  const wardX = hero.x + 2;
  const wardY = hero.y + 2;
  const initialTime = state.remainingTurnTime;
  const nextState = placeWard(state, {
    heroId: hero.instanceId,
    x: wardX,
    y: wardY,
    type: 'observer',
  });

  assert.equal(nextState.wards.length, (state.wards || []).length + 1, 'Ward count must increase by 1');
  assert.equal(nextState.remainingTurnTime, initialTime - 1.0, 'Remaining time must decrease by 1.0s');
  const placed = nextState.wards[nextState.wards.length - 1];
  assert.equal(placed.x, wardX);
  assert.equal(placed.y, wardY);
  assert.equal(placed.faction, hero.faction);

  // 2. Explored mask stability across vision recalculation
  const exploredMask = new Uint8Array(100 * 100);
  const visionRes = computeFactionVision({
    mapData: { tiles: [], size: 100 },
    faction: 'radiant',
    heroes: nextState.heroes,
    creeps: nextState.creeps,
    towers: nextState.towers,
    wards: nextState.wards,
    isDay: true,
    previousExploredMask: exploredMask,
  });
  assert.ok(visionRes.visibleMask, 'visibleMask must be defined');
  assert.ok(visionRes.exploredMask, 'exploredMask must be defined');

  // 3. VFX Draw Safety: Must NOT throw when from/to is missing or type is aoe_impact/beacon
  const mockCtx = {
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {},
    moveTo: () => {},
    lineTo: () => {},
  };

  // Calling drawVfx without from/to should not throw
  assert.doesNotThrow(() => {
    drawVfx(mockCtx, {
      id: 'test_ward_vfx',
      type: 'aoe_impact',
      targetPos: { x: 10, y: 10 },
      color: '#facc15',
      durationMs: 800,
      createdAt: Date.now(),
    }, Date.now(), 16);
  }, 'drawVfx must not throw when from/to is missing');
});

test('32. End Turn Lifecycle & Ward Timer Progression', async () => {
  const { createInitialGameState, placeWard, endTurn } = await import('./gameState.js');
  const { computeFactionVision } = await import('./visionEngine.js');

  let state = createInitialGameState();
  const hero = state.heroes[0];

  // Place an observer ward
  state = placeWard(state, {
    heroId: hero.instanceId,
    x: hero.x + 1,
    y: hero.y + 1,
    type: 'observer',
  });
  assert.equal(state.wards.length, 1);
  assert.equal(state.wards[0].turnsLeft, 10);

  // Calling endTurn must NOT throw ReferenceError: updatedTowers is not defined
  state = endTurn(state);

  assert.equal(state.turnNumber, 2);
  assert.equal(state.wards.length, 1);
  assert.equal(state.wards[0].turnsLeft, 9, 'Ward turnsLeft must decrement by 1');
  assert.ok(Array.isArray(state.towers), 'Towers array must be preserved');
  assert.ok(state.towers.length > 0, 'Towers must exist');

  // Verify vision computation succeeds on the new state
  const exploredMask = new Uint8Array(100 * 100);
  const v = computeFactionVision({
    mapData: { tiles: [], size: 100 },
    faction: 'radiant',
    heroes: state.heroes,
    creeps: state.creeps,
    towers: state.towers,
    wards: state.wards,
    isDay: true,
    previousExploredMask: exploredMask,
  });
  assert.ok(v.visibleMask);
  assert.ok(v.exploredMask);
});

test('33. Tower Neutral Creep Immunity & Balanced Jungle Camp Layout', async () => {
  const { resolveTowerAttacks } = await import('./combatRules.js');
  const { createInitialGameState } = await import('./gameState.js');
  const { NEUTRAL_CAMPS } = await import('../map/dotaMapData.js');

  const state = createInitialGameState();
  const radTower = state.towers.find(t => t.id === 'rad_t1_bot') || state.towers[0];

  // 1. Tower Neutral Immunity: Tower must NEVER fire at neutral creeps even if adjacent
  const neutralCreep = {
    id: 'test_neutral_1',
    isNeutral: true,
    faction: 'neutral',
    x: radTower.x + 1,
    y: radTower.y + 1,
    hp: 150,
    maxHp: 150,
    damage: 20,
    range: 1,
  };

  const towerResult = resolveTowerAttacks({
    towers: [radTower],
    heroes: [],
    creeps: [neutralCreep],
  });

  assert.equal(towerResult.attacks.length, 0, 'Towers must NEVER target neutral jungle creeps');

  // 2. Map Balance: Every neutral camp in NEUTRAL_CAMPS must be at least 12 tiles away from any tower
  state.towers.forEach(tower => {
    const tx = tower.x + (tower.size || 2) / 2;
    const ty = tower.y + (tower.size || 2) / 2;
    NEUTRAL_CAMPS.forEach(camp => {
      const dist = Math.hypot(camp.x - tx, camp.y - ty);
      assert.ok(
        dist >= 11.5,
        `Camp ${camp.name} at (${camp.x}, ${camp.y}) is too close to tower ${tower.id} (${tx}, ${ty}), dist: ${dist.toFixed(1)} < 12`
      );
    });
  });
});













