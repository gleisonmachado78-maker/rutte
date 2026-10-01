import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ratingKey, StarRating } from '@/components/ui/star-rating';
import { VideoCard } from '@/components/life/videos';
import { GRATITUDE_VIDEOS } from '@/lib/gratitude-videos';
import { dailyPick, meditationOfDay, meditationSeconds, MEDITATIONS } from '@/lib/meditations';
import { cn } from '@/lib/utils';
import type { LifeVideo } from '@/lib/videos';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Meditação do dia: um roteiro guiado diferente a cada dia (passo a passo, com tempo),
 * mais um vídeo de meditação do dia.
 */
export function DailyMeditation({ onPlay }: { onPlay: (v: LifeVideo) => void }) {
  const [offset, setOffset] = useState(0);
  const med = meditationOfDay(new Date(), offset);
  const [step, setStep] = useState(-1); // -1 = ainda não começou; steps.length = concluída
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const total = meditationSeconds(med);
  const video = dailyPick(GRATITUDE_VIDEOS.filter((v) => v.group === 'meditacao'));
  const current = med.steps[step];
  const done = step >= med.steps.length;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Avança sozinho quando o tempo do passo acaba
  useEffect(() => {
    if (!running || !current || elapsed < current.secs) return;
    setElapsed(0);
    setStep((s) => s + 1);
  }, [elapsed, current, running]);

  useEffect(() => {
    if (done && running) {
      setRunning(false);
      toast.success('Meditação concluída 🌿', { description: 'Leve essa calma para o resto do dia.' });
    }
  }, [done, running]);

  const reset = () => {
    setRunning(false);
    setStep(-1);
    setElapsed(0);
  };
  const go = (to: number) => {
    setElapsed(0);
    setStep(Math.max(0, Math.min(med.steps.length, to)));
  };
  const other = () => {
    reset();
    setOffset((o) => (o + 1) % MEDITATIONS.length);
  };

  const before = med.steps.slice(0, Math.max(0, step)).reduce((t, s) => t + s.secs, 0);
  const progress = done ? 1 : step < 0 ? 0 : (before + elapsed) / total;

  return (
    <section aria-labelledby="med-title" className="rounded-2xl border border-border bg-gradient-to-br from-violet-500/10 via-card to-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
            <Sparkles className="size-3.5" aria-hidden /> {offset === 0 ? 'Meditação do dia' : 'Outra meditação'} · {med.theme}
          </p>
          <h2 id="med-title" className="mt-0.5 text-lg font-bold">{med.title}</h2>
          <p className="text-sm text-foreground/70">
            {med.intro} <span className="whitespace-nowrap text-foreground/50">· cerca de {Math.round(total / 60)} min</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={other} title="Ver outra meditação guiada">
          <Shuffle /> Outra
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-h-[220px] flex-col rounded-xl border border-border bg-background/70 p-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progresso da meditação" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="h-full rounded-full bg-violet-500 transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="flex flex-1 flex-col justify-center py-4 text-center" aria-live="polite">
            {step < 0 ? (
              <>
                <p className="font-brand text-lg leading-relaxed text-foreground/85">Encontre um lugar tranquilo, silencie o celular e, quando estiver pronto(a), comece.</p>
                <p className="mt-2 text-xs text-foreground/55">{med.steps.length} passos · a Rutte avança sozinha no tempo de cada um</p>
              </>
            ) : done ? (
              <>
                <p className="font-brand text-lg leading-relaxed">{med.closing}</p>
                <StarRating itemKey={ratingKey('meditation', med.id)} label={med.title} withNote={false} className="mx-auto mt-3 [&>div]:justify-center" />
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-foreground/50">
                  Passo {step + 1} de {med.steps.length} · {mmss(Math.max(0, current.secs - elapsed))}
                </p>
                <p className="mt-2 font-brand text-lg leading-relaxed sm:text-xl">{current.text}</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {step < 0 || done ? (
              <Button
                onClick={() => {
                  go(0);
                  setRunning(true);
                }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {done ? <RotateCcw /> : <Play />} {done ? 'Meditar de novo' : 'Começar meditação guiada'}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Passo anterior">
                  <ChevronLeft />
                </Button>
                <Button variant="outline" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause /> : <Play />} {running ? 'Pausar' : 'Continuar'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => go(step + 1)} aria-label="Próximo passo">
                  <ChevronRight />
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Encerrar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Vídeo do dia</p>
          <VideoCard video={video} onPlay={onPlay} />
        </div>
      </div>

      <button type="button" onClick={() => setShowScript((s) => !s)} aria-expanded={showScript} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground">
        <ChevronDown className={cn('size-4 transition-transform', showScript && 'rotate-180')} aria-hidden /> Ler o roteiro completo
      </button>
      {showScript && (
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/80">
          {med.steps.map((s) => (
            <li key={s.text}>{s.text}</li>
          ))}
          <li className="list-none pt-1 italic text-foreground/65">{med.closing}</li>
        </ol>
      )}
    </section>
  );
}
