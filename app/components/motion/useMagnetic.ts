import {useEffect, type RefObject} from 'react';
import {gsap} from '~/lib/gsap';
import {prefersReducedMotion} from './useReducedMotion';

/** Element folgt dem Zeiger leicht („magnetisch“), nur bei feinem Pointer. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;

    const xTo = gsap.quickTo(el, 'x', {duration: 0.6, ease: 'power3.out'});
    const yTo = gsap.quickTo(el, 'y', {duration: 0.6, ease: 'power3.out'});

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, strength]);
}
