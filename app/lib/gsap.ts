import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useEffect, useLayoutEffect, type DependencyList, type RefObject} from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export {gsap, ScrollTrigger};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * GSAP-Animationen an eine Komponente binden; alles im Callback wird beim
 * Unmount bzw. bei Dep-Änderung über gsap.context sauber zurückgesetzt.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (self: gsap.Context) => void | (() => void),
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(setup, scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
