import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, CalendarPlus, ExternalLink, Link2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useDeleteLink, useLinks, useSaveLink, useTasks } from '@/hooks/use-data';
import { icsEnabled, useLinkFeeds, type LinkEvent } from '@/hooks/use-link-feeds';
import { LIFE_AREAS, LIFE_AREA_BY_ID } from '@/lib/life-areas';
import { isClosed, todayISO } from '@/lib/task-utils';
import { cn, uid } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { LifeAreaId, LifeLink } from '@/types';

/** Nome das áreas na tela de Links (mais direto para o dia a dia). */
const AREA_LABEL: Partial<Record<LifeAreaId, string>> = { intelectual: 'Estudos', profissional: 'Trabalho', saude: 'Saúde', financas: 'Finanças' };
const areaName = (a: LifeAreaId) => AREA_LABEL[a] ?? LIFE_AREA_BY_ID[a].short;

/** Sugestões rápidas de link por área (a pessoa completa o endereço). */
const SUGGEST: Partial<Record<LifeAreaId, { title: string; url?: string }[]>> = {
  intelectual: [{ title: 'Portal do aluno' }, { title: 'AVA / Moodle' }, { title: 'Google Classroom', url: 'https://classroom.google.com' }, { title: 'Biblioteca virtual' }],
  profissional: [{ title: 'E-mail do trabalho' }, { title: 'Sistema da empresa' }, { title: 'Drive / arquivos' }, { title: 'LinkedIn', url: 'https://www.linkedin.com' }],
  financas: [{ title: 'Banco' }, { title: 'Cartão de crédito' }, { title: 'Investimentos' }, { title: 'gov.br / Receita', url: 'https://www.gov.br' }],
  saude: [{ title: 'Plano de saúde' }, { title: 'Meu SUS Digital', url: 'https://meususdigital.saude.gov.br' }, { title: 'Laboratório / exames' }, { title: 'App da academia' }],
  familia: [{ title: 'Agenda da escola dos filhos' }, { title: 'Grupo da família' }],
  espiritualidade: [{ title: 'Site da igreja' }, { title: 'Bíblia online', url: 'https://www.bibliaonline.com.br' }],
  emocional: [{ title: 'Agendamento da terapia' }],
  social: [{ title: 'Eventos e encontros' }],
  lazer: [{ title: 'Streaming' }, { title: 'Ingressos' }],
  relacionamentos: [{ title: 'Datas especiais' }],
};

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};
const favicon = (url: string) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host(url))}&sz=64`;
const normUrl = (u: string) => {
  const t = u.trim();
  if (!t) return '';
  return /^(https?|webcal):\/\//i.test(t) ? t : `https://${t}`;
};

type Draft = { id?: string; title: string; url: string; area: LifeAreaId; icsUrl: string; note: string };
const emptyDraft = (area: LifeAreaId = 'intelectual'): Draft => ({ title: '', url: '', area, icsUrl: '', note: '' });

export function LinksPage() {
  const { data: links = [] } = useLinks();
  const { data: tasks = [] } = useTasks();
  const { events, errors } = useLinkFeeds();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);

  const query = q.trim().toLowerCase();
  const visible = links.filter((l) => !query || `${l.title} ${l.url} ${areaName(l.area)}`.toLowerCase().includes(query));
  const areasWith = LIFE_AREAS.filter((a) => visible.some((l) => l.area === a.id));
  const today = todayISO();
  const until = format(addDays(new Date(), 30), 'yyyy-MM-dd');
  const totalFeeds = links.filter((l) => l.icsUrl).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Link2 className="size-7 text-primary" aria-hidden /> Links
          </h1>
          <p className="text-sm text-foreground/60">Seus portais e sites de cada área da vida num só lugar. Conecte o calendário do portal e as entregas aparecem no Calendário.</p>
        </div>
        <Button onClick={() => setDraft(emptyDraft())}>
          <Plus /> Novo link
        </Button>
      </header>

      {links.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar link…"
            aria-label="Buscar link"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground/50 hover:bg-muted" aria-label="Limpar busca">
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {totalFeeds > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-foreground/55">
          <CalendarDays className="size-3.5" aria-hidden /> {totalFeeds} {totalFeeds === 1 ? 'calendário conectado' : 'calendários conectados'} · {events.filter((e) => e.date >= today && e.date <= until).length} entregas e compromissos nos próximos 30 dias
        </p>
      )}

      {/* Seções por área */}
      {areasWith.map((a) => (
        <section key={a.id} aria-labelledby={`lk-${a.id}`} className="space-y-2">
          <h2 id={`lk-${a.id}`} className="flex items-center gap-2 font-bold">
            <span className="grid size-7 place-items-center rounded-lg text-white" style={{ backgroundColor: a.color }}>
              <a.icon className="size-4" aria-hidden />
            </span>
            {areaName(a.id)}
            <span className="text-sm font-medium text-foreground/45">{visible.filter((l) => l.area === a.id).length}</span>
            <button type="button" onClick={() => setDraft(emptyDraft(a.id))} className="ml-1 grid size-7 place-items-center rounded-full text-foreground/45 hover:bg-muted hover:text-primary" aria-label={`Adicionar link em ${areaName(a.id)}`}>
              <Plus className="size-4" />
            </button>
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible
              .filter((l) => l.area === a.id)
              .map((l) => (
                <LinkCard
                  key={l.id}
                  link={l}
                  upcoming={[
                    ...events.filter((e) => e.link.id === l.id && e.date >= today && e.date <= until).map((e) => ({ kind: 'feed' as const, date: e.date, time: e.time, title: e.title, ev: e })),
                    ...tasks
                      .filter((t) => !isClosed(t) && t.links.some((x) => x.url === l.url))
                      .map((t) => ({ kind: 'task' as const, date: t.dueDate, time: t.deadlineTime, title: t.title, taskId: t.id })),
                  ].sort((x, y) => `${x.date}${x.time ?? ''}`.localeCompare(`${y.date}${y.time ?? ''}`))}
                  feedError={errors[l.id]}
                  onEdit={() => setDraft({ id: l.id, title: l.title, url: l.url, area: l.area, icsUrl: l.icsUrl ?? '', note: l.note ?? '' })}
                />
              ))}
          </div>
        </section>
      ))}

      {/* Começar: áreas com sugestões */}
      {links.length === 0 && (
        <section className="space-y-3">
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <Link2 className="mx-auto size-10 text-foreground/25" aria-hidden />
            <p className="mt-2 font-semibold">Guarde aqui os sites que você usa em cada área</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-foreground/60">Ex.: em Estudos, o portal da faculdade e o AVA. Se o portal tiver “exportar calendário”, as entregas aparecem no seu Calendário.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {LIFE_AREAS.filter((a) => SUGGEST[a.id]).map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <span className="grid size-6 place-items-center rounded-md text-white" style={{ backgroundColor: a.color }}>
                    <a.icon className="size-3.5" aria-hidden />
                  </span>
                  {areaName(a.id)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGEST[a.id]!.map((s) => (
                    <button key={s.title} type="button" onClick={() => setDraft({ ...emptyDraft(a.id), title: s.title, url: s.url ?? '' })} className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium hover:border-primary hover:text-primary">
                      <Plus className="size-3" aria-hidden /> {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {links.length > 0 && visible.length === 0 && <p className="text-sm text-foreground/60">Nenhum link encontrado.</p>}

      <LinkDialog draft={draft} onClose={() => setDraft(null)} count={links.length} />
    </div>
  );
}

type Upcoming = { kind: 'feed'; date: string; time?: string; title: string; ev: LinkEvent } | { kind: 'task'; date: string; time?: string; title: string; taskId: string };

function LinkCard({ link, upcoming, feedError, onEdit }: { link: LifeLink; upcoming: Upcoming[]; feedError?: string; onEdit: () => void }) {
  const del = useDeleteLink();
  const openNewTask = useUI((s) => s.openNewTask);
  const openTask = useUI((s) => s.openTask);
  const area = LIFE_AREA_BY_ID[link.area];
  const [imgOk, setImgOk] = useState(true);

  const remove = async () => {
    if (await askConfirm({ title: `Excluir o link “${link.title}”?`, message: 'As entregas que já viraram afazer continuam no Calendário.', confirmLabel: 'Excluir', danger: true })) {
      del.mutate(link.id);
      toast('Link excluído', { description: link.title });
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3" style={{ borderLeftColor: area.color, borderLeftWidth: 4 }}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
          {imgOk ? <img src={favicon(link.url)} alt="" className="size-7" onError={() => setImgOk(false)} /> : <Link2 className="size-5 text-foreground/50" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-snug">{link.title}</h3>
          <p className="truncate text-xs text-foreground/55">{host(link.url)}</p>
          {link.note && <p className="mt-1 text-sm leading-snug text-foreground/75">{link.note}</p>}
          {link.icsUrl && (
            <p className={cn('mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', feedError ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300')} title={feedError || 'As entregas deste portal aparecem no Calendário'}>
              <CalendarDays className="size-3" aria-hidden /> {feedError ? 'Calendário com problema' : icsEnabled() ? 'Calendário conectado' : 'Calendário conectado (aparece no site)'}
            </p>
          )}
        </div>
      </div>

      {upcoming.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-muted/50 p-2">
          {upcoming.slice(0, 4).map((u, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => (u.kind === 'task' ? openTask(u.taskId) : u.ev.url ? window.open(u.ev.url, '_blank', 'noopener') : window.open(link.url, '_blank', 'noopener'))}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-background"
              >
                <span className="w-16 shrink-0 font-semibold tabular-nums text-foreground/70">{format(parseISO(u.date), 'dd MMM', { locale: ptBR })}{u.time ? ` ${u.time}` : ''}</span>
                <span className="min-w-0 flex-1 truncate">{u.title}</span>
                <span className="shrink-0 text-[10px] text-foreground/45">{u.kind === 'task' ? 'afazer' : 'portal'}</span>
              </button>
            </li>
          ))}
          {upcoming.length > 4 && <li className="px-1.5 text-[11px] text-foreground/50">+ {upcoming.length - 4} no Calendário</li>}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-white hover:opacity-90">
          <ExternalLink className="size-4" aria-hidden /> Abrir
        </a>
        <button
          type="button"
          onClick={() => openNewTask({ lifeAreaId: link.area, title: '', links: [{ id: uid('lk'), title: link.title, url: link.url }] })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:bg-muted"
          title="Cria um afazer com prazo (ex.: trabalho para entregar) que aparece no Calendário"
        >
          <CalendarPlus className="size-4" aria-hidden /> Entrega
        </button>
        <span className="ml-auto flex">
          <button type="button" onClick={onEdit} className="grid size-9 place-items-center rounded-full text-foreground/45 hover:bg-muted hover:text-foreground" aria-label={`Editar ${link.title}`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={remove} className="grid size-9 place-items-center rounded-full text-foreground/45 hover:bg-muted hover:text-primary" aria-label={`Excluir ${link.title}`}>
            <Trash2 className="size-4" />
          </button>
        </span>
      </div>
    </article>
  );
}

function LinkDialog({ draft, onClose, count }: { draft: Draft | null; onClose: () => void; count: number }) {
  const save = useSaveLink();
  const [d, setD] = useState<Draft | null>(draft);
  const [showIcs, setShowIcs] = useState(false);
  // reabre com o rascunho novo
  const key = useMemo(() => (draft ? `${draft.id ?? 'novo'}-${draft.title}-${draft.area}` : ''), [draft]);
  const [lastKey, setLastKey] = useState('');
  if (key !== lastKey) {
    setLastKey(key);
    setD(draft);
    setShowIcs(!!draft?.icsUrl);
  }
  if (!d) return <Dialog open={false} />;

  const submit = () => {
    const url = normUrl(d.url);
    if (!d.title.trim() || !url) return toast.error('Preencha o nome e o endereço do link');
    try {
      new URL(url);
    } catch {
      return toast.error('Endereço inválido');
    }
    const link: LifeLink = {
      id: d.id ?? uid('lnk'),
      title: d.title.trim(),
      url,
      area: d.area,
      icsUrl: d.icsUrl.trim() ? normUrl(d.icsUrl) : undefined,
      note: d.note.trim() || undefined,
      order: count,
      createdAt: new Date().toISOString(),
    };
    save.mutate(link, { onSuccess: () => toast.success(d.id ? 'Link atualizado' : 'Link salvo', { description: link.title }) });
    onClose();
  };

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto">
        <DialogTitle className="text-lg font-bold">{d.id ? 'Editar link' : 'Novo link'}</DialogTitle>
        <DialogDescription className="text-sm text-foreground/60">Escolha a área da vida e cole o endereço.</DialogDescription>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Área</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {LIFE_AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setD({ ...d, area: a.id })}
                  aria-pressed={d.area === a.id}
                  className={cn('inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors', d.area === a.id ? 'border-transparent text-white' : 'border-border hover:bg-muted')}
                  style={d.area === a.id ? { backgroundColor: a.color } : undefined}
                >
                  <a.icon className="size-3.5" aria-hidden /> {areaName(a.id)}
                </button>
              ))}
            </div>
            {SUGGEST[d.area] && !d.id && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGEST[d.area]!.map((s) => (
                  <button key={s.title} type="button" onClick={() => setD({ ...d, title: s.title, url: d.url || s.url || '' })} className="h-7 rounded-full bg-muted px-2.5 text-[11px] font-medium text-foreground/70 hover:text-foreground">
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="lk-title">Nome</Label>
            <Input id="lk-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Ex.: Portal do aluno" />
          </div>
          <div>
            <Label htmlFor="lk-url">Endereço</Label>
            <Input id="lk-url" value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} placeholder="https://portal.suafaculdade.edu.br" inputMode="url" />
          </div>
          <div>
            <Label htmlFor="lk-note">Observação (opcional)</Label>
            <Textarea id="lk-note" value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} placeholder="Ex.: matrícula 2026-1234 · senha no gerenciador" className="min-h-[60px]" />
          </div>
          <div className="rounded-xl border border-border p-3">
            <button type="button" onClick={() => setShowIcs((v) => !v)} className="flex w-full items-center gap-2 text-left text-sm font-semibold">
              <CalendarDays className="size-4 text-primary" aria-hidden /> Conectar ao Calendário {d.icsUrl ? '· conectado' : '(opcional)'}
            </button>
            {showIcs && (
              <div className="mt-2 space-y-2">
                <p className="text-xs leading-relaxed text-foreground/65">
                  Se o portal tiver <b>“Exportar calendário”</b> ou <b>“Assinar calendário (iCal)”</b> — como Moodle, Canvas, Google Classroom, Blackboard, Outlook —, copie o link que termina em <b>.ics</b> e cole aqui. As entregas, provas e aulas aparecem no seu Calendário e aqui no card.
                </p>
                <Input value={d.icsUrl} onChange={(e) => setD({ ...d, icsUrl: e.target.value })} placeholder="https://… /calendar/export … .ics" inputMode="url" aria-label="Link do calendário (iCal)" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit}>{d.id ? 'Salvar' : 'Adicionar link'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
