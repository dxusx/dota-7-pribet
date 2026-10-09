/**
 * Visual Effects (VFX) & Projectiles Engine for DOTA 7 PRIBET
 * Handles procedural rendering of projectile motion, beams, hooks, slashes, and impacts on HTML5 Canvas.
 */

export function createSkillVfx(skillId, fromPos, toPos) {
  const from = fromPos ? { x: fromPos.x, y: fromPos.y } : { x: 0, y: 0 };
  const to = toPos ? { x: toPos.x, y: toPos.y } : from;

  if (skillId === 'meat-hook') {
    return {
      type: 'hook',
      from,
      to,
      color: '#84cc16',
      durationMs: 450,
      createdAt: Date.now(),
    };
  }

  if (skillId === 'sun-strike') {
    return {
      type: 'beam',
      from: { x: to.x, y: Math.max(0, to.y - 15) },
      to,
      color: '#f59e0b',
      durationMs: 700,
      createdAt: Date.now(),
    };
  }

  if (skillId === 'awp-wallbang') {
    return {
      type: 'tracer',
      from,
      to,
      color: '#22c55e',
      durationMs: 400,
      createdAt: Date.now(),
    };
  }

  if (skillId === 'dismantle' || skillId === 'cleave') {
    return {
      type: 'slash',
      from,
      to,
      color: '#dc2626',
      durationMs: 400,
      createdAt: Date.now(),
    };
  }

  if (skillId === 'chaos-meteor') {
    return {
      type: 'meteor',
      from: { x: to.x - 5, y: to.y - 8 },
      to,
      color: '#f97316',
      durationMs: 650,
      createdAt: Date.now(),
    };
  }

  if (skillId === 'hollow-purple') {
    return {
      type: 'purple_sphere',
      from,
      to,
      color: '#c084fc',
      durationMs: 600,
      createdAt: Date.now(),
    };
  }

  // Generic area / spell burst
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
 * Procedural VFX rendering inside HTML5 Canvas world transform
 */
export function drawVfx(ctx, vfx, now, tileSize) {
  const p = getVfxProgress(vfx, now);
  if (p >= 1.0) return;

  const startPx = vfx.from.x * tileSize + tileSize / 2;
  const startPy = vfx.from.y * tileSize + tileSize / 2;
  const endPx = vfx.to.x * tileSize + tileSize / 2;
  const endPy = vfx.to.y * tileSize + tileSize / 2;

  ctx.save();

  // 1. Hook (Pudge chain)
  if (vfx.type === 'hook') {
    const curX = startPx + (endPx - startPx) * (p < 0.6 ? p / 0.6 : (1.0 - p) / 0.4);
    const curY = startPy + (endPy - startPy) * (p < 0.6 ? p / 0.6 : (1.0 - p) / 0.4);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Hook tip
    ctx.fillStyle = vfx.color;
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 2. Beam (Sun Strike vertical pillar)
  else if (vfx.type === 'beam') {
    const alpha = Math.sin(p * Math.PI);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = vfx.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(endPx, endPy - 350);
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Ground impact ring
    ctx.fillStyle = vfx.color;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * (0.8 + p * 0.8), 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Tracer (AWP Wallbang piercing ray)
  else if (vfx.type === 'tracer') {
    const alpha = 1.0 - p;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = vfx.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Piercing flash at target
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(endPx, endPy, 5 + (1 - p) * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Slash (Sukuna Dismantle / Cleave)
  else if (vfx.type === 'slash') {
    const alpha = 1.0 - p;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = vfx.color;
    ctx.lineWidth = 3;
    const len = tileSize * 1.4;

    ctx.beginPath();
    ctx.moveTo(endPx - len / 2, endPy - len / 2);
    ctx.lineTo(endPx + len / 2, endPy + len / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endPx + len / 2, endPy - len / 2);
    ctx.lineTo(endPx - len / 2, endPy + len / 2);
    ctx.stroke();
  }

  // 5. Meteor (Chaos Meteor rolling ball)
  else if (vfx.type === 'meteor') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;

    // Fiery tail
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Meteor fireball
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(curX, curY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Purple Sphere (Gojo Hollow Purple)
  else if (vfx.type === 'purple_sphere') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.beginPath();
    ctx.arc(curX, curY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(curX, curY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Projectile (Ranged attack or Tower shot)
  else if (vfx.type === 'projectile' || vfx.type === 'tower_shot') {
    const curX = startPx + (endPx - startPx) * p;
    const curY = startPy + (endPy - startPy) * p;
    const radius = vfx.type === 'tower_shot' ? 6 : 4;

    ctx.fillStyle = vfx.color;
    ctx.beginPath();
    ctx.arc(curX, curY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Impact / Burst
  else {
    const alpha = 1.0 - p;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = vfx.color;
    ctx.beginPath();
    ctx.arc(endPx, endPy, tileSize * (0.3 + p * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
