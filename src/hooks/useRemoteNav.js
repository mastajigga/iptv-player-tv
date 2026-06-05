// hooks/useRemoteNav.js
// Gestion de la navigation télécommande Samsung TV

import { useEffect, useRef, useCallback } from 'react';
import { KEY } from '../utils/constants';

/**
 * Hook principal de navigation TV.
 * Capture les touches de la télécommande et délègue aux callbacks.
 */
export function useRemoteNav(handlers = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function onKeyDown(e) {
      const handler = handlersRef.current[e.keyCode];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

/**
 * Hook pour gérer le focus dans une grille [row][col]
 */
export function useGridNav() {
  const gridRef = useRef({ rows: [], currentRow: 0, currentCol: 0 });

  const registerRow = useCallback((rowIndex, tiles) => {
    gridRef.current.rows[rowIndex] = tiles;
  }, []);

  const focusElement = useCallback((row, col) => {
    const tile = gridRef.current.rows[row]?.[col];
    if (tile?.current) {
      tile.current.focus({ preventScroll: false });
      // Scroll into view si nécessaire
      tile.current.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  const moveRight = useCallback(() => {
    const { rows, currentRow, currentCol } = gridRef.current;
    const row = rows[currentRow];
    if (row && currentCol < row.length - 1) {
      gridRef.current.currentCol++;
      focusElement(currentRow, gridRef.current.currentCol);
    }
  }, [focusElement]);

  const moveLeft = useCallback(() => {
    if (gridRef.current.currentCol > 0) {
      gridRef.current.currentCol--;
      focusElement(gridRef.current.currentRow, gridRef.current.currentCol);
    }
  }, [focusElement]);

  const moveDown = useCallback(() => {
    const { rows, currentRow, currentCol } = gridRef.current;
    if (currentRow < rows.length - 1) {
      gridRef.current.currentRow++;
      const newRow = rows[gridRef.current.currentRow];
      gridRef.current.currentCol = Math.min(currentCol, (newRow?.length || 1) - 1);
      focusElement(gridRef.current.currentRow, gridRef.current.currentCol);
    }
  }, [focusElement]);

  const moveUp = useCallback(() => {
    if (gridRef.current.currentRow > 0) {
      gridRef.current.currentRow--;
      const newRow = gridRef.current.rows[gridRef.current.currentRow];
      gridRef.current.currentCol = Math.min(gridRef.current.currentCol, (newRow?.length || 1) - 1);
      focusElement(gridRef.current.currentRow, gridRef.current.currentCol);
    }
  }, [focusElement]);

  const resetNav = useCallback(() => {
    gridRef.current = { rows: [], currentRow: 0, currentCol: 0 };
  }, []);

  return {
    registerRow,
    moveRight,
    moveLeft,
    moveDown,
    moveUp,
    resetNav,
    focusElement,
    currentPos: () => ({
      row: gridRef.current.currentRow,
      col: gridRef.current.currentCol,
    }),
  };
}

/**
 * Hook anti double-back (toast « Appuyez à nouveau pour quitter »)
 */
export function useBackHandler(onBack, onDoubleBack, delay = 2000) {
  const lastBack = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastBack.current < delay) {
      onDoubleBack?.();
    } else {
      lastBack.current = now;
      onBack?.();
    }
  }, [onBack, onDoubleBack, delay]);
}
