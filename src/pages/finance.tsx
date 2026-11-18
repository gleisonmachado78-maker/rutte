import { addMonths, format, parseISO } from 'date-fns';
import { BellRing, CalendarClock, CalendarDays, ChevronDown, Circle, CircleAlert, CircleCheck, Info, ListPlus, Minus, Pencil, PiggyBank, Plus, Target, Trash2, Trophy, Wallet, X, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RutteLogo } from '@/components/brand/rutte';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Progress, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/sheet';
import { useCreateTask, useDeleteDream, useDreamDeposit, useDreams, useFinance, useRemoveDreamDeposit, useSaveDream, useSaveFinance } from '@/hooks/use-data';
import {
  brl,
  DREAM_ICONS,
  DREAM_IDEAS,
  dreamIcon,
  dreamIconId,
  freeShare,
  METHOD_BY_ID,
  moneyInput,
  monthLabel,
  parseMoney,
  planFor,
  STATUS_INFO,
  WAY_BY_ID,
  wayPlan,
  WAYS,
  waysOf,
} from '@/lib/finance';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Dream, DreamWay } from '@/types';

/* ----------------------------------- Peças ----------------------------------- */

function IconTile({ icon: Icon, size = 'md' }: { icon: LucideIcon; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center bg-primary/10 text-primary dark:text-neon', size === 'sm' ? 'size-9 rounded-lg' : size === 'md' ? 'size-10 rounded-xl' : 'size-12 rounded-xl')}
      aria-hidden
    >
      <Icon className={size === 'lg' ? 'size-6' : size === 'md' ? 'size-5' : 'size-4'} />
    </span>
  );
}

function MoneyInput({ id, value, onChange, placeholder, className, ariaLabel }: { id?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string; ariaLabel?: string }) {
  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/50">R$</span>
      <Input id={id} inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={ariaLabel} className="pl-9 tabular-nums" />
    </div>
  );
}

function MoneyField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <MoneyInput id={id} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

/* ----------------------------------- Seu mês ----------------------------------- */

function MonthCard({ needed }: { needed: number }) {
  const { data: budget } = useFinance();
  const save = useSaveFinance();
  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');

  useEffect(() => {
    setIncome(moneyInput(budget?.income));
    setExpenses(moneyInput(budget?.expenses));
  }, [budget?.updatedAt]);

  const submit = () => {
    const i = parseMoney(income);
    const e = parseMoney(expenses);
    if (!(i > 0)) return toast.error('Informe quanto entra por mês');
    save.mutate({ income: i, expenses: Number.isFinite(e) ? e : 0, rate: 0 });
    setEditing(false);
    toast.success('Seu mês foi salvo');
  };

  if (!budget || editing)
    return (
      <section aria-labelledby="fin-month" className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 id="fin-month" className="flex items-center gap-2 font-bold">
          <Wallet className="size-5 text-primary dark:text-neon" aria-hidden /> {budget ? 'Seu mês' : 'Primeiro passo: o seu mês'}
        </h2>
        <p className="mt-1 text-sm text-foreground/60">Quanto entra e quanto sai por mês. Assim eu sei quanto sobra para os seus sonhos.</p>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <MoneyField id="fin-income" label="Entra por mês" value={income} onChange={setIncome} placeholder="4.000" />
          <MoneyField id="fin-expenses" label="Sai por mês" value={expenses} onChange={setExpenses} placeholder="3.200" />
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            {budget && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </section>
    );

  const free = budget.income - budget.expenses;
  const fits = needed <= free;
  return (
    <section aria-labelledby="fin-month" className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="fin-month" className="flex items-center gap-2 font-bold">
          <Wallet className="size-5 text-primary dark:text-neon" aria-hidden /> Seu mês
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil /> Editar
        </Button>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {(
          [
            ['Entra', budget.income],
            ['Sai', budget.expenses],
            ['Sobra', free],
          ] as const
        ).map(([l, v]) => (
          <div key={l} className={cn('rounded-lg px-2 py-2', l === 'Sobra' ? 'bg-primary/10' : 'bg-muted/60')}>
            <dt className="text-xs text-foreground/60">{l}</dt>
            <dd className={cn('font-bold tabular-nums', l === 'Sobra' && 'text-primary dark:text-neon')}>{brl(v)}</dd>
          </div>
        ))}
      </dl>
      {needed > 0 && (
        <p className="mt-3 flex items-start gap-2 text-sm">
          {fits ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary dark:text-neon" aria-hidden />}
          <span>
            Seus sonhos pedem <strong>{brl(needed)} por mês</strong>. {fits ? 'Cabe na sua sobra.' : `Sua sobra não cobre tudo: faltam ${brl(needed - free)} por mês. Abra um sonho e veja de onde pode vir o resto.`}
          </span>
        </p>
      )}
    </section>
  );
}

/* --------------------------------- Novo/editar sonho --------------------------------- */

type FormState = { title: string; icon: string; target: string; deadline: string; saved: string; why: string };
const blankForm = (): FormState => ({ title: '', icon: 'sonho', target: '', deadline: format(addMonths(new Date(), 12), 'yyyy-MM'), saved: '', why: '' });

function DreamForm({ open, onOpenChange, dream, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; dream?: Dream; onCreated?: (id: string) => void }) {
  const save = useSaveDream();
  const [f, setF] = useState<FormState>(blankForm);
  useEffect(() => {
    if (!open) return;
    setF(dream ? { title: dream.title, icon: dreamIconId(dream), target: moneyInput(dream.target), deadline: dream.deadline.slice(0, 7), saved: '', why: dream.why ?? '' } : blankForm());
  }, [open, dream?.id]);

  const target = parseMoney(f.target);
  const saved = parseMoney(f.saved) || 0;
  const deadline = f.deadline ? `${f.deadline}-28` : '';
  const already = dream ? dream.deposits.reduce((s, x) => s + x.amount, 0) : saved;
  const preview =
    target > 0 && deadline
      ? planFor({ id: '', title: '', emoji: '', target, deadline, deposits: [{ id: '', date: '', amount: already, createdAt: '' }], methods: [], stepsDone: [], createdAt: new Date().toISOString(), updatedAt: '' }, 0)
      : null;

  const submit = () => {
    if (!f.title.trim()) return toast.error('Dê um nome ao sonho');
    if (!(target > 0)) return toast.error('Informe quanto custa');
    if (!f.deadline) return toast.error('Escolha até quando');
    const now = new Date().toISOString();
    const deposits = dream ? dream.deposits : saved > 0 ? [{ id: `dp_${Date.now().toString(36)}`, date: todayISO(), amount: saved, note: 'Já tinha guardado', createdAt: now }] : [];
    save.mutate(
      { ...(dream ? { id: dream.id } : {}), title: f.title.trim(), icon: f.icon, target, deadline, why: f.why.trim() || undefined, deposits },
      {
        onSuccess: (created) => {
          toast.success(dream ? 'Sonho atualizado' : 'Sonho criado', { description: dream ? undefined : 'Agora diga de onde vai sair o dinheiro.' });
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
        <DialogDescription className="mt-1 text-sm text-foreground/60">O que você quer, quanto custa e até quando.</DialogDescription>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {!dream && (
            <div className="flex flex-wrap gap-1.5">
              {DREAM_IDEAS.map((idea) => {
                const Icon = DREAM_ICONS.find((i) => i.id === idea.icon)!.icon;
                const on = f.title === idea.title;
                return (
                  <button
                    key={idea.title}
                    type="button"
                    onClick={() => setF((s) => ({ ...s, title: idea.title, icon: idea.icon, target: moneyInput(idea.target), deadline: format(addMonths(new Date(), idea.months), 'yyyy-MM') }))}
                    className={cn('inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors', on ? 'border-primary bg-primary text-white' : 'border-border text-foreground/70 hover:border-primary/50 hover:text-foreground')}
                  >
                    <Icon className="size-3.5" aria-hidden /> {idea.title}
                  </button>
                );
              })}
            </div>
          )}
          <div>
            <Label htmlFor="dr-title">O que você quer</Label>
            <Input id="dr-title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Ex.: Viagem para a Europa" maxLength={80} />
            <div className="mt-2 grid grid-cols-9 gap-1">
              {DREAM_ICONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setF((s) => ({ ...s, icon: id }))}
                  className={cn('grid aspect-square place-items-center rounded-lg transition-colors', f.icon === id ? 'bg-primary text-white' : 'text-foreground/55 hover:bg-muted hover:text-foreground')}
                  aria-label={`Ícone: ${label}`}
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
          {!dream && <MoneyField id="dr-saved" label="Já tenho guardado (se tiver)" value={f.saved} onChange={(v) => setF((s) => ({ ...s, saved: v }))} placeholder="0" />}
          <div>
            <Label htmlFor="dr-why">Por que é importante (opcional)</Label>
            <Textarea id="dr-why" value={f.why} onChange={(e) => setF((s) => ({ ...s, why: e.target.value }))} placeholder="Ex.: Levar meus pais para conhecer o mar" className="min-h-[60px]" maxLength={300} />
          </div>
          {preview && preview.perMonth > 0 && (
            <p className="flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-sm">
              <PiggyBank className="size-5 shrink-0 text-primary dark:text-neon" aria-hidden />
              <span>
                Você vai precisar guardar <strong className="tabular-nums">{brl(preview.perMonth)} por mês</strong>.
              </span>
            </p>
          )}
          <div className="flex justify-end gap-2">
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

function DepositForm({ dream, suggested, onDone }: { dream: Dream; suggested: number; onDone: () => void }) {
  const deposit = useDreamDeposit();
  const [value, setValue] = useState(suggested > 0 ? moneyInput(Math.ceil(suggested)) : '');
  const send = (sign: 1 | -1) => {
    const n = parseMoney(value);
    if (!(n > 0)) return toast.error('Informe um valor');
    deposit.mutate({ dreamId: dream.id, amount: sign * n, date: todayISO() }, { onSuccess: onDone });
  };
  return (
    <form
      className="mt-3 flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        send(1);
      }}
    >
      <MoneyInput value={value} onChange={setValue} ariaLabel="Valor" className="w-36" />
      <Button type="submit" disabled={deposit.isPending}>
        <Plus /> Guardar
      </Button>
      <Button type="button" variant="outline" disabled={deposit.isPending} onClick={() => send(-1)}>
        <Minus /> Tirei
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onDone} aria-label="Cancelar">
        <X />
      </Button>
    </form>
  );
}

/* --------------------------------- Cartão do sonho --------------------------------- */

function DreamCard({ dream, onOpen }: { dream: Dream; onOpen: () => void }) {
  const p = planFor(dream, 0);
  const Icon = dreamIcon(dream);
  const st = STATUS_INFO[p.status];
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex h-full w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
        <span className="flex w-full items-center gap-3">
          <IconTile icon={Icon} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{dream.title}</span>
            <span className="text-xs text-foreground/55">até {monthLabel(dream.deadline)}</span>
          </span>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', st.tone)}>{st.label}</span>
        </span>
        <span className="block w-full">
          <span className="mb-1.5 flex items-baseline justify-between gap-2 tabular-nums">
            <span className="text-lg font-bold">{brl(p.saved)}</span>
            <span className="text-sm text-foreground/55">de {brl(dream.target)}</span>
          </span>
          <Progress value={p.pct} label={`${Math.round(p.pct)}% de ${dream.title}`} />
        </span>
        <span className="text-sm text-foreground/70">
          {p.status === 'realizado' ? (
            'Você juntou tudo!'
          ) : p.status === 'vencido' ? (
            'O prazo passou. Toque para ajustar.'
          ) : (
            <>
              Guarde <strong className="text-foreground">{brl(p.perMonth)} por mês</strong>
            </>
          )}
        </span>
      </button>
    </li>
  );
}

/* ------------------------------- Painel do sonho ------------------------------- */

function WayRow({ way, onChange, onRemove, dream }: { way: DreamWay; onChange: (v: number) => void; onRemove: () => void; dream: Dream }) {
  const def = WAY_BY_ID[way.id];
  const method = METHOD_BY_ID[def?.methodId ?? ''];
  const [text, setText] = useState(moneyInput(way.value));
  const [open, setOpen] = useState(false);
  const save = useSaveDream();
  const createTask = useCreateTask();
  if (!def) return null;
  const toggleStep = (key: string) =>
    save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline, stepsDone: dream.stepsDone.includes(key) ? dream.stepsDone.filter((k) => k !== key) : [...dream.stepsDone, key] });
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <IconTile icon={def.icon} size="sm" />
        <div className="min-w-0 flex-1 basis-40">
          <p className="text-sm font-medium leading-tight">{def.label}</p>
          <p className="text-xs text-foreground/50">{def.hint}</p>
        </div>
        <div className="ml-12 flex items-center gap-1.5 sm:ml-0">
          <MoneyInput
            value={text}
            onChange={(v) => {
              setText(v);
              const n = parseMoney(v);
              onChange(Number.isFinite(n) ? n : 0);
            }}
            ariaLabel={`${def.label}: valor`}
            className="w-28"
          />
          <span className="w-12 text-xs leading-tight text-foreground/50">{def.kind === 'mensal' ? 'por mês' : 'uma vez'}</span>
          <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Tirar ${def.label}`} title="Tirar">
            <X />
          </Button>
        </div>
      </div>
      {method && (
        <div className="ml-12 mt-1">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline dark:text-neon">
            Como fazer <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
          </button>
          {open && (
            <ol className="mt-2 space-y-1.5">
              {method.steps.map((s, i) => {
                const key = `${method.id}:${i}`;
                const done = dream.stepsDone.includes(key);
                return (
                  <li key={key} className="group/step flex items-start gap-2 text-sm">
                    <button type="button" onClick={() => toggleStep(key)} className="mt-0.5 shrink-0 text-foreground/40 hover:text-primary" aria-label={done ? `Desmarcar: ${s}` : `Marcar como feito: ${s}`}>
                      {done ? <CircleCheck className="size-4 text-primary dark:text-neon" /> : <Circle className="size-4" />}
                    </button>
                    <span className={cn('min-w-0 flex-1', done && 'text-foreground/40 line-through')}>{s}</span>
                    <button
                      type="button"
                      onClick={() =>
                        createTask.mutate({ title: s, whatToDo: `Passo para o sonho ${dream.title}.`, status: 'NOT_STARTED', priority: 'MEDIUM', dueDate: todayISO(), scope: 'PERSONAL', lifeAreaId: 'financas', subtasks: [], links: [] })
                      }
                      className="shrink-0 rounded-md p-0.5 text-foreground/35 hover:bg-muted hover:text-primary sm:opacity-0 sm:focus:opacity-100 sm:group-hover/step:opacity-100"
                      aria-label={`Virar afazer: ${s}`}
                      title="Virar afazer"
                    >
                      <ListPlus className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </li>
  );
}

function DreamSheet({ dream, onClose, onEdit }: { dream: Dream | null; onClose: () => void; onEdit: (d: Dream) => void }) {
  const save = useSaveDream();
  const remove = useDeleteDream();
  const removeDep = useRemoveDreamDeposit();
  const createTask = useCreateTask();
  const { data: dreams = [] } = useDreams();
  const { data: budget } = useFinance();
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [ways, setWays] = useState<DreamWay[]>([]);
  const dirty = useRef(false);

  useEffect(() => {
    dirty.current = false;
    setSaving(false);
    setAdding(false);
    setWays(dream ? waysOf(dream) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dream?.id]);

  // salva as formas de juntar (só os campos do plano: não sobrescreve depósitos)
  useEffect(() => {
    if (!dream || !dirty.current) return;
    const h = setTimeout(() => save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline, ways }), 600);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ways]);

  if (!dream) return <Dialog open={false} />;
  const p = planFor(dream, 0);
  const wp = wayPlan(dream, ways);
  const Icon = dreamIcon(dream);
  const done = p.status === 'realizado';
  const missing = WAYS.filter((d) => !ways.find((w) => w.id === d.id));
  const editWays = (fn: (w: DreamWay[]) => DreamWay[]) => {
    dirty.current = true;
    setWays(fn);
  };
  const free = budget?.income ? Math.max(0, budget.income - budget.expenses) : 0;
  const suggestFor = (id: string) => {
    const def = WAY_BY_ID[id];
    if (id === 'sobra' && free) return Math.floor(freeShare(dream, dreams, free) / 10) * 10 || def.suggest;
    // forma mensal: sugere o que ainda falta por mês
    if (def.kind === 'mensal' && wp.gapMonthly > 0) return Math.min(Math.ceil(wp.gapMonthly / 10) * 10, def.suggest * 3);
    return def.suggest;
  };
  const moveDeadline = () => {
    if (!wp.reachDate) return;
    const d = wp.reachDate;
    save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: d, ways }, { onSuccess: () => toast.success('Prazo atualizado', { description: `Até ${monthLabel(d)}` }) });
  };
  const reminder = () =>
    createTask.mutate({
      title: `Guardar ${brl(wp.monthly)} para ${dream.title}`,
      whatToDo: 'Separar o dinheiro e registrar em Sonhos e metas.',
      status: 'NOT_STARTED',
      priority: 'HIGH',
      dueDate: todayISO(),
      recurrenceRule: 'FREQ=MONTHLY',
      scope: 'PERSONAL',
      lifeAreaId: 'financas',
      subtasks: [],
      links: [],
    });

  return (
    <Dialog open={!!dream} onOpenChange={(v) => !v && onClose()}>
      <SheetContent aria-describedby={undefined}>
        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6">
          {/* Cabeçalho */}
          <div className="flex items-center gap-3 pr-12">
            <IconTile icon={Icon} size="lg" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-xl font-bold">{dream.title}</DialogTitle>
              <p className="text-sm text-foreground/55">
                {brl(dream.target)} até {monthLabel(dream.deadline)}
              </p>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(dream)}>
              <Pencil /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-primary"
              onClick={async () => {
                if (await askConfirm({ title: `Excluir "${dream.title}"?`, message: 'O sonho e o histórico serão apagados.', confirmLabel: 'Excluir', danger: true })) {
                  remove.mutate(dream.id);
                  onClose();
                }
              }}
            >
              <Trash2 /> Excluir
            </Button>
          </div>
          {dream.why && <p className="mt-2 border-l-4 border-primary pl-3 text-sm italic text-foreground/70">“{dream.why}”</p>}

          {/* 1. Quanto já tenho */}
          <section aria-labelledby="dr-1" className="mt-5 rounded-xl border border-border bg-card p-4">
            <h3 id="dr-1" className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
              1. Quanto já tenho
            </h3>
            <p className="mt-1 tabular-nums">
              <span className="text-3xl font-bold">{brl(p.saved)}</span> <span className="text-foreground/55">de {brl(dream.target)}</span>
            </p>
            <Progress value={p.pct} className="mt-3 h-2.5" label={`${Math.round(p.pct)}% guardado`} />
            <p className="mt-1.5 text-sm text-foreground/60">{done ? 'Você juntou tudo. Parabéns!' : `Faltam ${brl(p.remaining)}`}</p>
            {!done &&
              (saving ? (
                <DepositForm dream={dream} suggested={wp.monthly || p.perMonth} onDone={() => setSaving(false)} />
              ) : (
                <Button className="mt-3" onClick={() => setSaving(true)}>
                  <PiggyBank /> Guardar dinheiro
                </Button>
              ))}
          </section>

          {/* 2. De onde vai sair o dinheiro */}
          {!done && (
            <section aria-labelledby="dr-2" className="mt-4 rounded-xl border border-border bg-card p-4">
              <h3 id="dr-2" className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
                2. De onde vai sair o dinheiro
              </h3>

              <div aria-live="polite" className={cn('mt-2 flex items-start gap-2 rounded-lg p-3 text-sm', ways.length === 0 ? 'bg-muted/60' : wp.diff !== null && wp.diff >= 0 ? 'bg-emerald-500/10' : 'bg-primary/10')}>
                {ways.length === 0 ? (
                  <>
                    <Info className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden />
                    <span>
                      Para chegar até {monthLabel(dream.deadline)} você precisa juntar <strong>{brl(wp.needMonthly)} por mês</strong>. Escolha abaixo de onde vai sair esse dinheiro.
                    </span>
                  </>
                ) : wp.diff !== null && wp.diff >= 0 ? (
                  <>
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <span>
                      <strong>Dá certo!</strong> Você junta tudo em <strong>{monthLabel(wp.reachDate!)}</strong>
                      {wp.diff > 0 ? `, ${wp.diff} ${wp.diff === 1 ? 'mês' : 'meses'} antes do prazo.` : ', bem no prazo.'}
                    </span>
                  </>
                ) : (
                  <>
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary dark:text-neon" aria-hidden />
                    <span>
                      <strong>Ainda não chega no prazo.</strong> Faltam <strong>{brl(wp.gapMonthly)} por mês</strong>.{wp.reachDate ? ` Do jeito que está, você chega em ${monthLabel(wp.reachDate)}.` : ' Adicione algo que entre todo mês.'}
                    </span>
                  </>
                )}
              </div>

              {ways.length > 0 && (
                <ul className="mt-1 divide-y divide-border">
                  {ways.map((w) => (
                    <WayRow
                      key={w.id}
                      way={w}
                      dream={dream}
                      onChange={(v) => editWays((ws) => ws.map((x) => (x.id === w.id ? { ...x, value: v } : x)))}
                      onRemove={() => editWays((ws) => ws.filter((x) => x.id !== w.id))}
                    />
                  ))}
                </ul>
              )}

              {ways.length > 0 && (
                <p className="flex justify-between border-t border-border pt-3 text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="text-right tabular-nums">
                    <strong>{brl(wp.monthly)} por mês</strong>
                    {wp.once > 0 && <span className="block text-xs text-foreground/55">+ {brl(wp.once)} de uma vez</span>}
                  </span>
                </p>
              )}

              {missing.length > 0 &&
                (adding || ways.length === 0 ? (
                  <div className="mt-3">
                    <p className="mb-2 text-sm font-medium">{ways.length ? 'Adicionar:' : 'De onde vai sair?'}</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {missing.map((d) => {
                        const WIcon = d.icon;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              editWays((ws) => [...ws, { id: d.id, value: suggestFor(d.id) }]);
                              setAdding(false);
                            }}
                            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/50"
                          >
                            <WIcon className="size-4 shrink-0 text-primary dark:text-neon" aria-hidden />
                            <span className="min-w-0 flex-1">{d.label}</span>
                            <Plus className="size-3.5 shrink-0 text-foreground/40" aria-hidden />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setAdding(true)}>
                    <Plus /> Adicionar de onde vem o dinheiro
                  </Button>
                ))}

              {((wp.diff !== null && wp.diff < 0 && wp.reachDate) || wp.monthly > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                  {wp.diff !== null && wp.diff < 0 && wp.reachDate && (
                    <Button size="sm" variant="outline" onClick={moveDeadline}>
                      <CalendarClock /> Mudar prazo para {monthLabel(wp.reachDate)}
                    </Button>
                  )}
                  {wp.monthly > 0 && (
                    <Button size="sm" variant="ghost" onClick={reminder}>
                      <BellRing /> Lembrete todo mês
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 3. Histórico */}
          {dream.deposits.length > 0 && (
            <details className="group mt-4 rounded-xl border border-border bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
                Histórico ({dream.deposits.length})
                <ChevronDown className="size-4 text-foreground/50 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="divide-y divide-border border-t border-border">
                {[...dream.deposits].reverse().map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <span className="w-16 shrink-0 tabular-nums text-foreground/55">{d.date ? format(parseISO(d.date), 'dd/MM/yy') : ''}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground/70">{d.note ?? (d.amount < 0 ? 'Retirada' : 'Guardado')}</span>
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
            </details>
          )}
        </div>
      </SheetContent>
    </Dialog>
  );
}

/* ------------------------------------ Página ------------------------------------ */

export function FinancePage() {
  const { data: dreams = [] } = useDreams();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dream | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = dreams.find((d) => d.id === openId) ?? null;

  const { needed, active, achieved } = useMemo(() => {
    const withPlan = dreams.map((d) => ({ d, p: planFor(d, 0) }));
    return {
      needed: withPlan.reduce((s, x) => s + (x.p.status === 'realizado' || x.p.status === 'vencido' ? 0 : x.p.perMonth), 0),
      active: withPlan.filter((x) => x.p.status !== 'realizado').map((x) => x.d),
      achieved: withPlan.filter((x) => x.p.status === 'realizado').map((x) => x.d),
    };
  }, [dreams]);

  const newDream = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <RutteLogo className="w-12 shrink-0 sm:w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Target className="size-7 text-primary" aria-hidden /> Sonhos e metas
          </h1>
          <p className="mt-1 max-w-2xl text-foreground/60">Diga o que você quer conquistar. Eu mostro quanto guardar por mês e de onde pode sair o dinheiro.</p>
        </div>
        <Button onClick={newDream}>
          <Plus /> Novo sonho
        </Button>
      </header>

      <MonthCard needed={needed} />

      <section aria-labelledby="fin-dreams" className="space-y-3">
        <h2 id="fin-dreams" className="text-lg font-bold">
          Meus sonhos
        </h2>
        {dreams.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
            <IconTile icon={Target} size="lg" />
            <p className="mt-1 font-semibold">Qual é o seu próximo sonho?</p>
            <p className="max-w-md text-sm text-foreground/60">Uma viagem, o carro, a casa, o seu negócio. Diga quanto custa e até quando.</p>
            <Button className="mt-2" onClick={newDream}>
              <Plus /> Criar meu primeiro sonho
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {active.map((d) => (
              <DreamCard key={d.id} dream={d} onOpen={() => setOpenId(d.id)} />
            ))}
          </ul>
        )}
        {achieved.length > 0 && (
          <>
            <h3 className="flex items-center gap-2 pt-2 font-semibold text-foreground/70">
              <Trophy className="size-4" aria-hidden /> Realizados
            </h3>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {achieved.map((d) => (
                <DreamCard key={d.id} dream={d} onOpen={() => setOpenId(d.id)} />
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="flex items-start gap-1.5 text-xs text-foreground/50">
        <CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Contas simples, sem juros: o que você guarda por mês até o prazo. Conteúdo educativo, não é recomendação de investimento.
      </p>

      <DreamForm open={formOpen} onOpenChange={setFormOpen} dream={editing} onCreated={(id) => setOpenId(id)} />
      <DreamSheet
        dream={opened}
        onClose={() => setOpenId(null)}
        onEdit={(d) => {
          setEditing(d);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
