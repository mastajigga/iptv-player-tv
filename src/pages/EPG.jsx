// pages/EPG.jsx
// Guide des programmes (EPG Grid) — Netflix TV Guide style

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRemoteNav } from '../hooks/useRemoteNav';
import { buildEPGGrid, formatEPGTime, formatDuration } from '../services/epg-parser';
import { KEY, COLORS, FONT } from '../utils/constants';
import usePlaylistStore from '../stores/playlistStore';
import './EPG.css';

export default function EPGPage({ programmes = [], epgChannels = [], onSelectChannel, onBack }) {
  const channels = usePlaylistStore((s) => s.channels);
  const [hoursRange, setHoursRange] = useState(4);
  const gridRef = useRef(null);

  // Filtrer les chaînes qui ont un EPG
  const channelsWithEPG = useMemo(() => {
    if (epgChannels.length > 0) return epgChannels;
    return channels.slice(0, 15).map((ch) => ({
      id: ch.id,
      name: ch.name,
      logo: ch.logo,
    }));
  }, [channels, epgChannels]);

  // Construire la grille
  const grid = useMemo(() => {
    return buildEPGGrid(programmes, channelsWithEPG, hoursRange);
  }, [programmes, channelsWithEPG, hoursRange]);

  // Navigation
  useRemoteNav({
    [KEY.BACK]: () => onBack?.(),
    [KEY.LEFT]: () => setHoursRange((h) => Math.max(2, h - 1)),
    [KEY.RIGHT]: () => setHoursRange((h) => Math.min(8, h + 1)),
  });

  const now = new Date();
  const nowLabel = formatEPGTime(now);

  return (
    <div className="epg-page" ref={gridRef}>
      {/* Header */}
      <div className="epg-header">
        <h1 className="epg-title">Guide TV</h1>
        <div className="epg-controls">
          <button
            data-focusable
            className="epg-btn"
            onClick={() => setHoursRange((h) => Math.max(2, h - 1))}
          >
            ‹ Moins
          </button>
          <span className="epg-range-label">{hoursRange}h</span>
          <button
            data-focusable
            className="epg-btn"
            onClick={() => setHoursRange((h) => Math.min(8, h + 1))}
          >
            Plus ›
          </button>
        </div>
        <span className="epg-now">{nowLabel}</span>
      </div>

      {/* Grille EPG */}
      <div className="epg-grid">
        {/* Colonne des chaînes (fixe) */}
        <div className="epg-channels-col">
          <div className="epg-channel-header" />
          {channelsWithEPG.map((ch) => (
            <div
              key={ch.id}
              className="epg-channel-cell"
              data-focusable
              tabIndex={0}
              onClick={() => onSelectChannel?.(channels.find((c) => c.id === ch.id) || ch)}
            >
              {ch.logo && <img className="epg-channel-logo" src={ch.logo} alt="" />}
              <span className="epg-channel-name">{ch.name}</span>
            </div>
          ))}
        </div>

        {/* Colonnes horaires (scrollable) */}
        <div className="epg-slots-scroll">
          <div className="epg-slots-container">
            {/* Ligne des heures */}
            <div className="epg-hours-row">
              {grid.slots.map((slot, i) => (
                <div key={i} className="epg-hour-cell" style={{ width: 200 }}>
                  <span className={slot.label === nowLabel ? 'epg-hour-now' : ''}>
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Lignes des programmes */}
            {channelsWithEPG.map((ch) => (
              <div key={ch.id} className="epg-program-row">
                {grid.slots.map((slot, i) => {
                  const prog = slot.programmes[ch.id];
                  if (!prog) {
                    return <div key={i} className="epg-empty-slot" style={{ width: 200 }} />;
                  }
                  if (!prog.isStart) return null; // Éviter les doublons

                  const width = (prog.colspan || 1) * 200;
                  return (
                    <div
                      key={i}
                      className={`epg-program-slot ${prog.live ? 'epg-program-live' : ''}`}
                      style={{ width }}
                      data-focusable
                      tabIndex={0}
                      title={`${prog.title}\n${prog.desc || ''}\n${formatEPGTime(prog.start)} - ${formatEPGTime(prog.stop)}`}
                    >
                      <span className="epg-program-time">
                        {formatEPGTime(prog.start)}
                      </span>
                      <span className="epg-program-title">{prog.title}</span>
                      <span className="epg-program-duration">
                        {formatDuration(prog.start, prog.stop)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="epg-legend">
        <span className="epg-legend-dot epg-legend-dot--live" /> En direct
        <span className="epg-legend-dot" /> Programme
      </div>
    </div>
  );
}
