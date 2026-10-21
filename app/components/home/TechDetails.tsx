import {useRef, useState} from 'react';
import {ScrollTrigger, useGsap} from '~/lib/gsap';
import {useT} from '~/i18n';
import {Picture} from './Picture';

/** Position der Hotspots auf dem Aurora-Bild (in %), Reihenfolge wie in de.tech.hotspots. */
const HOTSPOT_POS: Record<string, [number, number]> = {
  fabric: [62, 62],
  zipper: [47, 48],
  hood: [50, 14],
  vent: [24, 44],
  cuffs: [12, 88],
  patch: [86, 30],
};

const ZOOM = 2.6;

/**
 * „Kamera zoomt auf Hotspots“: Die Übersicht skaliert auf den Punkt,
 * dann öffnet sich das Makro-Foto kreisförmig vom Hotspot aus.
 */
export function TechDetails() {
  const t = useT().tech;
  const root = useRef<HTMLElement>(null);
  const hotspots = t.hotspots;
  const [active, setActive] = useState(-1);

  useGsap(
    root,
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // kurzer Vorlauf mit der Übersicht, dann je Hotspot ein gleich langer Abschnitt
          const idx =
            self.progress < 0.08
              ? -1
              : Math.min(
                  hotspots.length - 1,
                  Math.floor(((self.progress - 0.08) / 0.92) * hotspots.length),
                );
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    },
    [],
    {defer: true},
  );

  const focus = active >= 0 ? HOTSPOT_POS[hotspots[active].id] : null;
  const viewTransform = focus
    ? `scale(${ZOOM}) translate(${50 - focus[0]}%, ${50 - focus[1]}%)`
    : 'scale(1) translate(0, 0)';

  return (
    <section
      ref={root}
      id="technologie"
      aria-labelledby="tech-title"
      className="relative bg-black"
      style={{height: `${hotspots.length * 60 + 110}vh`}}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1800px] items-center gap-8 px-4 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-10">
          {/* Viewer */}
          <div className="relative mx-auto aspect-[520/544] w-full max-w-[min(560px,48svh)] overflow-hidden bg-graphite-1 md:max-w-[min(620px,74svh)]">
            <div
              className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo"
              style={{transform: viewTransform, transformOrigin: '50% 50%'}}
            >
              <Picture
                src="/assets/img/variant-aurora"
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {hotspots.map((h, i) => {
                const [x, y] = HOTSPOT_POS[h.id];
                return (
                  <span
                    key={h.id}
                    aria-hidden="true"
                    className="absolute grid h-6 w-6 place-items-center"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%,-50%) scale(${focus ? 1 / ZOOM : 1})`,
                    }}
                  >
                    <span
                      className={`absolute inset-0 rounded-full border ${i === active ? 'animate-ping border-orange' : 'border-bone/40'}`}
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${i === active ? 'bg-orange' : 'bg-bone/70'}`}
                    />
                  </span>
                );
              })}
            </div>

            {/* Makro-Aufnahmen */}
            {hotspots.map((h, i) => {
              const [x, y] = HOTSPOT_POS[h.id];
              const shown = i === active;
              return (
                <div
                  key={h.id}
                  aria-hidden={!shown}
                  className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-out-expo"
                  style={{
                    clipPath: shown
                      ? `circle(150% at ${x}% ${y}%)`
                      : `circle(0% at ${x}% ${y}%)`,
                    transitionDelay: shown ? '350ms' : '0ms',
                  }}
                >
                  <Picture
                    src={`/assets/img/detail-${h.id}`}
                    alt={shown ? `${h.label}: ${h.title}` : ''}
                    className={`h-full w-full object-cover transition-transform duration-[2400ms] ease-out ${shown ? 'scale-100' : 'scale-125'}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              );
            })}

            {/* Technisches Label im Viewer */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between">
              <span className="label text-[0.6rem] text-bone/70">
                {active >= 0
                  ? `${String(active + 1).padStart(2, '0')} / ${hotspots[active].label}`
                  : 'Aurora · All Black'}
              </span>
              <span className="label text-[0.6rem] text-orange">ateso</span>
            </div>
          </div>

          {/* Liste */}
          <div>
            <p className="label flex items-center gap-4 text-bone/60">
              <span className="rule-orange" /> {t.eyebrow}
            </p>
            <h2 id="tech-title" className="display mt-5 text-4xl md:text-6xl">
              {t.title}
            </h2>
            <ol className="mt-8 border-t border-white/10 md:mt-12">
              {hotspots.map((h, i) => (
                <li key={h.id} className="border-b border-white/10">
                  <div
                    className={`grid grid-cols-[3rem_1fr] gap-x-2 py-3 transition-colors duration-500 md:py-4 ${i === active ? 'text-bone' : 'text-bone/60'}`}
                  >
                    <span className="label pt-1 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="label">{h.label}</p>
                      <div
                        className={`grid transition-[grid-template-rows] duration-700 ease-out-expo ${i === active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-3 text-xl font-semibold md:text-2xl">
                            {h.title}
                          </p>
                          <p className="mt-1 max-w-md text-bone/70">{h.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
