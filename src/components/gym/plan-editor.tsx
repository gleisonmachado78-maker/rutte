import { ChevronDown, ChevronUp, Moon, Plus, Save, ScanEye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/form-controls';
import { useCreateExercise, useSavePlanDay } from '@/hooks/use-data';
import { MUSCLE_LABEL, WEEKDAYS, WEEK_ORDER } from '@/lib/gym';
import { cn } from '@/lib/utils';
import type { Exercise, GymData, MuscleGroup, PlannedExercise, WorkoutDay } from '@/types';
import { ExerciseGuideDialog } from './exercise-guide-dialog';

function DayCard({ day, gym, onHowTo }: { day: WorkoutDay; gym: GymData; onHowTo: (e: Exercise, target: string) => void }) {
  const save = useSavePlanDay();
  const [title, setTitle] = useState(day.title);
  const [items, setItems] = useState<PlannedExercise[]>(day.exercises);
  const [dirty, setDirty] = useState(false);
  const isToday = new Date().getDay() === day.weekday;

  useEffect(() => {
    setTitle(day.title);
    setItems(day.exercises);
    setDirty(false);
  }, [day]);

  const change = (fn: (xs: PlannedExercise[]) => PlannedExercise[]) => {
    setItems(fn);
    setDirty(true);
  };
  const move = (i: number, d: -1 | 1) =>
    change((xs) => {
      const next = [...xs];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  const exName = (id: string) => gym.exercises.find((e) => e.id === id)?.name ?? id;

  return (
    <article className={cn('flex flex-col rounded-xl border bg-card p-4', isToday ? 'border-neon shadow-neon' : 'border-border')}>
      <header className="mb-3 flex items-center gap-2">
        <span className={cn('rounded-lg px-2 py-1 text-xs font-bold uppercase', isToday ? 'bg-primary text-white' : 'bg-muted')}>
          {WEEKDAYS[day.weekday]}
        </span>
        {isToday && <span className="text-xs font-semibold text-primary">Hoje</span>}
      </header>
      <Label htmlFor={`pl-${day.weekday}`}>Grupo / nome do treino</Label>
      <Input
        id={`pl-${day.weekday}`}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
        placeholder="Ex: Peito e tríceps (vazio = descanso)"
      />

      {!title.trim() && items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-foreground/50">
          <Moon className="size-4" aria-hidden /> Descanso
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {items.map((it, i) => (
            <li key={`${it.exerciseId}-${i}`} className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5">
              <button
                type="button"
                onClick={() => {
                  const ex = gym.exercises.find((x) => x.id === it.exerciseId);
                  if (ex) onHowTo(ex, `${it.sets}×${it.reps}`);
                }}
                className="inline-flex min-w-0 flex-1 items-center gap-1 text-left text-sm font-medium hover:text-primary"
                title="Ver como fazer"
              >
                <ScanEye className="size-3.5 shrink-0 text-primary dark:text-neon" aria-hidden />
                <span className="truncate">{exName(it.exerciseId)}</span>
              </button>
              <input
                aria-label={`Séries de ${exName(it.exerciseId)}`}
                inputMode="numeric"
                value={it.sets}
                onChange={(e) => change((xs) => xs.map((x, j) => (j === i ? { ...x, sets: Math.max(1, Number(e.target.value) || 1) } : x)))}
                className="h-8 w-10 rounded-md border border-border bg-background text-center text-sm tabular-nums"
              />
              <span className="text-xs text-foreground/50">×</span>
              <input
                aria-label={`Repetições de ${exName(it.exerciseId)}`}
                value={it.reps}
                onChange={(e) => change((xs) => xs.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))}
                className="h-8 w-14 rounded-md border border-border bg-background text-center text-sm tabular-nums"
              />
              <Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                <ChevronUp />
              </Button>
              <Button variant="ghost" size="icon-sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descer">
                <ChevronDown />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => change((xs) => xs.filter((_, j) => j !== i))} aria-label="Remover" className="hover:text-primary">
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Select
        aria-label={`Adicionar exercício em ${WEEKDAYS[day.weekday]}`}
        value=""
        onChange={(e) => e.target.value && change((xs) => [...xs, { exerciseId: e.target.value, sets: 3, reps: '10' }])}
        className="mt-3"
      >
        <option value="">+ Adicionar exercício</option>
        {Object.entries(MUSCLE_LABEL).map(([m, label]) => (
          <optgroup key={m} label={label}>
            {gym.exercises.filter((x) => x.muscle === m).map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </optgroup>
        ))}
      </Select>

      <div className="mt-auto pt-3">
        <Button
          className="w-full"
          variant={dirty ? 'primary' : 'outline'}
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate({ weekday: day.weekday, title: title.trim(), exercises: items }, { onSuccess: () => setDirty(false) })}
        >
          <Save /> {dirty ? 'Salvar dia' : 'Salvo'}
        </Button>
      </div>
    </article>
  );
}

function NewExercise() {
  const create = useCreateExercise();
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('peito');
  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), muscle });
    toast.success('Exercício cadastrado', { description: name.trim() });
    setName('');
  };
  return (
    <div className="grid gap-2 rounded-xl border border-dashed border-border p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
      <div>
        <Label htmlFor="nx-name">Novo exercício</Label>
        <Input id="nx-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Ex: Supino declinado" />
      </div>
      <div>
        <Label htmlFor="nx-muscle">Grupo muscular</Label>
        <Select id="nx-muscle" value={muscle} onChange={(e) => setMuscle(e.target.value as MuscleGroup)}>
          {Object.entries(MUSCLE_LABEL).map(([m, l]) => (
            <option key={m} value={m}>{l}</option>
          ))}
        </Select>
      </div>
      <Button onClick={submit} disabled={create.isPending}>
        <Plus /> Cadastrar
      </Button>
    </div>
  );
}

export function PlanEditor({ gym }: { gym: GymData }) {
  const [howTo, setHowTo] = useState<{ exercise: Exercise; target: string } | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        Monte sua divisão de treino. Ex.: segunda peito, terça perna… Deixe o nome vazio para marcar descanso.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {WEEK_ORDER.map((w) => {
          const day = gym.plan.find((d) => d.weekday === w) ?? { weekday: w, title: '', exercises: [] };
          return <DayCard key={w} day={day} gym={gym} onHowTo={(exercise, target) => setHowTo({ exercise, target })} />;
        })}
      </div>
      <NewExercise />
      <ExerciseGuideDialog exercise={howTo?.exercise ?? null} target={howTo?.target} onClose={() => setHowTo(null)} />
    </div>
  );
}
