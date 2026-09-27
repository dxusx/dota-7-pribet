// Pure Dice Rolling System supporting D&D dice notation (d4, d6, d8, d10, d12, d20, d100)
// and Advantage / Disadvantage mechanics

export function rollDice(notation = '1d20', options = {}) {
  const { advantage = false, disadvantage = false } = options;

  // Standardize notation (e.g., "d20" -> "1d20")
  const cleanNotation = notation.trim().toLowerCase();
  const match = cleanNotation.match(/^(\d*)d(\d+)(?:([+-])(\d+))?$/);

  if (!match) {
    // Fallback: parse single integer or default to d20
    const val = parseInt(cleanNotation, 10);
    if (!isNaN(val)) return { notation, rolls: [val], modifier: 0, total: val, isCrit: false, isFail: false };
    return rollDice('1d20', options);
  }

  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const sign = match[3] || '+';
  const modVal = match[4] ? parseInt(match[4], 10) : 0;
  const modifier = sign === '-' ? -modVal : modVal;

  // Handle Advantage / Disadvantage on d20 single rolls
  if (sides === 20 && count === 1 && (advantage || disadvantage)) {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    
    let chosen;
    let dropped;

    if (advantage && !disadvantage) {
      chosen = Math.max(roll1, roll2);
      dropped = Math.min(roll1, roll2);
    } else if (disadvantage && !advantage) {
      chosen = Math.min(roll1, roll2);
      dropped = Math.max(roll1, roll2);
    } else {
      // Both cancel each other out
      chosen = roll1;
      dropped = roll2;
    }

    const total = chosen + modifier;
    const isCrit = chosen === 20;
    const isFail = chosen === 1;

    return {
      notation,
      rolls: [roll1, roll2],
      chosenRoll: chosen,
      droppedRoll: dropped,
      modifier,
      total,
      isCrit,
      isFail,
      advantage: advantage && !disadvantage,
      disadvantage: disadvantage && !advantage
    };
  }

  // Standard dice rolling
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  const sum = rolls.reduce((acc, v) => acc + v, 0);
  const total = sum + modifier;

  // For 1d20, identify natural 20 (Crit) and natural 1 (Fail)
  const isCrit = sides === 20 && count === 1 && rolls[0] === 20;
  const isFail = sides === 20 && count === 1 && rolls[0] === 1;

  return {
    notation,
    rolls,
    chosenRoll: rolls[0],
    droppedRoll: null,
    modifier,
    total,
    isCrit,
    isFail,
    advantage: false,
    disadvantage: false
  };
}

// Convenience wrapper for attack & initiative rolls
export function rollD20(modifier = 0, options = {}) {
  const result = rollDice('1d20', options);
  return {
    ...result,
    total: result.chosenRoll + modifier,
    modifier
  };
}
