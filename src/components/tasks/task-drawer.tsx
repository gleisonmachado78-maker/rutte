import { askConfirm } from '@/components/ui/confirm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building,
  CalendarPlus,
  CircleCheck,
  ClipboardList,
  UserRound,
  FolderKanban,
  Lightbulb,
  Plus,
  RotateCcw,
  Tag,
  Target,
  Timer,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/form-controls';
import { DialogClose, DialogContent, DialogDescription, DialogTitle, Dialog, SheetContent } from '@/components/ui/sheet';
import {
  useCreateCategory,
  useCreateProject,
  useCreateTask,
  useDeleteTask,
  useLookups,
  useModules,
  useTasks,
  useUpdateTask,
} from '@/hooks/use-data';
import { isOverdue, PRIORITIES, PRIORITY_LABEL, RECURRENCE_OPTIONS, STATUSES, STATUS_LABEL } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI, type TaskDefaults } from '@/store/ui';
import { useFocus } from '@/store/focus';
import { useNavigate } from 'react-router-dom';
import type { Scope, Task } from '@/types';
import { LIFE_AREAS } from '@/lib/life-areas';
import { SendToGoogle } from './send-to-google';
import { OverdueBadge, PriorityBadge, StatusBadge } from './badges';
import { taskSchema, toFormValues, toTaskInput, type TaskFormValues } from './task-schema';
import { LocationField } from './location-field';
import { ContactsSection, HistorySection, LinksAndFilesSection, Section, SubtasksSection } from './task-sections';

const SCOPE_OPTIONS: { value: Scope; label: string; hint: string; icon: typeof Tag }[] = [
  { value: 'PERSONAL', label: 'Pessoal', hint: 'Seu CPF: casa, academia, igreja…', icon: UserRound },
  { value: 'BUSINESS', label: 'Empresa', hint: 'Tarefas dentro da empresa', icon: Building },
];

const PALETTE = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#B91B1C', '#475569'];

/** Drawer global de detalhe/edição. Montado uma vez no layout e controlado pelo store de UI. */
export function TaskDrawer() {
  const drawer = useUI((s) => s.drawer);
  const closeDrawer = useUI((s) => s.closeDrawer);
  const globalScope = useUI((s) => s.scope);
  const { data: tasks = [] } = useTasks();
  const task = drawer.taskId ? tasks.find((t) => t.id === drawer.taskId) : undefined;
  const dirtyRef = useRef(false);

  const onOpenChange = (open: boolean) => {
    if (open) return;
    if (!dirtyRef.current) return closeDrawer();
    void askConfirm({ title: 'Descartar alterações?', message: 'As mudanças que você fez neste afazer não foram salvas.', confirmLabel: 'Descartar', danger: true }).then((ok) => {
      if (ok) {
        dirtyRef.current = false;
        closeDrawer();
      }
    });
  };

  const missing = drawer.taskId && !task;

  return (
    <Dialog open={drawer.open && !missing} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        {drawer.open && (
          <TaskForm
            key={drawer.nonce}
            task={task}
            defaults={{ scope: globalScope === 'ALL' ? undefined : globalScope, ...drawer.defaults }}
            onDirtyChange={(d) => {
              dirtyRef.current = d;
            }}
            onDone={() => {
              dirtyRef.current = false;
              closeDrawer();
            }}
          />
        )}
      </SheetContent>
    </Dialog>
  );
}

function TaskForm({
  task,
  defaults,
  onDirtyChange,
  onDone,
}: {
  task?: Task;
  defaults?: TaskDefaults;
  onDirtyChange: (dirty: boolean) => void;
  onDone: () => void;
}) {
  const isNew = !task;
  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const { categories, projects } = useLookups();
  const modules = useModules();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toFormValues(task, defaults),
  });
  const { register, handleSubmit, control, setValue, formState } = form;
  const { errors, isDirty, isSubmitting } = formState;
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const [status, priority, meetingUrl, title, scope, categoryId, projectId, location] = useWatch({
    control,
    name: ['status', 'priority', 'meetingUrl', 'title', 'scope', 'categoryId', 'projectId', 'location'],
  });
  const scopedCategories = categories.filter((c) => !c.scope || c.scope === scope);
  const scopedProjects = projects.filter((p) => !p.scope || p.scope === scope);

  // Ao trocar Pessoal/Empresa, limpa categoria/projeto que não pertencem ao novo escopo
  useEffect(() => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.scope && cat.scope !== scope) setValue('categoryId', '', { shouldDirty: true });
    const prj = projects.find((p) => p.id === projectId);
    if (prj?.scope && prj.scope !== scope) setValue('projectId', '', { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const submit = handleSubmit(async (values) => {
    const input = toTaskInput(values);
    if (isNew) await create.mutateAsync(input);
    else await update.mutateAsync({ id: task.id, patch: input });
    onDone();
  });

  const completeNow = () => {
    setValue('status', status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED', { shouldDirty: true });
    void submit();
  };

  const meetingValid = /^https?:\/\/\S+\.\S+/.test(meetingUrl ?? '');

  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col" noValidate>
      {/* Cabeçalho */}
      <header className="border-b border-border px-5 pb-4 pt-5 pr-14 sm:px-6">
        <DialogTitle className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          {isNew ? 'Novo afazer' : 'Detalhe do afazer'}
        </DialogTitle>
        <textarea
          {...register('title')}
          rows={1}
          placeholder="O que precisa ser feito?"
          aria-label="Título"
          autoFocus={isNew}
          className="mt-1 w-full resize-none bg-transparent text-xl font-bold leading-tight placeholder:text-foreground/30 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-2xl [field-sizing:content]"
        />
        {errors.title && <p className="text-xs font-medium text-primary">{errors.title.message}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={priority} />
          <StatusBadge status={status} />
          {task && isOverdue(task) && <OverdueBadge />}
        </div>
      </header>

      {/* Corpo com rolagem */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
        {meetingValid && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 btn-neon rounded-xl px-4 py-3 font-semibold text-white transition-all duration-200 hover:brightness-110"
          >
            <Video className="size-5" aria-hidden /> Entrar na Reunião
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          {modules.business && (
          <fieldset className="col-span-2">
            <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60">Contexto</legend>
            <div role="radiogroup" aria-label="Contexto" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/50 p-1">
              {SCOPE_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={scope === value}
                  onClick={() => setValue('scope', value, { shouldDirty: true })}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
                    scope === value
                      ? value === 'BUSINESS'
                        ? 'bg-business text-white shadow-[0_0_16px_rgb(224_69_123_/_.45)]'
                        : 'bg-brand text-white shadow-neon-brand'
                      : 'text-foreground/60 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="flex flex-col items-start leading-tight">
                    {label}
                    <span className="hidden text-[11px] font-normal opacity-70 sm:block">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          )}
          <div>
            <Label htmlFor="f-status">Status</Label>
            <Select id="f-status" {...register('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-priority">Prioridade</Label>
            <Select id="f-priority" {...register('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
              ))}
            </Select>
          </div>
          <QuickCreateSelect
            id="f-category"
            label="Categoria"
            icon={Tag}
            items={scopedCategories}
            scope={scope}
            register={register('categoryId')}
            onCreated={(id) => setValue('categoryId', id, { shouldDirty: true })}
            kind="category"
          />
          <QuickCreateSelect
            id="f-project"
            label="Projeto"
            icon={FolderKanban}
            items={scopedProjects}
            scope={scope}
            register={register('projectId')}
            onCreated={(id) => setValue('projectId', id, { shouldDirty: true })}
            kind="project"
          />
          <div>
            <Label htmlFor="f-due">Prazo</Label>
            <Input id="f-due" type="date" {...register('dueDate')} className={cn(errors.dueDate && 'border-primary')} />
            {errors.dueDate && <p className="mt-1 text-xs text-primary">{errors.dueDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="f-time">Horário limite</Label>
            <Input id="f-time" type="time" {...register('deadlineTime')} />
          </div>
          <div>
            <Label htmlFor="f-start">Início</Label>
            <Input id="f-start" type="date" {...register('startDate')} className={cn(errors.startDate && 'border-primary')} />
            {errors.startDate && <p className="mt-1 text-xs text-primary">{errors.startDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="f-rec">Recorrência</Label>
            <Select id="f-rec" {...register('recurrenceRule')}>
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="f-life">Área da vida</Label>
            <Select id="f-life" {...register('lifeAreaId')}>
              <option value="">Nenhuma</option>
              {LIFE_AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="f-meet">Link da reunião</Label>
            <Input id="f-meet" type="url" placeholder="https://meet.google.com/…" {...register('meetingUrl')} className={cn(errors.meetingUrl && 'border-primary')} />
            {errors.meetingUrl && <p className="mt-1 text-xs text-primary">{errors.meetingUrl.message}</p>}
          </div>
          <div className="col-span-2">
            <Label htmlFor="f-location">Local do compromisso</Label>
            <LocationField value={location} onChange={(l) => setValue('location', l, { shouldDirty: true })} />
          </div>
        </div>

        <Section title="O que fazer" icon={ClipboardList}>
          <Textarea {...register('whatToDo')} placeholder="Descreva o objetivo do afazer…" aria-label="O que fazer" />
        </Section>
        <Section title="Como fazer" icon={Lightbulb}>
          <Textarea {...register('howTo')} placeholder={'Orientações e passos:\n1. …\n2. …'} aria-label="Como fazer" className="min-h-[110px]" />
        </Section>
        <Section title="Resultado esperado" icon={Target}>
          <Textarea {...register('expectedResult')} placeholder="Critérios de aceite: como saber que está pronto?" aria-label="Resultado esperado" />
        </Section>

        <SubtasksSection control={control} register={register} errors={errors} />
        <ContactsSection control={control} setValue={setValue} />
        <LinksAndFilesSection control={control} register={register} errors={errors} />
        {task?.history && task.history.length > 0 && <HistorySection history={task.history} />}
      </div>

      {/* Rodapé fixo */}
      <footer className="flex items-center gap-2 border-t border-border bg-background px-5 py-3 pb-safe sm:px-6">
        {!isNew && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)} aria-label="Excluir afazer" className="text-primary hover:bg-primary/10">
              <Trash2 />
            </Button>
            <Button variant="outline" onClick={completeNow} disabled={isSubmitting}>
              {status === 'COMPLETED' ? <RotateCcw /> : <CircleCheck />}
              <span className="hidden sm:inline">{status === 'COMPLETED' ? 'Reabrir' : 'Concluir'}</span>
            </Button>
            {task && status !== 'COMPLETED' && (
              <Button
                variant="outline"
                onClick={() => {
                  useFocus.getState().setActivity({ label: task.title, taskId: task.id });
                  onDone();
                  navigate('/focus');
                }}
                title="Focar neste afazer com a técnica Pomodoro"
              >
                <Timer />
                <span className="hidden sm:inline">Focar</span>
              </Button>
            )}
            {task && <SendToGoogle task={task} icon={<CalendarPlus />} />}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isDirty && !isNew && <span className="hidden text-xs text-foreground/50 sm:inline">Alterações não salvas</span>}
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isNew ? <><Plus /> Criar afazer</> : 'Salvar'}
          </Button>
        </div>
      </footer>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle className="text-lg font-bold">Excluir afazer?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-foreground/70">
            “{title}” será removido. Você poderá desfazer pelo aviso logo em seguida.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={async () => {
                if (!task) return;
                await remove.mutateAsync(task.id);
                setConfirmDelete(false);
                onDone();
              }}
            >
              <Trash2 /> Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function QuickCreateSelect({
  id,
  label,
  icon: Icon,
  items,
  register,
  onCreated,
  kind,
  scope,
}: {
  id: string;
  label: string;
  icon: typeof Tag;
  items: { id: string; name: string; color: string }[];
  register: UseFormRegisterReturn;
  onCreated: (id: string) => void;
  kind: 'category' | 'project';
  scope: Scope;
}) {
  const createCategory = useCreateCategory();
  const createProject = useCreateProject();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[items.length % PALETTE.length]);

  const save = async () => {
    if (!name.trim()) return;
    const mutation = kind === 'category' ? createCategory : createProject;
    const item = await mutation.mutateAsync({ name: name.trim(), color, scope });
    onCreated(item.id);
    setName('');
    setAdding(false);
  };

  return (
    <div className={cn(adding && 'col-span-2')}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="inline-flex items-center gap-1">
          <Icon className="size-3" aria-hidden /> {label}
        </Label>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="mb-1.5 text-xs font-semibold text-primary hover:underline">
            + Nova
          </button>
        )}
      </div>
      {adding ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-2">
          <Input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void save();
              }
            }}
            placeholder={`Nome ${kind === 'category' ? 'da categoria' : 'do projeto'}`}
            aria-label={`Nome ${kind === 'category' ? 'da nova categoria' : 'do novo projeto'}`}
            className="h-9 min-w-0 flex-1"
          />
          <div className="flex gap-1" role="radiogroup" aria-label="Cor">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Cor ${c}`}
                onClick={() => setColor(c)}
                className={cn('size-6 rounded-full ring-offset-2 ring-offset-background transition-all', color === c && 'ring-2 ring-foreground')}
                style={{ background: c }}
              />
            ))}
          </div>
          <Button size="sm" onClick={save}>Criar</Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setAdding(false)} aria-label="Cancelar">
            <X />
          </Button>
        </div>
      ) : (
        <Select id={id} {...register}>
          <option value="">Sem {label.toLowerCase()}</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </Select>
      )}
    </div>
  );
}
