import { LIFE_AREAS } from '@/lib/life-areas';
import { cn } from '@/lib/utils';
import type { LifeAreaId } from '@/types';

const SIZE = 460;
const C = SIZE / 2;
const R = 160;

const polar = (angle: number, r: number) => [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;

function sector(a0: number, a1: number, r: number) {
  if (r <= 0) return '';
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  return `M ${C} ${C} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
}

function arc(a0: number, a1: number, r: number) {
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
}

/**
 * Roda da Vida em "polar area": cada fatia é uma área e o raio preenchido é a nota (0–10).
 * `previous` desenha a avaliação anterior como contorno tracejado para comparação.
 */
export function WheelChart({
  scores,
  previous,
  selected,
  onSelect,
}: {
  scores: Record<LifeAreaId, number>;
  previous?: Record<LifeAreaId, number>;
  selected?: LifeAreaId | null;
  onSelect?: (id: LifeAreaId) => void;
}) {
  const n = LIFE_AREAS.length;
  const step = (Math.PI * 2) / n;
  const start = -Math.PI / 2;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full max-w-[460px] select-none" role="img" aria-label="Gráfico da Roda da Vida">
      {/* Anéis de referência */}
      {[2, 4, 6, 8, 10].map((v) => (
        <circle key={v} cx={C} cy={C} r={(v / 10) * R} fill="none" className="stroke-border" strokeWidth={v === 10 ? 2 : 1} />
      ))}

      {LIFE_AREAS.map((area, i) => {
        const a0 = start + i * step;
        const a1 = a0 + step;
        const mid = a0 + step / 2;
        const score = scores[area.id] ?? 0;
        const prev = previous?.[area.id];
        const isSel = selected === area.id;
        const dim = selected && !isSel;
        const [lx, ly] = polar(mid, R + 38);
        const [sx, sy] = polar(mid, Math.max((score / 10) * R - 16, 14));
        const Icon = area.icon;
        return (
          <g
            key={area.id}
            onClick={() => onSelect?.(area.id)}
            className={cn(onSelect && 'cursor-pointer', 'transition-opacity duration-200')}
            opacity={dim ? 0.35 : 1}
          >
            <title>{`${area.name}: ${score}/10`}</title>
            {/* Área de clique da fatia inteira */}
            <path d={sector(a0, a1, R)} fill="transparent" />
            <path d={sector(a0, a1, (score / 10) * R)} fill={area.color} fillOpacity={isSel ? 0.95 : 0.75} className="stroke-background" strokeWidth={2} />
            {prev !== undefined && (
              <path d={arc(a0 + 0.02, a1 - 0.02, (prev / 10) * R)} fill="none" className="stroke-foreground" strokeOpacity={0.7} strokeWidth={2} strokeDasharray="4 4" />
            )}
            {score > 0 && (
              <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central" className="fill-white text-[13px] font-bold">
                {score}
              </text>
            )}
            <Icon x={lx - 10} y={ly - 22} width={20} height={20} color={area.color} aria-hidden />
            <text x={lx} y={ly + 10} textAnchor="middle" className={cn('fill-foreground text-[11px]', isSel ? 'font-bold' : 'font-medium')}>
              {area.short}
            </text>
          </g>
        );
      })}

      {/* Raios */}
      {LIFE_AREAS.map((_, i) => {
        const [x, y] = polar(start + i * step, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} className="stroke-border" strokeWidth={1} />;
      })}
      <circle cx={C} cy={C} r={4} className="fill-foreground/40" />
    </svg>
  );
}
