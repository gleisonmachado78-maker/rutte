import { askConfirm } from '@/components/ui/confirm';
import { addDays, format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  Plus,
  RotateCcw,
  ScanEye,
  ScanLine,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/form-controls';
import {
  useApplyGeneratedPlan,
  useCreateTask,
  useLookups,
  useSaveBody,
  useSaveGymProfile,
  useTasks,
} from '@/hooks/use-data';
import { bmi, fmt1, parseNum, proteinRange, sortedLog, waterLiters } from '@/lib/body';
import { todayISO } from '@/lib/task-utils';
import { MUSCLE_LABEL, WEEKDAYS, WEEKDAYS_SHORT, WEEK_ORDER } from '@/lib/gym';
import { isClosed } from '@/lib/task-utils';
import { habitsFor, type TrainingHabit } from '@/lib/training-habits';
import { cn } from '@/lib/utils';
import {
  EXTRA_EXERCISES,
  findExercise,
  generatePlan,
  GOALS,
  LEVELS,
  muscleIntensity,
  PLACES,
  RESTRICTIONS,
  type GeneratedPlan,
} from '@/lib/workout-generator';
import type { Exercise, GymData, MuscleGroup, Restriction, TrainingProfile, WorkoutDay } from '@/types';
import { BmiBadge } from './body-stats';
import { ExerciseGuideDialog } from './exercise-guide-dialog';
import { Hologram } from './hologram';

const DEFAULT_PROFILE: TrainingProfile = {
  goal: 'hipertrofia',
  level: 'intermediario',
  weekdays: [1, 2, 3, 4, 5],
  minutes: 60,
  focus: [],
  place: 'academia',
  restrictions: [],
  preferredTime: '07:00',
};

const STEPS = ['Corpo', 'Objetivo', 'Nível', 'Dias', 'Tempo', 'Foco', 'Local'] as const;
const FOCUS_OPTIONS: MuscleGroup[] = ['peito', 'costas', 'ombros', 'biceps', 'triceps', 'abdomen', 'pernas', 'gluteos', 'panturrilha'];

function OptionCard({ active, onClick, title, desc, emoji }: { active: boolean; onClick: () => void; title: string; desc?: string; emoji?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
        active ? 'border-neon bg-primary/10 shadow-neon' : 'border-border bg-card hover:bg-muted',
      )}
    >
      {emoji && <span className="text-2xl" aria-hidden>{emoji}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {desc && <span className="block text-xs text-foreground/60">{desc}</span>}
      </span>
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', active ? 'border-primary bg-primary text-white' : 'border-foreground/30')}>
        {active && <Check className="size-3" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all duration-200',
        active ? 'border-neon bg-primary text-white shadow-neon' : 'border-border bg-card hover:bg-muted',
      )}
    >
      {active && <Check className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}

const toggle = <T,>(xs: T[], v: T) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]);

/* ------------------------------ Resultado editável ------------------------------ */

function EditableDay({
  day,
  library,
  onChange,
  onHowTo,
}: {
  day: WorkoutDay;
  library: Exercise[];
  onChange: (d: WorkoutDay) => void;
  onHowTo: (e: Exercise, target: string) => void;
}) {
  const set = (i: number, patch: Partial<WorkoutDay['exercises'][number]>) =>
    onChange({ ...day, exercises: day.exercises.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const grouped = (Object.keys(MUSCLE_LABEL) as MuscleGroup[]).map((m) => ({ m, items: library.filter((e) => e.muscle === m) }));
  const options = grouped.map(({ m, items }) => (
    <optgroup key={m} label={MUSCLE_LABEL[m]}>
      {items.map((e) => (
        <option key={e.id} value={e.id}>{e.name}</option>
      ))}
    </optgroup>
  ));

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-lg bg-primary px-2 py-1 text-xs font-bold uppercase text-white">{WEEKDAYS_SHORT[day.weekday]}</span>
        <Input value={day.title} onChange={(e) => onChange({ ...day, title: e.target.value })} aria-label={`Nome do treino de ${WEEKDAYS[day.weekday]}`} className="h-9 font-semibold" />
      </div>
      <ul className="space-y-1.5">
        {day.exercises.map((pe, i) => (
          <li key={`${pe.exerciseId}-${i}`} className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-primary dark:text-neon"
              aria-label="Ver como fazer"
              title="Ver como fazer"
              onClick={() => {
                const ex = library.find((x) => x.id === pe.exerciseId);
                if (ex) onHowTo(ex, `${pe.sets}×${pe.reps}`);
              }}
            >
              <ScanEye />
            </Button>
            <div className="min-w-0 flex-1">
              <Select value={pe.exerciseId} onChange={(e) => set(i, { exerciseId: e.target.value })} aria-label="Trocar exercício" className="h-9 text-sm">
                {options}
              </Select>
            </div>
            <input
              aria-label="Séries"
              inputMode="numeric"
              value={pe.sets}
              onChange={(e) => set(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 w-10 shrink-0 rounded-lg border border-border bg-background text-center text-sm tabular-nums"
            />
            <span className="text-xs text-foreground/50">×</span>
            <input
              aria-label="Repetições"
              value={pe.reps}
              onChange={(e) => set(i, { reps: e.target.value })}
              className="h-9 w-14 shrink-0 rounded-lg border border-border bg-background text-center text-sm tabular-nums"
            />
            <Button variant="ghost" size="icon-sm" onClick={() => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })} aria-label="Remover exercício" className="shrink-0 hover:text-primary">
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <Select
        value=""
        onChange={(e) => e.target.value && onChange({ ...day, exercises: [...day.exercises, { exerciseId: e.target.value, sets: 3, reps: '10-12' }] })}
        aria-label="Adicionar exercício"
        className="mt-2 h-9 text-sm"
      >
        <option value="">+ Adicionar exercício</option>
        {options}
      </Select>
    </article>
  );
}

function HabitCard({ habit, onAdd, added }: { habit: TrainingHabit; onAdd: () => void; added: boolean }) {
  const Icon = habit.icon;
  return (
    <li className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:text-neon">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{habit.title}</p>
        <p className="mt-0.5 text-xs text-foreground/60">{habit.why}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        title={added ? 'Adicionado aos afazeres' : 'Transformar em afazer/hábito'}
        aria-label={added ? `Já adicionado: ${habit.title}` : `Virar hábito: ${habit.title}`}
        className={cn(
          'grid size-8 shrink-0 place-items-center self-center rounded-full transition-all duration-200',
          added ? 'bg-emerald-500 text-white' : 'btn-neon text-white hover:brightness-110',
        )}
      >
        {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
      </button>
    </li>
  );
}

/* ---------------------------------- Principal ---------------------------------- */

export function WorkoutGenerator({ gym, onApplied }: { gym: GymData; onApplied: () => void }) {
  const [profile, setProfile] = useState<TrainingProfile>(gym.profile ?? DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<GeneratedPlan | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [addedHabits, setAddedHabits] = useState<string[]>([]);
  const [howTo, setHowTo] = useState<{ exercise: Exercise; target: string } | null>(null);
  const saveProfile = useSaveGymProfile();
  const saveBody = useSaveBody();
  const apply = useApplyGeneratedPlan();
  const createTask = useCreateTask();
  const { data: tasks = [] } = useTasks();
  const { categories } = useLookups();

  const library = useMemo(() => {
    const have = new Set(gym.exercises.map((e) => e.id));
    return [...gym.exercises, ...EXTRA_EXERCISES.filter((e) => !have.has(e.id))];
  }, [gym.exercises]);

  const set = (patch: Partial<TrainingProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const intensity = useMemo(() => {
    if (result) return muscleIntensity(days);
    return Object.fromEntries(profile.focus.map((m) => [m, 0.85])) as Partial<Record<MuscleGroup, number>>;
  }, [result, days, profile.focus]);

  // Peso e altura (texto para permitir vírgula enquanto digita)
  const lastWeight = sortedLog(gym.bodyLog).at(-1)?.weightKg ?? gym.profile?.weightKg;
  const [weightTxt, setWeightTxt] = useState(lastWeight ? String(lastWeight).replace('.', ',') : '');
  const [heightTxt, setHeightTxt] = useState(gym.profile?.heightCm ? String(gym.profile.heightCm) : '');
  const weightKg = parseNum(weightTxt);
  const heightCm = parseNum(heightTxt);
  const bodyValid =
    (!weightTxt || (weightKg >= 20 && weightKg <= 400)) && (!heightTxt || (heightCm >= 100 && heightCm <= 250));
  const bodyText =
    weightKg && heightCm ? `${fmt1(weightKg)} kg · ${(heightCm / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m · IMC ${fmt1(bmi(weightKg, heightCm)!)}` : '';

  const canNext = (step !== 3 || profile.weekdays.length > 0) && (step !== 0 || bodyValid);

  const generate = () => {
    setScanning(true);
    const withBody = { ...profile, weightKg: weightKg || undefined, heightCm: heightCm || undefined };
    setProfile(withBody);
    saveProfile.mutate(withBody);
    if (weightKg) saveBody.mutate({ date: todayISO(), weightKg, heightCm: heightCm || undefined, silent: true });
    window.setTimeout(() => {
      const plan = generatePlan(profile, gym.exercises);
      setResult(plan);
      setDays(plan.days);
      setScanning(false);
    }, 1600);
  };

  useEffect(() => {
    if (result) document.getElementById('gen-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const onApply = async () => {
    if (!result) return;
    const ok = await askConfirm({ title: 'Aplicar este treino?', message: 'Ele vai substituir o seu plano semanal atual. Você pode editar depois em Plano semanal.', confirmLabel: 'Aplicar' });
    if (!ok) return;
    const usedIds = new Set(days.flatMap((d) => d.exercises.map((e) => e.exerciseId)));
    const have = new Set(gym.exercises.map((e) => e.id));
    const newExercises = [...usedIds].filter((id) => !have.has(id)).map((id) => findExercise(id)!).filter(Boolean);
    apply.mutate({ plan: days.map((d) => ({ ...d, title: d.title.trim() })), newExercises }, { onSuccess: onApplied });
  };

  const nextDate = (weekday: number) => {
    const t = new Date();
    return format(addDays(t, (weekday - t.getDay() + 7) % 7), 'yyyy-MM-dd');
  };

  const createReminders = async () => {
    const catId = categories.find((c) => c.name.toLowerCase() === 'academia')?.id;
    let count = 0;
    for (const d of days.filter((x) => x.title.trim())) {
      const title = `Treino: ${d.title.trim()}`;
      if (tasks.some((t) => t.title === title && !isClosed(t))) continue;
      await createTask.mutateAsync({
        title,
        whatToDo: d.exercises.map((e) => `${findExercise(e.exerciseId)?.name ?? library.find((l) => l.id === e.exerciseId)?.name} — ${e.sets}×${e.reps}`).join('\n'),
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        dueDate: nextDate(d.weekday),
        deadlineTime: profile.preferredTime || undefined,
        recurrenceRule: 'FREQ=WEEKLY',
        scope: 'PERSONAL',
        categoryId: catId,
        lifeAreaId: 'saude',
        subtasks: [],
        links: [],
      });
      count++;
    }
    if (!count) toast('Os lembretes desses treinos já existem nos seus afazeres.');
  };

  const addHabit = async (h: TrainingHabit) => {
    await createTask.mutateAsync({
      title: h.title,
      whatToDo: h.why,
      status: 'NOT_STARTED',
      priority: h.kind === 'acelerar' ? 'HIGH' : 'MEDIUM',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      recurrenceRule: h.recurrence,
      scope: 'PERSONAL',
      lifeAreaId: 'saude',
      subtasks: [],
      links: [],
    });
    setAddedHabits((a) => [...a, h.id]);
  };

  // Boas práticas com metas calculadas pelo peso informado
  const habits = habitsFor(profile.goal).map((h) => {
    if (!weightKg) return h;
    if (h.id === 'h_proteina') {
      const p = proteinRange(weightKg);
      return { ...h, title: `Bater ${p.min}–${p.max} g de proteína por dia`, why: `${h.why} (1,6–2 g × ${fmt1(weightKg)} kg)` };
    }
    if (h.id === 'h_agua') return { ...h, title: `Beber ~${fmt1(waterLiters(weightKg))} L de água por dia` };
    return h;
  });
  const status = scanning
    ? 'Analisando respostas e montando seu treino…'
    : result
      ? `${result.splitName} · ${GOALS[profile.goal].label}${bodyText ? ` · ${bodyText}` : ''}`
      : `Etapa ${step + 1} de ${STEPS.length} · ${STEPS[step]}${bodyText ? ` · ${bodyText}` : ''}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Hologram intensity={intensity} scanning={scanning} status={status} />
        </div>

        {/* Questionário */}
        <section aria-labelledby="quiz-title" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="quiz-title" className="flex items-center gap-2 text-lg font-bold">
            <ScanLine className="size-5 text-primary icon-glow dark:text-neon" aria-hidden /> Pesquisa do seu treino ideal
          </h2>
          <p className="text-sm text-foreground/60">Responda 7 perguntas rápidas. A Rutte monta a divisão — e você ajusta o que quiser.</p>

          <ol className="mt-4 flex gap-1" aria-label="Progresso">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn('h-1.5 w-full rounded-full transition-all duration-300', i <= step ? 'bg-primary shadow-neon' : 'bg-muted')}
                  aria-label={`Ir para ${s}`}
                  aria-current={i === step ? 'step' : undefined}
                />
                <span className={cn('mt-1 hidden text-[11px] sm:block', i === step ? 'font-semibold' : 'text-foreground/50')}>{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 min-h-[280px]" role="radiogroup" aria-label={STEPS[step]}>
            {step === 0 && (
              <fieldset className="space-y-4">
                <legend className="mb-2 font-semibold">Seu corpo hoje <span className="font-normal text-foreground/50">(opcional, mas deixa tudo mais preciso)</span></legend>
                <div className="grid max-w-sm grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="gen-w">Peso (kg)</Label>
                    <Input id="gen-w" inputMode="decimal" value={weightTxt} onChange={(e) => setWeightTxt(e.target.value)} placeholder="72,5" />
                  </div>
                  <div>
                    <Label htmlFor="gen-h">Altura (cm)</Label>
                    <Input id="gen-h" inputMode="numeric" value={heightTxt} onChange={(e) => setHeightTxt(e.target.value)} placeholder="175" />
                  </div>
                </div>
                {!bodyValid && <p className="text-xs text-primary">Confira: peso entre 20–400 kg e altura entre 100–250 cm.</p>}
                {bodyValid && weightKg > 0 && heightCm > 0 && (
                  <div className="space-y-2">
                    <BmiBadge weightKg={weightKg} heightCm={heightCm} />
                    <p className="text-xs text-foreground/60">
                      Metas personalizadas: proteína ~{proteinRange(weightKg).min}–{proteinRange(weightKg).max} g/dia · água ~{fmt1(waterLiters(weightKg))} L/dia.
                    </p>
                  </div>
                )}
                <p className="text-xs text-foreground/50">Seu peso também entra no histórico de “Peso corporal” da aba Evolução.</p>
              </fieldset>
            )}
            {step === 1 && (
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">Qual é o seu principal objetivo?</legend>
                {(Object.keys(GOALS) as (keyof typeof GOALS)[]).map((g) => (
                  <OptionCard key={g} active={profile.goal === g} onClick={() => set({ goal: g })} title={GOALS[g].label} desc={GOALS[g].desc} emoji={GOALS[g].emoji} />
                ))}
              </fieldset>
            )}
            {step === 2 && (
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">Há quanto tempo você treina?</legend>
                {(Object.keys(LEVELS) as (keyof typeof LEVELS)[]).map((l) => (
                  <OptionCard key={l} active={profile.level === l} onClick={() => set({ level: l })} title={LEVELS[l].label} desc={LEVELS[l].desc} />
                ))}
              </fieldset>
            )}
            {step === 3 && (
              <fieldset className="space-y-3">
                <legend className="mb-2 font-semibold">Quais dias você consegue treinar?</legend>
                <div className="flex flex-wrap gap-2">
                  {WEEK_ORDER.map((w) => (
                    <Chip key={w} active={profile.weekdays.includes(w)} onClick={() => setProfile((p) => ({ ...p, weekdays: toggle(p.weekdays, w) }))}>
                      {WEEKDAYS_SHORT[w]}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-foreground/60">
                  {profile.weekdays.length} {profile.weekdays.length === 1 ? 'dia' : 'dias'} por semana
                  {profile.weekdays.length > 6 && ' — recomendamos ao menos 1 dia de descanso (usaremos 6).'}
                  {profile.weekdays.length === 0 && ' — escolha pelo menos um dia.'}
                </p>
                <div className="max-w-[200px]">
                  <Label htmlFor="gen-time">Horário preferido</Label>
                  <Input id="gen-time" type="time" value={profile.preferredTime ?? ''} onChange={(e) => set({ preferredTime: e.target.value })} />
                </div>
              </fieldset>
            )}
            {step === 4 && (
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="mb-2 font-semibold">Quanto tempo por treino?</legend>
                {([30, 45, 60, 90] as const).map((m) => (
                  <OptionCard key={m} active={profile.minutes === m} onClick={() => set({ minutes: m })} title={`${m} min`} desc={m <= 30 ? 'Rápido e intenso' : m >= 90 ? 'Volume alto' : 'Equilibrado'} />
                ))}
              </fieldset>
            )}
            {step === 5 && (
              <fieldset className="space-y-3">
                <legend className="mb-2 font-semibold">Quer dar prioridade a algum músculo? <span className="font-normal text-foreground/50">(opcional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((m) => (
                    <Chip key={m} active={profile.focus.includes(m)} onClick={() => setProfile((p) => ({ ...p, focus: toggle(p.focus, m) }))}>
                      {MUSCLE_LABEL[m]}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-foreground/60">Os grupos escolhidos acendem no holograma e ganham um exercício extra.</p>
              </fieldset>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="mb-2 font-semibold">Onde você vai treinar?</legend>
                  {(Object.keys(PLACES) as (keyof typeof PLACES)[]).map((p) => (
                    <OptionCard key={p} active={profile.place === p} onClick={() => set({ place: p })} title={PLACES[p].label} desc={PLACES[p].desc} />
                  ))}
                </fieldset>
                <fieldset>
                  <legend className="mb-2 font-semibold">Alguma dor ou restrição?</legend>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(RESTRICTIONS) as Restriction[]).map((r) => (
                      <Chip key={r} active={profile.restrictions.includes(r)} onClick={() => setProfile((p) => ({ ...p, restrictions: toggle(p.restrictions, r) }))}>
                        {RESTRICTIONS[r]}
                      </Chip>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-foreground/60">Sentindo dor, procure um profissional. Evitaremos exercícios que sobrecarregam essa região.</p>
                </fieldset>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft /> Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Próximo <ArrowRight />
              </Button>
            ) : (
              <Button onClick={generate} disabled={scanning || profile.weekdays.length === 0} size="lg">
                <Sparkles /> {scanning ? 'Gerando…' : result ? 'Gerar novamente' : 'Gerar meu treino'}
              </Button>
            )}
          </div>
        </section>
      </div>

      {/* Resultado */}
      {result && !scanning && (
        <section id="gen-result" aria-labelledby="res-title" className="scroll-mt-20 space-y-4">
          <div className="rounded-2xl border border-neon/50 bg-card p-4 shadow-neon sm:p-6">
            <h2 id="res-title" className="flex items-center gap-2 text-xl font-bold">
              <Zap className="size-5 text-primary dark:text-neon" aria-hidden /> Seu treino: {result.splitName}
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-foreground/80">
              {result.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden /> {h}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-foreground/50">
              Sugestão gerada por regras gerais de treino — ajuste à vontade e, se possível, valide com um profissional de educação física.
            </p>
          </div>

          <p className="text-sm font-medium">Ajuste o que quiser (troque exercícios, séries e repetições) antes de aplicar:</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {WEEK_ORDER.map((w) => days[w]).filter((d) => d.title || d.exercises.length).map((d) => (
              <EditableDay key={d.weekday} day={d} library={library} onHowTo={(exercise, target) => setHowTo({ exercise, target })} onChange={(nd) => setDays((ds) => ds.map((x) => (x.weekday === nd.weekday ? nd : x)))} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={onApply} disabled={apply.isPending}>
              <Check /> Aplicar ao meu plano
            </Button>
            <Button size="lg" variant="outline" className="h-auto min-h-12 whitespace-normal py-2 text-left" onClick={createReminders} disabled={createTask.isPending}>
              <BellRing /> Criar lembretes semanais nos afazeres
            </Button>
            <Button size="lg" variant="ghost" onClick={() => { setResult(null); setStep(0); }}>
              <RotateCcw /> Refazer pesquisa
            </Button>
          </div>
        </section>
      )}

      <ExerciseGuideDialog exercise={howTo?.exercise ?? null} target={howTo?.target} onClose={() => setHowTo(null)} />

      {/* Boas práticas */}
      <section aria-labelledby="habits-title" className="space-y-3">
        <div>
          <h2 id="habits-title" className="text-lg font-bold">Boas práticas da Rutte</h2>
          <p className="text-sm text-foreground/60">
            Escolhidas para o objetivo <strong>{GOALS[profile.goal].label}</strong>. Toque no + para transformar em afazer recorrente.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(['foco', 'acelerar'] as const).map((kind) => (
            <div key={kind}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground/70">
                {kind === 'foco' ? <ScanLine className="size-4" aria-hidden /> : <Zap className="size-4" aria-hidden />}
                {kind === 'foco' ? 'Para não sair do foco' : 'Para acelerar os resultados'}
              </h3>
              <ul className="space-y-2">
                {habits.filter((h) => h.kind === kind).map((h) => (
                  <HabitCard key={h.id} habit={h} added={addedHabits.includes(h.id) || tasks.some((t) => t.title === h.title && !isClosed(t))} onAdd={() => addHabit(h)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
