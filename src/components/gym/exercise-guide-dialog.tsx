import { Box, CircleAlert, Gauge, ListOrdered, Pause, Play, RotateCw, Square, Target, Wind } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { guideFor } from '@/lib/exercise-guide';
import { MUSCLE_LABEL } from '@/lib/gym';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';
import { ExerciseHologram } from './exercise-hologram';

const ExerciseHologram3D = lazy(() => import('./exercise-hologram-3d').then((m) => ({ default: m.ExerciseHologram3D })));

/** Modal "Como fazer": holograma grande + passo a passo, erros comuns e respiração. */
export function ExerciseGuideDialog({
  exercise,
  target,
  onClose,
}: {
  exercise: Exercise | null;
  target?: string;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [spin, setSpin] = useState(true);
  const guide = exercise ? guideFor(exercise) : null;

  return (
    <Dialog open={!!exercise} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto p-0">
        {exercise && guide && (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="bg-navy p-3">
              {mode === '3d' ? (
                <Suspense fallback={<ExerciseHologram exercise={exercise} playing={playing} speed={speed} />}>
                  <ExerciseHologram3D exercise={exercise} playing={playing} speed={speed} autoRotate={spin} />
                </Suspense>
              ) : (
                <ExerciseHologram exercise={exercise} playing={playing} speed={speed} />
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="btn-neon inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white"
                  aria-label={playing ? 'Pausar animação' : 'Reproduzir animação'}
                >
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {playing ? 'Pausar' : 'Reproduzir'}
                </button>
                <div role="radiogroup" aria-label="Velocidade" className="flex items-center gap-1 rounded-lg bg-white/10 p-1 text-white">
                  <Gauge className="ml-1 size-4 text-white/60" aria-hidden />
                  {[0.5, 1].map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={speed === v}
                      onClick={() => setSpeed(v)}
                      className={cn('h-7 rounded-md px-2 text-xs font-semibold', speed === v ? 'bg-white text-navy' : 'text-white/70 hover:text-white')}
                    >
                      {v === 0.5 ? 'Lento' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div role="radiogroup" aria-label="Tipo de holograma" className="flex items-center gap-1 rounded-lg bg-white/10 p-1 text-white">
                  {(
                    [
                      ['3d', 'Holograma 3D', Box],
                      ['2d', 'Vista 2D', Square],
                    ] as const
                  ).map(([id, label, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={mode === id}
                      onClick={() => setMode(id)}
                      className={cn('inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold', mode === id ? 'bg-white text-navy' : 'text-white/70 hover:text-white')}
                    >
                      <Icon className="size-3.5" aria-hidden /> {label}
                    </button>
                  ))}
                </div>
                {mode === '3d' && (
                  <button
                    type="button"
                    aria-pressed={spin}
                    onClick={() => setSpin((v) => !v)}
                    className={cn('inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold', spin ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white')}
                  >
                    <RotateCw className="size-3.5" aria-hidden /> {spin ? 'Girando' : 'Girar sozinho'}
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[11px] text-white/50">
                {mode === '3d' ? 'Arraste o holograma para ver de qualquer ângulo. As silhuetas tênues mostram o início e o fim do movimento.' : 'As silhuetas tênues mostram as posições inicial e final.'}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="pr-8">
                <DialogTitle className="text-xl font-bold">{exercise.name}</DialogTitle>
                <DialogDescription className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-foreground/60">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{MUSCLE_LABEL[exercise.muscle]}</span>
                  {target && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:text-neon">Meta {target}</span>}
                </DialogDescription>
              </div>

              <section>
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                  <Target className="size-4 text-primary" aria-hidden /> Músculos trabalhados
                </h3>
                <p className="text-sm text-foreground/80">{guide.target}</p>
              </section>

              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                  <ListOrdered className="size-4 text-primary" aria-hidden /> Como fazer
                </h3>
                <ol className="space-y-1.5">
                  {guide.steps.map((st, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                  <CircleAlert className="size-4 text-amber-500" aria-hidden /> Evite
                </h3>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {guide.mistakes.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span aria-hidden className="text-amber-500">✕</span> {m}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg bg-muted/60 p-3">
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                  <Wind className="size-4 text-sky-500" aria-hidden /> Respiração
                </h3>
                <p className="text-sm text-foreground/80">{guide.breath}</p>
              </section>

              <p className="text-[11px] text-foreground/50">Orientação geral. Em caso de dor ou dúvida na execução, procure um profissional de educação física.</p>
              <DialogClose className="btn-neon h-10 w-full rounded-xl text-sm font-semibold text-white">Entendi</DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
