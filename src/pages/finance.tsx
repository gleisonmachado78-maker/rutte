import { addMonths, format, parseISO } from 'date-fns';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Circle,
  CircleCheck,
  Info,
  ListChecks,
  ListPlus,
  Minus,
  Pencil,
  PiggyBank,
  Plus,
  SlidersHorizontal,
  Target,
  Trash2,
  Trophy,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RutteLogo } from '@/components/brand/rutte';
import { PlanBuilder } from '@/components/finance/plan-builder';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Progress, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/sheet';
import { useCreateTask, useDeleteDream, useDreamDeposit, useDreams, useFinance, useRemoveDreamDeposit, useSaveDream, useSaveFinance } from '@/hooks/use-data';
import {
  brl,
  budgetCheck,
  DEFAULT_RATE,
  DREAM_ICONS,
  DREAM_IDEAS,
  dreamIcon,
  dreamIconId,
  METHOD_BY_ID,
  METHOD_GROUPS,
  METHODS,
  moneyInput,
  monthLabel,
  parseMoney,
  planFor,
  STATUS_INFO,
  type FinanceMethod,
  type MethodGroup,
} from '@/lib/finance';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Dream } from '@/types';

/* ----------------------------------- Peças ----------------------------------- */

function IconTile({ icon: Icon, size = 'md', className }: { icon: LucideIcon; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-primary/10 text-primary dark:text-neon',
        size === 'sm' ? 'size-8 rounded-lg' : size === 'md' ? 'size-10 rounded-xl' : 'size-12 rounded-xl',
        className,
      )}
      aria-hidden
    >
      <Icon className={size === 'lg' ? 'size-6' : size === 'md' ? 'size-5' : 'size-4'} />
    </span>
  );
}

function MoneyField({ id, label, value, onChange, placeholder, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">R$</span>
        <Input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 tabular-nums" />
      </div>
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground/70" aria-hidden>
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-sm text-foreground/60">{label}</span>
      </span>
    </div>
  );
}

function StatusChip({ status }: { status: keyof typeof STATUS_INFO }) {
  const st = STATUS_INFO[status];
  return <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', st.tone)}>{st.label}</span>;
}

/* ----------------------------------- Seu mês ----------------------------------- */

function BudgetCard({ needed }: { needed: number }) {
  const { data: budget } = useFinance();
  const save = useSaveFinance();
  const [editing, setEditing] = useState(false);
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
    setEditing(false);
    toast.success('Seu mês foi salvo');
  };
  const showForm = editing || !budget;

  return (
    <section aria-labelledby="fin-month" className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="fin-month" className="flex items-center gap-2 font-bold">
          <Wallet className="size-5 text-primary dark:text-neon" aria-hidden /> Seu mês
        </h2>
        {budget && !editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Editar
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className="text-sm text-foreground/60">Quanto entra e quanto sai por mês. Assim eu sei se os seus sonhos cabem na sobra.</p>
          <MoneyField id="fin-income" label="Entra por mês" value={income} onChange={setIncome} placeholder="5.000" hint="Salário e outras rendas, líquido" />
          <MoneyField id="fin-expenses" label="Sai por mês" value={expenses} onChange={setExpenses} placeholder="3.800" hint="Contas, mercado, cartão…" />
          <div>
            <Label htmlFor="fin-rate">Rendimento ao mês (%)</Label>
            <Input id="fin-rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="tabular-nums" />
            <p className="mt-1 text-xs text-foreground/50">Quanto o dinheiro guardado rende. Use 0 para não contar.</p>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            {budget && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      ) : (
        check && (
          <div className="mt-3 space-y-3">
            <dl className="divide-y divide-border text-sm">
              <div className="flex justify-between py-1.5">
                <dt className="text-foreground/60">Entra</dt>
                <dd className="font-semibold tabular-nums">{brl(budget!.income)}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-foreground/60">Sai</dt>
                <dd className="font-semibold tabular-nums">{brl(budget!.expenses)}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="font-semibold">Sobra</dt>
                <dd className={cn('font-bold tabular-nums', check.free < 0 && 'text-primary dark:text-neon')}>{brl(check.free)}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-foreground/60">Sonhos pedem</dt>
                <dd className="font-semibold tabular-nums">{brl(needed)}</dd>
              </div>
            </dl>
            {needed > 0 && (
              <>
                <Progress value={check.free > 0 ? (needed / check.free) * 100 : 100} label="Quanto da sobra os sonhos usam" />
                <p className="text-sm text-foreground/70">
                  {check.gap > 0 ? (
                    <>
                      Faltam <strong className="text-primary dark:text-neon">{brl(check.gap)} por mês</strong>. Abra um sonho e use o simulador para fechar a conta.
                    </>
                  ) : (
                    <>
                      Cabe no orçamento: usa <strong>{Math.round(check.share * 100)}%</strong> da sua sobra.
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        )
      )}
    </section>
  );
}

/* --------------------------------- Novo/editar sonho --------------------------------- */

type FormState = { title: string; icon: string; target: string; deadline: string; saved: string; why: string; methods: string[] };

const blankForm = (): FormState => ({ title: '', icon: 'sonho', target: '', deadline: format(addMonths(new Date(), 12), 'yyyy-MM'), saved: '', why: '', methods: [] });

function DreamForm({ open, onOpenChange, dream, rate, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; dream?: Dream; rate: number; onCreated?: (id: string) => void }) {
  const save = useSaveDream();
  const [f, setF] = useState<FormState>(blankForm);
  useEffect(() => {
    if (!open) return;
    setF(dream ? { title: dream.title, icon: dreamIconId(dream), target: moneyInput(dream.target), deadline: dream.deadline.slice(0, 7), saved: '', why: dream.why ?? '', methods: dream.methods } : blankForm());
  }, [open, dream?.id]);

  const target = parseMoney(f.target);
  const saved = parseMoney(f.saved) || 0;
  const deadline = f.deadline ? `${f.deadline}-28` : '';
  const alreadySaved = dream ? dream.deposits.reduce((s, x) => s + x.amount, 0) : saved;
  const preview =
    target > 0 && deadline
      ? planFor({ id: '', title: '', emoji: '', target, deadline, deposits: [{ id: '', date: '', amount: alreadySaved, createdAt: '' }], methods: [], stepsDone: [], createdAt: new Date().toISOString(), updatedAt: '' }, rate)
      : null;

  const submit = () => {
    if (!f.title.trim()) return toast.error('Dê um nome ao sonho');
    if (!(target > 0)) return toast.error('Informe quanto o sonho custa');
    if (!f.deadline) return toast.error('Escolha até quando quer realizar');
    const now = new Date().toISOString();
    const deposits = dream ? dream.deposits : saved > 0 ? [{ id: `dp_${Date.now().toString(36)}`, date: todayISO(), amount: saved, note: 'Já tinha guardado', createdAt: now }] : [];
    save.mutate(
      { ...(dream ? { id: dream.id } : {}), title: f.title.trim(), icon: f.icon, target, deadline, why: f.why.trim() || undefined, methods: f.methods, deposits },
      {
        onSuccess: (created) => {
          toast.success(dream ? 'Sonho atualizado' : 'Sonho criado', { description: dream ? f.title.trim() : 'Veja no simulador como chegar lá.' });
          onOpenChange(false);
          if (!dream) onCreated?.(created.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="text-lg font-bold">{dream ? 'Editar sonho' : 'Novo sonho ou meta'}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/60">Quanto custa e até quando. Eu calculo quanto guardar por mês.</DialogDescription>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {!dream && (
            <div>
              <Label>Comece por uma ideia</Label>
              <div className="flex flex-wrap gap-1.5">
                {DREAM_IDEAS.map((idea) => {
                  const Icon = DREAM_ICONS.find((i) => i.id === idea.icon)!.icon;
                  const on = f.title === idea.title;
                  return (
                    <button
                      key={idea.title}
                      type="button"
                      onClick={() => setF((s) => ({ ...s, title: idea.title, icon: idea.icon, target: moneyInput(idea.target), deadline: format(addMonths(new Date(), idea.months), 'yyyy-MM'), methods: idea.methods }))}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                        on ? 'border-primary bg-primary text-white' : 'border-border text-foreground/70 hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden /> {idea.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="dr-title">Nome</Label>
            <Input id="dr-title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Ex.: Viagem para a Europa" maxLength={80} />
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="grid grid-cols-9 gap-1">
              {DREAM_ICONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setF((s) => ({ ...s, icon: id }))}
                  className={cn('grid aspect-square place-items-center rounded-lg transition-colors', f.icon === id ? 'bg-primary text-white' : 'text-foreground/60 hover:bg-muted hover:text-foreground')}
                  aria-label={label}
                  aria-pressed={f.icon === id}
                  title={label}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField id="dr-target" label="Quanto custa" value={f.target} onChange={(v) => setF((s) => ({ ...s, target: v }))} placeholder="15.000" />
            <div>
              <Label htmlFor="dr-deadline">Até quando</Label>
              <Input id="dr-deadline" type="month" min={format(addMonths(new Date(), 1), 'yyyy-MM')} value={f.deadline} onChange={(e) => setF((s) => ({ ...s, deadline: e.target.value }))} />
            </div>
          </div>
          {!dream && <MoneyField id="dr-saved" label="Já tenho guardado (opcional)" value={f.saved} onChange={(v) => setF((s) => ({ ...s, saved: v }))} placeholder="0" />}
          <div>
            <Label htmlFor="dr-why">Por que é importante? (opcional)</Label>
            <Textarea id="dr-why" value={f.why} onChange={(e) => setF((s) => ({ ...s, why: e.target.value }))} placeholder="Ex.: Levar meus pais para conhecer o mar" className="min-h-[64px]" maxLength={300} />
          </div>

          {preview && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <PiggyBank className="size-5 shrink-0 text-primary dark:text-neon" aria-hidden />
              <p className="text-sm">
                {preview.perMonth > 0 ? (
                  <>
                    Guardar <strong className="tabular-nums">{brl(preview.perMonth)} por mês</strong> até {monthLabel(deadline)}.
                  </>
                ) : (
                  'Você já tem o valor todo.'
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {dream ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------- Guardar ----------------------------------- */

function DepositForm({ dream, suggested, onDone, compact }: { dream: Dream; suggested: number; onDone?: () => void; compact?: boolean }) {
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
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        send(1);
      }}
    >
      <div className={cn('grid gap-2', !compact && 'sm:grid-cols-[10rem_minmax(0,1fr)]')}>
        <MoneyField id={`dep-${dream.id}${compact ? '-c' : ''}`} label="Valor" value={value} onChange={setValue} />
        {!compact && (
          <div>
            <Label htmlFor={`dep-note-${dream.id}`}>Observação</Label>
            <Input id={`dep-note-${dream.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Salário, 13º, venda…" maxLength={80} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={deposit.isPending}>
          <Plus /> Guardar
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={deposit.isPending} onClick={() => send(-1)}>
          <Minus /> Retirar
        </Button>
        {onDone && (
          <Button type="button" size="sm" variant="ghost" onClick={onDone} aria-label="Cancelar">
            <X />
          </Button>
        )}
      </div>
    </form>
  );
}

/* --------------------------------- Cartão do sonho --------------------------------- */

function DreamCard({ dream, rate, onOpen }: { dream: Dream; rate: number; onOpen: (tab?: SheetTab) => void }) {
  const p = planFor(dream, rate);
  const [saving, setSaving] = useState(false);
  const Icon = dreamIcon(dream);
  return (
    <li className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <button type="button" onClick={() => onOpen()} className="flex items-center gap-3 text-left">
        <IconTile icon={Icon} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{dream.title}</span>
          <span className="flex items-center gap-1 text-xs text-foreground/55">
            <CalendarDays className="size-3" aria-hidden /> até {monthLabel(dream.deadline)}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </button>

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between gap-2 tabular-nums">
          <span className="text-lg font-bold">{brl(p.saved)}</span>
          <span className="text-sm text-foreground/55">de {brl(dream.target)}</span>
        </div>
        <Progress value={p.pct} label={`${Math.round(p.pct)}% de ${dream.title}`} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        {p.status === 'realizado' ? (
          <span className="text-foreground/60">Meta alcançada</span>
        ) : p.status === 'vencido' ? (
          <span className="text-foreground/60">Faltam {brl(p.remaining)}</span>
        ) : (
          <span>
            <strong className="tabular-nums">{brl(p.perMonth)}</strong> <span className="text-foreground/55">por mês</span>
          </span>
        )}
        <StatusChip status={p.status} />
      </div>

      {p.status !== 'realizado' && (
        <div className="mt-3 border-t border-border pt-3">
          {saving ? (
            <DepositForm dream={dream} suggested={p.perMonth} onDone={() => setSaving(false)} compact />
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSaving(true)}>
                <PiggyBank /> Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpen('simulador')}>
                <SlidersHorizontal /> Simular
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* ------------------------------- Detalhe do sonho ------------------------------- */

function useStepToTask() {
  const createTask = useCreateTask();
  return (step: string, context: string) =>
    createTask.mutate({ title: step, whatToDo: context, status: 'NOT_STARTED', priority: 'MEDIUM', dueDate: todayISO(), scope: 'PERSONAL', lifeAreaId: 'financas', subtasks: [], links: [] });
}

function MethodSteps({ method, done, onToggle, onTask }: { method: FinanceMethod; done: (i: number) => boolean; onToggle?: (i: number) => void; onTask: (step: string) => void }) {
  return (
    <ol className="space-y-1.5">
      {method.steps.map((s, i) => (
        <li key={i} className="group/step flex items-start gap-2 text-sm">
          {onToggle ? (
            <button type="button" onClick={() => onToggle(i)} className="mt-0.5 shrink-0 text-foreground/40 hover:text-primary" aria-label={done(i) ? `Desmarcar: ${s}` : `Marcar como feito: ${s}`}>
              {done(i) ? <CircleCheck className="size-4 text-primary dark:text-neon" /> : <Circle className="size-4" />}
            </button>
          ) : (
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-foreground/60">{i + 1}</span>
          )}
          <span className={cn('min-w-0 flex-1', done(i) && 'text-foreground/40 line-through')}>{s}</span>
          <button
            type="button"
            onClick={() => onTask(s)}
            className="shrink-0 rounded-md p-0.5 text-foreground/35 hover:bg-muted hover:text-primary sm:opacity-0 sm:focus:opacity-100 sm:group-hover/step:opacity-100"
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

type SheetTab = 'resumo' | 'simulador' | 'passos';
const SHEET_TABS: { id: SheetTab; label: string; icon: LucideIcon }[] = [
  { id: 'resumo', label: 'Resumo', icon: PiggyBank },
  { id: 'simulador', label: 'Simulador', icon: SlidersHorizontal },
  { id: 'passos', label: 'Passos', icon: ListChecks },
];

function DreamSheet({ dream, rate, onClose, onEdit, startTab }: { dream: Dream | null; rate: number; onClose: () => void; onEdit: (d: Dream) => void; startTab: SheetTab }) {
  const save = useSaveDream();
  const remove = useDeleteDream();
  const removeDep = useRemoveDreamDeposit();
  const toTask = useStepToTask();
  const { data: budget } = useFinance();
  const [tab, setTab] = useState<SheetTab>(startTab);
  useEffect(() => setTab(startTab), [dream?.id, startTab]);

  if (!dream) return <Dialog open={false} />;
  const p = planFor(dream, rate);
  const Icon = dreamIcon(dream);
  const chosen = dream.methods.map((id) => METHOD_BY_ID[id]).filter(Boolean);
  const others = METHODS.filter((m) => !dream.methods.includes(m.id));
  const base = { id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline };
  const setMethods = (methods: string[]) => save.mutate({ ...base, methods });
  const toggleStep = (key: string) => save.mutate({ ...base, stepsDone: dream.stepsDone.includes(key) ? dream.stepsDone.filter((k) => k !== key) : [...dream.stepsDone, key] });

  return (
    <Dialog open={!!dream} onOpenChange={(v) => !v && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <div className="border-b border-border px-4 pb-3 pt-4 sm:px-6">
          <div className="flex items-center gap-3 pr-12">
            <IconTile icon={Icon} size="lg" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-xl font-bold">{dream.title}</DialogTitle>
              <p className="text-sm text-foreground/55">
                {brl(dream.target)} até {monthLabel(dream.deadline)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <div role="tablist" aria-label="Seções do sonho" className="flex min-w-0 flex-1 gap-1 rounded-xl border border-border bg-card p-1">
              {SHEET_TABS.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn('inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-1 text-sm font-semibold', tab === id ? 'bg-primary text-white' : 'text-foreground/65 hover:text-foreground')}
                >
                  <TabIcon className="hidden size-4 shrink-0 sm:block" aria-hidden /> <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Editar sonho" title="Editar" onClick={() => onEdit(dream)}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:text-primary"
              aria-label="Excluir sonho"
              title="Excluir"
              onClick={async () => {
                if (await askConfirm({ title: `Excluir "${dream.title}"?`, message: 'O sonho e o histórico de depósitos serão apagados.', confirmLabel: 'Excluir', danger: true })) {
                  remove.mutate(dream.id);
                  onClose();
                }
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        <div role="tabpanel" className="flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6">
          {tab === 'resumo' && (
            <div className="space-y-5">
              <section aria-label="Progresso" className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">Guardado</p>
                    <p className="text-3xl font-bold tabular-nums">{brl(p.saved)}</p>
                  </div>
                  <StatusChip status={p.status} />
                </div>
                <Progress value={p.pct} className="mt-3 h-2.5" label={`${Math.round(p.pct)}% guardado`} />
                <div className="mt-1.5 flex justify-between text-xs tabular-nums text-foreground/55">
                  <span>{Math.round(p.pct)}%</span>
                  <span>faltam {brl(p.remaining)}</span>
                </div>
                {p.status !== 'realizado' && p.status !== 'vencido' && <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-foreground/55">Para chegar no prazo, guarde</p>}
                {p.status !== 'realizado' && p.status !== 'vencido' && (
                  <div className="mt-1.5 grid grid-cols-3 divide-x divide-border rounded-lg bg-muted/50 text-center">
                    {(
                      [
                        ['por mês', p.perMonth],
                        ['por semana', p.perWeek],
                        ['por dia', p.perDay],
                      ] as const
                    ).map(([l, v]) => (
                      <div key={l} className="px-2 py-2">
                        <p className="font-bold tabular-nums">{brl(v, v < 100)}</p>
                        <p className="text-xs text-foreground/55">{l}</p>
                      </div>
                    ))}
                  </div>
                )}
                {p.status === 'vencido' && <p className="mt-3 text-sm text-foreground/70">O prazo passou. Edite o sonho ou use o simulador para escolher um novo prazo.</p>}
              </section>

              {p.status !== 'realizado' && (
                <section aria-labelledby="dr-save" className="space-y-2">
                  <h3 id="dr-save" className="font-bold">
                    Registrar dinheiro
                  </h3>
                  <DepositForm dream={dream} suggested={p.perMonth} />
                </section>
              )}

              {dream.why && <blockquote className="rounded-xl border-l-4 border-primary bg-muted/50 px-4 py-3 text-sm italic text-foreground/80">“{dream.why}”</blockquote>}

              <section aria-labelledby="dr-hist" className="space-y-2">
                <h3 id="dr-hist" className="font-bold">
                  Histórico
                </h3>
                {dream.deposits.length === 0 ? (
                  <p className="text-sm text-foreground/55">Nenhum depósito ainda. O primeiro é o mais importante.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                    {[...dream.deposits].reverse().map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <span className="w-16 shrink-0 tabular-nums text-foreground/55">{d.date ? format(parseISO(d.date), 'dd/MM/yy') : ''}</span>
                        <span className="min-w-0 flex-1 truncate text-foreground/75">{d.note ?? (d.amount < 0 ? 'Retirada' : 'Depósito')}</span>
                        <span className={cn('shrink-0 font-semibold tabular-nums', d.amount < 0 && 'text-primary dark:text-neon')}>
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
          )}

          {tab === 'simulador' &&
            (p.status === 'realizado' ? (
              <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
                <Trophy className="size-8 text-primary dark:text-neon" aria-hidden />
                <p className="font-semibold">Meta alcançada</p>
                <p className="text-sm text-foreground/60">Você juntou todo o valor deste sonho.</p>
              </div>
            ) : (
              <PlanBuilder dream={dream} budget={budget} rate={rate} />
            ))}

          {tab === 'passos' && (
            <div className="space-y-4">
              <p className="text-sm text-foreground/60">Os caminhos que você escolheu, passo a passo. Marque o que já fez; qualquer passo pode virar afazer.</p>
              {chosen.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-foreground/55">Nenhum caminho ainda. Escolha abaixo ou toque em “Usar este plano” no simulador.</p>}
              <ul className="space-y-3">
                {chosen.map((m) => {
                  const doneCount = m.steps.filter((_, i) => dream.stepsDone.includes(`${m.id}:${i}`)).length;
                  return (
                    <li key={m.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <IconTile icon={m.icon} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-tight">{m.title}</p>
                          <p className="text-xs text-foreground/55">
                            {doneCount} de {m.steps.length} passos · {m.potential}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label={`Tirar ${m.title} do plano`} title="Tirar do plano" onClick={() => setMethods(dream.methods.filter((x) => x !== m.id))}>
                          <X />
                        </Button>
                      </div>
                      <Progress value={(doneCount / m.steps.length) * 100} className="mb-3 h-1.5" label={`${doneCount} de ${m.steps.length} passos`} />
                      <MethodSteps method={m} done={(i) => dream.stepsDone.includes(`${m.id}:${i}`)} onToggle={(i) => toggleStep(`${m.id}:${i}`)} onTask={(s) => toTask(s, `Passo de “${m.title}” para o sonho ${dream.title}.`)} />
                    </li>
                  );
                })}
              </ul>
              {others.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/55">Adicionar caminho</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {others.map((m) => {
                      const MIcon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethods([...dream.methods, m.id])}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground/75 transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          <MIcon className="size-4 shrink-0 text-foreground/45" aria-hidden />
                          <span className="min-w-0 flex-1 truncate">{m.title}</span>
                          <Plus className="size-3.5 shrink-0 text-foreground/40" aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Dialog>
  );
}

/* ----------------------------------- Caminhos ----------------------------------- */

function MethodsSection({ dreams }: { dreams: Dream[] }) {
  const [group, setGroup] = useState<MethodGroup>('ganhar');
  const [open, setOpen] = useState<string | null>(null);
  const save = useSaveDream();
  const toTask = useStepToTask();
  const g = METHOD_GROUPS.find((x) => x.id === group)!;
  const active = dreams.filter((d) => planFor(d).status !== 'realizado');
  return (
    <section aria-labelledby="fin-methods" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="fin-methods" className="text-lg font-bold">
            Caminhos para juntar dinheiro
          </h2>
          <p className="text-sm text-foreground/60">{g.intro}</p>
        </div>
        <div role="tablist" aria-label="Tipo de caminho" className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {METHOD_GROUPS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={group === x.id}
              onClick={() => setGroup(x.id)}
              className={cn('h-8 whitespace-nowrap rounded-lg px-3 text-sm font-semibold', group === x.id ? 'bg-primary text-white' : 'text-foreground/65 hover:text-foreground')}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {METHODS.filter((m) => m.group === group).map((m) => {
          const isOpen = open === m.id;
          return (
            <li key={m.id} className="rounded-xl border border-border bg-card">
              <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen} className="flex w-full items-start gap-3 p-4 text-left">
                <IconTile icon={m.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="mt-0.5 block text-sm text-foreground/60">{m.summary}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-foreground/65">
                    <span className="rounded-full bg-muted px-2 py-0.5">{m.potential}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{m.time}</span>
                  </span>
                </span>
                <ChevronDown className={cn('mt-1 size-4 shrink-0 text-foreground/40 transition-transform', isOpen && 'rotate-180')} aria-hidden />
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <MethodSteps method={m} done={() => false} onTask={(s) => toTask(s, `Passo de “${m.title}”.`)} />
                  {active.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground/55">Usar no sonho:</span>
                      {active.map((d) => {
                        const has = d.methods.includes(m.id);
                        const DIcon = dreamIcon(d);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            disabled={has}
                            onClick={() => save.mutate({ id: d.id, title: d.title, target: d.target, deadline: d.deadline, methods: [...d.methods, m.id] }, { onSuccess: () => toast.success('Caminho adicionado', { description: d.title }) })}
                            className={cn(
                              'inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium',
                              has ? 'border-primary/30 bg-primary/10 text-primary dark:text-neon' : 'border-border text-foreground/70 hover:border-primary/50 hover:text-foreground',
                            )}
                          >
                            {has ? <CircleCheck className="size-3.5" aria-hidden /> : <DIcon className="size-3.5" aria-hidden />}
                            {d.title}
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
  const [startTab, setStartTab] = useState<SheetTab>('resumo');
  const opened = dreams.find((d) => d.id === openId) ?? null;
  const open = (id: string, t: SheetTab = 'resumo') => {
    setStartTab(t);
    setOpenId(id);
  };

  const { totals, active, achieved } = useMemo(() => {
    const withPlan = dreams.map((d) => ({ d, p: planFor(d, rate) }));
    return {
      totals: {
        saved: withPlan.reduce((s, x) => s + x.p.saved, 0),
        remaining: withPlan.reduce((s, x) => s + x.p.remaining, 0),
        perMonth: withPlan.reduce((s, x) => s + (x.p.status === 'realizado' || x.p.status === 'vencido' ? 0 : x.p.perMonth), 0),
        done: withPlan.filter((x) => x.p.status === 'realizado').length,
      },
      active: withPlan.filter((x) => x.p.status !== 'realizado').map((x) => x.d),
      achieved: withPlan.filter((x) => x.p.status === 'realizado').map((x) => x.d),
    };
  }, [dreams, rate]);

  const newDream = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-4">
        <RutteLogo className="w-12 shrink-0 sm:w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Target className="size-7 text-primary" aria-hidden /> Sonhos e metas
          </h1>
          <p className="mt-1 max-w-2xl text-foreground/60">
            “Me conte o que você quer conquistar, quanto custa e até quando. Eu mostro quanto guardar e o caminho para chegar lá.” — <strong className="text-foreground">Rutte</strong>
          </p>
        </div>
        <Button onClick={newDream}>
          <Plus /> Novo sonho
        </Button>
      </header>

      {dreams.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={PiggyBank} label="Guardado" value={brl(totals.saved)} />
          <StatTile icon={Target} label="Falta juntar" value={brl(totals.remaining)} />
          <StatTile icon={CalendarDays} label="Guardar por mês" value={brl(totals.perMonth)} />
          <StatTile icon={Trophy} label="Realizados" value={`${totals.done} de ${dreams.length}`} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="fin-dreams" className="min-w-0 space-y-3">
          <h2 id="fin-dreams" className="text-lg font-bold">
            Meus sonhos
          </h2>
          {dreams.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
              <IconTile icon={Target} size="lg" />
              <p className="mt-1 font-semibold">Qual é o seu próximo sonho?</p>
              <p className="max-w-md text-sm text-foreground/60">Uma viagem, o carro, a casa, o seu negócio. Diga quanto custa e até quando, e eu mostro quanto guardar por mês e como chegar lá.</p>
              <Button className="mt-2" onClick={newDream}>
                <Plus /> Criar meu primeiro sonho
              </Button>
            </div>
          ) : (
            <ul className="grid gap-3 xl:grid-cols-2">
              {active.map((d) => (
                <DreamCard key={d.id} dream={d} rate={rate} onOpen={(t) => open(d.id, t)} />
              ))}
            </ul>
          )}
          {achieved.length > 0 && (
            <>
              <h3 className="flex items-center gap-2 pt-2 font-semibold text-foreground/70">
                <Trophy className="size-4" aria-hidden /> Realizados
              </h3>
              <ul className="grid gap-3 xl:grid-cols-2">
                {achieved.map((d) => (
                  <DreamCard key={d.id} dream={d} rate={rate} onOpen={(t) => open(d.id, t)} />
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <BudgetCard needed={totals.perMonth} />
        </aside>
      </div>

      <MethodsSection dreams={dreams} />

      <p className="flex items-start gap-1.5 text-xs text-foreground/50">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Conteúdo educativo para organizar seus objetivos. Os valores são estimativas e não são recomendação de investimento.
      </p>

      <DreamForm open={formOpen} onOpenChange={setFormOpen} dream={editing} rate={rate} onCreated={(id) => open(id, 'simulador')} />
      <DreamSheet
        dream={opened}
        rate={rate}
        startTab={startTab}
        onClose={() => setOpenId(null)}
        onEdit={(d) => {
          setEditing(d);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
