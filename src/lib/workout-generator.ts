/**
 * Gerador de treino baseado em regras (sem IA externa): transforma as respostas do
 * questionário em uma divisão semanal com exercícios, séries e repetições.
 * O resultado é só um ponto de partida — o usuário edita antes de aplicar.
 */
import type {
  Exercise,
  MuscleGroup,
  PlannedExercise,
  Restriction,
  TrainingGoal,
  TrainingLevel,
  TrainingPlace,
  TrainingProfile,
  WorkoutDay,
} from '@/types';
import { DEFAULT_EXERCISES, MUSCLE_LABEL, WEEKDAYS } from './gym';

/* --------------------------- Metadados dos exercícios --------------------------- */

interface ExerciseMeta {
  places: TrainingPlace[];
  stress?: Restriction[];
  /** multiarticular (vem primeiro no treino) */
  compound?: boolean;
}

/** Exercícios extras (casa / peso corporal) adicionados à biblioteca quando usados. */
export const EXTRA_EXERCISES: Exercise[] = [
  { id: 'ex_flexao', name: 'Flexão de braço', muscle: 'peito' },
  { id: 'ex_supino_halter', name: 'Supino com halteres', muscle: 'peito' },
  { id: 'ex_agachamento_corpo', name: 'Agachamento com peso corporal', muscle: 'pernas' },
  { id: 'ex_agachamento_goblet', name: 'Agachamento goblet', muscle: 'pernas' },
  { id: 'ex_afundo', name: 'Afundo (avanço)', muscle: 'pernas' },
  { id: 'ex_ponte', name: 'Ponte de glúteo', muscle: 'gluteos' },
  { id: 'ex_remada_halter', name: 'Remada unilateral com halter', muscle: 'costas' },
  { id: 'ex_barra_fixa', name: 'Barra fixa (ou australiana)', muscle: 'costas' },
  { id: 'ex_mergulho', name: 'Mergulho no banco', muscle: 'triceps' },
  { id: 'ex_abd_bicicleta', name: 'Abdominal bicicleta', muscle: 'abdomen' },
  { id: 'ex_elevacao_pernas', name: 'Elevação de pernas', muscle: 'abdomen' },
  { id: 'ex_burpee', name: 'Burpee', muscle: 'cardio' },
  { id: 'ex_polichinelo', name: 'Polichinelo (min)', muscle: 'cardio' },
  { id: 'ex_bike', name: 'Bicicleta ergométrica (min)', muscle: 'cardio' },
];

const ALL: TrainingPlace[] = ['academia', 'halteres', 'corpo'];
const GYM: TrainingPlace[] = ['academia'];
const DB: TrainingPlace[] = ['academia', 'halteres'];

const META: Record<string, ExerciseMeta> = {
  ex_supino_reto: { places: GYM, stress: ['ombro'], compound: true },
  ex_supino_inclinado: { places: DB, compound: true },
  ex_supino_halter: { places: DB, compound: true },
  ex_flexao: { places: ALL, compound: true },
  ex_crucifixo: { places: DB },
  ex_triceps_pulley: { places: GYM },
  ex_triceps_frances: { places: DB, stress: ['ombro'] },
  ex_mergulho: { places: ['halteres', 'corpo'], stress: ['ombro'] },
  ex_agachamento: { places: GYM, stress: ['joelho', 'lombar'], compound: true },
  ex_agachamento_goblet: { places: DB, stress: ['joelho'], compound: true },
  ex_agachamento_corpo: { places: ['halteres', 'corpo'], stress: ['joelho'], compound: true },
  ex_leg_press: { places: GYM, stress: ['joelho'], compound: true },
  ex_afundo: { places: ALL, stress: ['joelho'], compound: true },
  ex_extensora: { places: GYM, stress: ['joelho'] },
  ex_flexora: { places: GYM },
  ex_stiff: { places: DB, stress: ['lombar'], compound: true },
  ex_elevacao_pelvica: { places: DB, compound: true },
  ex_ponte: { places: ['halteres', 'corpo'] },
  ex_panturrilha: { places: ALL },
  ex_puxada: { places: GYM, compound: true },
  ex_barra_fixa: { places: ['academia', 'corpo'], compound: true },
  ex_remada_curvada: { places: DB, stress: ['lombar'], compound: true },
  ex_remada_baixa: { places: GYM, compound: true },
  ex_remada_halter: { places: DB, compound: true },
  ex_rosca_direta: { places: DB },
  ex_rosca_martelo: { places: DB },
  ex_desenvolvimento: { places: DB, stress: ['ombro'], compound: true },
  ex_elevacao_lateral: { places: DB },
  ex_face_pull: { places: GYM },
  ex_abdominal: { places: ALL },
  ex_abd_bicicleta: { places: ALL },
  ex_elevacao_pernas: { places: ALL, stress: ['lombar'] },
  ex_prancha: { places: ALL },
  ex_esteira: { places: GYM },
  ex_bike: { places: GYM },
  ex_polichinelo: { places: ['halteres', 'corpo'] },
  ex_burpee: { places: ['halteres', 'corpo'], stress: ['joelho'] },
};

const LIBRARY: Exercise[] = [...DEFAULT_EXERCISES, ...EXTRA_EXERCISES];
export const findExercise = (id: string) => LIBRARY.find((e) => e.id === id);

/** Exercícios permitidos para um grupo, dado o local e as restrições (multiarticulares primeiro). */
export function poolFor(muscle: MuscleGroup, place: TrainingPlace, restrictions: Restriction[]) {
  return LIBRARY.filter((e) => {
    const m = META[e.id];
    if (!m || e.muscle !== muscle) return false;
    if (!m.places.includes(place)) return false;
    return !(m.stress ?? []).some((s) => restrictions.includes(s));
  }).sort((a, b) => Number(!!META[b.id]?.compound) - Number(!!META[a.id]?.compound));
}

/* ------------------------------- Parâmetros ------------------------------- */

export const GOALS: Record<TrainingGoal, { label: string; emoji: string; desc: string; sets: number; reps: string; rest: string; cardioMin: number }> = {
  hipertrofia: { label: 'Hipertrofia', emoji: '💪', desc: 'Ganhar massa muscular', sets: 4, reps: '8-12', rest: '60–90 s', cardioMin: 0 },
  emagrecimento: { label: 'Emagrecimento', emoji: '🔥', desc: 'Perder gordura', sets: 3, reps: '12-15', rest: '30–45 s', cardioMin: 20 },
  forca: { label: 'Força', emoji: '🏋️', desc: 'Levantar mais peso', sets: 5, reps: '4-6', rest: '2–3 min', cardioMin: 0 },
  definicao: { label: 'Definição', emoji: '✨', desc: 'Manter músculo e secar', sets: 4, reps: '10-15', rest: '45–60 s', cardioMin: 15 },
  condicionamento: { label: 'Condicionamento', emoji: '❤️', desc: 'Fôlego e saúde', sets: 3, reps: '15-20', rest: '30 s (circuito)', cardioMin: 10 },
};

export const LEVELS: Record<TrainingLevel, { label: string; desc: string }> = {
  iniciante: { label: 'Iniciante', desc: 'Menos de 6 meses' },
  intermediario: { label: 'Intermediário', desc: '6 meses a 2 anos' },
  avancado: { label: 'Avançado', desc: 'Mais de 2 anos' },
};

export const PLACES: Record<TrainingPlace, { label: string; desc: string }> = {
  academia: { label: 'Academia completa', desc: 'Máquinas, barras e halteres' },
  halteres: { label: 'Em casa com halteres', desc: 'Halteres e peso do corpo' },
  corpo: { label: 'Só peso corporal', desc: 'Sem equipamento' },
};

export const RESTRICTIONS: Record<Restriction, string> = {
  joelho: 'Joelho',
  lombar: 'Lombar',
  ombro: 'Ombro',
};

const EX_PER_SESSION: Record<TrainingProfile['minutes'], number> = { 30: 4, 45: 5, 60: 6, 90: 8 };

/* --------------------------------- Divisões --------------------------------- */

interface Template {
  title: string;
  slots: MuscleGroup[];
}

const T = {
  fullA: { title: 'Corpo inteiro A', slots: ['pernas', 'peito', 'costas', 'ombros', 'gluteos', 'abdomen', 'biceps', 'triceps'] },
  fullB: { title: 'Corpo inteiro B', slots: ['gluteos', 'costas', 'peito', 'pernas', 'ombros', 'triceps', 'biceps', 'abdomen'] },
  fullC: { title: 'Corpo inteiro C', slots: ['pernas', 'ombros', 'costas', 'peito', 'panturrilha', 'abdomen', 'biceps', 'triceps'] },
  push: { title: 'Empurrar (peito, ombros, tríceps)', slots: ['peito', 'peito', 'ombros', 'triceps', 'ombros', 'peito', 'triceps', 'abdomen'] },
  pull: { title: 'Puxar (costas e bíceps)', slots: ['costas', 'costas', 'biceps', 'costas', 'ombros', 'biceps', 'abdomen', 'costas'] },
  legs: { title: 'Pernas e glúteos', slots: ['pernas', 'gluteos', 'pernas', 'gluteos', 'panturrilha', 'pernas', 'abdomen', 'gluteos'] },
  upper: { title: 'Superiores', slots: ['peito', 'costas', 'ombros', 'peito', 'costas', 'biceps', 'triceps', 'ombros'] },
  lower: { title: 'Inferiores', slots: ['pernas', 'gluteos', 'pernas', 'gluteos', 'panturrilha', 'abdomen', 'pernas', 'gluteos'] },
  chestTri: { title: 'Peito e tríceps', slots: ['peito', 'peito', 'peito', 'triceps', 'triceps', 'ombros', 'abdomen', 'peito'] },
  backBi: { title: 'Costas e bíceps', slots: ['costas', 'costas', 'costas', 'biceps', 'biceps', 'ombros', 'abdomen', 'costas'] },
  quads: { title: 'Pernas (quadríceps)', slots: ['pernas', 'pernas', 'pernas', 'panturrilha', 'gluteos', 'abdomen', 'pernas', 'panturrilha'] },
  shoulders: { title: 'Ombros e abdômen', slots: ['ombros', 'ombros', 'ombros', 'abdomen', 'abdomen', 'triceps', 'biceps', 'ombros'] },
  posterior: { title: 'Posterior e glúteos', slots: ['gluteos', 'pernas', 'gluteos', 'gluteos', 'panturrilha', 'abdomen', 'pernas', 'gluteos'] },
} satisfies Record<string, Template>;

function splitFor(days: number, level: TrainingLevel): { name: string; templates: Template[] } {
  if (days <= 1) return { name: 'Corpo inteiro', templates: [T.fullA] };
  if (days === 2) return { name: 'Corpo inteiro A/B', templates: [T.fullA, T.fullB] };
  if (days === 3)
    return level === 'iniciante'
      ? { name: 'Corpo inteiro A/B/C', templates: [T.fullA, T.fullB, T.fullC] }
      : { name: 'Empurrar / Puxar / Pernas', templates: [T.push, T.pull, T.legs] };
  if (days === 4) return { name: 'Superiores / Inferiores', templates: [T.upper, T.lower, T.upper, T.lower] };
  if (days === 5) return { name: 'Divisão ABCDE', templates: [T.chestTri, T.quads, T.backBi, T.shoulders, T.posterior] };
  return { name: 'Empurrar / Puxar / Pernas ×2', templates: [T.push, T.pull, T.legs, T.push, T.pull, T.legs] };
}

/* ---------------------------------- Gerar ---------------------------------- */

export interface GeneratedPlan {
  splitName: string;
  days: WorkoutDay[];
  rest: string;
  highlights: string[];
  /** exercícios que precisam entrar na biblioteca do usuário */
  newExercises: Exercise[];
}

function repsFor(muscle: MuscleGroup, goal: TrainingGoal, exerciseId: string) {
  if (exerciseId === 'ex_prancha') return goal === 'forca' ? '45' : '30-60';
  if (muscle === 'abdomen') return '15-20';
  if (muscle === 'panturrilha') return '12-20';
  return GOALS[goal].reps;
}

export function generatePlan(profile: TrainingProfile, existing: Exercise[]): GeneratedPlan {
  const goal = GOALS[profile.goal];
  const weekdays = [...profile.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).slice(0, 6);
  const split = splitFor(weekdays.length, profile.level);
  const perSession = EX_PER_SESSION[profile.minutes] - (goal.cardioMin ? 1 : 0);
  const used = new Set<string>();

  const days: WorkoutDay[] = [0, 1, 2, 3, 4, 5, 6].map((w) => ({ weekday: w, title: '', exercises: [] }));

  weekdays.forEach((weekday, i) => {
    const tpl = split.templates[i % split.templates.length];
    // Grupos de foco que já aparecem neste treino ganham um exercício extra, logo no início
    const focusHere = profile.focus.filter((f) => tpl.slots.includes(f));
    const slots = [...focusHere, ...tpl.slots, ...tpl.slots];
    const target = Math.max(3, perSession);
    const variation = Math.floor(i / split.templates.length); // A/B repetidos variam exercícios
    const picked: PlannedExercise[] = [];
    const inDay = new Set<string>();

    for (const muscle of slots) {
      if (picked.length >= target) break;
      const pool = poolFor(muscle, profile.place, profile.restrictions).filter((e) => !inDay.has(e.id));
      if (!pool.length) continue;
      const ex = pool[variation % pool.length];
      inDay.add(ex.id);
      used.add(ex.id);
      let sets = goal.sets;
      if (profile.level === 'iniciante') sets = Math.max(2, sets - 1);
      if (profile.level === 'avancado' && META[ex.id]?.compound) sets += 1;
      if (muscle === 'abdomen' || muscle === 'panturrilha') sets = Math.min(sets, 3);
      picked.push({ exerciseId: ex.id, sets, reps: repsFor(muscle, profile.goal, ex.id) });
    }

    if (goal.cardioMin) {
      const cardio = poolFor('cardio', profile.place, profile.restrictions)[0];
      if (cardio) {
        used.add(cardio.id);
        picked.push({ exerciseId: cardio.id, sets: 1, reps: String(goal.cardioMin) });
      }
    }

    days[weekday] = { weekday, title: tpl.title, exercises: picked };
  });

  const have = new Set(existing.map((e) => e.id));
  const newExercises = [...used].filter((id) => !have.has(id)).map((id) => findExercise(id)!).filter(Boolean);

  const highlights = [
    `Divisão ${split.name} em ${weekdays.length} ${weekdays.length === 1 ? 'dia' : 'dias'}: ${weekdays.map((w) => WEEKDAYS[w]).join(', ')}.`,
    `${goal.label}: ${goal.sets} séries de ${goal.reps} repetições, descanso de ${goal.rest}.`,
    `${EX_PER_SESSION[profile.minutes]} exercícios por treino para caber em ~${profile.minutes} min.`,
  ];
  if (goal.cardioMin) highlights.push(`${goal.cardioMin} min de cardio no final de cada treino.`);
  if (profile.focus.length) highlights.push(`Prioridade extra para: ${profile.focus.map((f) => MUSCLE_LABEL[f]).join(', ')}.`);
  if (profile.restrictions.length)
    highlights.push(`Evitamos exercícios que sobrecarregam: ${profile.restrictions.map((r) => RESTRICTIONS[r].toLowerCase()).join(', ')}.`);
  if (profile.level === 'iniciante') highlights.push('Iniciante: menos séries e foco em aprender a execução antes de subir a carga.');

  return { splitName: split.name, days, rest: goal.rest, highlights, newExercises };
}

/** Intensidade por grupo muscular (0–1) conforme as séries semanais — usado no holograma. */
export function muscleIntensity(days: WorkoutDay[]) {
  const sets: Partial<Record<MuscleGroup, number>> = {};
  for (const d of days)
    for (const pe of d.exercises) {
      const m = findExercise(pe.exerciseId)?.muscle;
      if (m) sets[m] = (sets[m] ?? 0) + pe.sets;
    }
  const max = Math.max(1, ...Object.values(sets).map((v) => v ?? 0));
  return Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, (v ?? 0) / max])) as Partial<Record<MuscleGroup, number>>;
}

/** Topo da faixa de repetições ("8-12" → 12). */
export const topReps = (reps: string) => {
  const nums = reps.match(/\d+/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : 0;
};
