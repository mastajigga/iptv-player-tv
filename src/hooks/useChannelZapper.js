// hooks/useChannelZapper.js
// Navigation rapide entre chaînes + historique

import { useCallback, useRef } from 'react';
import usePlaylistStore from '../stores/playlistStore';
import * as storage from '../services/storage';

export function useChannelZapper() {
  const channels = usePlaylistStore((s) => s.channels);
  const historyRef = useRef([]);
  const currentIdx = useRef(-1);

  const zapper = useCallback((channel) => {
    const idx = channels.findIndex((ch) => ch.id === channel?.id);
    currentIdx.current = idx;

    // Ajouter à l'historique
    if (channel) {
      historyRef.current = [
        channel,
        ...historyRef.current.filter((h) => h.id !== channel.id),
      ].slice(0, 20);
      storage.addToHistory({ channelId: channel.id, channelName: channel.name });
    }

    return idx;
  }, [channels]);

  const next = useCallback(() => {
    if (channels.length === 0) return null;
    const idx = (currentIdx.current + 1) % channels.length;
    currentIdx.current = idx;
    const ch = channels[idx];
    storage.addToHistory({ channelId: ch.id, channelName: ch.name });
    return ch;
  }, [channels]);

  const prev = useCallback(() => {
    if (channels.length === 0) return null;
    const idx = (currentIdx.current - 1 + channels.length) % channels.length;
    currentIdx.current = idx;
    const ch = channels[idx];
    storage.addToHistory({ channelId: ch.id, channelName: ch.name });
    return ch;
  }, [channels]);

  const goTo = useCallback((index) => {
    if (index < 0 || index >= channels.length) return null;
    currentIdx.current = index;
    const ch = channels[index];
    storage.addToHistory({ channelId: ch.id, channelName: ch.name });
    return ch;
  }, [channels]);

  const getHistory = useCallback(() => historyRef.current, []);

  return {
    currentIndex: currentIdx.current,
    channels,
    zapper,
    next,
    prev,
    goTo,
    getHistory,
  };
}
