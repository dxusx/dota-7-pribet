import React, { useState } from 'react';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, 
  RotateCcw, Sparkles, AlertTriangle, History, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playDiceSound, playCritSound, playClickSound } from '../utils/sound';

export default function DiceRoller() {
  const [diceType, setDiceType] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState('normal'); // 'normal' | 'adv' | 'dis'
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([
    { id: 1, text: 'd100: 42 (Проверка попадания — Успех)', time: 'Старт' }
  ]);

  const diceOptions = [
    { sides: 4, name: 'D4', color: 'from-amber-600 to-yellow-500' },
    { sides: 6, name: 'D6', color: 'from-emerald-600 to-teal-500' },
    { sides: 8, name: 'D8', color: 'from-blue-600 to-indigo-500' },
    { sides: 10, name: 'D10', color: 'from-violet-600 to-purple-500' },
    { sides: 12, name: 'D12', color: 'from-pink-600 to-rose-500' },
    { sides: 20, name: 'D20', color: 'from-red-600 to-amber-500' },
    { sides: 100, name: 'D100', color: 'from-cyan-600 to-blue-500' },
  ];

  const rollDice = () => {
    setIsRolling(true);
    playDiceSound();

    setTimeout(() => {
      let rolls = [];
      let total = 0;

      if (diceType === 20 && advantage !== 'normal') {
        // Advantage / Disadvantage
        const r1 = Math.floor(Math.random() * 20) + 1;
        const r2 = Math.floor(Math.random() * 20) + 1;
        const chosen = advantage === 'adv' ? Math.max(r1, r2) : Math.min(r1, r2);
        rolls = [r1, r2];
        total = chosen + modifier;
        setLastResult({
          rolls,
          chosen,
          modifier,
          total,
          sides: 20,
          advantage,
          isNat20: chosen === 20,
          isNat1: chosen === 1,
        });

        if (chosen === 20) {
          playCritSound();
          confetti({ particleCount: 50, spread: 60 });
        }
      } else {
        // Standard roll
        for (let i = 0; i < diceCount; i++) {
          const val = Math.floor(Math.random() * diceType) + 1;
          rolls.push(val);
          total += val;
        }
        total += modifier;

        const isNat20 = diceType === 20 && rolls.includes(20);
        const isNat1 = diceType === 20 && rolls.includes(1);

        setLastResult({
          rolls,
          modifier,
          total,
          sides: diceType,
          isNat20,
          isNat1,
        });

        if (isNat20) {
          playCritSound();
          confetti({ particleCount: 50, spread: 60 });
        }
      }

      setIsRolling(false);

      // Add to history
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistory(prev => [
        {
          id: Date.now(),
          text: `${diceCount}D${diceType}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''} = ${total}`,
          time: timeStr
        },
        ...prev.slice(0, 15)
      ]);

    }, 450);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#121722] border border-amber-900/30 text-center">
        <h2 className="font-fantasy text-xl sm:text-2xl font-black text-amber-200 flex items-center justify-center gap-2">
          <Dice5 className="w-6 h-6 text-amber-400" />
          Интерактивный Дайс-Роллер Ведущего и Игроков
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Броски кубиков для проверок попадания (d100), инициативы, критов (d20) и урона способностей!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="md:col-span-7 space-y-5 p-6 rounded-2xl bg-[#10141d] border border-slate-800">
          
          {/* Select Dice Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Выберите кость:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {diceOptions.map((opt) => (
                <button
                  key={opt.sides}
                  onClick={() => { playClickSound(); setDiceType(opt.sides); }}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all border ${
                    diceType === opt.sides
                      ? `bg-gradient-to-br ${opt.color} text-white border-white/40 shadow-lg scale-105`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="font-stat text-lg">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dice Count & Modifiers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                Количество костей:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => { playClickSound(); setDiceCount(num); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      diceCount === num 
                        ? 'bg-amber-500 text-black border-amber-400' 
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                Модификатор:
              </label>
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  onClick={() => setModifier(m => m - 1)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-200"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-sm text-amber-400 bg-slate-900/60 py-1 rounded border border-slate-800">
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </div>
                <button
                  onClick={() => setModifier(m => m + 1)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Advantage / Disadvantage (For D20) */}
          {diceType === 20 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Преимущество D&D:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                <button
                  onClick={() => { playClickSound(); setAdvantage('normal'); }}
                  className={`py-1.5 px-2 rounded-lg border transition-all ${
                    advantage === 'normal' 
                      ? 'bg-slate-700 text-white border-slate-500' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Обычный
                </button>
                <button
                  onClick={() => { playClickSound(); setAdvantage('adv'); }}
                  className={`py-1.5 px-2 rounded-lg border transition-all ${
                    advantage === 'adv' 
                      ? 'bg-emerald-900 text-emerald-200 border-emerald-500 font-bold' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Преимущество
                </button>
                <button
                  onClick={() => { playClickSound(); setAdvantage('dis'); }}
                  className={`py-1.5 px-2 rounded-lg border transition-all ${
                    advantage === 'dis' 
                      ? 'bg-red-900 text-red-200 border-red-500 font-bold' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Помеха
                </button>
              </div>
            </div>
          )}

          {/* Big Roll Button */}
          <button
            onClick={rollDice}
            disabled={isRolling}
            className={`w-full py-4 rounded-xl font-fantasy text-lg font-black tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all ${
              isRolling
                ? 'bg-slate-800 text-slate-500 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 via-red-500 to-amber-600 hover:from-amber-400 hover:to-red-400 text-black shadow-amber-900/30 hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>БРОСИТЬ {diceCount}D{diceType}</span>
          </button>

        </div>

        {/* Result & Animation Display */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Main 3D Result Box */}
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-amber-500/30 flex flex-col items-center justify-center min-h-[220px] text-center relative overflow-hidden">
            {lastResult ? (
              <div className={`space-y-2 ${isRolling ? 'animate-dice' : ''}`}>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                  {lastResult.advantage && lastResult.advantage !== 'normal'
                    ? (lastResult.advantage === 'adv' ? 'Бросок с преимуществом' : 'Бросок с помехой')
                    : `Результат ${lastResult.sides ? `D${lastResult.sides}` : ''}`
                  }
                </div>

                <div className={`font-stat text-6xl sm:text-7xl font-black ${
                  lastResult.isNat20 
                    ? 'text-amber-300 animate-pulse' 
                    : lastResult.isNat1 
                    ? 'text-rose-500' 
                    : 'text-white'
                }`}>
                  {lastResult.total}
                </div>

                {/* Formula Breakdown */}
                <div className="text-xs font-mono text-slate-400">
                  Кости: [{lastResult.rolls.join(', ')}]
                  {lastResult.modifier !== 0 && (
                    <span> {lastResult.modifier > 0 ? `+ ${lastResult.modifier}` : `- ${Math.abs(lastResult.modifier)}`}</span>
                  )}
                </div>

                {lastResult.isNat20 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    КРИТИЧЕСКИЙ УСПЕХ (NAT 20)!
                  </div>
                )}

                {lastResult.isNat1 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    КРИТИЧЕСКИЙ ПРОВАЛ (NAT 1)!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Dice6 className="w-12 h-12 mx-auto mb-2 opacity-40 animate-pulse" />
                <p className="text-xs">Нажмите «Бросить», чтобы бросить кости</p>
              </div>
            )}
          </div>

          {/* Roll History */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-amber-400" />
                История бросков
              </span>
              <button
                onClick={() => setHistory([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Очистить
              </button>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto text-xs font-mono pr-1">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                  <span className="text-slate-300 font-semibold">{h.text}</span>
                  <span className="text-[10px] text-slate-500">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
