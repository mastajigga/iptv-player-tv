// pages/Search.jsx
// Recherche de chaînes et programmes EPG

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRemoteNav } from '../hooks/useRemoteNav';
import { KEY, COLORS, FONT, TILE } from '../utils/constants';
import usePlaylistStore from '../stores/playlistStore';
import Tile from '../components/tiles/Tile';
import './Search.css';

export default function SearchPage({ onSelectChannel, onBack }) {
  const channels = usePlaylistStore((s) => s.channels);
  const epgProgrammes = usePlaylistStore((s) => s.epgProgrammes);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('channels'); // 'channels' | 'epg'
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Recherche canaux
  const channelResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return channels
      .filter((ch) => ch.name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query, channels]);

  // Recherche EPG
  const epgResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return epgProgrammes
      .filter((p) => p.title?.toLowerCase().includes(q))
      .slice(0, 20)
      .map((p) => ({
        ...p,
        channelName: channels.find((ch) => ch.id === p.channelId)?.name || 'Inconnu',
      }));
  }, [query, epgProgrammes, channels]);

  const handleInput = (e) => {
    // Sur TV, on construit la query caractère par caractère
    const char = String.fromCharCode(e.keyCode);
    if (/[a-zA-Z0-9 ]/.test(char)) {
      setQuery((q) => q + char);
    }
  };

  useRemoteNav({
    [KEY.BACK]: () => onBack?.(),
    [KEY.RED]: () => setMode('channels'),
    [KEY.GREEN]: () => setMode('epg'),
  });

  return (
    <div className="search-page" onKeyDown={handleInput}>
      {/* Barre de recherche */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          data-focusable
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une chaîne ou un programme..."
          autoComplete="off"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          >
            ✕
          </button>
        )}
        <div className="search-mode-tabs">
          <button
            data-focusable
            className={`search-mode-btn ${mode === 'channels' ? 'search-mode-btn--active' : ''}`}
            onClick={() => setMode('channels')}
          >
            🔴 Chaînes ({channelResults.length})
          </button>
          <button
            data-focusable
            className={`search-mode-btn ${mode === 'epg' ? 'search-mode-btn--active' : ''}`}
            onClick={() => setMode('epg')}
          >
            🟢 Programmes ({epgResults.length})
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="search-results" ref={resultsRef}>
        {!query.trim() ? (
          <div className="search-hint">
            <p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED }}>
              Tapez pour rechercher...
            </p>
            <p style={{ fontSize: FONT.SM, color: COLORS.TEXT_MUTED, marginTop: 12 }}>
              🔴 Chaînes — 🟢 Programmes EPG — 🔙 Retour
            </p>
          </div>
        ) : mode === 'channels' ? (
          channelResults.length === 0 ? (
            <p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED, padding: 80 }}>
              Aucune chaîne trouvée pour « {query} »
            </p>
          ) : (
            <div className="search-grid">
              {channelResults.map((ch, i) => (
                <Tile
                  key={ch.id}
                  item={ch}
                  index={i}
                  onSelect={() => onSelectChannel?.(ch)}
                />
              ))}
            </div>
          )
        ) : (
          epgResults.length === 0 ? (
            <p style={{ fontSize: FONT.LG, color: COLORS.TEXT_MUTED, padding: 80 }}>
              Aucun programme trouvé pour « {query} »
            </p>
          ) : (
            <div className="search-epg-list">
              {epgResults.map((prog, i) => (
                <div
                  key={`${prog.channelId}_${prog.start?.getTime()}_${i}`}
                  className="search-epg-item"
                  data-focusable
                  tabIndex={0}
                  onClick={() => {
                    const ch = channels.find((c) => c.id === prog.channelId);
                    if (ch) onSelectChannel?.(ch);
                  }}
                >
                  <span className="search-epg-time">
                    {prog.start?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="search-epg-title">{prog.title}</span>
                  <span className="search-epg-channel">{prog.channelName}</span>
                  {prog.live && <span className="search-epg-live">🔴 Direct</span>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
