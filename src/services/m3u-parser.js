// services/m3u-parser.js
// Parseur M3U/M3U8 → objets canal normalisés

/**
 * Parse un fichier M3U/M3U8 en tableau de chaînes
 * @param {string} text - Contenu du fichier M3U
 * @param {string} sourceId - ID de la source (pour le tracking)
 * @returns {Array} Chaînes normalisées
 */
export function parseM3U(text, sourceId = 'default') {
  const lines = text.split(/\r?\n/);
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Ligne EXTINF : métadonnées de la chaîne
    if (line.startsWith('#EXTINF:')) {
      const url = lines[i + 1]?.trim();

      // Sauter si pas d'URL ou si c'est une autre directive
      if (!url || url.startsWith('#')) continue;

      // Extraire les attributs
      const name = extractName(line);
      const attrs = extractAttributes(line);

      channels.push({
        id: `${sourceId}_${channels.length}`,
        name: name || `Canal ${channels.length + 1}`,
        url: url,
        group: attrs['group-title'] || 'Non classé',
        logo: attrs['tvg-logo'] || null,
        tvgId: attrs['tvg-id'] || null,
        tvgName: attrs['tvg-name'] || null,
        tvgShift: attrs['tvg-shift'] || null,
        radio: attrs['radio'] === 'true',
        sourceId,
      });

      i++; // Sauter la ligne URL
    }
  }

  return channels;
}

/**
 * Extrait le nom de la chaîne d'une ligne EXTINF
 */
function extractName(line) {
  // Le nom est après la dernière virgule
  const parts = line.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return null;
}

/**
 * Extrait les attributs tvg-* d'une ligne EXTINF
 */
function extractAttributes(line) {
  const attrs = {};
  const regex = /([\w-]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Parse plusieurs playlists et fusionne
 */
export function parseMultiM3U(sources) {
  const allChannels = [];
  for (const source of sources) {
    const channels = parseM3U(source.content, source.id);
    allChannels.push(...channels);
  }
  return allChannels;
}

/**
 * Extrait les groupes uniques d'une liste de chaînes
 */
export function extractGroups(channels) {
  const groups = new Set();
  for (const ch of channels) {
    groups.add(ch.group);
  }
  return [...groups].sort();
}

/**
 * Génère un M3U à partir d'une liste de chaînes
 */
export function generateM3U(channels, title = 'IPTV Player Export') {
  let m3u = '#EXTM3U\n';
  for (const ch of channels) {
    const attrs = [];
    if (ch.tvgId) attrs.push(`tvg-id="${ch.tvgId}"`);
    if (ch.tvgName) attrs.push(`tvg-name="${ch.tvgName}"`);
    if (ch.logo) attrs.push(`tvg-logo="${ch.logo}"`);
    if (ch.group) attrs.push(`group-title="${ch.group}"`);
    m3u += `#EXTINF:-1 ${attrs.join(' ')},${ch.name}\n`;
    m3u += `${ch.url}\n`;
  }
  return m3u;
}
