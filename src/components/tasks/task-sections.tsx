import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CirclePlus,
  Download,
  ExternalLink,
  FileText,
  History,
  Link2,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useFieldArray, useWatch, type Control, type UseFormRegister, type UseFormSetValue, type FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox, Input, Progress } from '@/components/ui/form-controls';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { useCreateContact, useLookups } from '@/hooks/use-data';
import { cn, formatBytes, initials, uid } from '@/lib/utils';
import type { HistoryType, TaskHistoryEntry } from '@/types';
import type { TaskFormValues } from './task-schema';

type Ctl = { control: Control<TaskFormValues>; register: UseFormRegister<TaskFormValues>; errors: FieldErrors<TaskFormValues> };

export function Section({ title, icon: Icon, action, children }: { title: string; icon: LucideIcon; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-border pt-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------- Subtarefas ---------------------------------- */

export function SubtasksSection({ control, register, errors }: Ctl) {
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'subtasks' });
  const values = useWatch({ control, name: 'subtasks' });
  const [draft, setDraft] = useState('');
  const done = values.filter((s) => s.isCompleted).length;
  const pct = values.length ? (done / values.length) * 100 : 0;

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    append({ id: uid('st'), title, isCompleted: false });
    setDraft('');
  };

  return (
    <Section title="Subtarefas" icon={CircleCheck} action={<span className="text-xs font-semibold text-foreground/60">{done}/{values.length}</span>}>
      {values.length > 0 && <Progress value={pct} label={`${done} de ${values.length} subtarefas concluídas`} />}
      <ul className="space-y-1.5">
        {fields.map((field, i) => (
          <li key={field.id} className="group flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5">
            <Checkbox
              checked={values[i]?.isCompleted ?? false}
              onCheckedChange={(v) => update(i, { ...values[i], isCompleted: v === true })}
              aria-label={`Concluir subtarefa ${values[i]?.title ?? ''}`}
            />
            <input
              {...register(`subtasks.${i}.title` as const)}
              aria-label={`Título da subtarefa ${i + 1}`}
              className={cn(
                'h-8 min-w-0 flex-1 rounded-lg bg-transparent px-1 text-sm focus:bg-muted focus:outline-none',
                values[i]?.isCompleted && 'text-foreground/50 line-through',
                errors.subtasks?.[i]?.title && 'ring-1 ring-primary',
              )}
            />
            <div className="flex shrink-0 items-center">
              <Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Mover para cima">
                <ChevronUp />
              </Button>
              <Button variant="ghost" size="icon-sm" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label="Mover para baixo">
                <ChevronDown />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remover subtarefa" className="hover:text-primary">
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Adicionar subtarefa e pressionar Enter"
          aria-label="Nova subtarefa"
        />
        <Button variant="outline" size="icon" onClick={add} aria-label="Adicionar subtarefa">
          <Plus />
        </Button>
      </div>
    </Section>
  );
}

/* ---------------------------------- Pessoas ---------------------------------- */

export function ContactsSection({ control, setValue }: { control: Control<TaskFormValues>; setValue: UseFormSetValue<TaskFormValues> }) {
  const ids = useWatch({ control, name: 'contactIds' });
  const { contacts, contactById } = useLookups();
  const createContact = useCreateContact();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const available = contacts.filter((c) => !ids.includes(c.id));

  const set = (next: string[]) => setValue('contactIds', next, { shouldDirty: true });

  const saveNew = async () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Informe nome e um e-mail válido');
      return;
    }
    const c = await createContact.mutateAsync({ name: name.trim(), email: email.trim() });
    set([...ids, c.id]);
    setName('');
    setEmail('');
    setAdding(false);
  };

  return (
    <Section
      title="Pessoas vinculadas"
      icon={UserPlus}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus /> Vincular
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {available.length > 0 && <DropdownMenuLabel>Contatos</DropdownMenuLabel>}
            {available.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => set([...ids, c.id])}>
                <span className="grid size-6 place-items-center rounded-full bg-navy text-[10px] font-bold text-white">{initials(c.name)}</span>
                <span className="flex flex-col">
                  <span>{c.name}</span>
                  <span className="text-xs text-foreground/50">{c.email}</span>
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => setAdding(true)}>
              <CirclePlus /> Novo contato
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {ids.length === 0 && !adding && <p className="text-sm text-foreground/50">Nenhuma pessoa vinculada.</p>}
      <ul className="flex flex-wrap gap-2">
        {ids.map((id) => {
          const c = contactById.get(id);
          if (!c) return null;
          return (
            <li key={id} className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2">
              <span className="grid size-7 place-items-center rounded-full bg-navy text-[11px] font-bold text-white dark:bg-primary" aria-hidden>
                {initials(c.name)}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{c.name}</span>
                <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-primary">
                  <Mail className="size-3" aria-hidden />
                  {c.email}
                </a>
              </span>
              <button
                type="button"
                onClick={() => set(ids.filter((x) => x !== id))}
                className="ml-1 grid size-6 place-items-center rounded-full text-foreground/50 hover:bg-muted hover:text-primary"
                aria-label={`Desvincular ${c.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      {adding && (
        <div className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" aria-label="Nome do contato" autoFocus />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" aria-label="E-mail do contato" />
          <div className="flex gap-2">
            <Button onClick={saveNew} disabled={createContact.isPending}>Salvar</Button>
            <Button variant="ghost" size="icon" onClick={() => setAdding(false)} aria-label="Cancelar">
              <X />
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------- Anexos e links ------------------------------- */

const MAX_FILE = 1024 * 1024; // 1 MB por arquivo (limite do localStorage)

export function LinksAndFilesSection({ control, register, errors }: Ctl) {
  const links = useFieldArray({ control, name: 'links' });
  const files = useFieldArray({ control, name: 'attachments' });
  const linkValues = useWatch({ control, name: 'links' });
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const addLink = () => {
    let u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    try {
      new URL(u);
    } catch {
      toast.error('URL inválida');
      return;
    }
    links.append({ id: uid('lk'), title: title.trim() || u, url: u });
    setTitle('');
    setUrl('');
  };

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      if (file.size > MAX_FILE) {
        toast.error(`"${file.name}" excede 1 MB`, { description: 'Para arquivos grandes, adicione um link.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        files.append({ id: uid('att'), name: file.name, size: file.size, type: file.type, dataUrl: String(reader.result) });
      reader.readAsDataURL(file);
    });
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <Section
      title="Anexos e links"
      icon={Link2}
      action={
        <>
          <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <Button variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload /> Arquivo
          </Button>
        </>
      }
    >
      <ul className="space-y-1.5">
        {links.fields.map((f, i) => (
          <li key={f.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Link2 className="size-4 shrink-0 text-foreground/50" aria-hidden />
            {editing === i ? (
              <div className="grid flex-1 gap-1.5 sm:grid-cols-2">
                <Input {...register(`links.${i}.title` as const)} placeholder="Título" className="h-8" aria-label="Título do link" />
                <Input {...register(`links.${i}.url` as const)} placeholder="https://" className={cn('h-8', errors.links?.[i]?.url && 'border-primary')} aria-label="URL do link" />
              </div>
            ) : (
              <a href={linkValues[i]?.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline">
                {linkValues[i]?.title || linkValues[i]?.url}
                <span className="block truncate text-xs font-normal text-foreground/50">{linkValues[i]?.url}</span>
              </a>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(editing === i ? null : i)} aria-label={editing === i ? 'Concluir edição' : 'Editar link'}>
              {editing === i ? <CircleCheck /> : <Pencil />}
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={linkValues[i]?.url} target="_blank" rel="noreferrer" aria-label="Abrir link em nova aba">
                <ExternalLink />
              </a>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => links.remove(i)} aria-label="Remover link" className="hover:text-primary">
              <Trash2 />
            </Button>
          </li>
        ))}
        {files.fields.map((f, i) => (
          <li key={f.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <FileText className="size-4 shrink-0 text-foreground/50" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {f.name}
              <span className="block text-xs font-normal text-foreground/50">{formatBytes(f.size)}</span>
            </span>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={f.dataUrl} download={f.name} aria-label={`Baixar ${f.name}`}>
                <Download />
              </a>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => files.remove(i)} aria-label="Remover anexo" className="hover:text-primary">
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" aria-label="Título do novo link" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
          placeholder="https://…"
          aria-label="URL do novo link"
        />
        <Button variant="outline" onClick={addLink}>
          <Plus /> Link
        </Button>
      </div>
    </Section>
  );
}

/* --------------------------------- Histórico --------------------------------- */

const HISTORY_ICON: Record<HistoryType, LucideIcon> = {
  CREATED: CirclePlus,
  UPDATED: Pencil,
  STATUS_CHANGED: RotateCcw,
  COMPLETED: CircleCheck,
  REOPENED: RotateCcw,
};

export function HistorySection({ history }: { history: TaskHistoryEntry[] }) {
  const items = [...history].reverse();
  return (
    <Section title="Histórico de alterações" icon={History}>
      <ol className="relative space-y-3 border-l border-border pl-5">
        {items.map((h) => {
          const Icon = HISTORY_ICON[h.type];
          return (
            <li key={h.id} className="relative">
              <span
                className={cn(
                  'absolute -left-[31px] grid size-5 place-items-center rounded-full border-2 border-background',
                  h.type === 'COMPLETED' ? 'bg-emerald-500 text-white' : h.type === 'CREATED' ? 'bg-primary text-white' : 'bg-muted text-foreground/70',
                )}
                aria-hidden
              >
                <Icon className="size-3" />
              </span>
              <p className="text-sm">{h.message}</p>
              <time dateTime={h.at} className="text-xs text-foreground/50">
                {format(parseISO(h.at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </time>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
