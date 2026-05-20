// Spanish/Dominican flavor strings used around the app.

export const winnerPhrases = [
  '¡Se acabó!',
  '¡Capicúa!',
  '¡Dominó!',
  '¡Pa’ la casa!',
  '¡Pónganla ahí!',
];

export const winnerSubtitles = [
  'Llegaron primero.',
  'Partida ganada.',
  'Que sirvan otro café.',
  '¿Otra mano?',
];

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
