import Lenis from 'lenis';
import {createContext, useContext, useEffect, useState} from 'react';
import {gsap, ScrollTrigger} from '~/lib/gsap';
import {prefersReducedMotion} from './useReducedMotion';

const LenisContext = createContext<Lenis | null>(null);

/** Lenis-Smooth-Scroll, synchronisiert mit dem GSAP-Ticker. Aus bei reduced motion. */
export function SmoothScroll({children}: {children: React.ReactNode}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({lerp: 0.09, smoothWheel: true});
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}

/** Zu einem Anker scrollen – mit Lenis, sonst nativ. */
export function scrollToTarget(lenis: Lenis | null, target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, {duration: 1.6});
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({top: target});
  } else {
    document.querySelector(target)?.scrollIntoView();
  }
}
