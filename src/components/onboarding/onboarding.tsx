import { ArrowLeft, ArrowRight, Check, ChartPie, Dumbbell, Building, Sparkles } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { BRAND, RutteLogo } from '@/components/brand/rutte';
import { Button } from '@/components/ui/button';
import { useCompleteOnboarding } from '@/hooks/use-data';
import {
  firstName,
  GOALS,
  gymGoalFor,
  MAX_GOALS,
  PEAKS,
  SITUATIONS,
  STRUGGLES,
  suggestedModules,
} from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import type { GoalId, Peak, Situation, Struggle, UserProfile } from '@/types';

const toggle = <T,>(xs: T[], v: T) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]);

function Choice({
  active,
  onClick,
  title,
  desc,
  icon,
  disabled,
  multi,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
  icon?: ReactNode;
  disabled?: boolean;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 disabled:opacity-40',
        active ? 'border-neon bg-white/10 shadow-neon' : 'border-white/15 bg-white/5 hover:bg-white/10',
      )}
    >
      {icon && <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 text-white">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-white">{title}</span>
        {desc && <span className="block text-xs text-white/60">{desc}</span>}
      </span>
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center border-2',
          multi ? 'rounded-md' : 'rounded-full',
          active ? 'border-neon bg-primary text-white' : 'border-white/30',
        )}
        aria-hidden
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

const STEPS = ['Você', 'Momento', 'Objetivos', 'Rotina', 'Seu app'] as const;

/**
 * Primeira conversa com a Rutte: poucas perguntas que adaptam o app a cada pessoa
 * (módulos, categorias, afazeres iniciais, dicas e destaques).
 */
export function Onboarding({ existing, onClose }: { existing: UserProfile | null; onClose: () => void }) {
  const complete = useCompleteOnboarding();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? '');
  const [situations, setSituations] = useState<Situation[]>(existing?.situations ?? []);
  const [goals, setGoals] = useState<GoalId[]>(existing?.goals ?? []);
  const [peak, setPeak] = useState<Peak>(existing?.peak ?? 'manha');
  const [struggle, setStruggle] = useState<Struggle>(existing?.struggle ?? 'procrastinacao');
  const [modules, setModules] = useState<UserProfile['modules']>(existing?.modules ?? { business: false, gym: false, life: true });
  const [touchedModules, setTouchedModules] = useState(!!existing);

  // Sugere os módulos pelas respostas até a pessoa mexer neles
  useEffect(() => {
    if (!touchedModules) setModules(suggestedModules(situations, goals));
  }, [situations, goals, touchedModules]);


  const nick = firstName(name);
  const canNext = [name.trim().length > 0, situations.length > 0, goals.length > 0, true, true, true][step];

  const speech = [
    'Oi! Eu sou a Rutte, a secretária por trás da sua produtividade. Vou te fazer umas perguntas rápidas para deixar tudo do seu jeito. Como posso te chamar?',
    `Prazer, ${nick}! Me conta: como está a sua vida hoje? Pode marcar mais de uma opção.`,
    `Ótimo. E o que você quer conquistar nos próximos 3 meses? Escolha até ${MAX_GOALS} objetivos — é neles que eu vou focar.`,
    'Agora me ajuda a te ajudar: quando você rende mais e o que mais atrapalha a sua rotina?',
    `Com base no que você falou, separei estas partes do app para você, ${nick}. Pode ligar ou desligar. Depois eu te mostro o app num tour rapidinho.`,
  ][step];

  const finish = () => {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      name: name.trim() || 'Você',
      situations,
      goals,
      peak,
      struggle,
      modules,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    complete.mutate(
      {
        profile,
        mode: 'keep',
        // a lista de afazeres começa vazia: nada é criado automaticamente
        starter: [],
        time: PEAKS[peak].time,
        gymGoal: gymGoalFor(goals),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-navy text-white" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-6">
        {/* Progresso */}
        <div className="flex items-center gap-3">
          <span className="font-brand text-lg font-bold">{BRAND.name}</span>
          <ol className="flex flex-1 gap-1" aria-label="Progresso">
            {STEPS.map((s, i) => (
              <li key={s} className={cn('h-1.5 flex-1 rounded-full transition-all duration-300', i <= step ? 'bg-primary shadow-neon' : 'bg-white/15')} aria-current={i === step ? 'step' : undefined}>
                <span className="sr-only">{s}</span>
              </li>
            ))}
          </ol>
          <span className="text-xs tabular-nums text-white/50">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Rutte falando */}
        <div className="mt-6 flex items-start gap-3">
          <RutteLogo glow className="w-16 shrink-0 sm:w-20" />
          <p id="ob-title" className="relative rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-[15px] leading-relaxed text-white" aria-live="polite">
            {speech}
          </p>
        </div>

        {/* Perguntas */}
        <div className="mt-6 flex-1 space-y-3">
          {step === 0 && (
            <div className="space-y-2">
              <label htmlFor="ob-name" className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Seu nome
              </label>
              <input
                id="ob-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
                placeholder="Ex.: Ana"
                maxLength={40}
                autoComplete="given-name"
                className="h-12 w-full rounded-xl border border-white/20 bg-white/5 px-4 text-lg text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-2" role="group" aria-label="Seu momento">
              {(Object.keys(SITUATIONS) as Situation[]).map((s) => {
                const d = SITUATIONS[s];
                return <Choice key={s} multi active={situations.includes(s)} onClick={() => setSituations((x) => toggle(x, s))} title={d.label} desc={d.desc} icon={<d.icon className="size-5" />} />;
              })}
            </div>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-white/60">
                {goals.length}/{MAX_GOALS} escolhidos
              </p>
              <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Seus objetivos">
                {(Object.keys(GOALS) as GoalId[]).map((g) => {
                  const d = GOALS[g];
                  const on = goals.includes(g);
                  return (
                    <Choice
                      key={g}
                      multi
                      active={on}
                      disabled={!on && goals.length >= MAX_GOALS}
                      onClick={() => setGoals((x) => toggle(x, g))}
                      title={d.label}
                      icon={<d.icon className="size-5" />}
                    />
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">Quando você rende mais?</legend>
                <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
                  {(Object.keys(PEAKS) as Peak[]).map((p) => (
                    <Choice key={p} active={peak === p} onClick={() => setPeak(p)} title={PEAKS[p].label} desc={PEAKS[p].desc} />
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">O que mais atrapalha você?</legend>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                  {(Object.keys(STRUGGLES) as Struggle[]).map((s) => (
                    <Choice key={s} active={struggle === s} onClick={() => setStruggle(s)} title={STRUGGLES[s].label} />
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-2" role="group" aria-label="Partes do app">
              <Choice multi active disabled title="Afazeres, Calendário e Dashboard" desc="Sempre ligados — o coração da Rutte" icon={<Check className="size-5" />} onClick={() => undefined} />
              <Choice
                multi
                active={modules.business}
                onClick={() => {
                  setTouchedModules(true);
                  setModules((m) => ({ ...m, business: !m.business }));
                }}
                title="Separar Pessoal × Empresa"
                desc="Para quem tem negócio ou atende clientes: tarefas da empresa com cor própria"
                icon={<Building className="size-5" />}
              />
              <Choice
                multi
                active={modules.gym}
                onClick={() => {
                  setTouchedModules(true);
                  setModules((m) => ({ ...m, gym: !m.gym }));
                }}
                title="Academia"
                desc="Plano de treino, cargas, PRs, peso e hologramas de exercícios"
                icon={<Dumbbell className="size-5" />}
              />
              <Choice
                multi
                active={modules.life}
                onClick={() => {
                  setTouchedModules(true);
                  setModules((m) => ({ ...m, life: !m.life }));
                }}
                title="Roda da Vida"
                desc="Equilíbrio entre as áreas da vida, com vídeos e dicas"
                icon={<ChartPie className="size-5" />}
              />
              <p className="text-xs text-white/50">Dá para mudar depois em “Personalizar a Rutte”, no menu.</p>
            </div>
          )}

        </div>

        {/* Navegação */}
        <div className="mt-8 flex items-center gap-2">
          {step > 0 ? (
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft /> Voltar
            </Button>
          ) : existing ? (
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
              Cancelar
            </Button>
          ) : (
            <Button variant="ghost" className="text-white/60 hover:bg-white/10" onClick={() => finish()} disabled={complete.isPending}>
              Pular por agora
            </Button>
          )}
          <div className="ml-auto">
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Continuar <ArrowRight />
              </Button>
            ) : (
              <Button size="lg" onClick={() => finish()} disabled={complete.isPending}>
                <Sparkles /> {existing ? 'Salvar personalização' : 'Começar a usar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
