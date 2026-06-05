// components/tiles/HeroBanner.jsx
// Hero Banner Netflix-like avec lecture automatique

import { useState, useEffect, useRef } from 'react';
import { KEY, COLORS, FONT } from '../../utils/constants';
import './HeroBanner.css';

const HERO_IMAGES = [
  // Dégradés abstraits pour les chaînes sans poster
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #141e30, #243b55)',
];

export default function HeroBanner({ channel, onPlay, onSelectChannel, channels = [] }) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const heroRef = useRef(null);

  // Background dynamique avec fallback
  const backgroundStyle = channel?.logo
    ? {
        backgroundImage: `url(${channel.logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bgLoaded ? 1 : 0,
        transition: 'opacity 1s ease',
      }
    : {
        background: HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)],
        opacity: 1,
      };

  // Précharger l'image de fond
  useEffect(() => {
    if (channel?.logo) {
      const img = new Image();
      img.onload = () => setBgLoaded(true);
      img.src = channel.logo;
    } else {
      setBgLoaded(true);
    }
  }, [channel?.logo]);

  // Rotation automatique des chaînes (toutes les 8s)
  useEffect(() => {
    if (channels.length < 2) return;
    let idx = channels.indexOf(channel);
    const interval = setInterval(() => {
      idx = (idx + 1) % channels.length;
      onSelectChannel?.(channels[idx]);
    }, 8000);
    return () => clearInterval(interval);
  }, [channel, channels, onSelectChannel]);

  return (
    <div ref={heroRef} className="hero-banner" data-focusable tabIndex={0}>
      {/* Fond animé */}
      <div className="hero-banner__bg" style={backgroundStyle}>
        {/* Effet de parallaxe subtil au focus */}
      </div>

      {/* Dégradé inférieur pour lisibilité */}
      <div className="hero-banner__gradient-bottom" />

      {/* Dégradé latéral gauche */}
      <div className="hero-banner__gradient-left" />

      {/* Contenu */}
      <div className="hero-banner__content">
        {/* Logo de la chaîne (si disponible) */}
        {channel?.logo && (
          <img
            className="hero-banner__logo"
            src={channel.logo}
            alt={channel.name}
          />
        )}

        {/* Nom de la chaîne */}
        <h1 className="hero-banner__title">
          {channel?.name || 'IPTV Player'}
        </h1>

        {/* Méta */}
        <div className="hero-banner__meta">
          {channel?.group && (
            <span className="hero-banner__badge">{channel.group}</span>
          )}
          {channel?.currentProgram && (
            <span className="hero-banner__program">
              En direct : {channel.currentProgram}
            </span>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="hero-banner__actions">
          <button
            className="hero-banner__btn hero-banner__btn--play"
            data-focusable
            onClick={() => onPlay?.(channel)}
          >
            <span className="hero-banner__btn-icon">▶</span>
            Regarder
          </button>

          <button
            className="hero-banner__btn hero-banner__btn--info"
            data-focusable
            onClick={() => onSelectChannel?.(channel)}
          >
            <span className="hero-banner__btn-icon">ℹ</span>
            Plus d'infos
          </button>
        </div>
      </div>

      {/* Indicateur de rotation (dots) */}
      {channels.length > 1 && (
        <div className="hero-banner__dots">
          {channels.slice(0, 5).map((ch, i) => (
            <div
              key={ch.id}
              className={`hero-banner__dot ${ch.id === channel?.id ? 'hero-banner__dot--active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
