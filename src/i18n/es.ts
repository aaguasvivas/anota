// Spanish dictionary — Dominican voice.
// Restraint over costume: slang lives on celebratory moments, not chrome.

import type { Dictionary } from './types';

export const es: Dictionary = {
  brand: {
    name: 'Anota',
    tagline: 'Anotador de dominó',
  },
  chrome: {
    undo: 'Deshacer',
    reset: 'Reiniciar',
    newMatch: 'Nueva partida',
    settings: 'Ajustes',
    ok: 'OK',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    done: 'Listo',
    delete: 'Borrar',
    add: 'Añadir',
    customAdd: 'Otro',
    leader: 'VA',
    target: 'Hasta',
    targetChange: 'cambiar',
    tied: 'empate',
    leadsBy: (name, n) => `${name} va ${n} arriba`,
    vs: 'vs',
    footerTagline: 'Hecho pa’ la mesa dominicana · dominó, capicúa y café',
  },
  team: {
    defaultA: 'Nosotros',
    defaultB: 'Ellos',
    plusFor: (name) => `+ para ${name}`,
    plusForA11y: (name, n) => `Sumar ${n} a ${name}`,
    customForA11y: (name) => `Puntos personalizados para ${name}`,
    addPoints: 'Puntos',
    arrived: '¡llegó!',
    toWin: (n) =>
      n === 1 ? 'una pa’ ganar' : `${n} pa’ ganar`,
  },
  customModal: {
    titleFor: 'Puntos para',
    placeholder: '0',
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
      `🁢 Anota — Anotador de dominó\n${a} ${sa} – ${sb} ${b}\n¡${a} ganó!`,
  },
  reset: {
    title: '¿Reiniciar la partida?',
    message:
      'Se borran los puntos y las rondas. Los nombres y el objetivo se quedan.',
    confirm: 'Reiniciar',
  },
  newMatchConfirm: {
    title: '¿Empezar nueva partida?',
    message:
      'Los puntos y las rondas se borran. Los nombres y el objetivo se quedan.',
    confirm: 'Empezar',
  },
  history: {
    sectionTitle: 'Rondas',
    emptyTitle: 'Todavía no se ha jugao’',
    emptySubtitle: 'Suma puntos y la historia aparece aquí.',
    removeRoundConfirm: (n, name) => `¿Borrar +${n} de ${name}?`,
  },
};
