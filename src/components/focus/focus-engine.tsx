import { format } from 'date-fns';
import { Pause, Play, Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useSaveFocusSession } from '@/hooks/use-data';
import { cn } from '@/lib/utils';
import { fmtClock, PHASE_LABEL, remainingAt, useFocus } from '@/store/focus';

/* ------------------------------ Som de aviso (Web Audio) ------------------------------ */

let audioCtx: AudioContext | null = null;
/** Deve ser chamado num clique (o navegador só libera som após interação). */
export function unlockAudio() {
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch {
    /* sem áudio */
  }
}

function chime() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [0, 0.28, 0.56].forEach((dt, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = i === 2 ? 1046 : 784;
    gain.gain.setValueAtTime(0.0001, t0 + dt);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + dt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.25);
    osc.connect(gain).connect(audioCtx!.destination);
    osc.start(t0 + dt);
    osc.stop(t0 + dt + 0.3);
  });
}

/** Re-renderiza periodicamente enquanto o timer roda. */
export function useNow(active: boolean, every = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(id);
  }, [active, every]);
  return active ? now : Date.now();
}

/**
 * Motor global do Pomodoro (montado no layout): detecta o fim de cada fase,
 * registra o foco concluído, avisa com som/vibração e atualiza o título da aba.
 */
export function FocusEngine() {
  const status = useFocus((s) => s.status);
  const save = useSaveFocusSession();
  const handling = useRef(false);
  const now = useNow(status === 'running', 500);
  const state = useFocus();
  const left = remainingAt(state, now);

  useEffect(() => {
    if (state.status !== 'running' || left > 0 || handling.current) return;
    handling.current = true;
    const { settings, activity, startedAt } = useFocus.getState();
    const ended = useFocus.getState().advance();
    if (ended === 'focus') {
      const end = new Date();
      save.mutate({
        date: format(end, 'yyyy-MM-dd'),
        startedAt: new Date(startedAt ?? end.getTime() - settings.focus * 60_000).toISOString(),
        endedAt: end.toISOString(),
        minutes: settings.focus,
        activity: activity.label.trim() || 'Foco livre',
        taskId: activity.taskId,
      });
      toast.success('🍅 Pomodoro concluído!', {
        description: `${activity.label.trim() || 'Foco livre'} · hora de uma ${useFocus.getState().phase === 'long' ? 'pausa longa' : 'pausa curta'}.`,
        duration: 8000,
      });
    } else {
      toast('Pausa encerrada', { description: 'Bora para o próximo bloco de foco?', duration: 6000 });
    }
    if (settings.sound) chime();
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* sem vibração */
    }
    handling.current = false;
  }, [left, state.status, save]);

  // Título da aba com o tempo restante
  useEffect(() => {
    const base = 'Rutte — Sua secretária digital';
    document.title = state.status === 'idle' ? base : `${state.status === 'paused' ? '⏸' : '⏱'} ${fmtClock(left)} · ${PHASE_LABEL[state.phase]} — Rutte`;
    return () => {
      document.title = base;
    };
  }, [left, state.status, state.phase]);

  return null;
}

/** Mini-cronômetro flutuante nas outras telas enquanto há um foco em andamento. */
export function FocusPill() {
  const location = useLocation();
  const state = useFocus();
  const now = useNow(state.status === 'running', 500);
  if (state.status === 'idle' || location.pathname === '/focus') return null;
  const left = remainingAt(state, now);
  const isFocus = state.phase === 'focus';

  return (
    <div className="fixed bottom-[calc(9rem+env(safe-area-inset-bottom))] left-4 z-30 flex items-center gap-1 rounded-full border border-neon/50 bg-navy/95 py-1 pl-1 pr-3 text-white shadow-neon backdrop-blur md:bottom-6 md:left-auto md:right-6">
      <button
        type="button"
        onClick={() => {
          unlockAudio();
          state.status === 'running' ? state.pause() : state.start();
        }}
        className="btn-neon grid size-9 place-items-center rounded-full"
        aria-label={state.status === 'running' ? 'Pausar foco' : 'Continuar foco'}
      >
        {state.status === 'running' ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <Link to="/focus" className="flex min-w-0 items-center gap-2 pl-1" aria-label="Abrir o Foco">
        <Timer className={cn('size-4 shrink-0', isFocus ? 'text-neon' : 'text-emerald-400')} aria-hidden />
        <span className="font-mono text-base font-bold tabular-nums">{fmtClock(left)}</span>
        <span className="hidden max-w-[10rem] truncate text-xs text-white/70 sm:inline">
          {isFocus ? state.activity.label || 'Foco livre' : PHASE_LABEL[state.phase]}
        </span>
      </Link>
    </div>
  );
}
