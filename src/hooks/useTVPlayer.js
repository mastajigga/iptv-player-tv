// hooks/useTVPlayer.js
// Hook player HLS pour Samsung TV

import { useRef, useState, useCallback, useEffect } from 'react';
import Hls from 'hls.js';

/**
 * Hook player vidéo avec fallback HLS.js
 */
export function useTVPlayer() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [state, setState] = useState({
    isPlaying: false,
    isLive: true,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    error: null,
  });

  // Vérifier si HLS natif est supporté (Tizen 4.0+)
  const hasNativeHLS = useCallback(() => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  }, []);

  const play = useCallback((url) => {
    const video = videoRef.current;
    if (!video) return;

    // Nettoyer l'ancienne instance HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setState((s) => ({ ...s, error: null }));

    if (hasNativeHLS()) {
      // HLS natif (Tizen)
      video.src = url;
      video.play().catch((err) => {
        console.warn('Native HLS failed, falling back to HLS.js:', err);
        playWithHLSjs(url);
      });
    } else {
      // Fallback HLS.js
      playWithHLSjs(url);
    }

    function playWithHLSjs(streamUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          liveSyncDurationCount: 3,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => setState((s) => ({ ...s, error: e.message })));
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setState((s) => ({ ...s, error: data.details }));
          }
        });
        hlsRef.current = hls;
      } else {
        // Fallback ultime : lecture directe
        video.src = streamUrl;
        video.play().catch((e) => setState((s) => ({ ...s, error: e.message })));
      }
    }

    setState((s) => ({ ...s, isPlaying: true }));
  }, [hasNativeHLS]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const seek = useCallback((seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += seconds;
    }
  }, []);

  const setVolume = useCallback((vol) => {
    const video = videoRef.current;
    if (video) {
      video.volume = Math.max(0, Math.min(1, vol));
      video.muted = vol === 0;
    }
  }, []);

  // Mettre à jour currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setState((s) => ({
        ...s,
        currentTime: video.currentTime,
        duration: video.duration || 0,
        buffered: video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0,
      }));
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  return {
    videoRef,
    ...state,
    play,
    pause,
    stop,
    seek,
    setVolume,
  };
}
