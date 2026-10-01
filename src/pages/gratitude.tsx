import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookHeart, ChevronDown, ClipboardCopy, Flame, HandHeart, History, Hourglass, Save, Shuffle, Sparkles, Sun, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BreathingGuide } from '@/components/gratitude/breathing';
import { DailyMeditation } from '@/components/gratitude/daily-meditation';
import { ratingKey, StarRating, StarsBadge } from '@/components/ui/star-rating';
import { VideoCard, VideoPlayerDialog, useVideoPlayer } from '@/components/life/videos';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Input, Textarea } from '@/components/ui/form-controls';
import { useDeleteGratitude, useGratitude, useRatings, useSaveGratitude, useUser } from '@/hooks/use-data';
import { GRATITUDE_VIDEOS, GRATITUDE_VIDEO_GROUPS } from '@/lib/gratitude-videos';
import { PRAYER_THEMES, PRAYERS, PROMPTS, promptOf, REFLECTIONS, type PrayerTheme } from '@/lib/gratitude';
import { dailyPick } from '@/lib/meditations';
import { firstName } from '@/lib/onboarding';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { GratitudeEntry } from '@/types';

/** Dias seguidos com registro (até hoje ou ontem). */
function streakOf(entries: GratitudeEntry[]) {
  const dates = new Set(entries.map((e) => e.date));
  let d = new Date();
  if (!dates.has(format(d, 'yyyy-MM-dd'))) d = subDays(d, 1);
  let n = 0;
  while (dates.has(format(d, 'yyyy-MM-dd'))) {
    n++;
    d = subDays(d, 1);
  }
  return n;
}

function Journal({ entries }: { entries: GratitudeEntry[] }) {
  const save = useSaveGratitude();
  const today = todayISO();
  const existing = entries.find((e) => e.date === today);
  const [present, setPresent] = useState<string[]>(['', '', '']);
  const [past, setPast] = useState('');
  const [future, setFuture] = useState('');

  useEffect(() => {
    setPresent([...(existing?.present ?? []), '', '', ''].slice(0, 3));
    setPast(existing?.past ?? '');
    setFuture(existing?.future ?? '');
  }, [existing?.id]);

  const filled = present.some((p) => p.trim()) || past.trim() || future.trim();
  const submit = () =>
    save.mutate({ date: today, present: present.map((p) => p.trim()).filter(Boolean), past: past.trim(), future: future.trim() });

  return (
    <section aria-labelledby="journal-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 id="journal-title" className="flex items-center gap-2 font-bold">
        <BookHeart className="size-5 text-primary" aria-hidden /> Diário de gratidão de hoje
      </h2>
      <p className="mt-1 text-sm text-foreground/65">Agradeça pelo que você tem, pelo que já teve e pelo que ainda vai ter.</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Sun className="size-4 text-amber-500" aria-hidden /> O que eu tenho — {promptOf(PROMPTS.present)}
          </p>
          <div className="space-y-2">
            {present.map((v, i) => (
              <Input
                key={i}
                id={`gr-present-${i}`}
                value={v}
                onChange={(e) => setPresent((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={['Ex.: Minha saúde', 'Ex.: O café com minha família', 'Ex.: Ter terminado aquele trabalho'][i]}
                aria-label={`Gratidão de hoje ${i + 1}`}
                maxLength={160}
              />
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="gr-past" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <History className="size-4 text-violet-500" aria-hidden /> O que eu já tive — {promptOf(PROMPTS.past)}
          </label>
          <Textarea id="gr-past" value={past} onChange={(e) => setPast(e.target.value)} className="min-h-[64px]" maxLength={400} />
        </div>
        <div>
          <label htmlFor="gr-future" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Hourglass className="size-4 text-emerald-500" aria-hidden /> O que eu ainda terei — {promptOf(PROMPTS.future)}
          </label>
          <Textarea id="gr-future" value={future} onChange={(e) => setFuture(e.target.value)} className="min-h-[64px]" maxLength={400} />
        </div>
        <Button onClick={submit} disabled={!filled || save.isPending} className="w-full sm:w-auto">
          <Save /> {existing ? 'Atualizar o dia de hoje' : 'Guardar minha gratidão'}
        </Button>
      </div>
    </section>
  );
}

function PrayerCard({ title, origin, text, rateId, stars = 0, featured, defaultOpen = false }: { title: string; origin?: string; text: string; rateId?: string; stars?: number; featured?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      toast.success('Texto copiado');
    } catch {
      toast('Não foi possível copiar', { description: 'Selecione o texto e copie manualmente.' });
    }
  };
  return (
    <li className={cn('rounded-xl border bg-card', featured ? 'border-primary/40 md:col-span-2' : 'border-border')}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 p-3 text-left">
        <span className="min-w-0 flex-1">
          {featured && <span className="block text-[11px] font-semibold uppercase tracking-wide text-primary dark:text-neon">{featured}</span>}
          <span className="flex items-center gap-2 font-semibold">
            {title} <StarsBadge stars={stars} />
          </span>
          {origin && <span className="block text-xs text-foreground/55">{origin}</span>}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-foreground/50 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="whitespace-pre-line font-brand text-[15px] leading-relaxed text-foreground/85">{text}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {rateId ? <StarRating itemKey={rateId} label={title} withNote={false} /> : <span />}
            <Button variant="ghost" size="sm" onClick={copy}>
              <ClipboardCopy /> Copiar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export function GratitudePage() {
  const { data: entries = [] } = useGratitude();
  const { data: user } = useUser();
  const remove = useDeleteGratitude();
  const player = useVideoPlayer();
  const [tab, setTab] = useState<'oracoes' | 'reflexoes'>('oracoes');
  const [theme, setTheme] = useState<PrayerTheme | 'ALL' | 'FAV'>('ALL');
  const { data: ratings = {} } = useRatings();
  const starsOf = (id: string) => ratings[ratingKey('prayer', id)]?.stars ?? 0;
  const prayerOfDay = dailyPick(PRAYERS);
  const reflectionOfDay = dailyPick(REFLECTIONS, new Date(), 3);
  const prayers =
    theme === 'FAV'
      ? PRAYERS.filter((p) => starsOf(p.id) > 0).sort((a, b) => starsOf(b.id) - starsOf(a.id))
      : PRAYERS.filter((p) => (theme === 'ALL' ? p.id !== prayerOfDay.id : p.theme === theme));
  const [memorySeed, setMemorySeed] = useState(0);
  const streak = streakOf(entries);
  const thanksCount = entries.reduce((n, e) => n + e.present.length + (e.past ? 1 : 0) + (e.future ? 1 : 0), 0);

  // "Relembrar": um dia antigo do diário (não o de hoje)
  const memory = useMemo(() => {
    const old = entries.filter((e) => e.date !== todayISO());
    return old.length ? old[(memorySeed + old.length) % old.length] : undefined;
  }, [entries, memorySeed]);

  const nick = user ? firstName(user.name) : '';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <HandHeart className="size-7 text-primary" aria-hidden /> Gratidão
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-foreground/65">
          {nick ? `${nick}, este` : 'Este'} é o seu espaço para agradecer pelo que você tem, pelo que já teve e pelo que ainda terá — com diário, meditação, orações e vídeos.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold">
            <Flame className="size-4 text-amber-500" aria-hidden /> {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden /> {thanksCount} {thanksCount === 1 ? 'agradecimento' : 'agradecimentos'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Journal entries={entries} />
        <BreathingGuide />
      </div>

      <DailyMeditation onPlay={player.play} />

      {memory && (
        <section aria-labelledby="memory-title" className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <h2 id="memory-title" className="font-bold">Relembrar</h2>
            <span className="text-xs text-foreground/60">
              {format(parseISO(memory.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })} · há {differenceInCalendarDays(new Date(), parseISO(memory.date))} dias
            </span>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setMemorySeed((s) => s + 1)}>
              <Shuffle /> Outro dia
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {memory.present.map((p) => (
              <li key={p}>🙏 {p}</li>
            ))}
            {memory.past && <li>⏳ Já tive: {memory.past}</li>}
            {memory.future && <li>🌱 Ainda terei: {memory.future}</li>}
          </ul>
        </section>
      )}

      <section aria-labelledby="pray-title" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="pray-title" className="text-lg font-bold">Orações e reflexões</h2>
          <div role="tablist" aria-label="Tipo de texto" className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {(
              [
                ['oracoes', 'Orações'],
                ['reflexoes', 'Reflexões'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn('h-8 rounded-lg px-3 text-sm font-semibold', tab === id ? 'bg-primary text-white' : 'text-foreground/65 hover:text-foreground')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {tab === 'oracoes' && (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]" role="toolbar" aria-label="Temas das orações">
            {[{ id: 'ALL' as const, label: 'Todas' }, ...PRAYER_THEMES, { id: 'FAV' as const, label: '⭐ Minhas favoritas' }].map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
                className={cn('h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors', theme === t.id ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-muted')}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {tab === 'oracoes' ? (
            <>
              {theme === 'ALL' && <PrayerCard key={`dia-${prayerOfDay.id}`} featured="Oração do dia" defaultOpen title={prayerOfDay.title} origin={prayerOfDay.origin} text={prayerOfDay.text} rateId={ratingKey('prayer', prayerOfDay.id)} stars={starsOf(prayerOfDay.id)} />}
              {prayers.map((p) => (
                <PrayerCard key={p.id} title={p.title} origin={p.origin} text={p.text} rateId={ratingKey('prayer', p.id)} stars={starsOf(p.id)} />
              ))}
              {theme === 'FAV' && prayers.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground/60 md:col-span-2">Abra uma oração e dê estrelas a ela — as suas favoritas aparecem aqui.</li>
              )}
            </>
          ) : (
            <>
              <PrayerCard key={`dia-${reflectionOfDay.title}`} featured="Reflexão do dia" defaultOpen title={reflectionOfDay.title} text={reflectionOfDay.text} />
              {REFLECTIONS.filter((r) => r !== reflectionOfDay).map((r) => (
                <PrayerCard key={r.title} title={r.title} text={r.text} />
              ))}
            </>
          )}
        </ul>
      </section>

      {GRATITUDE_VIDEOS.length > 0 && (
        <section aria-labelledby="gr-videos" className="space-y-4">
          <h2 id="gr-videos" className="text-lg font-bold">Vídeos para meditar, agradecer e orar</h2>
          {GRATITUDE_VIDEO_GROUPS.map((g) => {
            const list = GRATITUDE_VIDEOS.filter((v) => v.group === g.id);
            if (!list.length) return null;
            return (
              <div key={g.id} className="space-y-2">
                <h3 className="font-semibold">{g.label}</h3>
                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]" role="list" aria-label={g.label}>
                  {list.map((v) => (
                    <div key={v.youtubeId} role="listitem" className="w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-[260px]">
                      <VideoCard video={v} onPlay={player.play} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {entries.length > 0 && (
        <section aria-labelledby="gr-hist" className="space-y-2">
          <h2 id="gr-hist" className="text-lg font-bold">Seu diário</h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {entries.slice(0, 14).map((e) => (
              <li key={e.id} className="flex items-start gap-3 p-3 text-sm">
                <span className="w-20 shrink-0 font-semibold tabular-nums">{format(parseISO(e.date), 'dd/MM/yy')}</span>
                <span className="min-w-0 flex-1 text-foreground/80">
                  {[...e.present, e.past && `já tive: ${e.past}`, e.future && `ainda terei: ${e.future}`].filter(Boolean).join(' · ')}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:text-primary"
                  aria-label={`Apagar o dia ${format(parseISO(e.date), 'dd/MM')}`}
                  onClick={async () => (await askConfirm({ title: 'Apagar este dia do diário?', confirmLabel: 'Apagar', danger: true })) && remove.mutate(e.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <VideoPlayerDialog video={player.video} onClose={player.close} />
    </div>
  );
}
