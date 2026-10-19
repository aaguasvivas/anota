// Spanish dictionary - Dominican voice.
// Restraint over costume: slang lives on celebratory moments, not chrome.

import type { Dictionary } from './types';

export const es: Dictionary = {
  brand: {
    name: 'Anota',
  },
  chrome: {
    undo: 'Deshacer',
    undoLast: (n) => `Deshacer +${n}`,
    undoA11y: (n, name) => `Deshacer +${n} de ${name}`,
    newMatch: 'Nueva partida',
    settings: 'Ajustes',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    done: 'Listo',
    delete: 'Borrar',
    add: 'Sumar',
    leader: 'ARRIBA',
    target: 'Hasta',
    targetChange: 'cambiar',
    tied: 'empate',
    // Name-agnostic word order: "Nosotros", "Ellos" and any custom team name
    // all read correctly without a conjugated verb.
    leadsBy: (name, n) => `${name} arriba por ${n}`,
    vs: 'vs',
  },
  team: {
    defaultA: 'Nosotros',
    defaultB: 'Ellos',
    plusForA11y: (name, n) => `Sumar ${n} a ${name}`,
    customForA11y: (name) => `Puntos personalizados para ${name}`,
    addPoints: 'Puntos',
    arrived: 'meta alcanzada',
    toWin: (n) => (n === 1 ? 'falta 1' : `faltan ${n}`),
    scoreA11y: (name, s, tgt, left, lead) =>
      `${name}, ${s} de ${tgt}, ${left === 0 ? 'meta alcanzada' : `faltan ${left}`}${lead ? ', arriba' : ''}`,
    renameHint: 'Abre los ajustes para cambiar el nombre.',
  },
  customModal: {
    titleFor: 'Puntos para',
  },
  settings: {
    namesSection: 'Nombres de los equipos',
    nameTopA11y: 'Nombre del equipo de arriba',
    nameBottomA11y: 'Nombre del equipo de abajo',
    targetSection: 'A cuántos puntos',
    customLabel: 'Otro',
    customTargetA11y: 'A cuántos puntos, otro',
    languageSection: 'Idioma',
    languageEs: 'Español',
    languageEn: 'English',
    hapticsLabel: 'Vibración al tocar',
    hapticsHint: 'Apágala si molesta a la mesa.',
    themeSection: 'Tema',
    themeNames: { classic: 'Clásico', midnight: 'Medianoche', mahogany: 'Caoba', casino: 'Rojo casino', bone: 'Hueso', carbon: 'Carbón' },
    themeLockedTag: 'Pro',
    themeLockedA11y: 'Tema Pro, bloqueado',
    themeLockedHint: 'Abre Anota Pro.',
    purchasesSection: 'Compras',
    removeAdsRow: 'Quitar anuncios',
  },
  winner: {
    phrases: [
      '¡Capicúa!',
      '¡Pa’ la casa!',
      '¡Pónganla ahí!',
      '¡Se acabó!',
      '¡Eso e’ tuyo!',
    ],
    subtitles: [
      'Otra cuando quieran.',
      '¿Otra partida?',
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
    message: 'Los puntos y las rondas se borran. Los nombres y la meta se quedan.',
    confirm: 'Nueva partida',
  },
  history: {
    emptySubtitle: 'Las rondas salen aquí. Mantén una presionada para borrarla.',
    removeRoundConfirm: (n, name) => `¿Borrar +${n} de ${name}?`,
    removeHint: 'Pregunta antes de borrar esta ronda',
    removeButton: 'Borrar',
  },
  pro: {
    title: 'Anota Pro',
    blurb: 'Pago único, sin suscripción.',
    themeContext: (name) => `${name} viene con Anota Pro.`,
    buyPro: 'Anota Pro {price}',
    proIncludes: 'Todos los temas y sin anuncios. Conviene más.',
    proIncludesAdsOff: 'Todos los temas. Ya no tienes anuncios.',
    buyRemoveAds: 'Solo quitar anuncios {price}',
    buying: 'Un momento...',
    restore: 'Restaurar compras',
    restored: 'Compras restauradas. Disfruta.',
    notFound: 'No se encontró ninguna compra.',
    thanks: 'Gracias por apoyar Anota.',
    thanksNoAds: 'Listo, sin anuncios. Gracias.',
    close: 'Cerrar',
    errorTitle: 'Problema con la compra',
    storeError:
      'El App Store no pudo completar la compra. Inténtalo de nuevo en un momento.',
    unavailable:
      'Esta compra no está disponible ahora mismo. Inténtalo más tarde.',
  },
};
