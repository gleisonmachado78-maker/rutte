import { Check, Crown, NotebookPen, Sparkles, Timer, CircleCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-gate';
import { useFocusSessions, useNotes, useTasks } from '@/hooks/use-data';
import { currentPlan, formatPrice, PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

/** Aba "Plano" das Configurações: plano atual, uso da conta e os planos que vão existir. */
export function PlanTab() {
  const plan = currentPlan();
  const { email } = useAuth();
  const { data: tasks = [] } = useTasks();
  const { data: notes = [] } = useNotes();
  const { data: sessions = [] } = useFocusSessions();
  const usage = [
    { icon: CircleCheck, v: tasks.length, l: 'afazeres' },
    { icon: NotebookPen, v: notes.length, l: 'notas' },
    { icon: Timer, v: sessions.length, l: 'pomodoros' },
  ];

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-start gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-neon">
            <Crown className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">Seu plano</p>
            <p className="text-2xl font-bold">Rutte {plan.name}</p>
            <p className="text-sm text-foreground/65">{plan.tagline}</p>
            {email && <p className="mt-1 text-xs text-foreground/50">Conta: {email}</p>}
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Ativo · sem custo</span>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          {usage.map((u) => (
            <div key={u.l} className="rounded-xl bg-muted/60 p-3 text-center">
              <u.icon className="mx-auto size-4 text-foreground/50" aria-hidden />
              <p className="mt-1 font-mono text-xl font-bold tabular-nums">{u.v}</p>
              <p className="text-xs text-foreground/60">{u.l}</p>
            </div>
          ))}
        </div>
        <p className="relative mt-4 flex items-start gap-2 text-sm text-foreground/70">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Você faz parte do beta: todos os recursos estão liberados. Quando os planos pagos chegarem, avisaremos com antecedência e nada do que você já cadastrou será perdido.
        </p>
      </section>

      <section aria-labelledby="planos-futuros" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 id="planos-futuros" className="text-lg font-bold">Planos</h2>
        <p className="mt-1 text-sm text-foreground/65">O que cada plano vai incluir depois do beta.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={cn('relative flex flex-col rounded-xl border p-4', p.highlight ? 'border-primary/60 bg-primary/5' : 'border-border')}>
              {p.highlight && <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Mais completo</span>}
              <p className="font-bold">{p.name}</p>
              <p className="text-xs text-foreground/60">{p.tagline}</p>
              <p className="mt-3 font-brand text-2xl font-bold">
                {formatPrice(p.price)}
                {p.price !== null && p.price > 0 && <span className="text-sm font-normal text-foreground/50">/mês</span>}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-foreground/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
