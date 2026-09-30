import { useId } from 'react';
import { MUSCLE_LABEL } from '@/lib/gym';
import { cn } from '@/lib/utils';
import type { MuscleGroup } from '@/types';

type Intensity = Partial<Record<MuscleGroup, number>>;

const NEON = (a: number) => `rgb(var(--neon) / ${a})`;

/** Uma região muscular: preenchimento proporcional à intensidade (0–1). */
function Region({ d, muscle, intensity, glow }: { d: string; muscle: MuscleGroup; intensity: Intensity; glow: string }) {
  const v = intensity[muscle] ?? 0;
  return (
    <path
      d={d}
      className="holo-region"
      fill={NEON(0.05 + v * 0.6)}
      stroke={NEON(0.35 + v * 0.6)}
      strokeWidth={v ? 1.4 : 0.9}
      filter={v > 0.05 ? `url(#${glow})` : undefined}
    >
      <title>{`${MUSCLE_LABEL[muscle]}${v ? ` · ${Math.round(v * 100)}%` : ''}`}</title>
    </path>
  );
}

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
const rrect = (x: number, y: number, w: number, h: number, r = 4) =>
  `M ${x + r} ${y} h ${w - 2 * r} q ${r} 0 ${r} ${r} v ${h - 2 * r} q 0 ${r} ${-r} ${r} h ${-(w - 2 * r)} q ${-r} 0 ${-r} ${-r} v ${-(h - 2 * r)} q 0 ${-r} ${r} ${-r} Z`;

/** Contorno neutro do corpo (cabeça, tronco, braços, pernas). */
function Outline() {
  const s = { fill: 'none', stroke: NEON(0.45), strokeWidth: 1 } as const;
  return (
    <g>
      <ellipse cx={0} cy={28} rx={13} ry={16} {...s} />
      <path d="M -5 44 L -5 52 M 5 44 L 5 52" {...s} />
      <path d="M -40 60 Q -30 52 -5 52 L 5 52 Q 30 52 40 60 L 46 110 L 50 150 M -40 60 L -46 110 L -50 150" {...s} />
      <path d="M -28 60 L -24 138 Q -22 150 -26 160 L -22 280 M 28 60 L 24 138 Q 22 150 26 160 L 22 280" {...s} strokeDasharray="2 3" />
      <path d="M -26 160 Q 0 150 26 160" {...s} />
      <path d="M -24 280 L -4 280 M 24 280 L 4 280 M -2 166 L -2 276 M 2 166 L 2 276" {...s} strokeDasharray="2 3" />
    </g>
  );
}

function Front({ intensity, glow }: { intensity: Intensity; glow: string }) {
  return (
    <g>
      <Outline />
      <Region muscle="ombros" intensity={intensity} glow={glow} d={`${ell(-32, 66, 10, 9)} ${ell(32, 66, 10, 9)}`} />
      <Region muscle="peito" intensity={intensity} glow={glow} d={`${rrect(-23, 60, 21, 24, 7)} ${rrect(2, 60, 21, 24, 7)}`} />
      <Region muscle="biceps" intensity={intensity} glow={glow} d={`${ell(-39, 92, 6.5, 15)} ${ell(39, 92, 6.5, 15)}`} />
      <path d={`${ell(-44, 126, 5, 14)} ${ell(44, 126, 5, 14)}`} fill={NEON(0.04)} stroke={NEON(0.3)} strokeWidth={0.8} />
      <Region
        muscle="abdomen"
        intensity={intensity}
        glow={glow}
        d={[0, 1, 2].map((r) => `${rrect(-11, 90 + r * 15, 10, 12, 3)} ${rrect(1, 90 + r * 15, 10, 12, 3)}`).join(' ')}
      />
      <Region muscle="pernas" intensity={intensity} glow={glow} d={`${ell(-13, 190, 10.5, 28)} ${ell(13, 190, 10.5, 28)}`} />
      <Region muscle="panturrilha" intensity={intensity} glow={glow} d={`${ell(-13, 246, 6.5, 20)} ${ell(13, 246, 6.5, 20)}`} />
      {/* Coração pulsa quando há cardio */}
      {(intensity.cardio ?? 0) > 0 && (
        <path
          className="holo-pulse"
          d="M -12 70 c -3 -4 -9 -2 -8 3 c 1 4 8 8 8 8 c 0 0 7 -4 8 -8 c 1 -5 -5 -7 -8 -3 Z"
          fill={NEON(0.9)}
          filter={`url(#${glow})`}
        >
          <title>Cardio</title>
        </path>
      )}
    </g>
  );
}

function Back({ intensity, glow }: { intensity: Intensity; glow: string }) {
  return (
    <g>
      <Outline />
      <Region muscle="ombros" intensity={intensity} glow={glow} d={`${ell(-32, 66, 10, 9)} ${ell(32, 66, 10, 9)}`} />
      <Region
        muscle="costas"
        intensity={intensity}
        glow={glow}
        d="M -22 58 L 22 58 L 26 76 L 18 120 L 4 132 L -4 132 L -18 120 L -26 76 Z"
      />
      <Region muscle="triceps" intensity={intensity} glow={glow} d={`${ell(-39, 92, 6.5, 15)} ${ell(39, 92, 6.5, 15)}`} />
      <Region muscle="gluteos" intensity={intensity} glow={glow} d={`${ell(-11, 152, 11, 11)} ${ell(11, 152, 11, 11)}`} />
      <Region muscle="pernas" intensity={intensity} glow={glow} d={`${ell(-13, 196, 9.5, 24)} ${ell(13, 196, 9.5, 24)}`} />
      <Region muscle="panturrilha" intensity={intensity} glow={glow} d={`${ell(-13, 244, 8, 19)} ${ell(13, 244, 8, 19)}`} />
    </g>
  );
}

/**
 * Holograma corporal (frente e costas). As regiões acendem conforme `intensity`.
 * `scanning` acelera a varredura (usado enquanto o treino é "gerado").
 */
export function Hologram({
  intensity,
  scanning,
  status,
  className,
}: {
  intensity: Intensity;
  scanning?: boolean;
  status: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const glow = `glow-${uid}`;
  const scanGrad = `scan-${uid}`;
  const grid = `grid-${uid}`;
  const active = (Object.entries(intensity) as [MuscleGroup, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-neon/40 bg-navy text-white shadow-neon', className)}>
      <svg viewBox="0 0 300 380" className="h-auto w-full" role="img" aria-label={`Holograma corporal: ${status}`}>
        <defs>
          <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={scanGrad} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0" />
            <stop offset=".5" stopColor="rgb(var(--neon))" stopOpacity=".45" />
            <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" />
          </linearGradient>
          <pattern id={grid} width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" fill="none" stroke={NEON(0.07)} strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="300" height="380" fill={`url(#${grid})`} />

        {/* HUD */}
        <g className="font-mono" fill={NEON(0.85)} fontSize="9" letterSpacing="1.5">
          <text x="14" y="20">RUTTE · SCAN CORPORAL</text>
          <text x="286" y="20" textAnchor="end">{scanning ? 'PROCESSANDO…' : 'ONLINE'}</text>
          <text x="75" y="330" textAnchor="middle" fillOpacity=".6">FRENTE</text>
          <text x="225" y="330" textAnchor="middle" fillOpacity=".6">COSTAS</text>
        </g>
        <path d="M 10 28 L 10 10 L 28 10 M 272 10 L 290 10 L 290 28 M 10 352 L 10 370 L 28 370 M 272 370 L 290 370 L 290 352" fill="none" stroke={NEON(0.7)} strokeWidth="1.5" />

        {/* Anéis da base */}
        {[75, 225].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={318} rx={48} ry={8} fill="none" stroke={NEON(0.6)} strokeWidth="1.2" strokeDasharray="10 6" className="holo-ring" />
            <ellipse cx={cx} cy={318} rx={34} ry={5} fill="none" stroke={NEON(0.35)} strokeWidth="1" strokeDasharray="4 8" className="holo-ring-rev" />
            <ellipse cx={cx} cy={318} rx={48} ry={8} fill={NEON(0.08)} />
          </g>
        ))}

        <g className="holo-flicker">
          <g className="holo-float">
            <g transform="translate(75 30)">
              <Front intensity={intensity} glow={glow} />
            </g>
            <g transform="translate(225 30)">
              <Back intensity={intensity} glow={glow} />
            </g>
          </g>
        </g>

        {/* Linha de varredura */}
        <rect x="0" y="0" width="300" height="26" fill={`url(#${scanGrad})`} className={scanning ? 'holo-scan-fast' : 'holo-scan'} />
      </svg>

      <div className="border-t border-neon/20 px-4 pb-3 pt-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-neon" aria-live="polite">
          {status}
        </p>
        {active.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {active.slice(0, 8).map(([m, v]) => (
              <li key={m} className="rounded-full border border-neon/40 bg-neon/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                {MUSCLE_LABEL[m]} {Math.round(v * 100)}%
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
