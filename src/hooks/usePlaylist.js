// hooks/usePlaylist.js
// Gestion des playlists M3U et favoris

import { useState, useCallback, useEffect } from 'react';
import { parseM3U, extractGroups } from '../services/m3u-parser';
import * as storage from '../services/storage';

export function usePlaylist() {
  const [sources, setSources] = useState([]);
  const [channels, setChannels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    async function init() {
      try {
        const [storedPlaylists, storedFavorites] = await Promise.all([
          storage.getPlaylists(),
          storage.getFavorites(),
        ]);

        if (storedPlaylists.length > 0) {
          setSources(storedPlaylists);

          // Parser les playlists stockées
          const allChannels = [];
          for (const pl of storedPlaylists) {
            const parsed = parseM3U(pl.content, pl.id);
            allChannels.push(...parsed);
          }
          setChannels(allChannels);
          setGroups(extractGroups(allChannels));
        }

        setFavorites(new Set(storedFavorites));
      } catch (err) {
        console.error('Failed to load playlists:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Ajouter une playlist via URL
  const addSourceFromURL = useCallback(async (url, label = 'Playlist') => {
    try {
      const response = await fetch(url);
      const content = await response.text();
      const id = `source_${Date.now()}`;
      const playlist = { id, type: 'm3u', url, label, content };

      await storage.savePlaylist(playlist);
      setSources((prev) => [...prev, playlist]);

      const parsed = parseM3U(content, id);
      setChannels((prev) => {
        const updated = [...prev, ...parsed];
        setGroups(extractGroups(updated));
        return updated;
      });
    } catch (err) {
      console.error('Failed to add playlist:', err);
      throw err;
    }
  }, []);

  // Ajouter une playlist via texte brut
  const addSourceFromText = useCallback(async (content, label = 'Playlist locale') => {
    const id = `source_${Date.now()}`;
    const playlist = { id, type: 'm3u', label, content };

    await storage.savePlaylist(playlist);
    setSources((prev) => [...prev, playlist]);

    const parsed = parseM3U(content, id);
    setChannels((prev) => {
      const updated = [...prev, ...parsed];
      setGroups(extractGroups(updated));
      return updated;
    });
  }, []);

  // Supprimer une source
  const removeSource = useCallback(async (id) => {
    await storage.deletePlaylist(id);
    setSources((prev) => prev.filter((s) => s.id !== id));
    setChannels((prev) => {
      const updated = prev.filter((ch) => ch.sourceId !== id);
      setGroups(extractGroups(updated));
      return updated;
    });
  }, []);

  // Toggle favori
  const toggleFavorite = useCallback(async (channelId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
        storage.removeFavorite(channelId);
      } else {
        next.add(channelId);
        storage.addFavorite(channelId);
      }
      return next;
    });
  }, []);

  // Rechercher par nom
  const search = useCallback((query) => {
    if (!query.trim()) return channels;
    const q = query.toLowerCase();
    return channels.filter((ch) => ch.name.toLowerCase().includes(q));
  }, [channels]);

  // Rafraîchir une playlist (re-fetch depuis URL)
  const refresh = useCallback(async (sourceId) => {
    const source = sources.find((s) => s.id === sourceId);
    if (!source || !source.url) return;

    try {
      const response = await fetch(source.url);
      const content = await response.text();
      const updatedPlaylist = { ...source, content };

      await storage.savePlaylist(updatedPlaylist);
      setSources((prev) => prev.map((s) => (s.id === sourceId ? updatedPlaylist : s)));
      setChannels((prev) => {
        const withoutOld = prev.filter((ch) => ch.sourceId !== sourceId);
        const parsed = parseM3U(content, sourceId);
        const updated = [...withoutOld, ...parsed];
        setGroups(extractGroups(updated));
        return updated;
      });
    } catch (err) {
      console.error('Failed to refresh playlist:', err);
    }
  }, [sources]);

  return {
    sources,
    channels,
    groups,
    favorites,
    loading,
    addSourceFromURL,
    addSourceFromText,
    removeSource,
    toggleFavorite,
    search,
    refresh,
  };
}
