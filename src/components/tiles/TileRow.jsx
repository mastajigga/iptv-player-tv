// components/tiles/TileRow.jsx
// Rangée horizontale scrollable (pattern Netflix)

import { useRef, useEffect, useCallback } from 'react';
import Tile from './Tile';
import { KEY, FONT, COLORS, TILE } from '../../utils/constants';
import './TileRow.css';

export default function TileRow({
  title,
  items,
  onSelect,
  showProgress = false,
}) {
  const sliderRef = useRef(null);
  const scrollAmount = useRef(0);
  const maxScroll = useRef(0);

  // Calculer le scroll maximum
  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      maxScroll.current = slider.scrollWidth - slider.clientWidth;
    }
  }, [items]);

  const scrollBy = useCallback((delta) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const step = TILE.WIDTH + TILE.GAP;
    scrollAmount.current = Math.max(
      0,
      Math.min(maxScroll.current, scrollAmount.current + delta * step)
    );

    slider.style.transform = `translateX(-${scrollAmount.current}px)`;
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="tile-row">
      {/* Titre de la rangée */}
      <h2 className="tile-row__title">{title}</h2>

      {/* Slider */}
      <div className="tile-row__viewport">
        <div
          ref={sliderRef}
          className="tile-row__slider"
          style={{
            gap: TILE.GAP,
            transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {items.map((item, index) => (
            <Tile
              key={item.id}
              item={showProgress ? { ...item } : item}
              index={index}
              onSelect={onSelect}
              onFocus={(focusedItem, focusedIndex) => {
                // Auto-scroll pour garder la tuile focusée visible
                const slider = sliderRef.current;
                if (!slider) return;

                const tileLeft = focusedIndex * (TILE.WIDTH + TILE.GAP);
                const tileRight = tileLeft + TILE.WIDTH;
                const viewportLeft = scrollAmount.current;
                const viewportRight = viewportLeft + 1920 - 80; // screen width - margin

                if (tileLeft < viewportLeft) {
                  scrollBy(-1);
                } else if (tileRight > viewportRight) {
                  scrollBy(1);
                }
              }}
            />
          ))}
        </div>

        {/* Indicateurs de scroll (flèches) */}
        {items.length > 6 && (
          <>
            <button
              className="tile-row__arrow tile-row__arrow--left"
              onClick={() => scrollBy(-3)}
              tabIndex={-1}
              aria-hidden="true"
            >
              ‹
            </button>
            <button
              className="tile-row__arrow tile-row__arrow--right"
              onClick={() => scrollBy(3)}
              tabIndex={-1}
              aria-hidden="true"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
