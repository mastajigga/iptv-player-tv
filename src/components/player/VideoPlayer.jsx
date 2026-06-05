// components/player/VideoPlayer.jsx
// Player vidéo HLS pour Samsung TV

import { useEffect, useRef, useState } from 'react';
import { useTVPlayer } from '../../hooks/useTVPlayer';
import { useRemoteNav } from '../../hooks/useRemoteNav';
import { KEY, COLORS, FONT } from '../../utils/constants';
import './VideoPlayer.css';

export default function VideoPlayer({ channel, onBack, onNext, onPrev }) {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    error,
    play,
    pause,
    stop,
    setVolume,
  } = useTVPlayer();

  const uiRef = useRef(null);
  const [showUI, setShowUI] = useState(true);
  const uiTimer = useRef(null);

  // Lancer la lecture
  useEffect(() => {
    if (channel?.url) {
      play(channel.url);
    }
    return () => stop();
  }, [channel?.url]);

  // Masquer l'UI après 5s d'inactivité
  function resetUITimer() {
    setShowUI(true);
    clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => setShowUI(false), 5000);
  }

  // Navigation télécommande
  useRemoteNav({
    [KEY.UP]: () => { onPrev?.(); resetUITimer(); },
    [KEY.DOWN]: () => { onNext?.(); resetUITimer(); },
    [KEY.ENTER]: () => resetUITimer(),
    [KEY.BACK]: () => { stop(); onBack?.(); },
    [KEY.PLAY]: () => play(channel?.url),
    [KEY.PAUSE]: () => pause(),
    [KEY.LEFT]: () => resetUITimer(),
    [KEY.RIGHT]: () => resetUITimer(),
  });

  if (error) {
    return (
      <div className="player-error" style={{ backgroundColor: COLORS.BG_PRIMARY }}>
        <p style={{ fontSize: FONT.LG, color: COLORS.ACCENT }}>Erreur de lecture</p>
        <p style={{ fontSize: FONT.SM, color: COLORS.TEXT_MUTED }}>{error}</p>
        <button data-focusable onClick={() => play(channel?.url)} style={{ fontSize: FONT.MD, marginTop: 24 }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="player-container" onMouseMove={resetUITimer} onKeyDown={resetUITimer}>
      {/* Vidéo plein écran */}
      <video
        ref={videoRef}
        className="player-video"
        autoPlay
        playsInline
        muted={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
        }}
      />

      {/* OSD (info-bar) */}
      {showUI && (
        <div className="player-osd" ref={uiRef}>
          <div className="player-osd__top">
            <span style={{ fontSize: FONT.LG, fontWeight: 'bold' }}>
              {channel?.name || 'Lecture'}
            </span>
          </div>
          <div className="player-osd__bottom">
            <span style={{ fontSize: FONT.SM }}>
              {channel?.group || ''}
            </span>
            {!isNaN(duration) && duration > 0 && (
              <span style={{ fontSize: FONT.SM, marginLeft: 24 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
