import { addMonths, format, parseISO } from 'date-fns';
import { ChevronDown, CircleCheck, Circle, Info, Zap, ListPlus, Minus, Pencil, PiggyBank, Plus, Target, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Progress, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/sheet';
import {
  useCreateTask,
  useDeleteDream,
  useDreamDeposit,
  useDreams,
  useFinance,
  useRemoveDreamDeposit,
  useSaveDream,
  useSaveFinance,
} from '@/hooks/use-data';
import {
  boostsFor,
  brl,
  budgetCheck,
  DEFAULT_RATE,
  DREAM_EMOJIS,
  DREAM_IDEAS,
  METHOD_BY_ID,
  METHOD_GROUPS,
  METHODS,
  moneyInput,
  monthLabel,
  monthsToReach,
  parseMoney,
  planFor,
  reachDate,
  savingPlan,
  STATUS_INFO,
  type FinanceMethod,
  type MethodGroup,
} from '@/lib/finance';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Dream, FinanceBudget } from '@/types';

/* ------------------------------- Campo de dinheiro ------------------------------- */

function MoneyField({ id, label, value, onChange, placeholder, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">R$</span>
        <Input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 tabular-nums" />
      </div>
      {hint && <p className="mt-1 text-xs text-foreground/55">{hint}</p>}
    </div>
  );
}

/* ----------------------------------- Seu mês ----------------------------------- */

function BudgetCard({ needed }: { needed: number }) {
  const { data: budget } = useFinance();
  const save = useSaveFinance();
  const [open, setOpen] = useState(false);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [rate, setRate] = useState('');

  useEffect(() => {
    setIncome(moneyInput(budget?.income));
    setExpenses(moneyInput(budget?.expenses));
    setRate((budget?.rate ?? DEFAULT_RATE).toLocaleString('pt-BR'));
  }, [budget?.updatedAt]);

  const check = budgetCheck(budget, needed);
  const submit = () => {
    const i = parseMoney(income);
    const e = parseMoney(expenses);
    const r = parseMoney(rate);
    if (!(i > 0)) return toast.error('Informe quanto entra por mês');
    save.mutate({ income: i, expenses: Number.isFinite(e) ? e : 0, rate: Number.isFinite(r) && r >= 0 && r < 10 ? r : DEFAULT_RATE });
    setOpen(false);
    toast.success('Seu mês foi salvo');
  };

  return (
    <section aria-labelledby="fin-month" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="fin-month" className="flex items-center gap-2 font-bold">
            <Wallet className="size-5 text-primary" aria-hidden /> Seu mês
          </h2>
          <p className="mt-1 text-sm text-foreground/65">Quanto entra e quanto sai, para saber se os seus sonhos cabem na sobra.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <Pencil /> {budget ? 'Editar' : 'Preencher'}
        </Button>
      </div>

      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <MoneyField id="fin-income" label="Entra por mês" value={income} onChange={setIncome} placeholder="5.000" hint="Salário + outras rendas, líquido" />
          <MoneyField id="fin-expenses" label="Gasta por mês" value={expenses} onChange={setExpenses} placeholder="3.800" hint="Contas, mercado, cartão…" />
          <div>
            <Label htmlFor="fin-rate">Rendimento ao mês (%)</Label>
            <Input id="fin-rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="tabular-nums" />
            <p className="mt-1 text-xs text-foreground/55">Estimativa do que o dinheiro guardado rende. Use 0 para não contar.</p>
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {budget && !open && check && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Sobra do mês" value={brl(check.free)} tone={check.free < 0 ? 'text-red-600 dark:text-red-400' : undefined} />
          <Stat label="Sonhos pedem por mês" value={brl(needed)} />
          <div className={cn('rounded-xl p-3 text-sm', check.gap > 0 ? 'bg-amber-500/10 text-amber-800 dark:text-amber-200' : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200')}>
            {needed === 0 ? (
              'Crie um sonho para ver se ele cabe na sua sobra.'
            ) : check.gap > 0 ? (
              <>
                Faltam <strong className="tabular-nums">{brl(check.gap)}</strong> por mês. Veja abaixo como ganhar mais ou gastar menos, ou estique um prazo.
              </>
            ) : (
              <>
                Cabe no orçamento: usa <strong className="tabular-nums">{Math.round(check.share * 100)}%</strong> da sua sobra.
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: string; tone?: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">{label}</p>
      <p className={cn('mt-0.5 text-xl font-bold tabular-nums', tone)}>{value}</p>
      {sub && <p className="text-xs text-foreground/55">{sub}</p>}
    </div>
  );
}

/* --------------------------------- Novo/editar sonho --------------------------------- */

type FormState = { title: string; emoji: string; target: string; deadline: string; saved: string; why: string; methods: string[] };

const blankForm = (): FormState => ({ title: '', emoji: '✨', target: '', deadline: format(addMonths(new Date(), 12), 'yyyy-MM'), saved: '', why: '', methods: [] });

function DreamForm({ open, onOpenChange, dream, rate, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; dream?: Dream; rate: number; onCreated?: (id: string) => void }) {
  const save = useSaveDream();
  const [f, setF] = useState<FormState>(blankForm);
  useEffect(() => {
    if (!open) return;
    setF(
      dream
        ? { title: dream.title, emoji: dream.emoji, target: moneyInput(dream.target), deadline: dream.deadline.slice(0, 7), saved: '', why: dream.why ?? '', methods: dream.methods }
        : blankForm(),
    );
  }, [open, dream?.id]);

  const target = parseMoney(f.target);
  const saved = parseMoney(f.saved) || 0;
  const deadline = f.deadline ? `${f.deadline}-28` : '';
  const preview =
    target > 0 && deadline
      ? planFor({ id: '', title: '', emoji: '', target, deadline, deposits: [{ id: '', date: '', amount: saved + (dream ? dream.deposits.reduce((s, x) => s + x.amount, 0) : 0), createdAt: '' }], methods: [], stepsDone: [], createdAt: new Date().toISOString(), updatedAt: '' }, rate)
      : null;

  const submit = () => {
    if (!f.title.trim()) return toast.error('Dê um nome ao sonho');
    if (!(target > 0)) return toast.error('Informe quanto o sonho custa');
    if (!f.deadline) return toast.error('Escolha até quando quer realizar');
    const now = new Date().toISOString();
    const deposits = dream ? dream.deposits : saved > 0 ? [{ id: `dp_${Date.now().toString(36)}`, date: todayISO(), amount: saved, note: 'Já tinha guardado', createdAt: now }] : [];
    save.mutate(
      { ...(dream ? { id: dream.id } : {}), title: f.title.trim(), emoji: f.emoji, target, deadline, why: f.why.trim() || undefined, methods: f.methods, deposits },
      {
        onSuccess: (created) => {
          toast.success(dream ? 'Sonho atualizado' : 'Sonho criado ✨', { description: dream ? f.title.trim() : 'Veja abaixo como juntar esse dinheiro.' });
          onOpenChange(false);
          if (!dream) onCreated?.(created.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="text-lg font-bold">{dream ? 'Editar sonho' : 'Novo sonho'}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/65">Quanto custa e até quando. A Rutte calcula quanto guardar por mês.</DialogDescription>

        {!dream && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">Ideias</p>
            <div className="flex flex-wrap gap-1.5">
              {DREAM_IDEAS.map((idea) => (
                <button
                  key={idea.title}
                  type="button"
                  onClick={() =>
                    setF((s) => ({ ...s, title: idea.title, emoji: idea.emoji, target: moneyInput(idea.target), deadline: format(addMonths(new Date(), idea.months), 'yyyy-MM'), methods: idea.methods }))
                  }
                  className={cn('rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary', f.title === idea.title && 'border-primary bg-primary/10 text-primary')}
                >
                  {idea.emoji} {idea.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <Label htmlFor="dr-title">Sonho</Label>
            <div className="flex gap-2">
              <select
                aria-label="Ícone"
                value={f.emoji}
                onChange={(e) => setF((s) => ({ ...s, emoji: e.target.value }))}
                className="h-10 w-16 shrink-0 rounded-xl border border-border bg-background text-center text-lg"
              >
                {DREAM_EMOJIS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
              <Input id="dr-title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Ex.: Viagem para a praia" maxLength={80} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField id="dr-target" label="Quanto custa" value={f.target} onChange={(v) => setF((s) => ({ ...s, target: v }))} placeholder="10.000" />
            <div>
              <Label htmlFor="dr-deadline">Até quando</Label>
              <Input id="dr-deadline" type="month" min={format(addMonths(new Date(), 1), 'yyyy-MM')} value={f.deadline} onChange={(e) => setF((s) => ({ ...s, deadline: e.target.value }))} />
            </div>
          </div>
          {!dream && <MoneyField id="dr-saved" label="Já tenho guardado (opcional)" value={f.saved} onChange={(v) => setF((s) => ({ ...s, saved: v }))} placeholder="0" />}
          <div>
            <Label htmlFor="dr-why">Por que este sonho importa? (opcional)</Label>
            <Textarea id="dr-why" value={f.why} onChange={(e) => setF((s) => ({ ...s, why: e.target.value }))} placeholder="Ex.: Levar meus pais para conhecer o mar" className="min-h-[64px]" maxLength={300} />
          </div>

          {preview && (
            <div className="rounded-xl bg-primary/10 p-3 text-sm">
              {preview.perMonth > 0 ? (
                <>
                  Guardar <strong className="tabular-nums">{brl(preview.perMonth)}</strong> por mês (≈ {brl(preview.perWeek)} por semana) até {monthLabel(deadline)}.
                </>
              ) : (
                'Você já tem o valor todo. É só realizar!'
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {dream ? 'Salvar' : 'Criar sonho'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------- Guardar ----------------------------------- */

function DepositForm({ dream, suggested, onDone }: { dream: Dream; suggested: number; onDone?: () => void }) {
  const deposit = useDreamDeposit();
  const [value, setValue] = useState(suggested > 0 ? moneyInput(Math.ceil(suggested)) : '');
  const [note, setNote] = useState('');
  const send = (sign: 1 | -1) => {
    const n = parseMoney(value);
    if (!(n > 0)) return toast.error('Informe um valor');
    deposit.mutate({ dreamId: dream.id, amount: sign * n, note: note.trim() || undefined, date: todayISO() }, { onSuccess: () => (setNote(''), onDone?.()) });
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        send(1);
      }}
    >
      <div className="w-36">
        <MoneyField id={`dep-${dream.id}`} label="Valor" value={value} onChange={setValue} />
      </div>
      <div className="min-w-[8rem] flex-1">
        <Label htmlFor={`dep-note-${dream.id}`}>Observação</Label>
        <Input id={`dep-note-${dream.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: salário, 13º, venda" maxLength={80} />
      </div>
      <Button type="submit" disabled={deposit.isPending}>
        <Plus /> Guardar
      </Button>
      <Button type="button" variant="outline" disabled={deposit.isPending} onClick={() => send(-1)} title="Registrar uma retirada">
        <Minus /> Retirar
      </Button>
    </form>
  );
}

/* --------------------------------- Cartão do sonho --------------------------------- */

function DreamCard({ dream, rate, onOpen }: { dream: Dream; rate: number; onOpen: () => void }) {
  const p = planFor(dream, rate);
  const st = STATUS_INFO[p.status];
  const [saving, setSaving] = useState(false);
  const { data: budget } = useFinance();
  const boost = p.status === 'realizado' || p.status === 'vencido' ? undefined : boostsFor(dream, budget, rate).find((b) => b.id === 'freela');
  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <button type="button" onClick={onOpen} className="flex items-start gap-3 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-2xl" aria-hidden>
          {dream.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{dream.title}</span>
          <span className="text-xs text-foreground/60">até {monthLabel(dream.deadline)}</span>
        </span>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', st.tone)}>{st.label}</span>
      </button>

      <div className="mt-3">
        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm tabular-nums">
          <span className="font-semibold">{brl(p.saved)}</span>
          <span className="text-foreground/60">de {brl(dream.target)}</span>
        </div>
        <Progress value={p.pct} label={`${Math.round(p.pct)}% de ${dream.title}`} />
        <p className="mt-1 text-right text-xs tabular-nums text-foreground/55">{Math.round(p.pct)}%</p>
      </div>

      {p.status !== 'realizado' && (
        <p className="mt-1 text-sm">
          {p.status === 'vencido' ? (
            <>Faltam {brl(p.remaining)}. Ajuste o prazo para recalcular.</>
          ) : (
            <>
              Guarde <strong className="tabular-nums">{brl(p.perMonth)}</strong>/mês <span className="text-foreground/60">· ≈ {brl(p.perDay, true)} por dia</span>
            </>
          )}
        </p>
      )}

      {boost && boost.gain > 0 && (
        <p className="mt-1 flex items-start gap-1 text-xs text-amber-700 dark:text-amber-300">
          <Zap className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Com {brl(boost.extra)}/mês de renda extra, chega {boost.gain} {boost.gain === 1 ? 'mês' : 'meses'} antes
        </p>
      )}

      <div className="mt-auto pt-3">
        {saving ? (
          <DepositForm dream={dream} suggested={p.perMonth} onDone={() => setSaving(false)} />
        ) : (
          <div className="flex gap-2">
            {p.status !== 'realizado' && (
              <Button size="sm" onClick={() => setSaving(true)}>
                <PiggyBank /> Guardar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onOpen}>
              Plano e métodos
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/* ------------------------------- Detalhe do sonho ------------------------------- */

function MethodSteps({ method, done, onToggle, onTask }: { method: FinanceMethod; done: (i: number) => boolean; onToggle?: (i: number) => void; onTask: (step: string) => void }) {
  return (
    <ol className="space-y-1">
      {method.steps.map((s, i) => (
        <li key={i} className="group flex items-start gap-2 text-sm">
          {onToggle ? (
            <button type="button" onClick={() => onToggle(i)} className="mt-0.5 shrink-0 text-foreground/50 hover:text-primary" aria-label={done(i) ? `Desmarcar: ${s}` : `Marcar como feito: ${s}`}>
              {done(i) ? <CircleCheck className="size-4 text-emerald-600" /> : <Circle className="size-4" />}
            </button>
          ) : (
            <span className="mt-0.5 w-4 shrink-0 text-center text-xs font-bold text-foreground/45">{i + 1}</span>
          )}
          <span className={cn('min-w-0 flex-1', done(i) && 'text-foreground/45 line-through')}>{s}</span>
          <button
            type="button"
            onClick={() => onTask(s)}
            className="shrink-0 rounded-md p-0.5 text-foreground/40 hover:bg-muted hover:text-primary sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            aria-label={`Virar afazer: ${s}`}
            title="Virar afazer"
          >
            <ListPlus className="size-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}

function useStepToTask() {
  const createTask = useCreateTask();
  return (step: string, context: string) =>
    createTask.mutate({
      title: step,
      whatToDo: context,
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: todayISO(),
      scope: 'PERSONAL',
      lifeAreaId: 'financas',
      subtasks: [],
      links: [],
    });
}

function SavingPlanSection({ dream, budget, rate, onAddMethod }: { dream: Dream; budget: FinanceBudget | null | undefined; rate: number; onAddMethod: (id: string) => void }) {
  const { data: dreams = [] } = useDreams();
  const plan = savingPlan(dream, budget, dreams, rate);
  if (!plan.parts.length) return null;
  return (
    <section aria-labelledby="dr-plan" className="mt-6">
      <h3 id="dr-plan" className="flex items-center gap-2 font-bold">
        <PiggyBank className="size-4 text-primary" aria-hidden /> Como juntar {brl(dream.target - plan.saved)}
      </h3>
      <p className="text-sm text-foreground/60">
        Uma sugestão de onde pode vir cada parte, em {plan.months} {plan.months === 1 ? 'mês' : 'meses'}. Toque numa linha para colocá-la no seu plano.
      </p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-foreground/55">
            <tr>
              <th className="px-3 py-2 font-semibold">De onde vem</th>
              <th className="px-3 py-2 text-right font-semibold">Por mês</th>
              <th className="px-3 py-2 text-right font-semibold">No total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plan.saved > 0 && (
              <tr>
                <td className="px-3 py-2">✅ Já guardado</td>
                <td className="px-3 py-2 text-right text-foreground/45">—</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{brl(plan.saved)}</td>
              </tr>
            )}
            {plan.parts.map((part) => {
              const inPlan = !!part.methodId && dream.methods.includes(part.methodId);
              return (
                <tr key={part.id} className={cn(!inPlan && 'cursor-pointer hover:bg-muted/50')} onClick={() => part.methodId && onAddMethod(part.methodId)}>
                  <td className="px-3 py-2">
                    <span className="font-medium">
                      {part.emoji} {part.title}
                    </span>
                    {inPlan && <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">no plano ✓</span>}
                    <span className="block text-xs text-foreground/55">{part.detail}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right align-top tabular-nums">{part.monthly ? brl(part.monthly) : <span className="text-xs text-foreground/55">uma vez</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right align-top font-semibold tabular-nums">{brl(part.total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-border bg-muted/40">
            <tr>
              <td className="px-3 py-2 font-bold">Total</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums">{brl(plan.monthly)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums">{brl(plan.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!budget?.income && <p className="mt-1.5 text-xs text-foreground/55">Preencha "Seu mês" na página Sonhos e metas para a Rutte usar a sua sobra real no plano.</p>}
    </section>
  );
}

function BoostSection({ dream, budget, rate, onAddMethod }: { dream: Dream; budget: FinanceBudget | null | undefined; rate: number; onAddMethod: (id: string) => void }) {
  const boosts = boostsFor(dream, budget, rate);
  if (!boosts.length) return null;
  return (
    <section aria-labelledby="dr-boost" className="mt-6">
      <h3 id="dr-boost" className="flex items-center gap-2 font-bold">
        <Zap className="size-4 text-amber-500" aria-hidden /> Dar um boost: ganhar mais e chegar antes
      </h3>
      <p className="text-sm text-foreground/60">Guardando o valor do mês e somando um destes, quando você chega lá:</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {boosts.map((b) => {
          const date = reachDate(b.months);
          const inPlan = dream.methods.includes(b.methodId);
          const gains = [b.extra ? `+${brl(b.extra)}/mês` : '', b.oneTime ? `+${brl(b.oneTime)} de uma vez` : ''].filter(Boolean).join(' e ');
          return (
            <li key={b.id} className="flex flex-col rounded-xl border border-border p-3">
              <p className="font-semibold">
                {b.emoji} {b.title}
              </p>
              <p className="text-xs text-foreground/55">{b.detail}</p>
              <p className="mt-1.5 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{gains}</p>
              {date && (
                <p className="text-sm">
                  Realiza em <strong>{monthLabel(date)}</strong>
                  {b.gain > 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {' '}
                      · {b.gain} {b.gain === 1 ? 'mês' : 'meses'} antes
                    </span>
                  ) : (
                    ' · no mesmo prazo'
                  )}
                </p>
              )}
              <Button size="sm" variant={inPlan ? 'ghost' : 'outline'} className="mt-2 self-start" disabled={inPlan} onClick={() => onAddMethod(b.methodId)}>
                {inPlan ? 'No plano ✓' : 'Quero esse boost'}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DreamSheet({ dream, rate, onClose, onEdit }: { dream: Dream | null; rate: number; onClose: () => void; onEdit: (d: Dream) => void }) {
  const save = useSaveDream();
  const remove = useDeleteDream();
  const removeDep = useRemoveDreamDeposit();
  const toTask = useStepToTask();
  const { data: budget } = useFinance();
  const [sim, setSim] = useState('');
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    setSim('');
    setAdding(false);
  }, [dream?.id]);

  if (!dream) return <Dialog open={false} />;
  const p = planFor(dream, rate);
  const simValue = parseMoney(sim);
  const simMonths = simValue > 0 ? monthsToReach(dream.target, p.saved, simValue, rate) : null;
  const simDate = simMonths !== null ? reachDate(simMonths) : null;
  const chosen = dream.methods.map((id) => METHOD_BY_ID[id]).filter(Boolean);
  const others = METHODS.filter((m) => !dream.methods.includes(m.id));
  const setMethods = (methods: string[]) => save.mutate({ ...dream, methods });
  const toggleStep = (key: string) =>
    save.mutate({ ...dream, stepsDone: dream.stepsDone.includes(key) ? dream.stepsDone.filter((k) => k !== key) : [...dream.stepsDone, key] });

  return (
    <Dialog open={!!dream} onOpenChange={(v) => !v && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6">
          <div className="flex items-start gap-3 pr-12">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-3xl" aria-hidden>
              {dream.emoji}
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold">{dream.title}</DialogTitle>
              <p className="text-sm text-foreground/60">
                {brl(dream.target)} até {monthLabel(dream.deadline)}
              </p>
            </div>
          </div>
          {dream.why && <p className="mt-3 rounded-xl border-l-4 border-primary bg-primary/5 px-3 py-2 text-sm italic">“{dream.why}”</p>}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Guardado" value={brl(p.saved)} sub={`${Math.round(p.pct)}% do sonho`} />
            <Stat label="Falta" value={brl(p.remaining)} />
            <Stat
              label="Por mês"
              value={p.status === 'realizado' ? '—' : brl(p.perMonth)}
              sub={p.status === 'realizado' ? 'Realizado!' : `${Math.ceil(p.months)} ${Math.ceil(p.months) === 1 ? 'mês' : 'meses'} · ≈ ${brl(p.perWeek)}/semana`}
            />
          </div>
          <Progress value={p.pct} className="mt-3 h-3" label={`${Math.round(p.pct)}% guardado`} />
          {rate > 0 && p.status !== 'realizado' && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-foreground/55">
              <Info className="size-3.5" aria-hidden /> Conta com rendimento estimado de {rate.toLocaleString('pt-BR')}% ao mês (muda em "Seu mês").
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {p.status !== 'realizado' && !adding && (
              <Button onClick={() => setAdding(true)}>
                <PiggyBank /> Guardar dinheiro
              </Button>
            )}
            <Button variant="outline" onClick={() => onEdit(dream)}>
              <Pencil /> Editar
            </Button>
            <Button
              variant="ghost"
              className="hover:text-red-600"
              onClick={async () => {
                if (await askConfirm({ title: `Excluir "${dream.title}"?`, message: 'O sonho e o histórico de depósitos serão apagados.', confirmLabel: 'Excluir', danger: true })) {
                  remove.mutate(dream.id);
                  onClose();
                }
              }}
            >
              <Trash2 /> Excluir
            </Button>
          </div>
          {adding && (
            <div className="mt-3 rounded-xl border border-border p-3">
              <DepositForm dream={dream} suggested={p.perMonth} onDone={() => setAdding(false)} />
            </div>
          )}

          {p.status !== 'realizado' && p.status !== 'vencido' && (
            <SavingPlanSection dream={dream} budget={budget} rate={rate} onAddMethod={(id) => !dream.methods.includes(id) && setMethods([...dream.methods, id])} />
          )}
          {p.status !== 'realizado' && p.status !== 'vencido' && (
            <BoostSection dream={dream} budget={budget} rate={rate} onAddMethod={(id) => !dream.methods.includes(id) && setMethods([...dream.methods, id])} />
          )}

          {p.status !== 'realizado' && (
            <section aria-labelledby="dr-sim" className="mt-6">
              <h3 id="dr-sim" className="flex items-center gap-2 font-bold">
                <TrendingUp className="size-4 text-primary" aria-hidden /> E se eu guardar…
              </h3>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <div className="w-40">
                  <MoneyField id="dr-sim-v" label="Por mês" value={sim} onChange={setSim} placeholder={moneyInput(Math.ceil(p.perMonth))} />
                </div>
                <p className="min-w-0 flex-1 pb-2 text-sm">
                  {simMonths === null ? (
                    <span className="text-foreground/55">Digite um valor para ver quando você chega lá.</span>
                  ) : simDate ? (
                    <>
                      Você realiza em <strong>{monthLabel(simDate)}</strong> ({Math.ceil(simMonths)} {Math.ceil(simMonths) === 1 ? 'mês' : 'meses'})
                      {simDate < dream.deadline ? ', antes do prazo 🎉' : simDate.slice(0, 7) === dream.deadline.slice(0, 7) ? ', no prazo.' : ', depois do prazo.'}
                    </>
                  ) : (
                    'Com esse valor o sonho não chega lá. Aumente um pouco.'
                  )}
                </p>
              </div>
            </section>
          )}

          <section aria-labelledby="dr-methods" className="mt-6">
            <h3 id="dr-methods" className="flex items-center gap-2 font-bold">
              <Target className="size-4 text-primary" aria-hidden /> Como vou conseguir
            </h3>
            <p className="text-sm text-foreground/60">Escolha os caminhos e vá marcando os passos. Cada passo pode virar afazer.</p>
            <ul className="mt-3 space-y-3">
              {chosen.map((m) => {
                const doneCount = m.steps.filter((_, i) => dream.stepsDone.includes(`${m.id}:${i}`)).length;
                return (
                  <li key={m.id} className="rounded-xl border border-border p-3">
                    <div className="mb-2 flex items-start gap-2">
                      <span className="text-xl" aria-hidden>
                        {m.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-xs text-foreground/55">
                          {m.potential} · {m.time} · {doneCount}/{m.steps.length} passos
                        </p>
                      </div>
                      <Button variant="ghost" size="icon-sm" aria-label={`Tirar ${m.title} do plano`} title="Tirar do plano" onClick={() => setMethods(dream.methods.filter((x) => x !== m.id))}>
                        <Trash2 />
                      </Button>
                    </div>
                    <MethodSteps
                      method={m}
                      done={(i) => dream.stepsDone.includes(`${m.id}:${i}`)}
                      onToggle={(i) => toggleStep(`${m.id}:${i}`)}
                      onTask={(s) => toTask(s, `Passo de “${m.title}” para o sonho ${dream.emoji} ${dream.title}.`)}
                    />
                  </li>
                );
              })}
            </ul>
            {others.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">Adicionar caminho</p>
                <div className="flex flex-wrap gap-1.5">
                  {others.map((m) => (
                    <button key={m.id} type="button" onClick={() => setMethods([...dream.methods, m.id])} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary">
                      {m.emoji} {m.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="dr-hist" className="mt-6">
            <h3 id="dr-hist" className="font-bold">
              Histórico
            </h3>
            {dream.deposits.length === 0 ? (
              <p className="mt-1 text-sm text-foreground/55">Nenhum depósito ainda. O primeiro é o mais importante.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                {[...dream.deposits].reverse().map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-16 shrink-0 tabular-nums text-foreground/60">{d.date ? format(parseISO(d.date), 'dd/MM/yy') : ''}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground/75">{d.note ?? (d.amount < 0 ? 'Retirada' : 'Depósito')}</span>
                    <span className={cn('shrink-0 font-semibold tabular-nums', d.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400')}>
                      {d.amount < 0 ? '−' : '+'}
                      {brl(Math.abs(d.amount), true)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Apagar este lançamento"
                      onClick={async () => (await askConfirm({ title: 'Apagar este lançamento?', confirmLabel: 'Apagar', danger: true })) && removeDep.mutate({ dreamId: dream.id, depositId: d.id })}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Dialog>
  );
}

/* ----------------------------------- Métodos ----------------------------------- */

function MethodsSection({ dreams }: { dreams: Dream[] }) {
  const [group, setGroup] = useState<MethodGroup>('ganhar');
  const [open, setOpen] = useState<string | null>(null);
  const save = useSaveDream();
  const toTask = useStepToTask();
  const g = METHOD_GROUPS.find((x) => x.id === group)!;
  const active = dreams.filter((d) => planFor(d).status !== 'realizado');
  return (
    <section aria-labelledby="fin-methods" className="space-y-3">
      <div>
        <h2 id="fin-methods" className="text-lg font-bold">
          Como conseguir o dinheiro
        </h2>
        <p className="text-sm text-foreground/65">Caminhos práticos, passo a passo. Coloque no plano de um sonho ou transforme os passos em afazeres.</p>
      </div>
      <div role="tablist" aria-label="Tipo de caminho" className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {METHOD_GROUPS.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={group === x.id}
            onClick={() => setGroup(x.id)}
            className={cn('flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', group === x.id ? 'bg-background shadow-sm' : 'text-foreground/65 hover:text-foreground')}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-foreground/60">{g.intro}</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {METHODS.filter((m) => m.group === group).map((m) => {
          const isOpen = open === m.id;
          return (
            <li key={m.id} className="rounded-2xl border border-border bg-card">
              <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen} className="flex w-full items-start gap-3 p-4 text-left">
                <span className="text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="mt-0.5 block text-sm text-foreground/65">{m.summary}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">{m.potential}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-foreground/65">{m.time}</span>
                  </span>
                </span>
                <ChevronDown className={cn('mt-1 size-4 shrink-0 text-foreground/50 transition-transform', isOpen && 'rotate-180')} aria-hidden />
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <MethodSteps method={m} done={() => false} onTask={(s) => toTask(s, `Passo de “${m.title}”.`)} />
                  {active.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground/60">Usar no sonho:</span>
                      {active.map((d) => {
                        const has = d.methods.includes(m.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            disabled={has}
                            onClick={() => save.mutate({ ...d, methods: [...d.methods, m.id] }, { onSuccess: () => toast.success('Caminho adicionado ao sonho', { description: `${d.emoji} ${d.title}` }) })}
                            className={cn('rounded-full border px-2.5 py-1 text-xs', has ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'border-border hover:border-primary hover:text-primary')}
                          >
                            {has ? '✓ ' : ''}
                            {d.emoji} {d.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------ Página ------------------------------------ */

export function FinancePage() {
  const { data: dreams = [] } = useDreams();
  const { data: budget } = useFinance();
  const rate = budget?.rate ?? DEFAULT_RATE;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dream | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = dreams.find((d) => d.id === openId) ?? null;

  const totals = useMemo(() => {
    const plans = dreams.map((d) => planFor(d, rate));
    return {
      saved: plans.reduce((s, p) => s + p.saved, 0),
      remaining: plans.reduce((s, p) => s + p.remaining, 0),
      perMonth: plans.reduce((s, p) => s + (p.status === 'realizado' || p.status === 'vencido' ? 0 : p.perMonth), 0),
      done: plans.filter((p) => p.status === 'realizado').length,
    };
  }, [dreams, rate]);

  const active = dreams.filter((d) => planFor(d, rate).status !== 'realizado');
  const achieved = dreams.filter((d) => planFor(d, rate).status === 'realizado');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <PiggyBank className="size-7 text-primary" aria-hidden /> Sonhos e metas
          </h1>
          <p className="mt-1 text-foreground/65">Quanto guardar por mês, quanto já tem e o caminho para chegar lá.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Novo sonho
        </Button>
      </header>

      {dreams.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Guardado" value={brl(totals.saved)} />
          <Stat label="Falta" value={brl(totals.remaining)} />
          <Stat label="Guardar por mês" value={brl(totals.perMonth)} sub="somando todos os sonhos" />
          <Stat label="Realizados" value={`${totals.done} de ${dreams.length}`} />
        </div>
      )}

      <BudgetCard needed={totals.perMonth} />

      <section aria-labelledby="fin-dreams" className="space-y-3">
        <h2 id="fin-dreams" className="text-lg font-bold">
          Meus sonhos
        </h2>
        {dreams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-3xl" aria-hidden>
              ✨
            </p>
            <p className="mt-2 font-semibold">Qual é o seu próximo sonho?</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-foreground/60">Uma viagem, o carro, a casa, o seu negócio… Diga quanto custa e até quando, e a Rutte mostra quanto guardar por mês e como chegar lá.</p>
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus /> Criar meu primeiro sonho
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {active.map((d) => (
              <DreamCard key={d.id} dream={d} rate={rate} onOpen={() => setOpenId(d.id)} />
            ))}
          </ul>
        )}
        {achieved.length > 0 && (
          <div>
            <h3 className="mb-2 mt-4 font-semibold text-foreground/70">Realizados 🎉</h3>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {achieved.map((d) => (
                <DreamCard key={d.id} dream={d} rate={rate} onOpen={() => setOpenId(d.id)} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <MethodsSection dreams={dreams} />

      <p className="flex items-start gap-1.5 text-xs text-foreground/50">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Conteúdo educativo para organizar seus objetivos. Os valores são estimativas e não são recomendação de investimento.
      </p>

      <DreamForm open={formOpen} onOpenChange={setFormOpen} dream={editing} rate={rate} onCreated={setOpenId} />
      <DreamSheet
        dream={opened}
        rate={rate}
        onClose={() => setOpenId(null)}
        onEdit={(d) => {
          setEditing(d);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
