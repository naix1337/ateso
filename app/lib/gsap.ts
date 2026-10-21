import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {
  useEffect,
  useLayoutEffect,
  type DependencyList,
  type RefObject,
} from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export {gsap, ScrollTrigger};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * GSAP-Animationen an eine Komponente binden; alles im Callback wird beim
 * Unmount bzw. bei Dep-Änderung über gsap.context sauber zurückgesetzt.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (self: gsap.Context) => void | (() => void),
  deps: DependencyList = [],
  {defer = false}: {defer?: boolean} = {},
) {
  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    if (!defer) {
      const ctx = gsap.context(setup, scope.current);
      return () => ctx.revert();
    }
    // Sections unterhalb des Folds erst in Idle-Zeit aufsetzen: verteilt die
    // Layout-Messungen der ScrollTrigger auf eigene, kurze Tasks
    let ctx: gsap.Context | null = null;
    const id = scheduleIdle(() => {
      if (!scope.current) return;
      ctx = gsap.context(setup, scope.current);
    });
    return () => {
      cancelIdle(id);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const scheduleIdle = (fn: () => void): number =>
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback(fn, {timeout: 1500})
    : window.setTimeout(fn, 1);

const cancelIdle = (id: number) =>
  typeof cancelIdleCallback === 'function'
    ? cancelIdleCallback(id)
    : window.clearTimeout(id);
