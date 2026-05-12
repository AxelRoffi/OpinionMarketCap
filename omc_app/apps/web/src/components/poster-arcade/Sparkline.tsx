import { cn } from '@/lib/utils';

type SparklineProps = {
  data: number[];
  /** SVG viewBox width. */
  width?: number;
  /** SVG viewBox height. */
  height?: number;
  /** Stroke width in viewBox units. */
  strokeWidth?: number;
  /** Stroke color CSS value. Defaults to var(--ink). */
  stroke?: string;
  /** Sketchy dashed look. */
  dashed?: boolean;
  /** Fill the area under the line. */
  fill?: string;
  /** Show the final point as a dot. */
  endDot?: boolean;
  endDotColor?: string;
  className?: string;
};

/**
 * No-deps SVG sparkline. Poster Arcade aesthetic — sharp corners, optional dashed
 * stroke, optional area fill. Use for price history on opinion detail.
 */
export function Sparkline({
  data,
  width = 600,
  height = 160,
  strokeWidth = 4,
  stroke = 'var(--ink)',
  dashed = true,
  fill,
  endDot = true,
  endDotColor = 'var(--pop)',
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = strokeWidth * 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (innerW * i) / (data.length - 1);
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const polylinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaPath = fill
    ? `${polylinePath} L ${points[points.length - 1].x.toFixed(1)} ${pad + innerH} L ${points[0].x.toFixed(1)} ${pad + innerH} Z`
    : null;

  const last = points[points.length - 1];

  return (
    <svg
      className={cn('block w-full h-auto', className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Price history sparkline"
    >
      {areaPath && (
        <path
          d={areaPath}
          fill={fill}
          opacity={0.18}
        />
      )}
      <path
        d={polylinePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray={dashed ? '8 5' : undefined}
      />
      {endDot && (
        <circle
          cx={last.x}
          cy={last.y}
          r={strokeWidth * 1.6}
          fill={endDotColor}
          stroke="var(--ink)"
          strokeWidth={strokeWidth * 0.6}
        />
      )}
    </svg>
  );
}
