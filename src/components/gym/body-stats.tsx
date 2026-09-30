import { format, parseISO, subDays } from 'date-fns';
import { Ruler, Save, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form-controls';
import { useDeleteBodyEntry, useSaveBody } from '@/hooks/use-data';
import { bmi, bmiCategory, fmt1, healthyRange, parseNum, sortedLog, TONE_CLASS } from '@/lib/body';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { GymData } from '@/types';
import { LineChart } from './charts';

/** Selo do IMC: valor + classificação por texto (não depende só da cor). */
export function BmiBadge({ weightKg, heightCm, className }: { weightKg?: number; heightCm?: number; className?: string }) {
  const v = bmi(weightKg, heightCm);
  if (v === null) return null;
  const cat = bmiCategory(v);
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', TONE_CLASS[cat.tone], className)}>
      IMC {fmt1(v)} · {cat.label}
    </span>
  );
}

export function BodyStats({ gym }: { gym: GymData }) {
  const save = useSaveBody();
  const remove = useDeleteBodyEntry();
  const log = sortedLog(gym.bodyLog);
  const current = log.at(-1)?.weightKg ?? gym.profile?.weightKg;
  const heightCm = gym.profile?.heightCm;
  const [weight, setWeight] = useState(current ? String(current) : '');
  const [height, setHeight] = useState(heightCm ? String(heightCm) : '');
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (heightCm && !height) setHeight(String(heightCm));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightCm]);

  const w = parseNum(weight);
  const h = parseNum(height);
  const valid = w >= 20 && w <= 400 && (!height || (h >= 100 && h <= 250));

  const first = log[0];
  const monthAgo = [...log].reverse().find((e) => e.date <= format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const deltaTotal = first && current ? current - first.weightKg : 0;
  const deltaMonth = monthAgo && current ? current - monthAgo.weightKg : null;
  const range = heightCm ? healthyRange(heightCm) : null;

  const Delta = ({ v, label }: { v: number; label: string }) => (
    <span className="inline-flex items-center gap-1 text-xs text-foreground/70">
      {v > 0 ? <TrendingUp className="size-3.5" aria-hidden /> : v < 0 ? <TrendingDown className="size-3.5" aria-hidden /> : null}
      <span className="font-semibold tabular-nums">
        {v > 0 ? '+' : ''}
        {fmt1(v)} kg
      </span>{' '}
      {label}
    </span>
  );

  return (
    <section aria-labelledby="body-title" className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 id="body-title" className="flex items-center gap-2 font-semibold">
        <Scale className="size-4 text-primary" aria-hidden /> Peso corporal
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="b-w">Peso (kg)</Label>
              <Input id="b-w" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="72,5" />
            </div>
            <div>
              <Label htmlFor="b-h">Altura (cm)</Label>
              <Input id="b-h" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
            </div>
          </div>
          <div>
            <Label htmlFor="b-d">Data</Label>
            <Input id="b-d" type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>
          {!valid && (weight || height) && <p className="text-xs text-primary">Confira os valores: peso entre 20–400 kg e altura entre 100–250 cm.</p>}
          <Button
            className="w-full"
            disabled={!valid || !w || save.isPending}
            onClick={() => save.mutate({ date, weightKg: w, heightCm: h || undefined })}
          >
            <Save /> Registrar medidas
          </Button>

          {current && (
            <div className="space-y-2 rounded-lg bg-muted/50 p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">{fmt1(current)}</span>
                <span className="text-sm text-foreground/60">kg atual</span>
              </div>
              <BmiBadge weightKg={current} heightCm={heightCm} />
              {range && (
                <p className="flex items-center gap-1 text-xs text-foreground/60">
                  <Ruler className="size-3.5" aria-hidden /> Faixa saudável para {heightCm} cm: {fmt1(range.min)}–{fmt1(range.max)} kg
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {deltaMonth !== null && <Delta v={deltaMonth} label="em 30 dias" />}
                {log.length > 1 && <Delta v={deltaTotal} label={`desde ${format(parseISO(first.date), 'dd/MM/yy')}`} />}
              </div>
              <p className="text-[11px] text-foreground/50">O IMC é uma referência geral e não diferencia músculo de gordura.</p>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <LineChart
            points={log.slice(-20).map((e) => ({ label: format(parseISO(e.date), 'dd/MM'), value: e.weightKg }))}
            title="Evolução do peso"
            subtitle="Últimos 20 registros"
            format={(v) => `${fmt1(v)} kg`}
          />
          {log.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Registros recentes">
              {log.slice(-8).reverse().map((e) => (
                <li key={e.date} className="inline-flex items-center gap-1 rounded-full border border-border py-0.5 pl-2.5 pr-1 text-xs">
                  <span className="tabular-nums">
                    {format(parseISO(e.date), 'dd/MM')} · {fmt1(e.weightKg)} kg
                  </span>
                  <button
                    type="button"
                    onClick={() => remove.mutate(e.date)}
                    aria-label={`Remover registro de ${format(parseISO(e.date), 'dd/MM')}`}
                    className="grid size-5 place-items-center rounded-full text-foreground/50 hover:bg-muted hover:text-primary"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
