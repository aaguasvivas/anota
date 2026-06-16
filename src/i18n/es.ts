// Spanish dictionary - Dominican voice.
// Restraint over costume: slang lives on celebratory moments, not chrome.

import type { Dictionary } from './types';

export const es: Dictionary = {
  brand: {
    name: 'Anota',
  },
  chrome: {
    undo: 'Deshacer',
    newMatch: 'Nueva partida',
    settings: 'Ajustes',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    done: 'Listo',
    delete: 'Borrar',
    add: 'Añadir',
    leader: 'VA',
    target: 'Hasta',
    targetChange: 'cambiar',
    tied: 'empate',
    leadsBy: (name, n) => `${name} va ${n} arriba`,
    vs: 'vs',
  },
  team: {
    defaultA: 'Nosotros',
    defaultB: 'Ellos',
    plusForA11y: (name, n) => `Sumar ${n} a ${name}`,
    customForA11y: (name) => `Puntos personalizados para ${name}`,
    addPoints: 'Puntos',
    arrived: '¡llegó!',
    toWin: (n) =>
      n === 1 ? 'una pa’ ganar' : `${n} pa’ ganar`,
  },
  customModal: {
    titleFor: 'Puntos para',
  },
  settings: {
    title: 'Ajustes de la partida',
    namesSection: 'Nombres de los equipos',
    targetSection: 'A cuántos puntos',
    customLabel: 'Otro',
    languageSection: 'Idioma',
    languageEs: 'Español',
    languageEn: 'English',
    hapticsSection: 'Vibración',
    hapticsLabel: 'Vibración al tocar',
    hapticsHint: 'Apágala si molesta a la mesa.',
    resetMatch: 'Reiniciar la partida',
  },
  winner: {
    phrases: [
      '¡Capicúa!',
      '¡Pa’ la casa!',
      '¡Llegamo’!',
      '¡Pónganla ahí!',
      '¡Se acabó!',
      '¡Eso e’ tuyo!',
    ],
    subtitles: [
      'Otra cuando quieran.',
      '¿Otra mano?',
      'Eso e’ arroz.',
      'Partida ganada.',
      'A recoger las fichas.',
    ],
    keepPlaying: 'Seguir jugando',
    newMatch: 'Nueva partida',
    share: 'Compartir',
    shareMessage: (a, b, sa, sb) =>
      `🁢 Anota - Anotador de dominó\n${a} ${sa} – ${sb} ${b}\n¡${a} ganó!`,
  },
  newMatchConfirm: {
    title: '¿Empezar nueva partida?',
    message:
      'Los puntos y las rondas se borran. Los nombres y el objetivo se quedan.',
    confirm: 'Empezar',
  },
  history: {
    sectionTitle: 'Rondas',
    emptySubtitle: 'Suma puntos y la historia aparece aquí.',
    removeRoundConfirm: (n, name) => `¿Borrar +${n} de ${name}?`,
    removeHint: 'Mantén presionado para borrar',
  },
};
