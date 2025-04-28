export function rollDice(command) {
  const input = command.trim().toLowerCase();
  const dicePart = input.startsWith('/roll')
    ? input.slice(5).trim()
    : input;

  const dIndex = dicePart.indexOf('d');
  if (dIndex === -1) return null;

  const leftPips = dicePart.slice(0, dIndex).trim();
  let rest = dicePart.slice(dIndex + 1).trim();

  const plus = rest.indexOf('+');
  const minus = rest.indexOf('-');
  const splitAt = plus > -1 ? plus : minus;

  const rightPips = splitAt > -1
    ? rest.slice(0, splitAt).trim()
    : rest;
  const modifierStr = splitAt > -1
    ? rest.slice(splitAt).trim()
    : '';

  const numDice = parseInt(leftPips, 10) || 1;
  const diceSides = parseInt(rightPips, 10);
  const cleanMod = modifierStr.replace(/\s+/g, '');
  const modifier = cleanMod ? parseInt(cleanMod, 10) : 0;

  const pips = [];
  for (let i = 0; i < numDice; i++) {
    pips.push(Math.floor(Math.random() * diceSides) + 1);
  }

  const total = pips.reduce((sum, pip) => sum + pip, 0) + modifier;
  const expression = `${numDice}d${diceSides}${cleanMod}`;

  return { pips, modifier, total, expression };
}
