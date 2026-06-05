// App.jsx
// Root — Navigation 5 écrans + Profils

import { useState, useEffect, useRef } from 'react';
import TVShell from './components/shell/TVShell';
import VideoPlayer from './components/player/VideoPlayer';
import ProfilePicker from './components/shell/ProfilePicker';
import HeroBanner from './components/tiles/HeroBanner';
import TileRow from './components/tiles/TileRow';
import EPGPage from './pages/EPG';
import SearchPage from './pages/Search';
import SettingsPage from './pages/Settings';
import { usePlaylist } from './hooks/usePlaylist';
import { useChannelZapper } from './hooks/useChannelZapper';
import { useRemoteNav } from './hooks/useRemoteNav';
import { KEY, COLORS, FONT } from './utils/constants';
import usePlaylistStore from './stores/playlistStore';
import useSettingsStore from './stores/settingsStore';
import useProfileStore from './stores/profileStore';
import * as storage from './services/storage';

// ============================================================
// HomePage
// ============================================================
function HomePage({ onSelectChannel, onPlayChannel, onGoToPage }) {
  const channels = usePlaylistStore((s) => s.channels);
  const groups = usePlaylistStore((s) => s.groups);
  const favorites = usePlaylistStore((s) => s.favorites);
  const customGroups = usePlaylistStore((s) => s.customGroups);
  const loading = usePlaylistStore((s) => s.loading);
  const { addSourceFromURL } = usePlaylist();

  const [heroChannel, setHeroChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const urlInputRef = useRef(null);

  useEffect(() => { storage.getHistory(10).then(setHistory); }, []);
  useEffect(() => {
    if (!heroChannel && channels.length > 0) setHeroChannel(channels[0]);
  }, [channels, heroChannel]);

  // Touches couleur = navigation globale
  useRemoteNav({
    [KEY.RED]: () => onGoToPage?.('search'),
    [KEY.GREEN]: () => onGoToPage?.('epg'),
    [KEY.YELLOW]: () => onGoToPage?.('settings'),
    [KEY.BLUE]: () => useProfileStore.getState().openProfilePicker(),
  });

  const handleAddPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    try { await addSourceFromURL(playlistUrl.trim(), 'Ma Playlist'); setPlaylistUrl(''); }
    catch (err) { console.error('Erreur playlist:', err); }
  };

  const handlePlay = (channel) => {
    storage.addToHistory({ channelId: channel.id, channelName: channel.name });
    onPlayChannel?.(channel);
  };

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
        <div className="home-hints" style={{ marginTop: 64, display: 'flex', gap: 24, fontSize: FONT.SM, color: '#444' }}>
          <span>🔴 Recherche</span><span>🟢 Guide TV</span><span>🟡 Paramètres</span><span>🔵 Profils</span>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED }}>Chargement...</p></div>;

  const favoriteChannels = channels.filter((ch) => favorites.has(ch.id));
  const historyChannels = history.map((h) => channels.find((ch) => ch.id === h.channelId)).filter(Boolean);
  const allGroups = [...groups, ...customGroups.map((g) => g.name)];

  return (
    <div style={{ overflow: 'hidden' }}>
      <HeroBanner channel={heroChannel} channels={channels.slice(0, 5)} onPlay={handlePlay} onSelectChannel={setHeroChannel} />
      <div style={{ paddingTop: 8 }}>
        {historyChannels.length > 0 && <TileRow title="Continuer à regarder" items={historyChannels} onSelect={handlePlay} showProgress />}
        {favoriteChannels.length > 0 && <TileRow title="⭐ Mes favoris" items={favoriteChannels} onSelect={handlePlay} />}
        {allGroups.map((group) => {
          const groupChannels = channels.filter((ch) => ch.group === group);
          if (groupChannels.length === 0) return null;
          return <TileRow key={group} title={group} items={groupChannels} onSelect={handlePlay} />;
        })}
      </div>
    </div>
  );
}

// ============================================================
// App Root
// ============================================================
export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentChannel, setCurrentChannel] = useState(null);
  const channels = usePlaylistStore((s) => s.channels);
  const epgProgrammes = usePlaylistStore((s) => s.epgProgrammes);
  const epgChannels = usePlaylistStore((s) => s.epgChannels);
  const initSettings = useSettingsStore((s) => s.init);
  const initProfiles = useProfileStore((s) => s.init);
  const showProfilePicker = useProfileStore((s) => s.showProfilePicker);
  const closeProfilePicker = useProfileStore((s) => s.closeProfilePicker);
  const zapper = useChannelZapper();

  useEffect(() => { initSettings(); initProfiles(); }, []);

  const navigateTo = (s) => {
    setScreen(s);
    setTimeout(() => document.querySelector('[data-focusable]')?.focus(), 100);
  };

  const handlePlayChannel = (ch) => { setCurrentChannel(ch); zapper.zapper(ch); setScreen('player'); };
  const handleNext = () => { const n = zapper.next(); if (n) setCurrentChannel(n); };
  const handlePrev = () => { const p = zapper.prev(); if (p) setCurrentChannel(p); };

  // Profile picker overlay
  if (showProfilePicker) {
    return (
      <TVShell>
        <ProfilePicker onClose={closeProfilePicker} />
      </TVShell>
    );
  }

  // Player
  if (screen === 'player' && currentChannel) {
    return (
      <TVShell onBack={() => navigateTo('home')}>
        <VideoPlayer channel={currentChannel} onBack={() => navigateTo('home')} onNext={handleNext} onPrev={handlePrev} />
      </TVShell>
    );
  }

  // EPG
  if (screen === 'epg') {
    return (
      <TVShell>
        <EPGPage programmes={epgProgrammes} epgChannels={epgChannels} onSelectChannel={handlePlayChannel} onBack={() => navigateTo('home')} />
      </TVShell>
    );
  }

  // Search
  if (screen === 'search') {
    return (
      <TVShell>
        <SearchPage onSelectChannel={handlePlayChannel} onBack={() => navigateTo('home')} />
      </TVShell>
    );
  }

  // Settings
  if (screen === 'settings') {
    return (
      <TVShell>
        <SettingsPage onBack={() => navigateTo('home')} />
      </TVShell>
    );
  }

  // Home
  return (
    <TVShell>
      <HomePage onPlayChannel={handlePlayChannel} onGoToPage={navigateTo} />
    </TVShell>
  );
}
