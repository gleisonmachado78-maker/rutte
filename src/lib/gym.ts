import { addDays, format, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Exercise, GymData, MuscleGroup, WorkoutDay, WorkoutEntry, WorkoutSession, WorkoutSet } from '@/types';

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
/** Ordem de exibição: segunda → domingo */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  peito: 'Peito',
  costas: 'Costas',
  pernas: 'Pernas',
  gluteos: 'Glúteos',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abdomen: 'Abdômen',
  panturrilha: 'Panturrilha',
  cardio: 'Cardio',
};

const ex = (id: string, name: string, muscle: MuscleGroup): Exercise => ({ id, name, muscle });

export const DEFAULT_EXERCISES: Exercise[] = [
  ex('ex_supino_reto', 'Supino reto', 'peito'),
  ex('ex_supino_inclinado', 'Supino inclinado com halteres', 'peito'),
  ex('ex_crucifixo', 'Crucifixo / Peck deck', 'peito'),
  ex('ex_triceps_pulley', 'Tríceps pulley', 'triceps'),
  ex('ex_triceps_frances', 'Tríceps francês', 'triceps'),
  ex('ex_agachamento', 'Agachamento livre', 'pernas'),
  ex('ex_leg_press', 'Leg press 45°', 'pernas'),
  ex('ex_extensora', 'Cadeira extensora', 'pernas'),
  ex('ex_flexora', 'Mesa flexora', 'pernas'),
  ex('ex_stiff', 'Stiff', 'gluteos'),
  ex('ex_elevacao_pelvica', 'Elevação pélvica', 'gluteos'),
  ex('ex_panturrilha', 'Panturrilha em pé', 'panturrilha'),
  ex('ex_puxada', 'Puxada frontal', 'costas'),
  ex('ex_remada_curvada', 'Remada curvada', 'costas'),
  ex('ex_remada_baixa', 'Remada baixa', 'costas'),
  ex('ex_rosca_direta', 'Rosca direta', 'biceps'),
  ex('ex_rosca_martelo', 'Rosca martelo', 'biceps'),
  ex('ex_desenvolvimento', 'Desenvolvimento com halteres', 'ombros'),
  ex('ex_elevacao_lateral', 'Elevação lateral', 'ombros'),
  ex('ex_face_pull', 'Face pull', 'ombros'),
  ex('ex_abdominal', 'Abdominal supra', 'abdomen'),
  ex('ex_prancha', 'Prancha (seg)', 'abdomen'),
  ex('ex_esteira', 'Esteira (min)', 'cardio'),
];

const p = (exerciseId: string, sets = 4, reps = '10') => ({ exerciseId, sets, reps });

export const DEFAULT_PLAN: WorkoutDay[] = [
  { weekday: 0, title: '', exercises: [] },
  { weekday: 1, title: 'Peito e tríceps', exercises: [p('ex_supino_reto', 4, '8-10'), p('ex_supino_inclinado'), p('ex_crucifixo', 3, '12'), p('ex_triceps_pulley', 4, '12'), p('ex_triceps_frances', 3, '10')] },
  { weekday: 2, title: 'Pernas (quadríceps)', exercises: [p('ex_agachamento', 4, '8'), p('ex_leg_press', 4, '12'), p('ex_extensora', 3, '12'), p('ex_panturrilha', 4, '15')] },
  { weekday: 3, title: 'Costas e bíceps', exercises: [p('ex_puxada', 4, '10'), p('ex_remada_curvada', 4, '8-10'), p('ex_remada_baixa', 3, '12'), p('ex_rosca_direta', 4, '10'), p('ex_rosca_martelo', 3, '12')] },
  { weekday: 4, title: 'Ombros e abdômen', exercises: [p('ex_desenvolvimento', 4, '10'), p('ex_elevacao_lateral', 4, '12'), p('ex_face_pull', 3, '15'), p('ex_abdominal', 3, '20'), p('ex_prancha', 3, '45')] },
  { weekday: 5, title: 'Posterior e glúteos', exercises: [p('ex_stiff', 4, '10'), p('ex_flexora', 4, '12'), p('ex_elevacao_pelvica', 4, '10'), p('ex_panturrilha', 4, '15')] },
  { weekday: 6, title: '', exercises: [] },
];

/** Carga inicial (kg) usada para gerar o histórico de exemplo. */
const SEED_KG: Record<string, number> = {
  ex_supino_reto: 50, ex_supino_inclinado: 18, ex_crucifixo: 35, ex_triceps_pulley: 25, ex_triceps_frances: 14,
  ex_agachamento: 60, ex_leg_press: 140, ex_extensora: 40, ex_flexora: 35, ex_stiff: 40, ex_elevacao_pelvica: 60,
  ex_panturrilha: 50, ex_puxada: 45, ex_remada_curvada: 40, ex_remada_baixa: 45, ex_rosca_direta: 20,
  ex_rosca_martelo: 12, ex_desenvolvimento: 14, ex_elevacao_lateral: 7, ex_face_pull: 20, ex_abdominal: 0, ex_prancha: 0,
};

/** Histórico de exemplo: ~12 semanas seguindo o plano, com progressão de carga. */
function seedSessions(plan: WorkoutDay[]): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  const firstMonday = startOfWeek(subWeeks(new Date(), 12), { weekStartsOn: 1 });
  // 12 semanas anteriores + os dias já passados da semana atual
  const today = format(new Date(), 'yyyy-MM-dd');
  for (let w = 0; w <= 12; w++) {
    for (const day of plan) {
      if (!day.title) continue;
      // Pula alguns treinos para parecer real
      if ((w * 7 + day.weekday) % 9 === 0) continue;
      const date = format(addDays(firstMonday, w * 7 + ((day.weekday + 6) % 7)), 'yyyy-MM-dd');
      if (date >= today) continue;
      const entries: WorkoutEntry[] = day.exercises.map((pe) => {
        const base = SEED_KG[pe.exerciseId] ?? 10;
        const step = base >= 60 ? 5 : base >= 20 ? 2.5 : 1;
        const kg = base === 0 ? 0 : base + Math.floor(w / 3) * step;
        const reps = parseInt(pe.reps, 10) || 10;
        return {
          exerciseId: pe.exerciseId,
          sets: Array.from({ length: pe.sets }, (_, i) => ({ reps: Math.max(1, reps - (i === pe.sets - 1 ? 2 : 0)), kg })),
        };
      });
      sessions.push({ id: `ws_seed_${w}_${day.weekday}`, date, title: day.title, entries, durationMin: 55 + ((w + day.weekday) % 4) * 5 });
    }
  }
  return sessions;
}

export function createGymSeed(): GymData {
  const plan = structuredClone(DEFAULT_PLAN);
  return { exercises: [...DEFAULT_EXERCISES], plan, sessions: seedSessions(plan) };
}

/* ------------------------------- Cálculos ------------------------------- */

/** 1RM estimado (fórmula de Epley). */
export const estimate1RM = (s: WorkoutSet) => (s.kg <= 0 ? 0 : s.reps <= 1 ? s.kg : s.kg * (1 + s.reps / 30));

export const setVolume = (s: WorkoutSet) => s.kg * s.reps;
export const sessionVolume = (s: WorkoutSession) =>
  s.entries.reduce((acc, e) => acc + e.sets.reduce((a, st) => a + setVolume(st), 0), 0);

export interface PersonalRecord {
  exerciseId: string;
  kg: number;
  reps: number;
  date: string;
  est1RM: number;
}

/** PR = maior carga levantada (desempate: mais repetições). Inclui o melhor 1RM estimado. */
export function personalRecords(sessions: WorkoutSession[]) {
  const map = new Map<string, PersonalRecord>();
  for (const s of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const e of s.entries) {
      for (const st of e.sets) {
        if (st.kg <= 0) continue;
        const cur = map.get(e.exerciseId);
        const est = estimate1RM(st);
        if (!cur || st.kg > cur.kg || (st.kg === cur.kg && st.reps > cur.reps)) {
          map.set(e.exerciseId, { exerciseId: e.exerciseId, kg: st.kg, reps: st.reps, date: s.date, est1RM: Math.max(est, cur?.est1RM ?? 0) });
        } else if (est > cur.est1RM) {
          cur.est1RM = est;
        }
      }
    }
  }
  return map;
}

/** Novos PRs que um treino bate em relação ao histórico anterior. */
export function newRecordsIn(session: WorkoutSession, history: WorkoutSession[]) {
  const before = personalRecords(history.filter((h) => h.id !== session.id && h.date <= session.date));
  const out: { exerciseId: string; kg: number; reps: number; previous?: number }[] = [];
  for (const e of session.entries) {
    const best = e.sets.filter((s) => s.kg > 0).sort((a, b) => b.kg - a.kg || b.reps - a.reps)[0];
    if (!best) continue;
    const prev = before.get(e.exerciseId);
    if (!prev || best.kg > prev.kg) out.push({ exerciseId: e.exerciseId, kg: best.kg, reps: best.reps, previous: prev?.kg });
  }
  return out;
}

export interface MonthPoint {
  month: string; // yyyy-MM
  label: string; // "set/26"
  value: number;
}

const monthLabel = (m: string) => format(parseISO(`${m}-01`), 'MMM/yy', { locale: ptBR });

/** Maior carga do exercício em cada mês (evolução de força). */
export function monthlyBest(sessions: WorkoutSession[], exerciseId: string): MonthPoint[] {
  const m = new Map<string, number>();
  for (const s of sessions) {
    const e = s.entries.find((x) => x.exerciseId === exerciseId);
    if (!e) continue;
    const best = Math.max(0, ...e.sets.map((st) => st.kg));
    const key = s.date.slice(0, 7);
    m.set(key, Math.max(m.get(key) ?? 0, best));
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, label: monthLabel(month), value }));
}

export interface MonthSummary {
  month: string;
  label: string;
  sessions: number;
  volume: number;
  minutes: number;
}

/** Resumo por mês: nº de treinos, volume total (kg × reps) e tempo. */
export function monthlySummary(sessions: WorkoutSession[]): MonthSummary[] {
  const m = new Map<string, MonthSummary>();
  for (const s of sessions) {
    const key = s.date.slice(0, 7);
    const cur = m.get(key) ?? { month: key, label: monthLabel(key), sessions: 0, volume: 0, minutes: 0 };
    cur.sessions += 1;
    cur.volume += sessionVolume(s);
    cur.minutes += s.durationMin ?? 0;
    m.set(key, cur);
  }
  return [...m.values()].sort((a, b) => a.month.localeCompare(b.month));
}

/** Última vez que o exercício foi feito (para sugerir a carga). */
export function lastEntry(sessions: WorkoutSession[], exerciseId: string, beforeDate?: string) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  for (const s of sorted) {
    if (beforeDate && s.date >= beforeDate) continue;
    const e = s.entries.find((x) => x.exerciseId === exerciseId);
    if (e) return { date: s.date, entry: e };
  }
  return undefined;
}

export const formatKg = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
export const formatVolume = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t` : `${Math.round(n)} kg`;
