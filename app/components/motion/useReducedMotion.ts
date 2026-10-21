import {useEffect, useState} from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

/** SSR-sicher: liefert erst nach dem Mount den echten Wert (Default: false). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return reduced;
}
