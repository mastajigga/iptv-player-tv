// App.jsx
// Root — Navigation Home / Player / EPG

import { useState, useEffect, useRef } from 'react';
import TVShell from './components/shell/TVShell';
import VideoPlayer from './components/player/VideoPlayer';
import HeroBanner from './components/tiles/HeroBanner';
import TileRow from './components/tiles/TileRow';
import EPGPage from './pages/EPG';
import { usePlaylist } from './hooks/usePlaylist';
import { useChannelZapper } from './hooks/useChannelZapper';
import { useRemoteNav } from './hooks/useRemoteNav';
import { KEY, COLORS, FONT } from './utils/constants';
import usePlaylistStore from './stores/playlistStore';
import useSettingsStore from './stores/settingsStore';
import * as storage from './services/storage';

// ============================================================
// Page d'accueil Netflix-like
// ============================================================
function HomePage({ onSelectChannel, onPlayChannel, onGoToEPG }) {
  const channels = usePlaylistStore((s) => s.channels);
  const groups = usePlaylistStore((s) => s.groups);
  const favorites = usePlaylistStore((s) => s.favorites);
  const customGroups = usePlaylistStore((s) => s.customGroups);
  const toggleFavorite = usePlaylistStore((s) => s.toggleFavorite);
  const isFavorite = usePlaylistStore((s) => s.isFavorite);
  const loading = usePlaylistStore((s) => s.loading);
  const { addSourceFromURL } = usePlaylist();

  const [heroChannel, setHeroChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const urlInputRef = useRef(null);

  useEffect(() => { storage.getHistory(10).then(setHistory); }, []);

  useEffect(() => {
    if (!heroChannel && channels.length > 0) {
      setHeroChannel(channels[0]);
    }
  }, [channels, heroChannel]);

  // Raccourcis télécommande
  useRemoteNav({
    [KEY.YELLOW]: () => onGoToEPG?.(),  // Touche jaune = EPG
    [KEY.BLUE]: () => {
      if (heroChannel) toggleFavorite(heroChannel.id);
    },
  });

  const handleAddPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    try {
      await addSourceFromURL(playlistUrl.trim(), 'Ma Playlist');
      setPlaylistUrl('');
    } catch (err) {
      console.error('Erreur playlist:', err);
    }
  };

  const handleHeroPlay = (channel) => {
    storage.addToHistory({ channelId: channel.id, channelName: channel.name });
    onPlayChannel?.(channel);
  };

  const handleTilePlay = (channel) => {
    storage.addToHistory({ channelId: channel.id, channelName: channel.name });
    onPlayChannel?.(channel);
  };

  // État vide
  if (!loading && channels.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '80px' }}>
        <h1 style={{ fontSize: FONT.XXL, marginBottom: 24, color: COLORS.TEXT_PRIMARY }}>IPTV Player</h1>
        <p style={{ fontSize: FONT.MD, color: COLORS.TEXT_SECONDARY, marginBottom: 48, textAlign: 'center', maxWidth: 800 }}>
          Ajoutez une playlist M3U ou Xtream Codes pour commencer.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <input ref={urlInputRef} data-focusable type="text" value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            onKeyDown={(e) => { if (e.keyCode === KEY.ENTER) handleAddPlaylist(); }}
            placeholder="https://exemple.com/playlist.m3u"
            style={{ padding: '16px 24px', fontSize: FONT.SM, width: 600, backgroundColor: COLORS.BG_ELEVATED, color: COLORS.TEXT_PRIMARY, border: '2px solid #333', borderRadius: 4, outline: 'none' }} />
          <button data-focusable onClick={handleAddPlaylist}
            style={{ padding: '16px 32px', fontSize: FONT.SM, backgroundColor: COLORS.ACCENT, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
            Ajouter
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED }}>Chargement...</p></div>;
  }

  const favoriteChannels = channels.filter((ch) => favorites.has(ch.id));
  const historyChannels = history.map((h) => channels.find((ch) => ch.id === h.channelId)).filter(Boolean);
  const allGroups = [...groups, ...customGroups.map((g) => g.name)];

  return (
    <div style={{ overflow: 'hidden' }}>
      <HeroBanner channel={heroChannel} channels={channels.slice(0, 5)} onPlay={handleHeroPlay} onSelectChannel={setHeroChannel} />

      <div style={{ paddingTop: 8 }}>
        {historyChannels.length > 0 && <TileRow title="Continuer à regarder" items={historyChannels} onSelect={handleTilePlay} showProgress />}
        {favoriteChannels.length > 0 && <TileRow title="⭐ Mes favoris" items={favoriteChannels} onSelect={handleTilePlay} />}
        {allGroups.map((group) => {
          const groupChannels = channels.filter((ch) => ch.group === group);
          if (groupChannels.length === 0) return null;
          return <TileRow key={group} title={group} items={groupChannels} onSelect={handleTilePlay} />;
        })}
      </div>
    </div>
  );
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'player' | 'epg'
  const [currentChannel, setCurrentChannel] = useState(null);
  const channels = usePlaylistStore((s) => s.channels);
  const epgProgrammes = usePlaylistStore((s) => s.epgProgrammes);
  const epgChannels = usePlaylistStore((s) => s.epgChannels);
  const initSettings = useSettingsStore((s) => s.init);
  const zapper = useChannelZapper();

  useEffect(() => { initSettings(); }, [initSettings]);

  const handlePlayChannel = (channel) => {
    setCurrentChannel(channel);
    zapper.zapper(channel);
    setScreen('player');
  };

  const handlePlayerBack = () => {
    setScreen('home');
    setTimeout(() => document.querySelector('[data-focusable]')?.focus(), 100);
  };

  const handleNextChannel = () => {
    const next = zapper.next();
    if (next) setCurrentChannel(next);
  };

  const handlePrevChannel = () => {
    const prev = zapper.prev();
    if (prev) setCurrentChannel(prev);
  };

  const handleEPGBack = () => setScreen('home');
  const handleEPGSelectChannel = (channel) => {
    setCurrentChannel(channel);
    setScreen('player');
  };

  // Player
  if (screen === 'player' && currentChannel) {
    return (
      <TVShell onBack={handlePlayerBack}>
        <VideoPlayer channel={currentChannel} onBack={handlePlayerBack} onNext={handleNextChannel} onPrev={handlePrevChannel} />
      </TVShell>
    );
  }

  // EPG
  if (screen === 'epg') {
    return (
      <TVShell>
        <EPGPage programmes={epgProgrammes} epgChannels={epgChannels} onSelectChannel={handleEPGSelectChannel} onBack={handleEPGBack} />
      </TVShell>
    );
  }

  // Home
  return (
    <TVShell>
      <HomePage onPlayChannel={handlePlayChannel} onGoToEPG={() => setScreen('epg')} />
    </TVShell>
  );
}
