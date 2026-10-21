import {
  SIGNET_BASE,
  SIGNET_PEAK,
  SIGNET_VIEWBOX,
  pointsToPath,
} from './logo-geometry';

type SignetProps = React.SVGProps<SVGSVGElement> & {title?: string};

/** Das ateso-Signet. Farbe über `currentColor`. */
export function Signet({title, ...props}: SignetProps) {
  return (
    <svg
      viewBox={SIGNET_VIEWBOX}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={10}
        strokeLinejoin="round"
      >
        <path data-part="peak" d={pointsToPath(SIGNET_PEAK)} />
        <path data-part="base" d={pointsToPath(SIGNET_BASE)} />
      </g>
    </svg>
  );
}
