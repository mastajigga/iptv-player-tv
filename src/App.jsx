// App.jsx
// Point d'entrée React — Router + Layout TV

import { useState, useEffect, useRef } from 'react';
import TVShell from './components/shell/TVShell';
import VideoPlayer from './components/player/VideoPlayer';
import HeroBanner from './components/tiles/HeroBanner';
import TileRow from './components/tiles/TileRow';
import { usePlaylist } from './hooks/usePlaylist';
import { useRemoteNav } from './hooks/useRemoteNav';
import { KEY, COLORS, FONT } from './utils/constants';
import usePlaylistStore from './stores/playlistStore';
import useSettingsStore from './stores/settingsStore';
import * as storage from './services/storage';

// ============================================================
// Page d'accueil Netflix-like
// ============================================================
function HomePage({ onSelectChannel, onPlayChannel }) {
  const channels = usePlaylistStore((s) => s.channels);
  const groups = usePlaylistStore((s) => s.groups);
  const favorites = usePlaylistStore((s) => s.favorites);
  const loading = usePlaylistStore((s) => s.loading);
  const { addSourceFromURL } = usePlaylist();

  const [heroChannel, setHeroChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const urlInputRef = useRef(null);

  // Charger l'historique
  useEffect(() => {
    storage.getHistory(10).then(setHistory);
  }, []);

  // Définir le hero (première chaîne de l'historique ou première chaîne)
  useEffect(() => {
    if (!heroChannel && channels.length > 0) {
      const lastWatched = history[0];
      const match = lastWatched
        ? channels.find((ch) => ch.id === lastWatched.channelId)
        : null;
      setHeroChannel(match || channels[0]);
    }
  }, [channels, history, heroChannel]);

  // Ajouter une playlist
  const handleAddPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    try {
      await addSourceFromURL(playlistUrl.trim(), 'Ma Playlist');
      setPlaylistUrl('');
      urlInputRef.current?.focus();
    } catch (err) {
      alert('Erreur lors du chargement de la playlist');
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

  // État vide : pas de playlist
  if (!loading && channels.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '80px',
      }}>
        <h1 style={{ fontSize: FONT.XXL, marginBottom: 24, color: COLORS.TEXT_PRIMARY }}>
          IPTV Player
        </h1>
        <p style={{ fontSize: FONT.MD, color: COLORS.TEXT_SECONDARY, marginBottom: 48, textAlign: 'center', maxWidth: 800 }}>
          Ajoutez une playlist M3U pour commencer à regarder vos chaînes.
          <br />
          Collez l'URL de votre playlist ci-dessous.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            ref={urlInputRef}
            data-focusable
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.keyCode === KEY.ENTER) handleAddPlaylist();
            }}
            placeholder="https://exemple.com/playlist.m3u"
            style={{
              padding: '16px 24px',
              fontSize: FONT.SM,
              width: 600,
              backgroundColor: COLORS.BG_ELEVATED,
              color: COLORS.TEXT_PRIMARY,
              border: '2px solid #333',
              borderRadius: 4,
              outline: 'none',
            }}
          />
          <button
            data-focusable
            onClick={handleAddPlaylist}
            style={{
              padding: '16px 32px',
              fontSize: FONT.SM,
              backgroundColor: COLORS.ACCENT,
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Ajouter
          </button>
        </div>
      </div>
    );
  }

  // État loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>
        <p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED }}>
          Chargement...
        </p>
      </div>
    );
  }

  // Construire les rangées
  const favoriteChannels = channels.filter((ch) => favorites.has(ch.id));
  const historyChannels = history
    .map((h) => channels.find((ch) => ch.id === h.channelId))
    .filter(Boolean);

  return (
    <div className="home-page" style={{ overflow: 'hidden' }}>
      {/* Hero Banner */}
      <HeroBanner
        channel={heroChannel}
        channels={channels.slice(0, 5)}
        onPlay={handleHeroPlay}
        onSelectChannel={setHeroChannel}
      />

      {/* Rangées */}
      <div style={{ paddingTop: 8 }}>
        {/* Continuer à regarder (historique) */}
        {historyChannels.length > 0 && (
          <TileRow
            title="Continuer à regarder"
            items={historyChannels}
            onSelect={handleTilePlay}
            showProgress
          />
        )}

        {/* Favoris */}
        {favoriteChannels.length > 0 && (
          <TileRow
            title="⭐ Mes favoris"
            items={favoriteChannels}
            onSelect={handleTilePlay}
          />
        )}

        {/* Groupes */}
        {groups.map((group) => {
          const groupChannels = channels.filter((ch) => ch.group === group);
          if (groupChannels.length === 0) return null;
          return (
            <TileRow
              key={group}
              title={group}
              items={groupChannels}
              onSelect={handleTilePlay}
            />
          );
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
  const { channels } = usePlaylist();
  const initSettings = useSettingsStore((s) => s.init);

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  const handleSelectChannel = (channel) => {
    setCurrentChannel(channel);
  };

  const handlePlayChannel = (channel) => {
    setCurrentChannel(channel);
    setScreen('player');
  };

  const handlePlayerBack = () => {
    setScreen('home');
    setTimeout(() => {
      document.querySelector('[data-focusable]')?.focus();
    }, 100);
  };

  const handleNextChannel = () => {
    if (!currentChannel || channels.length === 0) return;
    const idx = channels.findIndex((ch) => ch.id === currentChannel.id);
    setCurrentChannel(channels[(idx + 1) % channels.length]);
  };

  const handlePrevChannel = () => {
    if (!currentChannel || channels.length === 0) return;
    const idx = channels.findIndex((ch) => ch.id === currentChannel.id);
    setCurrentChannel(channels[(idx - 1 + channels.length) % channels.length]);
  };

  if (screen === 'player' && currentChannel) {
    return (
      <TVShell onBack={handlePlayerBack}>
        <VideoPlayer
          channel={currentChannel}
          onBack={handlePlayerBack}
          onNext={handleNextChannel}
          onPrev={handlePrevChannel}
        />
      </TVShell>
    );
  }

  return (
    <TVShell>
      <HomePage
        onSelectChannel={handleSelectChannel}
        onPlayChannel={handlePlayChannel}
      />
    </TVShell>
  );
}
