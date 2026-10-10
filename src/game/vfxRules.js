/**
 * Visual Effects (VFX) & Projectiles Engine for DOTA 7 PRIBET
 * High-quality, stylized, procedural Canvas 2D animations for hero abilities,
 * basic attacks, and tower defenses.
 */

export function createSkillVfx(skillId, fromPos, toPos) {
  const from = fromPos ? { x: fromPos.x, y: fromPos.y } : { x: 0, y: 0 };
  const to = toPos ? { x: toPos.x, y: toPos.y } : from;

  // 1. Pudge
  if (skillId === 'meat-hook') {
    return { type: 'hook', from, to, color: '#84cc16', durationMs: 480, createdAt: Date.now() };
  }
  if (skillId === 'rot') {
    return { type: 'rot_cloud', from, to, color: '#84cc16', durationMs: 650, createdAt: Date.now() };
  }
  if (skillId === 'dismember') {
    return { type: 'butcher_hacks', from, to, color: '#b91c1c', durationMs: 600, createdAt: Date.now() };
  }

  // 2. Invoker
  if (skillId === 'sun-strike') {
    return { type: 'beam', from: { x: to.x, y: Math.max(0, to.y - 15) }, to, color: '#f59e0b', durationMs: 750, createdAt: Date.now() };
  }
  if (skillId === 'chaos-meteor') {
    return { type: 'meteor', from: { x: to.x - 5, y: to.y - 8 }, to, color: '#f97316', durationMs: 700, createdAt: Date.now() };
  }
  if (skillId === 'deafening-blast') {
    return { type: 'shockwave_cone', from, to, color: '#38bdf8', durationMs: 500, createdAt: Date.now() };
  }
  if (skillId === 'emp') {
    return { type: 'emp_storm', from, to, color: '#c084fc', durationMs: 650, createdAt: Date.now() };
  }
  if (skillId === 'tornado') {
    return { type: 'tornado', from, to, color: '#cbd5e1', durationMs: 650, createdAt: Date.now() };
  }

  // 3. Shadow Fiend
  if (skillId === 'shadowraze') {
    return { type: 'shadowraze', from, to, color: '#dc2626', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'requiem-of-souls') {
    return { type: 'requiem', from, to, color: '#ef4444', durationMs: 850, createdAt: Date.now() };
  }

  // 4. m0NESY
  if (skillId === 'awp-wallbang') {
    return { type: 'tracer', from, to, color: '#22c55e', durationMs: 420, createdAt: Date.now() };
  }
  if (skillId === 'flashbang') {
    return { type: 'flashbang', from, to, color: '#ffffff', durationMs: 500, createdAt: Date.now() };
  }
  if (skillId === 'smoke-grenade') {
    return { type: 'smoke_grenade', from, to, color: '#64748b', durationMs: 900, createdAt: Date.now() };
  }

  // 5. Sukuna
  if (skillId === 'dismantle' || skillId === 'cleave') {
    return { type: 'slash', from, to, color: '#dc2626', durationMs: 420, createdAt: Date.now() };
  }
  if (skillId === 'malevolent-shrine') {
    return { type: 'malevolent_shrine', from, to, color: '#991b1b', durationMs: 900, createdAt: Date.now() };
  }
  if (skillId === 'fire-arrow') {
    return { type: 'fire_arrow', from, to, color: '#ea580c', durationMs: 600, createdAt: Date.now() };
  }

  // 6. Gojo Satoru
  if (skillId === 'hollow-purple') {
    return { type: 'purple_sphere', from, to, color: '#c084fc', durationMs: 750, createdAt: Date.now() };
  }
  if (skillId === 'blue') {
    return { type: 'blue_vortex', from, to, color: '#2563eb', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'red') {
    return { type: 'red_blast', from, to, color: '#dc2626', durationMs: 500, createdAt: Date.now() };
  }
  if (skillId === 'unlimited-void') {
    return { type: 'unlimited_void', from, to, color: '#7c3aed', durationMs: 950, createdAt: Date.now() };
  }
  if (skillId === 'infinity') {
    return { type: 'infinity_shield', from, to, color: '#38bdf8', durationMs: 650, createdAt: Date.now() };
  }

  // 7. Axe
  if (skillId === 'culling-blade') {
    return { type: 'culling_blade', from, to, color: '#ef4444', durationMs: 650, createdAt: Date.now() };
  }
  if (skillId === 'berserkers-call') {
    return { type: 'warrior_roar', from, to, color: '#f97316', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'battle-hunger') {
    return { type: 'cursed_flame', from, to, color: '#dc2626', durationMs: 600, createdAt: Date.now() };
  }

  // 8. Rubick
  if (skillId === 'fade-bolt') {
    return { type: 'lightning', from, to, color: '#10b981', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'telekinesis') {
    return { type: 'telekinesis', from, to, color: '#34d399', durationMs: 600, createdAt: Date.now() };
  }
  if (skillId === 'spell-steal') {
    return { type: 'spell_steal', from, to, color: '#059669', durationMs: 700, createdAt: Date.now() };
  }

  // 9. Alexander Anderson
  if (skillId === 'bayonet-barrage') {
    return { type: 'bayonet_barrage', from, to, color: '#e2e8f0', durationMs: 650, createdAt: Date.now() };
  }
  if (skillId === 'holy-barrier') {
    return { type: 'holy_barrier', from, to, color: '#facc15', durationMs: 700, createdAt: Date.now() };
  }
  if (skillId === 'divine-regen') {
    return { type: 'holy_heal', from, to, color: '#fbbf24', durationMs: 600, createdAt: Date.now() };
  }

  // 10. Gabriel
  if (skillId === 'spear-of-justice') {
    return { type: 'spear', from, to, color: '#fbbf24', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'divine-wrath') {
    return { type: 'divine_swords', from, to, color: '#f59e0b', durationMs: 750, createdAt: Date.now() };
  }
  if (skillId === 'angel-power') {
    return { type: 'angel_wings', from, to, color: '#fef08a', durationMs: 800, createdAt: Date.now() };
  }

  // 11. Alucard
  if (skillId === 'twin-shot') {
    return { type: 'twin_shot', from, to, color: '#f87171', durationMs: 450, createdAt: Date.now() };
  }
  if (skillId === 'cromwell-seal-0' || skillId === 'cromwell-seal-1' || skillId === 'cromwell-seal-2') {
    return { type: 'cromwell_seal', from, to, color: '#991b1b', durationMs: 850, createdAt: Date.now() };
  }
  if (skillId === 'shadow-hound') {
    return { type: 'shadow_hound', from, to, color: '#1e1b4b', durationMs: 600, createdAt: Date.now() };
  }

  // 12. Schrödinger
  if (skillId === 'quantum-warp') {
    return { type: 'quantum_warp', from, to, color: '#06b6d4', durationMs: 500, createdAt: Date.now() };
  }
  if (skillId === 'mind-control') {
    return { type: 'mind_control', from, to, color: '#a855f7', durationMs: 600, createdAt: Date.now() };
  }
  if (skillId === 'last-cat-live') {
    return { type: 'quantum_aura', from, to, color: '#38bdf8', durationMs: 700, createdAt: Date.now() };
  }

  // 13. Minos Prime
  if (skillId === 'judgement') {
    return { type: 'judgement_crater', from, to, color: '#38bdf8', durationMs: 650, createdAt: Date.now() };
  }
  if (skillId === 'die') {
    return { type: 'stomp_crater', from, to, color: '#60a5fa', durationMs: 550, createdAt: Date.now() };
  }
  if (skillId === 'thy-end') {
    return { type: 'combo_slashes', from, to, color: '#93c5fd', durationMs: 600, createdAt: Date.now() };
  }

  // 14. Katerina
  if (skillId === 'blade-dance') {
    return { type: 'blade_dance', from, to, color: '#e11d48', durationMs: 600, createdAt: Date.now() };
  }
  if (skillId === 'preparation') {
    return { type: 'blade_gleam', from, to, color: '#facc15', durationMs: 500, createdAt: Date.now() };
  }

  // 15. Wesker
  if (skillId === 'mastermind' || skillId === 'ouroboros') {
    return { type: 'uroboros_tendrils', from, to, color: '#831843', durationMs: 700, createdAt: Date.now() };
  }
  if (skillId === 'prion') {
    return { type: 'virus_injection', from, to, color: '#701a75', durationMs: 500, createdAt: Date.now() };
  }

  // Fallback / Generic spell burst
  return {
    type: 'burst',
    from,
    to,
    color: '#38bdf8',
    durationMs: 450,
    createdAt: Date.now(),
  };
}

export function createAttackVfx(fromPos, toPos, isRanged, faction = 'radiant') {
  const from = { x: fromPos.x, y: fromPos.y };
  const to = { x: toPos.x, y: toPos.y };
  const color = faction === 'radiant' ? '#38bdf8' : '#ef4444';

  if (isRanged) {
    return {
      type: 'projectile',
      from,
      to,
      color,
      durationMs: 350,
      createdAt: Date.now(),
    };
  }

  return {
    type: 'impact',
    from: to,
    to,
    color,
    durationMs: 250,
    createdAt: Date.now(),
  };
}

export function createTowerVfx(tower, targetPos, faction = 'radiant') {
  const sz = tower.size || 2;
  const from = { x: tower.x + sz / 2, y: tower.y + sz / 2 };
  const to = { x: targetPos.x + 0.5, y: targetPos.y + 0.5 };
  const color = faction === 'radiant' ? '#fbbf24' : '#f87171';

  return {
    type: 'tower_shot',
    from,
    to,
    color,
    durationMs: 400,
    createdAt: Date.now(),
  };
}

export function getVfxProgress(vfx, now = Date.now()) {
  if (!vfx || !vfx.durationMs) return 1.0;
  const elapsed = now - (vfx.createdAt || now);
  if (elapsed <= 0) return 0.0;
  return Math.min(1.0, elapsed / vfx.durationMs);
}

/**
 * Procedural stylized VFX rendering inside HTML5 Canvas world transform
 */
export function drawVfx(ctx, vfx, now, tileSize) {
  if (!vfx) return;
  const p = getVfxProgress(vfx, now);
  if (p >= 1.0) return;

  const from = vfx.from || vfx.targetPos || { x: 0, y: 0 };
  const to = vfx.to || vfx.targetPos || from;

  const startPx = from.x * tileSize + tileSize / 2;
  const startPy = from.y * tileSize + tileSize / 2;
  const endPx = to.x * tileSize + tileSize / 2;
  const endPy = to.y * tileSize + tileSize / 2;

  ctx.save();

  // 1. Meat Hook (Pudge rusty chain & iron cleaver)
  if (vfx.type === 'hook') {
    const extendProgress = p < 0.6 ? p / 0.6 : (1.0 - p) / 0.4;
    const curX = startPx + (endPx - startPx) * extendProgress;
    const curY = startPy + (endPy - startPy) * extendProgress;
    const angle = Math.atan2(endPy - startPy, endPx - startPx);

    // Chain links
    const totalDist = Math.hypot(curX - startPx, curY - startPy);
    const linkSpacing = 8;
    const linkCount = Math.floor(totalDist / linkSpacing);

    ctx.save();
    ctx.shadowColor = '#0f172a';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Riveted iron link highlights
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < linkCount; i++) {
      const lx = startPx + Math.cos(angle) * (i * linkSpacing);
      const ly = startPy + Math.sin(angle) * (i * linkSpacing);
      ctx.beginPath();
      ctx.arc(lx, ly, 1.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Heavy barbed hook tip
    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(angle);
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2.5;

    // Anchor hook blade
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(12, 0);
    ctx.lineTo(-4, 6);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Barbed tips
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(10, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Sun Strike (Invoker vertical solar flare pillar & ground seal)
  else if (vfx.type === 'beam') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Ground celestial runic seal
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    const sealRadius = tileSize * (1.1 + p * 0.4);

    ctx.beginPath();
    ctx.arc(endPx, endPy, sealRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(endPx, endPy, sealRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Runic compass rays
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + p * 2;
      ctx.beginPath();
      ctx.moveTo(endPx + Math.cos(a) * (sealRadius * 0.5), endPy + Math.sin(a) * (sealRadius * 0.5));
      ctx.lineTo(endPx + Math.cos(a) * (sealRadius * 1.1), endPy + Math.sin(a) * (sealRadius * 1.1));
      ctx.stroke();
    }

    // Towering solar beam pillar
    const beamGrad = ctx.createLinearGradient(endPx - 16, 0, endPx + 16, 0);
    beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    beamGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.85)');
    beamGrad.addColorStop(0.5, '#ffffff');
    beamGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.85)');
    beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(endPx - 16, endPy - 450, 32, 450);

    // Incandescent ground core
    const coreGrad = ctx.createRadialGradient(endPx, endPy, 0, endPx, endPy, sealRadius);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.8)');
    coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(endPx, endPy, sealRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. AWP Wallbang (m0NESY supersonic sniper tracer & shock rings)
  else if (vfx.type === 'tracer') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Laser beam core with neon glow
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Hot-white inner bullet wire
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // 3 Conical supersonic shockwave rings expanding along trajectory
    const angle = Math.atan2(endPy - startPy, endPx - startPx);
    [0.35, 0.65, 0.95].forEach((offsetFrac, idx) => {
      const rx = startPx + (endPx - startPx) * offsetFrac;
      const ry = startPy + (endPy - startPy) * offsetFrac;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(angle + Math.PI / 2);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7 + idx * 3, 2.5 + idx, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Concrete penetration flash burst at target
    const flashGrad = ctx.createRadialGradient(endPx, endPy, 0, endPx, endPy, 14 + (1 - p) * 10);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.5, '#4ade80');
    flashGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(endPx, endPy, 16 + (1 - p) * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Dismantle / Cleave (Sukuna razor-thin spatial cuts)
  else if (vfx.type === 'slash') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;

    const len = tileSize * (1.6 + p * 0.4);
    const cuts = [
      { dx1: -len * 0.6, dy1: -len * 0.5, dx2: len * 0.6, dy2: len * 0.5 },
      { dx1: len * 0.55, dy1: -len * 0.45, dx2: -len * 0.55, dy2: len * 0.45 },
      { dx1: -len * 0.7, dy1: 0, dx2: len * 0.7, dy2: 0 },
    ];

    cuts.forEach((c, i) => {
      ctx.strokeStyle = i === 1 ? '#ef4444' : '#b91c1c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(endPx + c.dx1, endPy + c.dy1);
      ctx.lineTo(endPx + c.dx2, endPy + c.dy2);
      ctx.stroke();

      // Sharp white razor reflection
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Blood spark droplets spraying out
    ctx.fillStyle = '#dc2626';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + 0.3;
      const dist = len * 0.4 * (0.8 + p * 0.8);
      ctx.beginPath();
      ctx.arc(endPx + Math.cos(a) * dist, endPy + Math.sin(a) * dist, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Malevolent Shrine (Sukuna Domain Expansion)
  else if (vfx.type === 'malevolent_shrine') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Blood mist domain radius
    const radius = tileSize * 3.5;
    const domainGrad = ctx.createRadialGradient(endPx, endPy, 0, endPx, endPy, radius);
    domainGrad.addColorStop(0, 'rgba(185, 28, 28, 0.4)');
    domainGrad.addColorStop(0.7, 'rgba(153, 27, 27, 0.25)');
    domainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = domainGrad;
    ctx.beginPath();
    ctx.arc(endPx, endPy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Torii Shrine silhouette glyph
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;

    // Torii roof
    ctx.beginPath();
    ctx.moveTo(endPx - 26, endPy - 22);
    ctx.quadraticCurveTo(endPx, endPy - 32, endPx + 26, endPy - 22);
    ctx.stroke();

    // Torii pillars
    ctx.beginPath();
    ctx.moveTo(endPx - 16, endPy - 22);
    ctx.lineTo(endPx - 16, endPy + 16);
    ctx.moveTo(endPx + 16, endPy - 22);
    ctx.lineTo(endPx + 16, endPy + 16);
    ctx.stroke();

    // Infinite cutting grid
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.8)';
    ctx.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) {
      const cutOffset = (i * 12 + (p * 40) % 24);
      ctx.beginPath();
      ctx.moveTo(endPx - 35, endPy + cutOffset);
      ctx.lineTo(endPx + 35, endPy - cutOffset);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Fire Arrow / Fuga (Sukuna divine Kamino arrow)
  else if (vfx.type === 'fire_arrow') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    const angle = Math.atan2(endPy - startPy, endPx - startPx);

    ctx.save();
    // Blazing flame trail
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Blazing arrow tip
    ctx.translate(curX, curY);
    ctx.rotate(angle);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();

    // Fire impact shockwave when near target
    if (p > 0.6) {
      const blastP = (p - 0.6) / 0.4;
      ctx.rotate(-angle);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, blastP * tileSize * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Hollow Purple (Gojo colliding Red & Blue singularity)
  else if (vfx.type === 'purple_sphere') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    ctx.save();

    // Orbiting Red (Reversal) and Blue (Lapse) spheres collapsing
    const orbitAngle = p * Math.PI * 6;
    const orbitRadius = Math.max(0, (1 - p * 1.2) * 20);

    if (orbitRadius > 2) {
      // Blue orb
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(curX + Math.cos(orbitAngle) * orbitRadius, curY + Math.sin(orbitAngle) * orbitRadius, 6, 0, Math.PI * 2);
      ctx.fill();

      // Red orb
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(curX - Math.cos(orbitAngle) * orbitRadius, curY - Math.sin(orbitAngle) * orbitRadius, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core Hollow Purple Singularity
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 24;

    const orbGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 24);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.3, '#c084fc');
    orbGrad.addColorStop(0.7, '#6b21a8');
    orbGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(curX, curY, 24, 0, Math.PI * 2);
    ctx.fill();

    // Pure black void center (matter erasure)
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(curX, curY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Distorted spatial ring
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(curX, curY, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 8. Unlimited Void (Gojo Domain Expansion)
  else if (vfx.type === 'unlimited_void') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;

    const radius = tileSize * 4;
    const voidGrad = ctx.createRadialGradient(endPx, endPy, 0, endPx, endPy, radius);
    voidGrad.addColorStop(0, '#020617');
    voidGrad.addColorStop(0.5, '#2e1065');
    voidGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = voidGrad;
    ctx.beginPath();
    ctx.arc(endPx, endPy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric infinity rings
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.8;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(endPx, endPy, r * tileSize * 0.9 + Math.sin(p * 5) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 9. Chaos Meteor (Invoker rolling flaming asteroid)
  else if (vfx.type === 'meteor') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    ctx.save();

    // Scorched fire furrow trail on the ground
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.7)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Heavy glowing molten asteroid core
    const meteorGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 14);
    meteorGrad.addColorStop(0, '#ffffff');
    meteorGrad.addColorStop(0.3, '#fef08a');
    meteorGrad.addColorStop(0.7, '#ea580c');
    meteorGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = meteorGrad;
    ctx.beginPath();
    ctx.arc(curX, curY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Molten debris sparks
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + p * 6;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(curX + Math.cos(a) * 16, curY + Math.sin(a) * 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 10. Shadowraze (Shadow Fiend erupting soul geyser)
  else if (vfx.type === 'shadowraze') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 16;

    // Towering crimson soul geyser
    const geyserGrad = ctx.createLinearGradient(endPx - 14, endPy, endPx + 14, endPy - 120);
    geyserGrad.addColorStop(0, '#18181b');
    geyserGrad.addColorStop(0.4, '#dc2626');
    geyserGrad.addColorStop(0.8, '#f87171');
    geyserGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = geyserGrad;
    ctx.fillRect(endPx - 14, endPy - 120 * p, 28, 120 * p);

    // Ground soul eruption ring
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * (0.8 + p * 0.8), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 11. Bayonet Barrage (Alexander Anderson rain of holy blades)
  else if (vfx.type === 'bayonet_barrage') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;

    const bayonets = [
      { x: endPx - 16, y: endPy - 8 },
      { x: endPx + 14, y: endPy - 12 },
      { x: endPx - 6, y: endPy + 10 },
      { x: endPx + 10, y: endPy + 8 },
      { x: endPx, y: endPy - 2 },
    ];

    bayonets.forEach(b => {
      // Silver blade
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - 28);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Golden crossguard
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x - 5, b.y - 20);
      ctx.lineTo(b.x + 5, b.y - 20);
      ctx.stroke();
    });

    // Holy scripture ground circle
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * 1.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 12. Spear of Justice (Gabriel flying golden angelic spear)
  else if (vfx.type === 'spear') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    const angle = Math.atan2(endPy - startPy, endPx - startPx);

    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 14;

    // Golden celestial light trail
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Spear head & wings
    ctx.translate(curX, curY);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 13. Twin Shot (Alucard dual Casull & Jackal blasts)
  else if (vfx.type === 'twin_shot') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;

    // Dual muzzle tracers (Silver Jackal & Black Casull)
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 10;

    // Shot 1 (Silver)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPx - 4, startPy - 4);
    ctx.lineTo(endPx - 4, endPy - 4);
    ctx.stroke();

    // Shot 2 (Red-Black)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPx + 4, startPy + 4);
    ctx.lineTo(endPx + 4, endPy + 4);
    ctx.stroke();

    // Double impact flashes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endPx - 4, endPy - 4, 6 + (1 - p) * 6, 0, Math.PI * 2);
    ctx.arc(endPx + 4, endPy + 4, 6 + (1 - p) * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 14. Cromwell Seal (Alucard summoning pentagram & demonic eyes)
  else if (vfx.type === 'cromwell_seal') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 16;

    const radius = tileSize * 2.2;
    // Pentagram circle
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(endPx, endPy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Five-pointed star
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const sx = endPx + Math.cos(a1) * radius;
      const sy = endPy + Math.sin(a1) * radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();

    // Demonic red eyes opening in shadows
    [-12, 14, -6, 8].forEach((ox, idx) => {
      const oy = idx % 2 === 0 ? -8 : 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(endPx + ox, endPy + oy, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(endPx + ox, endPy + oy, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // 15. Quantum Warp (Schrödinger digital glitch teleport)
  else if (vfx.type === 'quantum_warp') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;

    // Digital pixel slices at start and destination
    [
      { x: startPx, y: startPy },
      { x: endPx, y: endPy },
    ].forEach(pt => {
      for (let i = -3; i <= 3; i++) {
        const offset = i * 4;
        ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#ec4899';
        ctx.fillRect(pt.x + (i % 2) * 6 - 8, pt.y + offset, 16, 2.5);
      }
    });

    // Holographic vector line between points
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(endPx, endPy);
    ctx.stroke();
    ctx.restore();
  }

  // 16. Chain Lightning (Rubick Fade Bolt)
  else if (vfx.type === 'lightning') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;

    // Branching zigzag segments
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    const steps = 6;
    for (let i = 1; i < steps; i++) {
      const frac = i / steps;
      const bx = startPx + (endPx - startPx) * frac + ((i % 2 === 0 ? 1 : -1) * 12);
      const by = startPy + (endPy - startPy) * frac + ((i % 2 === 0 ? -1 : 1) * 12);
      ctx.lineTo(bx, by);
    }
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Hot-white core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // 17. Rot Cloud (Pudge toxic billowing gas)
  else if (vfx.type === 'rot_cloud') {
    const alpha = Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 16;

    const cloudRadius = tileSize * 1.8;
    const rotGrad = ctx.createRadialGradient(endPx, endPy, 0, endPx, endPy, cloudRadius);
    rotGrad.addColorStop(0, 'rgba(163, 230, 53, 0.7)');
    rotGrad.addColorStop(0.6, 'rgba(101, 163, 13, 0.4)');
    rotGrad.addColorStop(1, 'rgba(77, 124, 15, 0)');
    ctx.fillStyle = rotGrad;
    ctx.beginPath();
    ctx.arc(endPx, endPy, cloudRadius, 0, Math.PI * 2);
    ctx.fill();

    // Acid bubbles
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI) / 2.5 + p * 3;
      const br = 8 + (i % 3) * 6;
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(endPx + Math.cos(a) * br, endPy + Math.sin(a) * br, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 18. Culling Blade (Axe execution axe slam & blood fountain)
  else if (vfx.type === 'culling_blade') {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;

    // Colossal descending red battle-axe
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(endPx, endPy - 40 * (1 - p * 0.5));
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Axe head blade
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endPx, endPy - 20, 18, -Math.PI / 2, Math.PI / 2, false);
    ctx.fill();

    // Violent blood geyser shockwave
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * (1.0 + p * 1.5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 19. Projectile (Ranged auto attack or tower shot with luminous particle tail)
  else if (vfx.type === 'projectile' || vfx.type === 'tower_shot') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    const radius = vfx.type === 'tower_shot' ? 7 : 5;

    ctx.save();
    ctx.shadowColor = vfx.color;
    ctx.shadowBlur = 12;

    // Fading spark particle trail behind projectile
    for (let t = 1; t <= 3; t++) {
      const trailX = curX - (endPx - startPx) * (0.04 * t);
      const trailY = curY - (endPy - startPy) * (0.04 * t);
      ctx.fillStyle = vfx.color;
      ctx.globalAlpha = 0.8 - t * 0.22;
      ctx.beginPath();
      ctx.arc(trailX, trailY, radius * (1 - t * 0.25), 0, Math.PI * 2);
      ctx.fill();
    }

    // Main orb
    ctx.globalAlpha = 1.0;
    const orbGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, radius);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.5, vfx.color);
    orbGrad.addColorStop(1, vfx.color);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(curX, curY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 19.5 Beacon / Ward Placement / AoE Ripple
  else if (vfx.type === 'aoe_impact' || vfx.type === 'beacon') {
    const alpha = Math.sin(p * Math.PI);
    const pulseRadius = tileSize * (0.6 + p * 2.2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = vfx.color || '#facc15';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = vfx.color || '#facc15';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(endPx, endPy, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Central flash flare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endPx, endPy, Math.max(2, (1.0 - p) * tileSize * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 20. Melee Impact / Generic Burst
  else {
    const alpha = Math.max(0, 1.0 - p);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = vfx.color;
    ctx.shadowBlur = 14;

    // Curved weapon slash arc
    ctx.strokeStyle = vfx.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * (0.4 + p * 0.6), -Math.PI / 3, (2 * Math.PI) / 3);
    ctx.stroke();

    // Core spark burst
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endPx, endPy, 4 + (1 - p) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
