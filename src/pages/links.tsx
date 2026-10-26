import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, CalendarPlus, Check, ChevronDown, ExternalLink, LayoutGrid, Link2, Pencil, Pin, PinOff, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Label, Textarea } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useDeleteLink, useLinks, useSaveLink, useTasks } from '@/hooks/use-data';
import { icsEnabled, useLinkFeeds, type LinkEvent } from '@/hooks/use-link-feeds';
import { LIFE_AREAS, LIFE_AREA_BY_ID } from '@/lib/life-areas';
import { LINK_CATALOG, type CatalogItem } from '@/lib/link-catalog';
import { isClosed, todayISO } from '@/lib/task-utils';
import { cn, uid } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { LifeAreaId, LifeLink } from '@/types';

/** Nome das áreas na tela de Links (mais direto para o dia a dia). */
const AREA_LABEL: Partial<Record<LifeAreaId, string>> = { intelectual: 'Estudos', profissional: 'Trabalho', saude: 'Saúde', financas: 'Finanças' };
const areaName = (a: LifeAreaId) => AREA_LABEL[a] ?? LIFE_AREA_BY_ID[a].short;


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

type Draft = { id?: string; title: string; url: string; area: LifeAreaId; icsUrl: string; note: string; pinned?: boolean };
const emptyDraft = (area: LifeAreaId = 'intelectual'): Draft => ({ title: '', url: '', area, icsUrl: '', note: '' });

export function LinksPage() {
  const { data: links = [] } = useLinks();
  const { data: tasks = [] } = useTasks();
  const { events, errors } = useLinkFeeds();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [catalogOpen, setCatalogOpen] = useState<boolean | null>(null);
  const showCatalog = catalogOpen ?? links.length === 0;

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
        <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          <Button variant={showCatalog ? 'secondary' : 'outline'} onClick={() => setCatalogOpen(!showCatalog)} aria-expanded={showCatalog}>
            <LayoutGrid /> Escolher da lista
          </Button>
          <Button onClick={() => setDraft(emptyDraft())}>
            <Plus /> Outro link
          </Button>
        </div>
      </header>

      {showCatalog && <Catalog links={links} onAdded={() => setCatalogOpen(true)} onCustom={(area, item) => setDraft({ ...emptyDraft(area), title: item?.title ?? '' })} onClose={links.length ? () => setCatalogOpen(false) : undefined} />}

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
                  onEdit={() => setDraft({ id: l.id, title: l.title, url: l.url, area: l.area, icsUrl: l.icsUrl ?? '', note: l.note ?? '', pinned: l.pinned })}
                />
              ))}
          </div>
        </section>
      ))}

      {links.length > 0 && visible.length === 0 && <p className="text-sm text-foreground/60">Nenhum link encontrado.</p>}

      <LinkDialog draft={draft} onClose={() => setDraft(null)} count={links.length} />
    </div>
  );
}

/** Lista pronta: um toque adiciona (ou abre, se já estiver salvo). */
function Catalog({ links, onAdded, onCustom, onClose }: { links: LifeLink[]; onAdded: () => void; onCustom: (area: LifeAreaId, item?: CatalogItem) => void; onClose?: () => void }) {
  const save = useSaveLink();
  const del = useDeleteLink();
  const [area, setArea] = useState<LifeAreaId>('lazer');
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const items: { item: CatalogItem; area: LifeAreaId }[] = query
    ? LIFE_AREAS.flatMap((a) => LINK_CATALOG[a.id].filter((i) => i.title.toLowerCase().includes(query)).map((item) => ({ item, area: a.id })))
        .filter((x, i, arr) => arr.findIndex((y) => y.item.title === x.item.title) === i)
    : LINK_CATALOG[area].map((item) => ({ item, area }));
  const saved = (item: CatalogItem) => (item.url ? links.find((l) => host(l.url) === host(item.url!)) : undefined);

  const add = (item: CatalogItem, a: LifeAreaId) => {
    if (!item.url) return onCustom(a, item);
    onAdded();
    const link: LifeLink = { id: uid('lnk'), title: item.title, url: item.url, area: a, order: links.length, createdAt: new Date().toISOString() };
    save.mutate(link, {
      onSuccess: () => toast.success(`${item.title} adicionado`, { description: `em ${areaName(a)}`, action: { label: 'Desfazer', onClick: () => del.mutate(link.id) } }),
    });
  };

  return (
    <section aria-label="Escolher da lista" className="space-y-3 rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">Escolha da lista</h2>
          <p className="text-xs text-foreground/60">Toque para adicionar. No celular, abre direto no app (Spotify, WhatsApp, banco…).</p>
        </div>
        <div className="relative order-last w-full sm:order-none sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar app ou site…"
            aria-label="Procurar na lista"
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-foreground/50 hover:bg-muted" aria-label="Fechar a lista">
            <ChevronDown className="size-4 rotate-180" />
          </button>
        )}
      </div>

      {!query && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Áreas da vida">
          {LIFE_AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={area === a.id}
              onClick={() => setArea(a.id)}
              className={cn('inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors', area === a.id ? 'border-transparent text-white' : 'border-border hover:bg-muted')}
              style={area === a.id ? { backgroundColor: a.color } : undefined}
            >
              <a.icon className="size-3.5" aria-hidden /> {areaName(a.id)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map(({ item, area: a }) => {
          const has = saved(item);
          const inner = (
            <>
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                {item.url ? <img src={favicon(item.url)} alt="" className="size-6" loading="lazy" /> : <Link2 className="size-4 text-foreground/50" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-tight">{item.title}</span>
                <span className="block truncate text-[11px] text-foreground/50">{has ? 'Já está nos seus links' : item.url ? host(item.url) : item.hint}</span>
              </span>
              <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', has ? 'bg-emerald-500 text-white' : 'bg-muted text-foreground/60')}>
                {has ? <Check className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
              </span>
            </>
          );
          const cls = cn('flex items-center gap-2 rounded-xl border p-2 text-left transition-colors', has ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10' : 'border-border hover:border-primary hover:bg-muted/50');
          return has ? (
            <a key={item.title + a} href={has.url} target="_blank" rel="noreferrer" className={cls} title={`Abrir ${item.title}`}>
              {inner}
            </a>
          ) : (
            <button key={item.title + a} type="button" onClick={() => add(item, a)} className={cls} title={item.url ? `Adicionar ${item.title} em ${areaName(a)}` : 'Cole o endereço no próximo passo'}>
              {inner}
            </button>
          );
        })}
        <button type="button" onClick={() => onCustom(query ? 'lazer' : area, query ? { title: q.trim() } : undefined)} className="flex items-center gap-2 rounded-xl border border-dashed border-border p-2 text-left text-foreground/70 hover:border-primary hover:text-primary">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
            <Plus className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-tight">{query ? `Adicionar “${q.trim()}”` : 'Outro site'}</span>
            <span className="block truncate text-[11px] text-foreground/50">colar o endereço</span>
          </span>
        </button>
      </div>
    </section>
  );
}

type Upcoming = { kind: 'feed'; date: string; time?: string; title: string; ev: LinkEvent } | { kind: 'task'; date: string; time?: string; title: string; taskId: string };

function LinkCard({ link, upcoming, feedError, onEdit }: { link: LifeLink; upcoming: Upcoming[]; feedError?: string; onEdit: () => void }) {
  const del = useDeleteLink();
  const save = useSaveLink();
  const openNewTask = useUI((s) => s.openNewTask);
  const togglePin = () =>
    save.mutate({ ...link, pinned: !link.pinned }, { onSuccess: () => toast.success(link.pinned ? 'Tirado do menu' : 'Fixado no menu', { description: link.pinned ? link.title : `${link.title} aparece em “Atalhos”, no menu lateral` }) });
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
          <h3 className="flex items-center gap-1.5 truncate font-semibold leading-snug">
            {link.title}
            {link.pinned && <Pin className="size-3.5 shrink-0 text-primary" aria-label="Fixado no menu" />}
          </h3>
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
          <button type="button" onClick={togglePin} className={cn('grid size-9 place-items-center rounded-full hover:bg-muted', link.pinned ? 'text-primary' : 'text-foreground/45 hover:text-foreground')} aria-label={link.pinned ? `Tirar ${link.title} do menu` : `Fixar ${link.title} no menu`} title={link.pinned ? 'Tirar do menu' : 'Fixar no menu lateral'}>
            {link.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          </button>
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
      pinned: d.pinned || undefined,
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
            {!d.id && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LINK_CATALOG[d.area].slice(0, 8).map((s) => (
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
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
            <input type="checkbox" checked={!!d.pinned} onChange={(e) => setD({ ...d, pinned: e.target.checked })} className="size-4 accent-[rgb(var(--primary))]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold"><Pin className="size-4 text-primary" aria-hidden /> Fixar no menu</span>
              <span className="block text-xs text-foreground/60">Aparece em “Atalhos”, no menu lateral, e abre em outra aba. Só você vê.</span>
            </span>
          </label>
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
