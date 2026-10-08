#!/usr/bin/env node
/**
 * scripts/check.js
 * Ground-Truth Verification Runner for DOTA 7 PRIBET
 * Stages:
 *  1. Environment Pre-flight
 *  2. Syntax & Structural Check
 *  3. Combat & Game Rules Unit Tests
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

function runStep(name, fn) {
  const start = Date.now();
  process.stdout.write(`[CHECK] ${name}... `);
  try {
    fn();
    const elapsed = Date.now() - start;
    process.stdout.write(`PASS (${elapsed}ms)\n`);
  } catch (err) {
    const elapsed = Date.now() - start;
    process.stdout.write(`FAIL (${elapsed}ms)\n`);
    if (err.stdout) process.stdout.write(err.stdout.toString());
    if (err.stderr) process.stderr.write(err.stderr.toString());
    if (!err.stdout && !err.stderr && err.message) {
      console.error(err.message);
    }
    process.exit(1);
  }
}

// Stage 1: Environment Pre-flight
runStep('Environment Pre-flight', () => {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (major < 18) {
    throw new Error(`[ENV ERROR] Node.js >= 18 required, current: ${nodeVersion}`);
  }
  if (!existsSync('package.json')) {
    throw new Error('[ENV ERROR] package.json not found in working directory');
  }
});

// Stage 2: Syntax Validation
runStep('Syntax & Core Entrypoints', () => {
  const criticalFiles = [
    'src/game/combatRules.js',
    'src/game/combatRules.test.js',
    'src/game/gameState.js',
    'src/game/creepData.js',
    'src/game/towerData.js',
    'src/game/heroesData.js'
  ];
  for (const file of criticalFiles) {
    if (!existsSync(file)) {
      throw new Error(`Missing required file: ${file}`);
    }
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  }
});

// Stage 3: Game & Combat Unit Tests
runStep('Combat & Game Rules Tests', () => {
  execSync('node src/game/combatRules.test.js', { stdio: 'inherit' });
});

console.log('\n[PASS] All checks passed successfully.');
