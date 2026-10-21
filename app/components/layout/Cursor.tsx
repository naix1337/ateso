import {useEffect, useRef} from 'react';
import {gsap} from '~/lib/gsap';
import {prefersReducedMotion} from '~/components/motion/useReducedMotion';

const INTERACTIVE = 'a, button, [role="button"], input, label, [data-cursor]';

/** Dezenter Custom Cursor (Punkt + Ring), nur bei feinem Pointer. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dot.current || !ring.current) return;
    if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion())
      return;

    const d = dot.current;
    const r = ring.current;
    const dotX = gsap.quickTo(d, 'x', {duration: 0.12, ease: 'power3.out'});
    const dotY = gsap.quickTo(d, 'y', {duration: 0.12, ease: 'power3.out'});
    const ringX = gsap.quickTo(r, 'x', {duration: 0.5, ease: 'power3.out'});
    const ringY = gsap.quickTo(r, 'y', {duration: 0.5, ease: 'power3.out'});

    const move = (e: PointerEvent) => {
      gsap.to([d, r], {opacity: 1, duration: 0.3, overwrite: 'auto'});
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const active = (e.target as Element | null)?.closest?.(INTERACTIVE);
      gsap.to(r, {
        scale: active ? 1.9 : 1,
        borderColor: active ? '#FF5A1F' : 'rgba(242,239,232,0.5)',
        duration: 0.35,
      });
    };
    const leave = () => gsap.to([d, r], {opacity: 0, duration: 0.3});

    document.documentElement.classList.add('has-custom-cursor');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    document.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] -mt-4 -ml-4 h-8 w-8 rounded-full border opacity-0"
        style={{borderColor: 'rgba(242,239,232,0.5)'}}
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-orange opacity-0"
      />
    </>
  );
}
