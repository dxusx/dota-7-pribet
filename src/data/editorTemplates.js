// Dota Map Editor / Battle Map Editor Templates and Initial Objects

import { INITIAL_HEROES_95, TOWERS_DATA } from './dota95Data.js';
import { getAssetUrl } from '../utils/assetUrl.js';

// Object Categories
export const OBJECT_TYPES = {
  HERO: 'hero',
  CREEP: 'creep',
  TOWER: 'tower',
  STRUCTURE: 'structure'
};

// Object Teams
export const OBJECT_TEAMS = {
  RADIANT: 'radiant',
  DIRE: 'dire',
  NEUTRAL: 'neutral'
};

// HERO TEMPLATES
export const HERO_TEMPLATES = [
  {
    templateId: 'axe',
    name: 'Axe',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: '/avatars/axe_avatar.png',
    icon: '🪓',
    role: 'Танк / Инициатор'
  },
  {
    templateId: 'pudge',
    name: 'Pudge',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: '/avatars/pudge_avatar.png',
    icon: '🪝',
    role: 'Хукер / Ганкер'
  },
  {
    templateId: 'gojo',
    name: 'Satoru Gojo',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: '/avatars/gojo_avatar.png',
    icon: '🌀',
    role: 'Маг / Контроль'
  },
  {
    templateId: 'invoker',
    name: 'Invoker',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: '/avatars/invoker_avatar.png',
    icon: '🔮',
    role: 'Гранд-Маг'
  },
  {
    templateId: 'rubick',
    name: 'Rubick',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: '/avatars/rubick_avatar.png',
    icon: '🪄',
    role: 'Саппорт / Воровство'
  },
  {
    templateId: 'sniper',
    name: 'Sniper',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    avatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sniper.png',
    icon: '🎯',
    role: 'Снайпер / Керри'
  },
  {
    templateId: 'sukuna',
    name: 'Ryomen Sukuna',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.DIRE,
    avatar: '/avatars/sukuna_avatar.png',
    icon: '🌋',
    role: 'Король Проклятий'
  },
  {
    templateId: 'sf',
    name: 'Shadow Fiend',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.DIRE,
    avatar: '/avatars/sf_avatar.png',
    icon: '💀',
    role: 'Маг / Керри'
  },
  {
    templateId: 'wesker',
    name: 'Albert Wesker',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.DIRE,
    avatar: '/avatars/wesker_avatar.png',
    icon: '🕶️',
    role: 'Убийца / Мутант'
  },
  {
    templateId: 'monesy',
    name: 'm0NESY',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.DIRE,
    avatar: '/avatars/monesy_avatar.png',
    icon: '🔫',
    role: 'Снайпер (AWP)'
  },
  {
    templateId: 'minos',
    name: 'Minos Prime',
    type: OBJECT_TYPES.HERO,
    defaultTeam: OBJECT_TEAMS.DIRE,
    avatar: '/avatars/minos_avatar.png',
    icon: '👑',
    role: 'Судия / Брузер'
  }
];

// CREEP TEMPLATES
export const CREEP_TEMPLATES = [
  {
    templateId: 'rad_melee',
    name: 'Крип-мечник Radiant',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '⚔️',
    role: 'Ближний бой'
  },
  {
    templateId: 'rad_ranged',
    name: 'Крип-маг Radiant',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '🏹',
    role: 'Дальний бой'
  },
  {
    templateId: 'rad_siege',
    name: 'Катапульта Radiant',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '☄️',
    role: 'Осада'
  },
  {
    templateId: 'dire_melee',
    name: 'Крип-мечник Dire',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '⚔️',
    role: 'Ближний бой'
  },
  {
    templateId: 'dire_ranged',
    name: 'Крип-маг Dire',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '🏹',
    role: 'Дальний бой'
  },
  {
    templateId: 'dire_siege',
    name: 'Катапульта Dire',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '☄️',
    role: 'Осада'
  },
  {
    templateId: 'roshan',
    name: 'Рошан (Бессмертный)',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.NEUTRAL,
    icon: '👹',
    role: 'Босс Рошпита'
  },
  {
    templateId: 'neutral_ancient',
    name: 'Древний Чёрный Дракон',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.NEUTRAL,
    icon: '🐉',
    role: 'Нейтральный крип'
  },
  {
    templateId: 'neutral_wolf',
    name: 'Лесной Волк',
    type: OBJECT_TYPES.CREEP,
    defaultTeam: OBJECT_TEAMS.NEUTRAL,
    icon: '🐺',
    role: 'Нейтральный крип'
  }
];

// TOWER TEMPLATES
export const TOWER_TEMPLATES = [
  {
    templateId: 'rad_t1_tpl',
    name: 'Вышка T1 (Radiant)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '🗼',
    tier: 1
  },
  {
    templateId: 'rad_t2_tpl',
    name: 'Вышка T2 (Radiant)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '🗼',
    tier: 2
  },
  {
    templateId: 'rad_t3_tpl',
    name: 'Вышка T3 (Radiant)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '🗼',
    tier: 3
  },
  {
    templateId: 'rad_ancient_tpl',
    name: 'Древо Жизни (Ancient)',
    type: OBJECT_TYPES.STRUCTURE,
    defaultTeam: OBJECT_TEAMS.RADIANT,
    icon: '💎'
  },
  {
    templateId: 'dire_t1_tpl',
    name: 'Вышка T1 (Dire)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '🗼',
    tier: 1
  },
  {
    templateId: 'dire_t2_tpl',
    name: 'Вышка T2 (Dire)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '🗼',
    tier: 2
  },
  {
    templateId: 'dire_t3_tpl',
    name: 'Вышка T3 (Dire)',
    type: OBJECT_TYPES.TOWER,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '🗼',
    tier: 3
  },
  {
    templateId: 'dire_ancient_tpl',
    name: 'Ледяной Трон (Ancient)',
    type: OBJECT_TYPES.STRUCTURE,
    defaultTeam: OBJECT_TEAMS.DIRE,
    icon: '🌋'
  }
];

// Find template by templateId
export function findTemplate(templateId) {
  return (
    HERO_TEMPLATES.find(t => t.templateId === templateId) ||
    CREEP_TEMPLATES.find(t => t.templateId === templateId) ||
    TOWER_TEMPLATES.find(t => t.templateId === templateId) ||
    null
  );
}

// Create new instance from template at coordinates (x, y)
export function createInstanceFromTemplate(template, x, y, customTeam = null) {
  const instanceId = `${template.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    id: instanceId,
    templateId: template.templateId,
    type: template.type,
    name: template.name,
    team: customTeam || template.defaultTeam,
    x: Math.max(0, Math.min(94, Math.round(x))),
    y: Math.max(0, Math.min(94, Math.round(y))),
    avatar: template.avatar || null,
    icon: template.icon || (template.type === OBJECT_TYPES.HERO ? '👤' : '📦'),
    tier: template.tier || null
  };
}

// Generate Initial Default Map Objects (10 Heroes, Towers, Roshan, Lane Creeps)
export function getInitialEditorObjects() {
  const objects = [];

  // 1. Initial 10 Heroes
  INITIAL_HEROES_95.forEach(h => {
    const tpl = HERO_TEMPLATES.find(t => t.templateId === h.id) || {
      templateId: h.id,
      name: h.name,
      type: OBJECT_TYPES.HERO,
      defaultTeam: h.team,
      avatar: h.avatar,
      icon: '👤'
    };
    objects.push({
      id: `hero_${h.id}`,
      templateId: tpl.templateId,
      type: OBJECT_TYPES.HERO,
      name: h.name,
      team: h.team,
      x: h.c,
      y: h.r,
      avatar: h.avatar,
      icon: tpl.icon || '👤'
    });
  });

  // 2. Towers
  TOWERS_DATA.forEach(t => {
    objects.push({
      id: t.id,
      templateId: `${t.team}_t${t.tier}_tpl`,
      type: OBJECT_TYPES.TOWER,
      name: t.name,
      team: t.team,
      x: t.c,
      y: t.r,
      icon: '🗼',
      tier: t.tier
    });
  });

  // 3. Roshan
  objects.push({
    id: 'roshan_boss',
    templateId: 'roshan',
    type: OBJECT_TYPES.CREEP,
    name: 'Рошан (Бессмертный)',
    team: OBJECT_TEAMS.NEUTRAL,
    x: 42,
    y: 24,
    icon: '👹'
  });

  // 4. Sample Lane Creeps
  objects.push(
    { id: 'rad_creep_mid_1', templateId: 'rad_melee', type: OBJECT_TYPES.CREEP, name: 'Крип-мечник Radiant', team: OBJECT_TEAMS.RADIANT, x: 38, y: 56, icon: '⚔️' },
    { id: 'rad_creep_mid_2', templateId: 'rad_ranged', type: OBJECT_TYPES.CREEP, name: 'Крип-маг Radiant', team: OBJECT_TEAMS.RADIANT, x: 37, y: 57, icon: '🏹' },
    { id: 'dire_creep_mid_1', templateId: 'dire_melee', type: OBJECT_TYPES.CREEP, name: 'Крип-мечник Dire', team: OBJECT_TEAMS.DIRE, x: 54, y: 40, icon: '⚔️' },
    { id: 'dire_creep_mid_2', templateId: 'dire_ranged', type: OBJECT_TYPES.CREEP, name: 'Крип-маг Dire', team: OBJECT_TEAMS.DIRE, x: 55, y: 39, icon: '🏹' }
  );

  return objects;
}
