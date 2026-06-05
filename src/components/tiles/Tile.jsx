// components/tiles/Tile.jsx
// Tuile individuelle avec effet zoom Netflix au focus

import { useRef, memo } from 'react';
import { TILE, COLORS, FONT, KEY } from '../../utils/constants';
import './Tile.css';

const Tile = memo(function Tile({ item, index, onSelect, onFocus }) {
  const tileRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.keyCode === KEY.ENTER) {
      e.preventDefault();
      onSelect?.(item);
    }
  };

  const handleFocus = () => {
    onFocus?.(item, index);
  };

  return (
    <div
      ref={tileRef}
      className="tile"
      data-focusable
      tabIndex={0}
      onClick={() => onSelect?.(item)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      style={{ width: TILE.WIDTH }}
    >
      {/* Poster */}
      <div className="tile__poster">
        {item.logo ? (
          <img src={item.logo} alt={item.name} loading="lazy" />
        ) : (
          <div className="tile__placeholder">
            <span>{item.name?.charAt(0) || '?'}</span>
          </div>
        )}

        {/* Overlay au focus : infos supplémentaires */}
        <div className="tile__overlay">
          <span className="tile__play-icon">▶</span>
        </div>

        {/* Barre de progression (historique) */}
        {item.progress > 0 && (
          <div className="tile__progress-bar">
            <div
              className="tile__progress-fill"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Nom de la chaîne */}
      <span className="tile__name">{item.name}</span>

      {/* Groupe (badge) */}
      {item.group && (
        <span className="tile__group">{item.group}</span>
      )}
    </div>
  );
});

export default Tile;
