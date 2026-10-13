import { Check, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAdoptExercise, useCreateExercise } from '@/hooks/use-data';
import { matchExercise } from '@/lib/exercise-catalog';
import { MUSCLE_LABEL } from '@/lib/gym';
import { cn } from '@/lib/utils';
import { withCatalog } from '@/lib/workout-generator';
import { ExerciseHologram } from './exercise-hologram';
import type { Exercise, GymData, MuscleGroup } from '@/types';

/**
 * Escolher exercício com busca: digite parte do nome ("hack", "abdutora", "cross"…) ou filtre pelo grupo.
 * Mostra os seus exercícios e todo o catálogo; se não achar, cadastra o seu na hora.
 */
export function ExercisePicker({ gym, onPick, label = '+ Adicionar exercício', className }: { gym: GymData; onPick: (id: string) => void; label?: string; className?: string }) {
  const create = useCreateExercise();
  const adopt = useAdoptExercise();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'ALL'>('ALL');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('peito');
  const [hover, setHover] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const mine = useMemo(() => new Set(gym.exercises.map((e) => e.id)), [gym.exercises]);
  const all = useMemo(() => withCatalog(gym.exercises), [gym.exercises]);
  const found = all.filter((e) => (muscle === 'ALL' || e.muscle === muscle) && matchExercise(e, q.trim()));
  // cada linha tem o personagem animado: limita a quantidade de uma vez (a busca filtra o resto)
  const LIMIT = 60;
  const list = found.slice(0, LIMIT);
  const groups = (Object.keys(MUSCLE_LABEL) as MuscleGroup[]).map((m) => ({ m, items: list.filter((e) => e.muscle === m) })).filter((g) => g.items.length);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onDown = (ev: PointerEvent) => !box.current?.contains(ev.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  useEffect(() => {
    if (muscle !== 'ALL') setNewMuscle(muscle);
  }, [muscle]);

  const pick = async (x: Exercise) => {
    // exercício do catálogo passa a ser da pessoa (aparece no progresso, recordes e plano)
    if (!mine.has(x.id)) await adopt.mutateAsync(x);
    onPick(x.id);
    setOpen(false);
    setQ('');
  };
  const createMine = async () => {
    const name = q.trim();
    if (!name) return;
    const created = await create.mutateAsync({ name, muscle: newMuscle });
    toast.success('Exercício cadastrado', { description: name });
    onPick(created.id);
    setOpen(false);
    setQ('');
  };

  return (
    <div ref={box} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-10 w-full items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 text-left text-sm font-medium text-foreground/70 transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-4" aria-hidden /> {label}
        <span className="ml-auto text-xs font-normal text-foreground/40">{all.length} exercícios</span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-2xl" role="dialog" aria-label="Escolher exercício">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-foreground/40" aria-hidden />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'Enter' && list[0]) {
                  e.preventDefault();
                  pick(list[0]);
                }
              }}
              placeholder="Buscar: hack, abdutora, cross, Smith…"
              aria-label="Buscar exercício"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} className="grid size-7 place-items-center rounded-md text-foreground/50 hover:bg-muted" aria-label="Limpar busca">
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-1.5 [scrollbar-width:none]">
            {(['ALL', ...Object.keys(MUSCLE_LABEL)] as (MuscleGroup | 'ALL')[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMuscle(m)}
                className={cn('h-7 shrink-0 rounded-full px-2.5 text-xs font-semibold transition-colors', muscle === m ? 'bg-primary text-white' : 'text-foreground/60 hover:bg-muted')}
              >
                {m === 'ALL' ? 'Todos' : MUSCLE_LABEL[m]}
              </button>
            ))}
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {groups.map((g) => (
              <div key={g.m}>
                <p className="sticky top-0 bg-card/95 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/45 backdrop-blur">{MUSCLE_LABEL[g.m]}</p>
                {g.items.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => pick(x)}
                    onPointerEnter={() => setHover(x.id)}
                    onPointerLeave={() => setHover((h) => (h === x.id ? null : h))}
                    onFocus={() => setHover(x.id)}
                    className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {/* personagem mostrando o movimento (anima ao passar o mouse) */}
                    <span className="w-16 shrink-0">
                      <ExerciseHologram exercise={x} compact playing={hover === x.id} className="rounded-md" />
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{x.name}</span>
                    {mine.has(x.id) && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" aria-hidden /> seu
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
            {found.length > LIMIT && <p className="px-3 py-2 text-xs text-foreground/50">Mostrando {LIMIT} de {found.length}. Digite ou escolha um grupo para ver o resto.</p>}
            {q.trim() && (
              <div className="m-2 rounded-lg border border-dashed border-border p-2.5">
                <p className="text-xs text-foreground/60">{list.length ? 'Não é nenhum desses?' : 'Não encontrei esse exercício.'} Cadastre o seu:</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select value={newMuscle} onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)} aria-label="Grupo muscular do novo exercício" className="h-8 rounded-lg border border-border bg-background px-2 text-xs">
                    {Object.entries(MUSCLE_LABEL).map(([m, l]) => (
                      <option key={m} value={m}>{l}</option>
                    ))}
                  </select>
                  <button type="button" onClick={createMine} disabled={create.isPending} className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-white disabled:opacity-60">
                    <Plus className="size-3.5" aria-hidden /> Cadastrar “{q.trim()}”
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
