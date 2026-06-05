// components/shell/TVShell.jsx
// Layout principal de l'app TV

import { useRef, useEffect } from 'react';
import { useRemoteNav } from '../../hooks/useRemoteNav';
import { KEY, COLORS } from '../../utils/constants';
import './TVShell.css';

export default function TVShell({ children, onBack }) {
  const shellRef = useRef(null);

  // Navigation globale
  useRemoteNav({
    [KEY.BACK]: () => {
      onBack?.();
    },
  });

  // Focus initial sur le premier élément focusable
  useEffect(() => {
    const firstFocusable = shellRef.current?.querySelector('[data-focusable]');
    firstFocusable?.focus();
  }, []);

  return (
    <div
      ref={shellRef}
      className="tv-shell"
      style={{
        width: '1920px',
        height: '1080px',
        backgroundColor: COLORS.BG_PRIMARY,
        color: COLORS.TEXT_PRIMARY,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </div>
  );
}
