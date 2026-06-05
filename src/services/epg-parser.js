// services/epg-parser.js
// Parseur XMLTV → données EPG normalisées

/**
 * Parse un fichier XMLTV en programmes
 * @param {string} xmlText - Contenu XML
 * @returns {{ channels: Array, programmes: Array }}
 */
export function parseXMLTV(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('XMLTV invalide : ' + doc.querySelector('parsererror').textContent);
  }

  // Parser les chaînes
  const channels = [];
  const channelEls = doc.querySelectorAll('channel');
  channelEls.forEach((el) => {
    channels.push({
      id: el.getAttribute('id'),
      name: el.querySelector('display-name')?.textContent || el.getAttribute('id'),
      icon: el.querySelector('icon')?.getAttribute('src') || null,
    });
  });

  // Parser les programmes
  const programmes = [];
  const programmeEls = doc.querySelectorAll('programme');
  programmeEls.forEach((el) => {
    const start = el.getAttribute('start');
    const stop = el.getAttribute('stop');
    const channelId = el.getAttribute('channel');

    programmes.push({
      channelId,
      start: parseXMLTVDate(start),
      stop: parseXMLTVDate(stop),
      title: el.querySelector('title')?.textContent || 'Sans titre',
      desc: el.querySelector('desc')?.textContent || null,
      category: el.querySelector('category')?.textContent || null,
      icon: el.querySelector('icon')?.getAttribute('src') || null,
      episodeNum: el.querySelector('episode-num')?.textContent || null,
      subtitles: el.querySelector('subtitles')?.getAttribute('type') || null,
      rating: el.querySelector('rating value')?.textContent || null,
      previouslyShown: el.querySelector('previously-shown') !== null,
      new: el.querySelector('new') !== null,
      live: el.querySelector('live') !== null,
    });
  });

  return { channels, programmes };
}

/**
 * Parse une date XMLTV (format : 20260604180000 +0200)
 */
function parseXMLTVDate(dateStr) {
  if (!dateStr) return null;
  // Format : YYYYMMDDHHMMSS +ZZZZ
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match;
  return new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
}

/**
 * Récupère les programmes d'une chaîne pour une plage horaire
 */
export function getProgrammesForChannel(programmes, channelId, from, to) {
  return programmes
    .filter((p) => p.channelId === channelId && p.start >= from && p.start < to)
    .sort((a, b) => a.start - b.start);
}

/**
 * Récupère le programme en cours pour une chaîne
 */
export function getCurrentProgramme(programmes, channelId, now = new Date()) {
  const channelProgrammes = programmes.filter((p) => p.channelId === channelId);
  return channelProgrammes.find((p) => p.start <= now && p.stop > now) || null;
}

/**
 * Récupère les programmes du prime time (18h-23h)
 */
export function getPrimeTimeProgrammes(programmes, channelId, date = new Date()) {
  const primeStart = new Date(date);
  primeStart.setHours(18, 0, 0, 0);
  const primeEnd = new Date(date);
  primeEnd.setHours(23, 0, 0, 0);
  return getProgrammesForChannel(programmes, channelId, primeStart, primeEnd);
}

/**
 * Formate une date pour affichage EPG
 */
export function formatEPGTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formate la durée d'un programme
 */
export function formatDuration(start, stop) {
  if (!start || !stop) return '';
  const diffMin = Math.round((stop - start) / 60000);
  if (diffMin >= 60) {
    return `${Math.floor(diffMin / 60)}h${diffMin % 60 > 0 ? diffMin % 60 + 'min' : ''}`;
  }
  return `${diffMin}min`;
}

/**
 * Groupe les programmes par tranche horaire pour la grille EPG
 */
export function buildEPGGrid(programmes, channels, hoursRange = 3) {
  const now = new Date();
  const gridStart = new Date(now);
  gridStart.setHours(now.getHours(), 0, 0, 0);
  const gridEnd = new Date(gridStart);
  gridEnd.setHours(gridStart.getHours() + hoursRange);

  const slots = [];
  const intervalMin = 30; // Résolution de la grille : 30 min

  for (let t = new Date(gridStart); t < gridEnd; t = new Date(t.getTime() + intervalMin * 60000)) {
    const slotEnd = new Date(t.getTime() + intervalMin * 60000);
    const slotProgrammes = {};

    for (const ch of channels) {
      const prog = programmes.find(
        (p) => p.channelId === ch.id && p.start <= t && p.stop > t
      );
      if (prog) {
        // Calculer la largeur en slots
        const progDurationSlots = Math.ceil((prog.stop - prog.start) / (intervalMin * 60000));
        slotProgrammes[ch.id] = {
          ...prog,
          colspan: Math.max(1, progDurationSlots),
          isStart: prog.start >= t && prog.start < slotEnd,
        };
      }
    }

    slots.push({
      time: t,
      label: formatEPGTime(t),
      programmes: slotProgrammes,
    });
  }

  return { slots, channels, gridStart, gridEnd };
}
