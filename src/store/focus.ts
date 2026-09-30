import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FocusPhase = 'focus' | 'short' | 'long';
export type FocusStatus = 'idle' | 'running' | 'paused';

export interface FocusSettings {
  focus: number;
  short: number;
  long: number;
  /** pausa longa a cada N focos */
  every: number;
  autoStart: boolean;
  sound: boolean;
}

export interface FocusActivity {
  label: string;
  taskId?: string;
}

export const DEFAULT_SETTINGS: FocusSettings = { focus: 25, short: 5, long: 15, every: 4, autoStart: false, sound: true };

export const PHASE_LABEL: Record<FocusPhase, string> = {
  focus: 'Foco',
  short: 'Pausa curta',
  long: 'Pausa longa',
};

interface FocusState {
  phase: FocusPhase;
  status: FocusStatus;
  /** horário (ms) em que a fase termina — enquanto roda */
  endsAt?: number;
  /** quando a fase começou (para registrar a sessão) */
  startedAt?: number;
  /** tempo restante guardado ao pausar */
  remainingMs: number;
  /** focos concluídos no ciclo atual (volta a 0 após a pausa longa) */
  cycle: number;
  settings: FocusSettings;
  activity: FocusActivity;
  setActivity: (a: FocusActivity) => void;
  setSettings: (patch: Partial<FocusSettings>) => void;
  setPhase: (p: FocusPhase) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  /** encerra a fase atual e prepara a próxima; devolve a fase que terminou */
  advance: () => FocusPhase;
}

const minutes = (s: FocusSettings, p: FocusPhase) => (p === 'focus' ? s.focus : p === 'short' ? s.short : s.long) * 60_000;

export const useFocus = create<FocusState>()(
  persist(
    (set, get) => ({
      phase: 'focus',
      status: 'idle',
      remainingMs: DEFAULT_SETTINGS.focus * 60_000,
      cycle: 0,
      settings: DEFAULT_SETTINGS,
      activity: { label: '' },
      setActivity: (activity) => set({ activity }),
      setSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          // Parado: aplica a nova duração na hora
          return s.status === 'idle' ? { settings, remainingMs: minutes(settings, s.phase) } : { settings };
        }),
      setPhase: (phase) => set((s) => ({ phase, status: 'idle', endsAt: undefined, startedAt: undefined, remainingMs: minutes(s.settings, phase) })),
      start: () => {
        const s = get();
        if (s.status === 'running') return;
        const now = Date.now();
        set({ status: 'running', endsAt: now + s.remainingMs, startedAt: s.status === 'paused' ? s.startedAt : now });
      },
      pause: () => {
        const s = get();
        if (s.status !== 'running' || !s.endsAt) return;
        set({ status: 'paused', remainingMs: Math.max(0, s.endsAt - Date.now()), endsAt: undefined });
      },
      reset: () => set((s) => ({ status: 'idle', endsAt: undefined, startedAt: undefined, remainingMs: minutes(s.settings, s.phase) })),
      advance: () => {
        const s = get();
        const ended = s.phase;
        let cycle = s.cycle;
        let next: FocusPhase;
        if (ended === 'focus') {
          cycle += 1;
          next = cycle >= s.settings.every ? 'long' : 'short';
        } else {
          next = 'focus';
          if (ended === 'long') cycle = 0;
        }
        const auto = s.settings.autoStart;
        const now = Date.now();
        set({
          phase: next,
          cycle,
          status: auto ? 'running' : 'idle',
          startedAt: auto ? now : undefined,
          endsAt: auto ? now + minutes(s.settings, next) : undefined,
          remainingMs: minutes(s.settings, next),
        });
        return ended;
      },
    }),
    { name: 'rutte:focus' },
  ),
);

/** Tempo restante (ms) no instante `now`. */
export const remainingAt = (s: Pick<FocusState, 'status' | 'endsAt' | 'remainingMs'>, now: number) =>
  s.status === 'running' && s.endsAt ? Math.max(0, s.endsAt - now) : s.remainingMs;

export const phaseTotalMs = (s: Pick<FocusState, 'settings' | 'phase'>) => minutes(s.settings, s.phase);

export const fmtClock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
