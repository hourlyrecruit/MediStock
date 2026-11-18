import { useId } from 'react';
import { cn } from '@/shared/cn';

interface StaticHeroFallbackProps {
  className?: string;
}

const BACKDROP =
  'radial-gradient(110% 85% at 72% 42%, var(--primary-tint) 0%, color-mix(in oklab, var(--primary-tint) 45%, var(--bg-subtle)) 40%, var(--bg-subtle) 75%)';

interface CapsuleMark {
  x: number;
  y: number;
  angle: number;
  scale: number;
  tone: 'primary' | 'stone' | 'grey';
}

const TONE_FILL: Record<CapsuleMark['tone'], string> = {
  primary: 'var(--primary)',
  stone: 'var(--border-strong)',
  grey: 'var(--fg-faint)',
};

const CAPSULES: readonly CapsuleMark[] = [
  { x: 150, y: 120, angle: -32, scale: 1, tone: 'primary' },
  { x: 430, y: 300, angle: 24, scale: 1.1, tone: 'stone' },
  { x: 210, y: 410, angle: 62, scale: 0.9, tone: 'grey' },
  { x: 380, y: 90, angle: -14, scale: 0.8, tone: 'stone' },
  { x: 90, y: 300, angle: 40, scale: 0.75, tone: 'stone' },
];

export function StaticHeroFallback({ className }: StaticHeroFallbackProps) {
  const id = useId();
  const shine = `${id}-shine`;
  const shadow = `${id}-shadow`;

  return (
    <div aria-hidden="true" className={cn('absolute inset-0', className)} style={{ background: BACKDROP }}>
      <div className="absolute inset-x-[8%] top-[12%] bottom-[10%] opacity-90 md:inset-x-auto md:right-[4%] md:left-[48%]">
        <svg viewBox="0 0 520 520" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={shadow} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: 'var(--fg)' }} stopOpacity="0.1" />
              <stop offset="1" style={{ stopColor: 'var(--fg)' }} stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="270" cy="478" rx="210" ry="20" fill={`url(#${shadow})`} />

          <g transform="translate(232 170)">
            <rect x="0" y="0" width="92" height="22" rx="6" style={{ fill: 'var(--surface)' }} />
            <path
              d="M6 26h80v14c18 8 26 18 26 34v158a18 18 0 0 1-18 18H-2a18 18 0 0 1-18-18V74c0-16 8-26 26-34z"
              fill="#8a5a2b"
              opacity="0.85"
            />
            <rect x="-20" y="120" width="132" height="70" style={{ fill: 'var(--bg-subtle)' }} />
            <rect x="-20" y="168" width="132" height="8" style={{ fill: 'var(--primary)' }} />
            <rect x="-6" y="58" width="12" height="150" rx="6" fill="#ffffff" opacity="0.18" />
          </g>

          <g transform="translate(408 196)" style={{ fill: 'var(--primary)' }} opacity="0.9">
            <rect x="-17" y="-48" width="34" height="96" rx="12" />
            <rect x="-48" y="-17" width="96" height="34" rx="12" />
          </g>

          {CAPSULES.map((c) => (
            <g key={`${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y}) rotate(${c.angle}) scale(${c.scale})`}>
              <rect
                x="-46"
                y="-17"
                width="92"
                height="34"
                rx="17"
                style={{ fill: 'var(--surface)', stroke: 'var(--border-subtle)' }}
              />
              <path d="M0 -17h29a17 17 0 0 1 0 34H0z" style={{ fill: TONE_FILL[c.tone] }} />
              <rect x="-40" y="-13" width="80" height="10" rx="5" fill={`url(#${shine})`} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
