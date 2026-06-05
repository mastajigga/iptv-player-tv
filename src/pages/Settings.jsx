// pages/Settings.jsx
// Paramètres de l'application

import { useState } from 'react';
import { useRemoteNav } from '../hooks/useRemoteNav';
import { KEY, COLORS, FONT } from '../utils/constants';
import useSettingsStore from '../stores/settingsStore';
import useProfileStore from '../stores/profileStore';
import './Settings.css';

export default function SettingsPage({ onBack }) {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const addProfile = useProfileStore((s) => s.addProfile);
  const removeProfile = useProfileStore((s) => s.removeProfile);
  const setPin = useProfileStore((s) => s.setPin);
  const [section, setSection] = useState('general');
  const [newProfileName, setNewProfileName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinProfileId, setPinProfileId] = useState(null);
  const [showPinInput, setShowPinInput] = useState(false);

  useRemoteNav({
    [KEY.BACK]: () => onBack?.(),
    [KEY.RED]: () => setSection('general'),
    [KEY.GREEN]: () => setSection('profiles'),
    [KEY.YELLOW]: () => setSection('parental'),
  });

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Paramètres</h1>
        <div className="settings-tabs">
          <button data-focusable className={`settings-tab ${section === 'general' ? 'settings-tab--active' : ''}`}
            onClick={() => setSection('general')}>🔴 Affichage</button>
          <button data-focusable className={`settings-tab ${section === 'profiles' ? 'settings-tab--active' : ''}`}
            onClick={() => setSection('profiles')}>🟢 Profils</button>
          <button data-focusable className={`settings-tab ${section === 'parental' ? 'settings-tab--active' : ''}`}
            onClick={() => setSection('parental')}>🟡 Contrôle parental</button>
        </div>
        <span className="settings-keys">🔴🟢🟡 pour naviguer</span>
      </div>

      <div className="settings-body">
        {/* --- Affichage --- */}
        {section === 'general' && (
          <div className="settings-section">
            <SettingRow label="Thème" value={settings.theme === 'dark' ? 'Sombre' : 'OLED Black'}
              onLeft={() => updateSetting('theme', 'dark')}
              onRight={() => updateSetting('theme', 'oled')} />
            <SettingRow label="Taille du texte" value={settings.fontSize === 'small' ? 'Petit' : settings.fontSize === 'large' ? 'Grand' : 'Moyen'}
              onLeft={() => updateSetting('fontSize', settings.fontSize === 'medium' ? 'small' : 'medium')}
              onRight={() => updateSetting('fontSize', settings.fontSize === 'medium' ? 'large' : 'medium')} />
            <SettingRow label="Lecture auto Hero" value={settings.autoPlayHero ? 'Oui' : 'Non'}>
              <button data-focusable className="settings-toggle" onClick={() => updateSetting('autoPlayHero', !settings.autoPlayHero)}>
                {settings.autoPlayHero ? '✅' : '⬜'}
              </button>
            </SettingRow>
            <SettingRow label="Volume par défaut" value={`${Math.round(settings.defaultVolume * 100)}%`} />
            <SettingRow label="Jours EPG" value={`${settings.epgDaysToShow} jours`}
              onLeft={() => updateSetting('epgDaysToShow', Math.max(1, settings.epgDaysToShow - 1))}
              onRight={() => updateSetting('epgDaysToShow', Math.min(7, settings.epgDaysToShow + 1))} />
          </div>
        )}

        {/* --- Profils --- */}
        {section === 'profiles' && (
          <div className="settings-section">
            <h2 style={{ fontSize: FONT.LG, marginBottom: 24 }}>Profils ({profiles.length}/5)</h2>
            {profiles.map((p) => (
              <div key={p.id} className="settings-profile-row" data-focusable tabIndex={0}>
                <span style={{ fontSize: 36 }}>{p.avatar}</span>
                <span style={{ fontSize: FONT.MD, flex: 1 }}>{p.name} {p.id === activeProfileId ? '(actif)' : ''}</span>
                {p.isKid && <span style={{ fontSize: FONT.SM, color: '#f5c518' }}>👶 Enfant</span>}
                {p.pin && <span style={{ fontSize: FONT.SM }}>🔒 PIN</span>}
                {p.id !== 'default' && (
                  <button data-focusable className="settings-btn-sm" onClick={() => removeProfile(p.id)}>
                    Supprimer
                  </button>
                )}
              </div>
            ))}
            {profiles.length < 5 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <input data-focusable value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Nom du profil" style={{ padding: '12px 16px', fontSize: FONT.SM, backgroundColor: COLORS.BG_ELEVATED, color: COLORS.TEXT_PRIMARY, border: '1px solid #333', borderRadius: 4, width: 300 }} />
                <button data-focusable className="settings-btn" onClick={() => { addProfile(newProfileName); setNewProfileName(''); }}>
                  + Ajouter
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- Contrôle parental --- */}
        {section === 'parental' && (
          <div className="settings-section">
            <h2 style={{ fontSize: FONT.LG, marginBottom: 24 }}>Contrôle parental</h2>
            <SettingRow label="Chaînes adultes" value={settings.showAdultContent ? 'Visibles' : 'Masquées'}>
              <button data-focusable className="settings-toggle" onClick={() => updateSetting('showAdultContent', !settings.showAdultContent)}>
                {settings.showAdultContent ? '✅' : '⬜'}
              </button>
            </SettingRow>

            <h3 style={{ fontSize: FONT.MD, marginTop: 32, marginBottom: 16 }}>Code PIN par profil</h3>
            {profiles.map((p) => (
              <div key={p.id} className="settings-profile-row" data-focusable tabIndex={0}>
                <span style={{ fontSize: 36 }}>{p.avatar}</span>
                <span style={{ fontSize: FONT.MD, flex: 1 }}>{p.name}</span>
                {pinProfileId === p.id && showPinInput ? (
                  <>
                    <input data-focusable value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000" maxLength={4}
                      style={{ padding: '8px 12px', fontSize: FONT.SM, width: 100, backgroundColor: COLORS.BG_ELEVATED, color: COLORS.TEXT_PRIMARY, border: '1px solid #333', borderRadius: 4 }} />
                    <button data-focusable className="settings-btn-sm" onClick={() => { setPin(p.id, newPin || null); setShowPinInput(false); setNewPin(''); }}>
                      OK
                    </button>
                  </>
                ) : (
                  <button data-focusable className="settings-btn-sm" onClick={() => { setPinProfileId(p.id); setShowPinInput(true); setNewPin(p.pin || ''); }}>
                    {p.pin ? 'Modifier PIN' : 'Définir PIN'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Ligne de paramètre réutilisable
function SettingRow({ label, value, children, onLeft, onRight }) {
  return (
    <div className="settings-row" data-focusable tabIndex={0}>
      <span className="settings-row__label">{label}</span>
      <div className="settings-row__value">
        {onLeft && <button data-focusable className="settings-arrow" onClick={onLeft}>‹</button>}
        <span>{value}</span>
        {onRight && <button data-focusable className="settings-arrow" onClick={onRight}>›</button>}
        {children}
      </div>
    </div>
  );
}
