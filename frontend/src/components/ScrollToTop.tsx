import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Setzt das Fenster bei jedem Pfadwechsel zurück nach oben.
 * React Router macht das standardmäßig nicht — wer auf "Weiter" klickt,
 * landet sonst auf der neuen Seite an der gleichen Scroll-Position.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}
