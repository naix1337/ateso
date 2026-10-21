import {WORDMARK_LETTERS, WORDMARK_SKEW, WORDMARK_VIEWBOX} from './logo-geometry';

type WordmarkProps = React.SVGProps<SVGSVGElement> & {title?: string};

/** Wortmarke „ateso“. Jeder Buchstabe ist eine eigene Gruppe (`data-letter`) für Animationen. */
export function Wordmark({title = 'ateso', ...props}: WordmarkProps) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} role="img" {...props}>
      <title>{title}</title>
      <g fill="currentColor" transform={WORDMARK_SKEW}>
        {WORDMARK_LETTERS.map((letter, i) => (
          <g key={i} data-letter={letter.char} style={{transformBox: 'fill-box', transformOrigin: '50% 100%'}}>
            {letter.paths.map((d, j) => (
              <path key={j} d={d} fillRule="evenodd" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
