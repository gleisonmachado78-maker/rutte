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
  const [peaks, setPeaks] = useState<Peak[]>(existing?.peaks ?? (existing?.peak ? [existing.peak] : []));
  const [struggles, setStruggles] = useState<Struggle[]>(existing?.struggles ?? (existing?.struggle ? [existing.struggle] : []));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [modules, setModules] = useState<UserProfile['modules']>(existing?.modules ?? { business: false, gym: false, life: true });
  const [touchedModules, setTouchedModules] = useState(!!existing);

  // Sugere os módulos pelas respostas até a pessoa mexer neles
  useEffect(() => {
    if (!touchedModules) setModules(suggestedModules(situations, goals));
  }, [situations, goals, touchedModules]);


  const nick = firstName(name);
  const canNext = [name.trim().length > 0, situations.length > 0, goals.length > 0, true, true, true][step];

  const speech = existing
    ? [
        `Oi de novo! Que bom te ver por aqui. Vamos ajustar as coisas para eu continuar te ajudando do jeito certo. Como você prefere que eu te chame?`,
        `Combinado, ${nick}! A sua vida mudou desde a última vez? Pode marcar tudo o que fizer sentido agora.`,
        `E os seus planos, continuam os mesmos? Escolha até ${MAX_GOALS} — eu fico de olho neles para você.`,
        'Me conta de novo como anda a sua rotina: quando você rende mais e o que tem atrapalhado? Pode marcar várias opções.',
        `Tudo anotado, ${nick}. Revise as partes do app que eu deixei prontas para você e mude o que quiser.`,
      ][step]
    : [
        'Olá! Eu sou a Rutte, a sua nova secretária. 😊 A partir de hoje eu cuido da sua agenda, lembro você dos compromissos e ajudo a dar conta de tudo. Antes de começar, posso fazer umas perguntinhas para te conhecer melhor? Para começar: como você prefere que eu te chame?',
        `Muito prazer, ${nick}! Vai ser uma alegria trabalhar com você. Para eu me organizar: como está a sua vida hoje? Pode marcar tudo o que fizer sentido.`,
        `Anotado! Agora me conta os seus planos: o que você quer conquistar nos próximos meses? Escolha até ${MAX_GOALS} — eu vou ficar de olho neles por você.`,
        'Para eu te ajudar do jeito certo, me conta da sua rotina: em que horários você rende mais e o que costuma atrapalhar? Pode marcar várias opções — e, se quiser, escreva com as suas palavras.',
        `Prontinho, ${nick}! Com tudo o que você me contou, já deixei separado o que vai te ajudar mais. Pode ligar ou desligar o que quiser — quem manda aqui é você. Depois eu te mostro tudo num passeio rapidinho.`,
      ][step];

  const finish = () => {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      name: name.trim() || 'Você',
      situations,
      goals,
      peak: peaks[0] ?? 'manha',
      struggle: struggles[0] ?? 'procrastinacao',
      peaks,
      struggles,
      notes: notes.trim() || undefined,
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
        time: PEAKS[peaks[0] ?? 'manha'].time,
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
                Como prefere ser chamado(a)
              </label>
              <input
                id="ob-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
                placeholder="Seu nome ou apelido"
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
                {goals.length} de {MAX_GOALS} escolhidos
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
                <legend className="mb-2 font-semibold">
                  Quando você rende mais? <span className="text-sm font-normal text-white/55">(marque quantos quiser)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2" role="group">
                  {(Object.keys(PEAKS) as Peak[]).map((p) => (
                    <Choice key={p} multi active={peaks.includes(p)} onClick={() => setPeaks((x) => toggle(x, p))} title={PEAKS[p].label} desc={PEAKS[p].desc} />
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">
                  O que costuma atrapalhar? <span className="text-sm font-normal text-white/55">(marque quantos quiser)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2" role="group">
                  {(Object.keys(STRUGGLES) as Struggle[]).map((s) => (
                    <Choice key={s} multi active={struggles.includes(s)} onClick={() => setStruggles((x) => toggle(x, s))} title={STRUGGLES[s].label} />
                  ))}
                </div>
              </fieldset>
              <div className="space-y-2">
                <label htmlFor="ob-notes" className="font-semibold">
                  Quer me contar mais alguma coisa? <span className="text-sm font-normal text-white/55">(opcional)</span>
                </label>
                <textarea
                  id="ob-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={400}
                  rows={3}
                  placeholder="Ex.: trabalho em turnos, tenho dois filhos pequenos, quero voltar a estudar à noite…"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
                />
              </div>
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
              <p className="text-xs text-white/50">Quando quiser mudar, é só me chamar em Configurações → Personalizar.</p>
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
                <Sparkles /> {existing ? 'Salvar' : 'Vamos começar!'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
