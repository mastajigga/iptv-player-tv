// services/xtream-api.js
// Client API Xtream Codes

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class XtreamClient {
  constructor(server, username, password) {
    this.server = server.replace(/\/$/, '');
    this.username = username;
    this.password = password;
    this.baseURL = `${this.server}/player_api.php`;
    this.cache = new Map();
  }

  async _fetch(action, params = {}) {
    const url = new URL(this.baseURL);
    url.searchParams.set('username', this.username);
    url.searchParams.set('password', this.password);
    url.searchParams.set('action', action);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    // Cache check
    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    this.cache.set(cacheKey, { data, time: Date.now() });
    return data;
  }

  // --- Authentification ---
  async authenticate() {
    return this._fetch('user');
  }

  // --- Catégories Live TV ---
  async getLiveCategories() {
    const data = await this._fetch('get_live_categories');
    return (data || []).map((cat) => ({
      id: cat.category_id,
      name: cat.category_name,
      parentId: cat.parent_id || 0,
    }));
  }

  // --- Chaînes Live TV ---
  async getLiveStreams(categoryId = null) {
    const params = categoryId ? { category_id: categoryId } : {};
    const data = await this._fetch('get_live_streams', params);
    return (data || []).map((stream) => ({
      id: `xtream_live_${stream.stream_id}`,
      name: stream.name,
      url: `${this.server}/live/${this.username}/${this.password}/${stream.stream_id}.m3u8`,
      logo: stream.stream_icon ? stream.stream_icon : null,
      group: stream.category_name || 'Non classé',
      epgChannelId: stream.epg_channel_id || null,
      tvArchive: stream.tv_archive > 0,
      tvArchiveDuration: stream.tv_archive_duration || 0,
      sourceId: `xtream_${this.server}`,
      sourceType: 'xtream',
      xtreamId: stream.stream_id,
      num: stream.num || null,
    }));
  }

  // --- Catégories VOD ---
  async getVODCategories() {
    const data = await this._fetch('get_vod_categories');
    return (data || []).map((cat) => ({
      id: cat.category_id,
      name: cat.category_name,
      parentId: cat.parent_id || 0,
    }));
  }

  // --- Films/Séries VOD ---
  async getVODStreams(categoryId = null) {
    const params = categoryId ? { category_id: categoryId } : {};
    const data = await this._fetch('get_vod_streams', params);
    return (data || []).map((vod) => ({
      id: `xtream_vod_${vod.stream_id}`,
      name: vod.name,
      url: `${this.server}/movie/${this.username}/${this.password}/${vod.stream_id}.mp4`,
      logo: vod.stream_icon || null,
      group: vod.category_name || 'VOD',
      plot: vod.plot || null,
      cast: vod.cast || null,
      director: vod.director || null,
      genre: vod.genre || null,
      releaseDate: vod.releasedate || null,
      duration: vod.duration || null,
      rating: vod.rating || null,
      sourceType: 'xtream_vod',
      xtreamId: vod.stream_id,
    }));
  }

  // --- EPG (guide des programmes) ---
  async getEPG(streamId = null, limit = null) {
    const params = {};
    if (streamId) params.stream_id = streamId;
    if (limit) params.limit = limit;

    const data = await this._fetch('get_short_epg', params);
    if (!data?.epg_listings) return [];

    return data.epg_listings.map((epg) => ({
      channelId: `xtream_live_${epg.channel_id || epg.epg_id}`,
      channelName: epg.title || epg.name,
      programme: {
        start: epg.start_timestamp ? new Date(parseInt(epg.start_timestamp) * 1000) : new Date(epg.start),
        stop: epg.stop_timestamp ? new Date(parseInt(epg.stop_timestamp) * 1000) : new Date(epg.stop),
        title: epg.title || epg.name || 'Sans titre',
        desc: epg.description || null,
        category: epg.genre || null,
        rating: epg.rating || null,
        nowPlaying: epg.now_playing || false,
        hasArchive: epg.has_archive > 0,
      },
    }));
  }

  // --- XMLTV complet ---
  async getFullXMLTV() {
    const url = `${this.server}/xmltv.php?username=${this.username}&password=${this.password}`;
    const response = await fetch(url);
    return response.text();
  }
}
