import { Pause, Play, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BREATHING } from '@/lib/gratitude';
import { cn } from '@/lib/utils';

type PatternId = (typeof BREATHING)[number]['id'];

/** Meditação rápida de respiração: o círculo cresce ao inspirar e diminui ao soltar. */
export function BreathingGuide() {
  const [patternId, setPatternId] = useState<PatternId>('calma');
  const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pattern = BREATHING.find((p) => p.id === patternId)!;
  const phases = pattern.phases as readonly (readonly [string, number])[];
  const cycle = phases.reduce((t, [, s]) => t + s, 0);

  // Um único contador de segundos; fase e tempo restante são calculados a partir dele
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && elapsed >= minutes * 60) {
      setRunning(false);
      toast.success('Respiração concluída 🌿', { description: `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} só para você. Como se sente agora?` });
    }
  }, [elapsed, minutes, running]);

  const start = () => {
    setElapsed(0);
    setRunning(true);
  };

  let pos = elapsed % cycle;
  let phase = 0;
  while (pos >= phases[phase][1]) {
    pos -= phases[phase][1];
    phase++;
  }
  const left = phases[phase][1] - pos;
  const [label, secs] = phases[phase];
  // Cheio ao inspirar e na pausa logo depois; vazio ao soltar e na pausa final
  const expanded = running && (label === 'Inspire' || (label === 'Segure' && phases[phase - 1]?.[0] === 'Inspire'));
  const remaining = Math.max(0, minutes * 60 - elapsed);

  return (
    <section aria-labelledby="breath-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 id="breath-title" className="flex items-center gap-2 font-bold">
        <Wind className="size-5 text-sky-500" aria-hidden /> Respiração guiada
      </h2>
      <p className="mt-1 text-sm text-foreground/65">Alguns minutos de respiração acalmam o corpo e preparam a mente para agradecer.</p>

      <div className="mt-4 grid place-items-center">
        <div className="relative grid size-52 place-items-center">
          <div
            className={cn('absolute inset-0 rounded-full bg-sky-400/15 ring-1 ring-sky-400/40')}
            style={{
              transform: `scale(${expanded ? 1 : 0.55})`,
              transition: running ? `transform ${secs}s ease-in-out` : 'transform 400ms ease',
            }}
            aria-hidden
          />
          <div className="relative text-center" aria-live="polite">
            <span className="block font-brand text-2xl font-bold">{running ? label : 'Pronto?'}</span>
            <span className="block font-mono text-sm tabular-nums text-foreground/60">
              {running ? `${left}s · faltam ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : pattern.desc}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div role="radiogroup" aria-label="Ritmo" className="flex flex-wrap justify-center gap-1.5">
          {BREATHING.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={patternId === p.id}
              disabled={running}
              onClick={() => setPatternId(p.id)}
              className={cn('h-8 rounded-full border px-3 text-xs font-medium transition-colors disabled:opacity-50', patternId === p.id ? 'border-primary bg-primary text-white' : 'border-border hover:bg-muted')}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div role="radiogroup" aria-label="Duração" className="flex gap-1 rounded-lg bg-muted/60 p-1">
            {[1, 3, 5].map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={minutes === m}
                disabled={running}
                onClick={() => setMinutes(m)}
                className={cn('h-7 rounded-md px-2.5 text-xs font-semibold disabled:opacity-50', minutes === m ? 'bg-background shadow-sm' : 'text-foreground/60')}
              >
                {m} min
              </button>
            ))}
          </div>
          {running ? (
            <Button variant="outline" onClick={() => setRunning(false)}>
              <Pause /> Parar
            </Button>
          ) : (
            <Button onClick={start}>
              <Play /> Começar
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
