import React, { useState } from 'react';
import { 
  PlusCircle, Sparkles, Save, Download, Printer, 
  Image as ImageIcon, RefreshCw, CheckCircle, Heart, Zap, Swords 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClickSound, playCritSound } from '../utils/sound';

export default function CardCreator({ onSaveHero }) {
  const [formData, setFormData] = useState({
    name: 'Shadow Fiend (Nevermore)',
    title: 'Повелитель Душ',
    universe: 'Dota 2',
    dndRole: 'Колдун Некромант (Warlock / Soul Reaper)',
    themeColor: '#7c2d12', // Rich Dark Orange/Brown
    accentColor: '#f97316',
    avatar: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nevermore.png',
    quote: 'Твоя душа принадлежит мне.',
    description: 'Мастер темной магии и снайперских коилов. Накапливает души убитых врагов, повышая свой урон до космических значений.',
    stats: {
      hp: 100,
      hpRegen: '+1/ход',
      mana: 120,
      manaRegen: '+10/ход',
      damage: 45,
      period: 4,
      crit: 90,
      range: 15,
      penetration: 10,
      accuracy: 45,
      speed: 6,
      armor: 2,
      agility: 1
    },
    skills: [
      {
        id: 'shadowraze',
        num: 1,
        name: 'Shadowraze (Коилы)',
        type: 'Активное',
        isUltimate: false,
        castTime: '1 сек',
        manaCost: ['35', '50', '65', '80'],
        cooldown: '8 сек (1 ход)',
        description: 'Взрывает область перед собой на дистанции 5 / 10 / 15 клеток. Наносит 90 / 180 / 270 / 360 урона.',
        scalingDesc: 'Урон: 90 / 180 / 270 / 360. Затраты маны: 35 / 50 / 65 / 80.'
      },
      {
        id: 'necromastery',
        num: 2,
        name: 'Necromastery',
        type: 'Пассивное',
        isUltimate: false,
        castTime: 'Пассивно',
        manaCost: ['0', '0', '0', '0'],
        cooldown: 'Нет',
        description: 'За каждую поглощенную душу убитого крипа или героя получает постоянный бонус +2 / +3 / +4 / +5 к урону.',
        scalingDesc: 'Души: +2 / +3 / +4 / +5 урона за душу (макс 36 душ).'
      },
      {
        id: 'presence-dark-lord',
        num: 3,
        name: 'Presence of the Dark Lord',
        type: 'Пассивная Аура',
        isUltimate: false,
        castTime: 'Пассивно',
        manaCost: ['0', '0', '0', '0'],
        cooldown: 'Нет',
        description: 'Ужасающее присутствие снижает броню всех противников в радиусе 12 клеток на 3 / 5 / 7 / 9.',
        scalingDesc: 'Снижение брони: -3 / -5 / -7 / -9.'
      },
      {
        id: 'requiem-of-souls',
        num: 4,
        name: 'Requiem of Souls',
        type: 'Ультимейт (Активное)',
        isUltimate: true,
        castTime: '2 сек',
        manaCost: ['150', '175', '200'],
        cooldown: '100 / 80 / 60 сек',
        description: 'Невермор выпускает все накопленные души волнами тьмы вокруг себя, нанося гигантский урон и накладывая страх!',
        scalingDesc: 'Урон волны: 80 / 120 / 160 за линию душ. Страх: 1.5 хода.'
      }
    ],
    basicAttacks: 'Выстрел сгустком темной энергии (Дальность 15, Урон 45 + бонус душ, Крит 90).'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStatChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: val
      }
    }));
  };

  const handleSkillChange = (index, field, val) => {
    setFormData(prev => {
      const nextSkills = [...prev.skills];
      nextSkills[index] = { ...nextSkills[index], [field]: val };
      return { ...prev, skills: nextSkills };
    });
  };

  const handleSave = () => {
    playCritSound();
    const newHero = {
      ...formData,
      id: 'custom-' + Date.now(),
      stats: {
        ...formData.stats,
        hp: Number(formData.stats.hp) || 100,
        mana: Number(formData.stats.mana) || 100,
        damage: Number(formData.stats.damage) || 40,
        crit: Number(formData.stats.crit) || 80,
        range: Number(formData.stats.range) || 1,
        penetration: Number(formData.stats.penetration) || 10,
        accuracy: Number(formData.stats.accuracy) || 50,
        speed: Number(formData.stats.speed) || 6,
        armor: Number(formData.stats.armor) || 1,
      }
    };

    onSaveHero(newHero);
    setSavedSuccess(true);
    confetti({ particleCount: 70, spread: 60 });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const exportJSON = () => {
    playClickSound();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${formData.name.toLowerCase().replace(/\s+/g, '_')}_card.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-[#121722] border border-amber-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-fantasy text-xl sm:text-2xl font-black text-amber-200 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-amber-400" />
            Конструктор Карточек Персонажей
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Создайте нового героя для вашей игры, настройте статы, способности и сразу сохраните в Кодекс или распечатайте!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Экспорт JSON</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить в Кодекс</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Герой успешно сохранен! Теперь он доступен во вкладке «Герои» и в «Арене Дуэлей»!</span>
        </div>
      )}

      {/* Editor & Real-Time Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 p-6 rounded-2xl bg-[#10141d] border border-slate-800">
          
          <h3 className="font-fantasy text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Основная информация
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Имя героя:</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Титул / Звание:</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Вселенная:</label>
              <input
                type="text"
                value={formData.universe}
                onChange={e => setFormData({ ...formData, universe: e.target.value })}
                placeholder="Dota 2, CS:GO, D&D, Anime..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Роль / Класс в D&D:</label>
              <input
                type="text"
                value={formData.dndRole}
                onChange={e => setFormData({ ...formData, dndRole: e.target.value })}
                placeholder="Варвар, Следопыт, Монах..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Ссылка на аватарку / арт (URL):</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Цвет карточки (Тема):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.themeColor}
                  onChange={e => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-400">{formData.themeColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Коронная фраза (Цитата):</label>
              <input
                type="text"
                value={formData.quote}
                onChange={e => setFormData({ ...formData, quote: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <h3 className="font-fantasy text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
            2. Базовые характеристики (Уровень 1)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Здоровье (ХП):</label>
              <input
                type="number"
                value={formData.stats.hp}
                onChange={e => handleStatChange('hp', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Реген ХП:</label>
              <input
                type="text"
                value={formData.stats.hpRegen}
                onChange={e => handleStatChange('hpRegen', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Мана:</label>
              <input
                type="number"
                value={formData.stats.mana}
                onChange={e => handleStatChange('mana', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-blue-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Реген маны:</label>
              <input
                type="text"
                value={formData.stats.manaRegen}
                onChange={e => handleStatChange('manaRegen', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-blue-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Урон:</label>
              <input
                type="number"
                value={formData.stats.damage}
                onChange={e => handleStatChange('damage', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-rose-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Крит урон:</label>
              <input
                type="number"
                value={formData.stats.crit}
                onChange={e => handleStatChange('crit', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Дальность (кл):</label>
              <input
                type="number"
                value={formData.stats.range}
                onChange={e => handleStatChange('range', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Бронепробитие:</label>
              <input
                type="number"
                value={formData.stats.penetration}
                onChange={e => handleStatChange('penetration', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-purple-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Попадание (%):</label>
              <input
                type="number"
                value={formData.stats.accuracy}
                onChange={e => handleStatChange('accuracy', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-cyan-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Броня:</label>
              <input
                type="number"
                value={formData.stats.armor}
                onChange={e => handleStatChange('armor', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Скорость:</label>
              <input
                type="number"
                value={formData.stats.speed}
                onChange={e => handleStatChange('speed', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-yellow-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Период:</label>
              <input
                type="number"
                value={formData.stats.period}
                onChange={e => handleStatChange('period', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-300"
              />
            </div>
          </div>

          <h3 className="font-fantasy text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-slate-800 pb-2 pt-2">
            3. Способности & Ультимейт
          </h3>

          <div className="space-y-4">
            {formData.skills.map((skill, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    {skill.isUltimate ? '★ УЛЬТИМЕЙТ' : `Скилл ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    value={skill.type}
                    onChange={e => handleSkillChange(idx, 'type', e.target.value)}
                    placeholder="Активное / Пассивное"
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={e => handleSkillChange(idx, 'name', e.target.value)}
                    placeholder="Название скилла"
                    className="bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-semibold"
                  />
                  <input
                    type="text"
                    value={skill.castTime}
                    onChange={e => handleSkillChange(idx, 'castTime', e.target.value)}
                    placeholder="Время применения (напр. 2 сек)"
                    className="bg-slate-800 border border-slate-700 rounded p-1.5 text-slate-300 font-mono text-[11px]"
                  />
                </div>

                <textarea
                  value={skill.description}
                  onChange={e => handleSkillChange(idx, 'description', e.target.value)}
                  placeholder="Описание механики..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200"
                />

                <input
                  type="text"
                  value={skill.scalingDesc}
                  onChange={e => handleSkillChange(idx, 'scalingDesc', e.target.value)}
                  placeholder="Скейлинг: 50 / 100 / 150 / 200 урона"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-[11px] font-mono text-amber-300"
                />
              </div>
            ))}
          </div>

        </div>

        {/* Live Card Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="text-xs uppercase font-mono text-amber-400 font-bold flex items-center justify-between">
            <span>Живой просмотр карточки:</span>
            <span className="text-[10px] text-slate-400">Стиль оригинала</span>
          </div>

          {/* Render Preview Card */}
          <div 
            className="tabletop-card-shadow rounded-2xl border p-5 relative overflow-hidden"
            style={{
              backgroundColor: formData.themeColor,
              borderColor: 'rgba(255,255,255,0.2)'
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <img 
                  src={formData.avatar || 'https://via.placeholder.com/150'} 
                  alt={formData.name} 
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 bg-black/40"
                />
                <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-emerald-700 text-emerald-100 font-bold border-2 border-emerald-400 text-xs flex items-center justify-center shadow">
                  1
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/40 text-amber-300">
                  {formData.universe}
                </span>
                <h4 className="font-fantasy text-xl font-black text-white mt-0.5">
                  {formData.name}
                </h4>
                <p className="text-[11px] text-white/70 italic">"{formData.quote}"</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-1 bg-black/40 p-2 rounded-xl border border-white/10 text-center font-stat text-xs mb-3">
              <div>
                <span className="text-[9px] text-white/60">ХП</span>
                <div className="font-bold text-emerald-400">{formData.stats.hp}</div>
              </div>
              <div>
                <span className="text-[9px] text-white/60">Мана</span>
                <div className="font-bold text-blue-400">{formData.stats.mana}</div>
              </div>
              <div>
                <span className="text-[9px] text-white/60">Урон</span>
                <div className="font-bold text-rose-400">{formData.stats.damage}</div>
              </div>
              <div>
                <span className="text-[9px] text-white/60">Дальность</span>
                <div className="font-bold text-cyan-400">{formData.stats.range} кл</div>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="space-y-2 text-xs">
              {formData.skills.map((s, i) => (
                <div key={i} className="p-2 rounded-lg bg-black/35 border border-white/10">
                  <div className="flex justify-between font-bold text-white text-[11px]">
                    <span>{s.isUltimate ? '★ ' : `${i + 1}. `}{s.name}</span>
                    <span className="text-[10px] text-amber-300 font-mono">{s.castTime}</span>
                  </div>
                  <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5">{s.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-white/60 italic">
              Базовые удары: {formData.basicAttacks}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white font-bold text-sm shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Сохранить этого героя в Кодекс</span>
          </button>
        </div>

      </div>
    </div>
  );
}
