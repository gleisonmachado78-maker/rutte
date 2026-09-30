import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy, Dumbbell, History, Plus, Save, ScanEye, Timer, Trash2, TrendingUp, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/form-controls';
import { useSaveSession } from '@/hooks/use-data';
import { formatKg, lastEntry, MUSCLE_LABEL, personalRecords, WEEKDAYS, WEEK_ORDER } from '@/lib/gym';
import { cn } from '@/lib/utils';
import { topReps } from '@/lib/workout-generator';
import type { Exercise, GymData, WorkoutEntry, WorkoutSession } from '@/types';
import { ExerciseGuideDialog } from './exercise-guide-dialog';
import { ExerciseHologram } from './exercise-hologram';

/** Linha de série em edição (strings para permitir campo vazio enquanto digita). */
interface DraftSet {
  reps: string;
  kg: string;
}
interface DraftEntry {
  exerciseId: string;
  target?: string;
  sets: DraftSet[];
}

const num = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

function buildDraft(gym: GymData, date: string, weekday: number, existing?: WorkoutSession): DraftEntry[] {
  if (existing) {
    const planned = gym.plan.find((d) => d.title === existing.title)?.exercises ?? [];
    return existing.entries.map((e) => {
      const pe = planned.find((p) => p.exerciseId === e.exerciseId);
      return {
        exerciseId: e.exerciseId,
        target: pe ? `${pe.sets}×${pe.reps}` : undefined,
        sets: e.sets.map((s) => ({ reps: String(s.reps), kg: String(s.kg) })),
      };
    });
  }
  const day = gym.plan.find((d) => d.weekday === weekday);
  return (day?.exercises ?? []).map((pe) => {
    const last = lastEntry(gym.sessions, pe.exerciseId, date);
    const lastKg = last ? Math.max(...last.entry.sets.map((s) => s.kg)) : 0;
    const reps = String(parseInt(pe.reps, 10) || '');
    return {
      exerciseId: pe.exerciseId,
      target: `${pe.sets}×${pe.reps}`,
      sets: Array.from({ length: pe.sets }, () => ({ reps, kg: lastKg ? String(lastKg) : '' })),
    };
  });
}

export function WorkoutLogger({
  gym,
  date,
  onDateChange,
}: {
  gym: GymData;
  date: string;
  onDateChange: (d: string) => void;
}) {
  const save = useSaveSession();
  const existing = gym.sessions.find((s) => s.date === date);
  const naturalWeekday = parseISO(date).getDay();
  const [weekday, setWeekday] = useState(naturalWeekday);
  const [entries, setEntries] = useState<DraftEntry[]>([]);
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState('');
  const [howTo, setHowTo] = useState<{ exercise: Exercise; target?: string } | null>(null);

  const exById = useMemo(() => new Map(gym.exercises.map((e) => [e.id, e])), [gym.exercises]);
  const records = useMemo(() => personalRecords(gym.sessions.filter((s) => s.id !== existing?.id)), [gym.sessions, existing?.id]);

  // (Re)carrega ao trocar a data ou o dia do plano
  useEffect(() => {
    setWeekday(existing ? (gym.plan.find((d) => d.title === existing.title)?.weekday ?? naturalWeekday) : naturalWeekday);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);
  useEffect(() => {
    setEntries(buildDraft(gym, date, weekday, existing));
    setDuration(existing?.durationMin ? String(existing.durationMin) : '');
    setNote(existing?.note ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, weekday, existing?.id]);

  const day = gym.plan.find((d) => d.weekday === weekday);
  const title = existing?.title ?? (day?.title || 'Treino livre');

  const updateSet = (ei: number, si: number, patch: Partial<DraftSet>) =>
    setEntries((es) => es.map((e, i) => (i === ei ? { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : e)));
  const addSet = (ei: number) =>
    setEntries((es) => es.map((e, i) => (i === ei ? { ...e, sets: [...e.sets, { ...(e.sets.at(-1) ?? { reps: '', kg: '' }) }] } : e)));
  const removeSet = (ei: number, si: number) =>
    setEntries((es) => es.map((e, i) => (i === ei ? { ...e, sets: e.sets.filter((_, j) => j !== si) } : e)));
  const removeEntry = (ei: number) => setEntries((es) => es.filter((_, i) => i !== ei));
  const repeatLast = (ei: number) => {
    const last = lastEntry(gym.sessions, entries[ei].exerciseId, date);
    if (!last) return;
    setEntries((es) => es.map((e, i) => (i === ei ? { ...e, sets: last.entry.sets.map((s) => ({ reps: String(s.reps), kg: String(s.kg) })) } : e)));
  };

  const addExercise = (id: string) => {
    if (!id) return;
    const last = lastEntry(gym.sessions, id, date);
    const kg = last ? String(Math.max(...last.entry.sets.map((s) => s.kg))) : '';
    setEntries((es) => [...es, { exerciseId: id, sets: [{ reps: '10', kg }, { reps: '10', kg }, { reps: '10', kg }] }]);
    setAdding('');
  };

  const onSave = () => {
    const clean: WorkoutEntry[] = entries
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter((s) => num(s.reps) > 0).map((s) => ({ reps: num(s.reps), kg: num(s.kg) })),
      }))
      .filter((e) => e.sets.length > 0);
    save.mutate({
      id: existing?.id,
      date,
      title,
      entries: clean,
      durationMin: num(duration) || undefined,
      note: note.trim() || undefined,
    });
  };

  const totalSets = entries.reduce((a, e) => a + e.sets.filter((s) => num(s.reps) > 0).length, 0);
  const volume = entries.reduce((a, e) => a + e.sets.reduce((b, s) => b + num(s.kg) * num(s.reps), 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="g-date">Data</Label>
          <Input id="g-date" type="date" value={date} onChange={(e) => e.target.value && onDateChange(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="g-day">Treino</Label>
          <Select id="g-day" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} disabled={!!existing}>
            {WEEK_ORDER.map((w) => {
              const d = gym.plan.find((x) => x.weekday === w);
              return (
                <option key={w} value={w}>
                  {WEEKDAYS[w]} — {d?.title || 'Descanso'}
                </option>
              );
            })}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="g-dur">Duração (min)</Label>
            <Input id="g-dur" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Dumbbell className="size-5 text-primary" aria-hidden /> {title}
          </h2>
          <p className="text-sm text-foreground/60">
            {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
            {existing && ' · treino já registrado (editando)'}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-muted px-3 py-1 font-semibold tabular-nums">{totalSets} séries</span>
          <span className="rounded-full bg-muted px-3 py-1 font-semibold tabular-nums">{Math.round(volume).toLocaleString('pt-BR')} kg de volume</span>
        </div>
      </div>

      {entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Timer className="mx-auto size-8 text-foreground/30" aria-hidden />
          <p className="mt-2 font-semibold">{day?.title ? 'Nenhum exercício neste treino' : 'Dia de descanso'}</p>
          <p className="text-sm text-foreground/60">Adicione exercícios abaixo ou escolha outro treino.</p>
        </div>
      )}

      <ol className="space-y-3">
        {entries.map((e, ei) => {
          const exercise = exById.get(e.exerciseId);
          const pr = records.get(e.exerciseId);
          const last = lastEntry(gym.sessions, e.exerciseId, date);
          const bestNow = Math.max(0, ...e.sets.map((s) => num(s.kg)));
          const isPR = bestNow > 0 && (!pr || bestNow > pr.kg);
          // Sobrecarga progressiva: bateu o topo da faixa em todas as séries da última vez → sugerir subir
          const top = e.target ? topReps(e.target.split('×')[1] ?? '') : 0;
          const lastKg = last ? Math.max(...last.entry.sets.map((s) => s.kg)) : 0;
          const hitTop = !!last && top > 0 && lastKg > 0 && last.entry.sets.every((s) => s.reps >= top);
          const suggestKg = lastKg + (lastKg >= 60 ? 5 : lastKg >= 20 ? 2.5 : 1);
          const applied = hitTop && e.sets.every((s) => num(s.kg) >= suggestKg);
          return (
            <li key={`${e.exerciseId}-${ei}`} className={cn('rounded-xl border bg-card p-4', isPR ? 'border-neon shadow-neon' : 'border-border')}>
              <div className="flex flex-wrap items-start gap-3">
                {exercise && (
                  <button
                    type="button"
                    onClick={() => setHowTo({ exercise, target: e.target })}
                    className="w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-200 hover:shadow-neon sm:w-28"
                    aria-label={`Ver como fazer: ${exercise.name}`}
                    title="Ver como fazer"
                  >
                    <ExerciseHologram exercise={exercise} compact />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {ei + 1}. {exercise?.name ?? 'Exercício'}
                    {isPR && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 align-middle text-[11px] font-bold text-navy">
                        <Trophy className="size-3" aria-hidden /> Novo PR
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-foreground/60">
                    {exercise && MUSCLE_LABEL[exercise.muscle]}
                    {e.target && ` · meta ${e.target}`}
                    {last && ` · última: ${formatKg(Math.max(...last.entry.sets.map((s) => s.kg)))} (${format(parseISO(last.date), 'dd/MM')})`}
                    {pr && ` · PR ${formatKg(pr.kg)} × ${pr.reps}`}
                  </p>
                  {exercise && (
                    <button
                      type="button"
                      onClick={() => setHowTo({ exercise, target: e.target })}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline dark:text-neon"
                    >
                      <ScanEye className="size-3.5" aria-hidden /> Como fazer
                    </button>
                  )}
                </div>
                {hitTop && !applied && (
                  <Button
                    size="sm"
                    onClick={() => setEntries((es) => es.map((x, i) => (i === ei ? { ...x, sets: x.sets.map((s) => ({ ...s, kg: String(suggestKg) })) } : x)))}
                    title="Você fez o topo das repetições no último treino — hora de subir a carga"
                  >
                    <TrendingUp /> Suba para {formatKg(suggestKg)}
                  </Button>
                )}
                {last && (
                  <Button variant="ghost" size="sm" onClick={() => repeatLast(ei)} title="Copiar séries do último treino">
                    <Copy /> Repetir última
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => removeEntry(ei)} aria-label={`Remover ${exercise?.name}`} className="hover:text-primary">
                  <X />
                </Button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[260px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-foreground/50">
                      <th className="w-10 pb-1 font-medium">Série</th>
                      <th className="pb-1 font-medium">Carga (kg)</th>
                      <th className="pb-1 font-medium">Reps</th>
                      <th className="w-8 pb-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {e.sets.map((s, si) => {
                      const setPR = num(s.kg) > 0 && num(s.kg) === bestNow && isPR;
                      return (
                        <tr key={si}>
                          <td className="py-1 font-semibold tabular-nums text-foreground/60">{si + 1}</td>
                          <td className="py-1 pr-2">
                            <div className="relative">
                              <Input
                                inputMode="decimal"
                                value={s.kg}
                                onChange={(ev) => updateSet(ei, si, { kg: ev.target.value })}
                                aria-label={`Carga da série ${si + 1} de ${exercise?.name}`}
                                className={cn('h-9 tabular-nums', setPR && 'border-amber-400')}
                                placeholder="0"
                              />
                              {setPR && <Trophy className="absolute right-2 top-1/2 size-4 -translate-y-1/2 text-amber-500" aria-label="PR" />}
                            </div>
                          </td>
                          <td className="py-1 pr-2">
                            <Input
                              inputMode="numeric"
                              value={s.reps}
                              onChange={(ev) => updateSet(ei, si, { reps: ev.target.value })}
                              aria-label={`Repetições da série ${si + 1} de ${exercise?.name}`}
                              className="h-9 tabular-nums"
                              placeholder="0"
                            />
                          </td>
                          <td className="py-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => removeSet(ei, si)} aria-label={`Remover série ${si + 1}`} className="hover:text-primary">
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => addSet(ei)}>
                <Plus /> Série
              </Button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="g-add">Adicionar exercício</Label>
          <Select id="g-add" value={adding} onChange={(e) => addExercise(e.target.value)}>
            <option value="">Escolha um exercício…</option>
            {Object.entries(MUSCLE_LABEL).map(([m, label]) => (
              <optgroup key={m} label={label}>
                {gym.exercises.filter((x) => x.muscle === m).map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>
      </div>

      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observações: como se sentiu, dores, ajustes de carga…" aria-label="Observações do treino" className="min-h-[70px]" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs text-foreground/50">
          <History className="size-3.5" aria-hidden /> Séries sem repetições são ignoradas ao salvar.
        </p>
        <Button onClick={onSave} disabled={save.isPending || entries.length === 0} size="lg">
          <Save /> {existing ? 'Atualizar treino' : 'Salvar treino'}
        </Button>
      </div>

      <ExerciseGuideDialog exercise={howTo?.exercise ?? null} target={howTo?.target} onClose={() => setHowTo(null)} />
    </div>
  );
}
