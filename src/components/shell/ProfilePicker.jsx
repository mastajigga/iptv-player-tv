// components/shell/ProfilePicker.jsx
// Sélecteur de profil Netflix-like

import { useState } from 'react';
import { KEY, COLORS, FONT } from '../../utils/constants';
import { useRemoteNav } from '../../hooks/useRemoteNav';
import useProfileStore from '../../stores/profileStore';
import './ProfilePicker.css';

export default function ProfilePicker({ onClose }) {
  const profiles = useProfileStore((s) => s.profiles);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const verifyPin = useProfileStore((s) => s.verifyPin);
  const [pinProfile, setPinProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useRemoteNav({
    [KEY.BACK]: () => {
      if (pinProfile) {
        setPinProfile(null);
        setPin('');
        setError('');
      } else {
        onClose?.();
      }
    },
  });

  const handleSelect = async (profile) => {
    const result = await setActiveProfile(profile.id);
    if (result === 'pin_required') {
      setPinProfile(profile);
      setPin('');
      setError('');
    } else if (result) {
      onClose?.();
    }
  };

  const handlePinSubmit = async () => {
    if (!pinProfile || pin.length < 4) return;
    const ok = await verifyPin(pinProfile.id, pin);
    if (ok) {
      onClose?.();
    } else {
      setError('Code incorrect');
      setPin('');
    }
  };

  const handlePinKey = (e) => {
    if (e.keyCode >= KEY.DIGIT_0 && e.keyCode <= KEY.DIGIT_9 && pin.length < 4) {
      setPin((p) => p + String(e.keyCode - 48));
    } else if (e.keyCode === KEY.BACK && pin.length > 0) {
      setPin((p) => p.slice(0, -1));
    } else if (e.keyCode === KEY.ENTER && pin.length === 4) {
      handlePinSubmit();
    }
  };

  // Écran PIN
  if (pinProfile) {
    return (
      <div className="profile-picker" onKeyDown={handlePinKey}>
        <div className="profile-picker__pin">
          <h2 style={{ fontSize: FONT.XL, marginBottom: 24 }}>
            Code PIN — {pinProfile.name}
          </h2>
          <div className="profile-pin-dots">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`profile-pin-dot ${pin.length > i ? 'profile-pin-dot--filled' : ''}`} />
            ))}
          </div>
          {error && <p className="profile-pin-error">{error}</p>}
          <p style={{ fontSize: FONT.SM, color: COLORS.TEXT_MUTED, marginTop: 16 }}>
            Tapez votre code PIN à 4 chiffres
          </p>
        </div>
      </div>
    );
  }

  // Écran sélection
  return (
    <div className="profile-picker">
      <h1 className="profile-picker__title">Qui regarde ?</h1>
      <div className="profile-picker__list">
        {profiles.map((profile, i) => (
          <div
            key={profile.id}
            className="profile-card"
            data-focusable
            tabIndex={0}
            onClick={() => handleSelect(profile)}
            onKeyDown={(e) => {
              if (e.keyCode === KEY.ENTER) handleSelect(profile);
            }}
          >
            <div
              className="profile-card__avatar"
              style={{ backgroundColor: profile.color }}
            >
              <span>{profile.avatar}</span>
              {profile.pin && <span className="profile-card__lock">🔒</span>}
            </div>
            <span className="profile-card__name">{profile.name}</span>
            {profile.isKid && <span className="profile-card__kid">👶 Enfant</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
