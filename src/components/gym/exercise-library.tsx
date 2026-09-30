import { ScanEye, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MUSCLE_LABEL } from '@/lib/gym';
import { cn } from '@/lib/utils';
import { EXTRA_EXERCISES } from '@/lib/workout-generator';
import type { Exercise, GymData, MuscleGroup } from '@/types';
import { ExerciseGuideDialog } from './exercise-guide-dialog';
import { ExerciseHologram } from './exercise-hologram';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Biblioteca de exercícios com holograma animado de cada um. */
export function ExerciseLibrary({ gym }: { gym: GymData }) {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'ALL'>('ALL');
  const [open, setOpen] = useState<Exercise | null>(null);

  const all = useMemo(() => {
    const have = new Set(gym.exercises.map((e) => e.id));
    return [...gym.exercises, ...EXTRA_EXERCISES.filter((e) => !have.has(e.id))];
  }, [gym.exercises]);

  const list = all.filter((e) => (muscle === 'ALL' || e.muscle === muscle) && (!q || norm(e.name).includes(norm(q))));
  const groups = (Object.keys(MUSCLE_LABEL) as MuscleGroup[])
    .map((m) => ({ m, items: list.filter((e) => e.muscle === m) }))
    .filter((g) => g.items.length);

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">Toque em um exercício para ver o holograma em tamanho grande com o passo a passo.</p>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar exercício…"
          aria-label="Buscar exercício"
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Filtrar por grupo muscular">
        {(['ALL', ...Object.keys(MUSCLE_LABEL)] as (MuscleGroup | 'ALL')[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={muscle === m}
            onClick={() => setMuscle(m)}
            className={cn(
              'h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-all duration-200',
              muscle === m ? 'border-neon bg-primary text-white shadow-neon' : 'border-border bg-card hover:bg-muted',
            )}
          >
            {m === 'ALL' ? 'Todos' : MUSCLE_LABEL[m]}
          </button>
        ))}
      </div>

      {groups.map(({ m, items }) => (
        <section key={m} aria-label={MUSCLE_LABEL[m]} className="space-y-2">
          <h3 className="font-semibold">{MUSCLE_LABEL[m]}</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setOpen(e)}
                  className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-neon hover:shadow-neon"
                  aria-label={`Como fazer: ${e.name}`}
                >
                  <ExerciseHologram exercise={e} compact className="rounded-none border-0" />
                  <span className="flex items-center gap-1.5 p-2.5">
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{e.name}</span>
                    <ScanEye className="size-4 shrink-0 text-foreground/40 group-hover:text-primary" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length === 0 && <p className="text-sm text-foreground/60">Nenhum exercício encontrado.</p>}

      <ExerciseGuideDialog exercise={open} onClose={() => setOpen(null)} />
    </div>
  );
}
