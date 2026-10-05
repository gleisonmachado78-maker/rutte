import {
  BookOpen,
  CirclePlay,
  Gift,
  Headphones,
  Library,
  Palette,
  Search,
  Star,
  X,
  Crown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookCard } from "@/components/library/book-card";
import { FreeBookCard } from "@/components/library/free-book-card";
import { ReadingPlatforms } from "@/components/library/reading-platforms";
import { PodcastCard } from "@/components/library/podcast-card";
import { PODCASTS } from "@/lib/podcasts";
import { MENTORS } from "@/lib/mentors";
import { MentorsTab } from "@/components/library/mentors-tab";
import { FREE_BOOKS } from "@/lib/free-books";
import {
  VideoCard,
  VideoPlayerDialog,
  useVideoPlayer,
} from "@/components/life/videos";
import { useBookShelf, useRatings, useUser } from "@/hooks/use-data";
import { BOOKS } from "@/lib/books";
import {
  SHELF_LABEL,
  TOPICS,
  type ShelfStatus,
  type TopicId,
} from "@/lib/library";
import { focusAreas } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { LIFE_VIDEOS } from "@/lib/videos";

type Tab = "livros" | "videos" | "podcasts" | "nomes";
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const chip =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200";
const chipOn = "border-primary bg-primary text-white";
const chipOff = "border-border bg-background hover:bg-muted";

export function LibraryPage() {
  const location = useLocation();
  const nav = (location.state ?? {}) as { tab?: Tab; topic?: TopicId };
  const [tab, setTab] = useState<Tab>(
    nav.tab ?? (BOOKS.length ? "livros" : "videos"),
  );
  const [topic, setTopic] = useState<TopicId | "ALL">(nav.topic ?? "ALL");
  const [q, setQ] = useState("");
  const [shelfFilter, setShelfFilter] = useState<ShelfStatus | null>(null);
  const [onlyAnimated, setOnlyAnimated] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [topRated, setTopRated] = useState(false);
  /** temas de podcast abertos em "Ver mais" */
  const [openTopics, setOpenTopics] = useState<string[]>([]);
  const { data: shelf = {} } = useBookShelf();
  const { data: ratings = {} } = useRatings();
  const stars = (key: string) => ratings[key]?.stars ?? 0;
  /** com "Mais bem avaliados": só o que tem nota, da maior para a menor */
  const byRating = <T,>(list: T[], key: (x: T) => string) =>
    topRated
      ? list
          .filter((x) => stars(key(x)) > 0)
          .sort((a, b) => stars(key(b)) - stars(key(a)))
      : list;
  const { data: user } = useUser();
  const player = useVideoPlayer();

  // Vindo da Roda da Vida com um tema já escolhido
  useEffect(() => {
    if (nav.tab) setTab(nav.tab);
    if (nav.topic) setTopic(nav.topic);
  }, [nav.tab, nav.topic]);

  // Temas ligados aos objetivos da pessoa aparecem primeiro
  const focus = user ? focusAreas(user.goals) : [];
  const ordered = useMemo(
    () =>
      [...TOPICS].sort(
        (a, b) =>
          Number(!a.videoAreas.some((x) => focus.includes(x))) -
          Number(!b.videoAreas.some((x) => focus.includes(x))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focus.join()],
  );

  const query = norm(q.trim());
  const books = byRating(
    BOOKS.filter(
      (b) =>
        !onlyFree &&
        (topic === "ALL" || b.topic === topic) &&
        (!shelfFilter || shelf[b.googleId] === shelfFilter) &&
        (!query || norm(`${b.title} ${b.author}`).includes(query)),
    ),
    (b) => `book:${b.googleId}`,
  );
  const freeBooks = byRating(
    FREE_BOOKS.filter(
      (b) =>
        !shelfFilter &&
        (topic === "ALL" || b.topic === topic) &&
        (!query || norm(`${b.title} ${b.author}`).includes(query)),
    ),
    (b) => `free:${b.url}`,
  );
  const videoTopic = (area: string) =>
    TOPICS.find((t) => t.videoAreas.includes(area as never))?.id;
  const videos = byRating(
    LIFE_VIDEOS.filter(
      (v) =>
        (topic === "ALL" || videoTopic(v.area) === topic) &&
        (!onlyAnimated || v.style === "animado") &&
        (!query || norm(`${v.title} ${v.channel}`).includes(query)),
    ).sort(
      (a, b) => Number(a.style !== "animado") - Number(b.style !== "animado"),
    ),
    (v) => `video:${v.youtubeId}`,
  );
  const podcasts = byRating(
    PODCASTS.filter(
      (p) =>
        (topic === "ALL" || p.topic === topic) &&
        (!query || norm(`${p.title} ${p.host}`).includes(query)),
    ),
    (p) => `podcast:${p.spotifyId}`,
  );
  const ratedCount = (prefix: string) =>
    Object.keys(ratings).filter((k) => k.startsWith(prefix)).length;
  const topRatedChip = (n: number) => (
    <button
      type="button"
      aria-pressed={topRated}
      onClick={() => setTopRated((v) => !v)}
      className={cn(
        chip,
        "h-8 text-xs",
        topRated ? "border-amber-500 bg-amber-500 text-navy" : chipOff,
      )}
      title="Mostra só o que você avaliou, da maior nota para a menor"
    >
      <Star
        className={cn("size-3.5", topRated && "fill-current")}
        aria-hidden
      />{" "}
      Mais bem avaliados <span className="tabular-nums opacity-70">{n}</span>
    </button>
  );

  const topicsWithItems = ordered.filter((t) =>
    tab === "livros"
      ? BOOKS.some((b) => b.topic === t.id) ||
        FREE_BOOKS.some((b) => b.topic === t.id)
      : tab === "podcasts"
        ? PODCASTS.some((p) => p.topic === t.id)
        : LIFE_VIDEOS.some((v) => t.videoAreas.includes(v.area)),
  );
  const shelfCount = (s: ShelfStatus) =>
    Object.values(shelf).filter((x) => x === s).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Library className="size-7 text-primary" aria-hidden /> Biblioteca
        </h1>
        <p className="text-sm text-foreground/60">
          Livros, audiolivros, vídeos e podcasts escolhidos para você se
          desenvolver, organizados por tema.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Tipo de conteúdo"
        className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 sm:flex sm:w-fit"
      >
        {(
          [
            {
              id: "livros",
              label: "Livros",
              icon: BookOpen,
              n: BOOKS.length + FREE_BOOKS.length,
            },
            {
              id: "videos",
              label: "Vídeos",
              icon: CirclePlay,
              n: LIFE_VIDEOS.length,
            },
            {
              id: "podcasts",
              label: "Podcasts",
              icon: Headphones,
              n: PODCASTS.length,
            },
            {
              id: "nomes",
              label: "Grandes nomes",
              icon: Crown,
              n: MENTORS.length,
            },
          ] as const
        )
          .filter((t) => t.id !== "podcasts" || t.n > 0)
          .map(({ id, label, icon: Icon, n }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setTopic("ALL");
              }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition-colors sm:gap-1.5 sm:px-4",
                tab === id
                  ? "bg-primary text-white"
                  : "text-foreground/65 hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  tab === id ? "text-white/75" : "text-foreground/40",
                )}
              >
                {n}
              </span>
            </button>
          ))}
      </div>

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40"
            aria-hidden
          />
          <input
            id="library-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === "livros"
                ? "Buscar por título ou autor…"
                : tab === "podcasts"
                  ? "Buscar podcast…"
                  : tab === "nomes"
                    ? "Buscar pessoa ou podcast…"
                    : "Buscar vídeo ou canal…"
            }
            aria-label="Buscar na biblioteca"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground/50 hover:bg-muted"
              aria-label="Limpar busca"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {tab !== "nomes" && (
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]"
          role="toolbar"
          aria-label="Temas"
        >
          <button
            type="button"
            aria-pressed={topic === "ALL"}
            onClick={() => setTopic("ALL")}
            className={cn(chip, topic === "ALL" ? chipOn : chipOff)}
          >
            Todos
          </button>
          {topicsWithItems.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={topic === t.id}
              onClick={() => setTopic(t.id)}
              className={cn(chip, topic === t.id ? chipOn : chipOff)}
            >
              <t.icon
                className="size-4"
                style={{ color: topic === t.id ? undefined : t.color }}
                aria-hidden
              />
              {t.label}
            </button>
          ))}
        </div>
        )}

        {tab === "nomes" ? null : tab === "livros" ? (
          <div
            className="flex flex-wrap gap-2"
            role="toolbar"
            aria-label="Minha estante"
          >
            {topRatedChip(ratedCount("book:") + ratedCount("free:"))}
            {FREE_BOOKS.length > 0 && (
              <button
                type="button"
                aria-pressed={onlyFree}
                onClick={() => {
                  setOnlyFree((v) => !v);
                  setShelfFilter(null);
                }}
                className={cn(
                  chip,
                  "h-8 text-xs",
                  onlyFree
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : chipOff,
                )}
              >
                <Gift className="size-3.5" aria-hidden /> Só grátis (PDF){" "}
                <span className="tabular-nums opacity-70">
                  {FREE_BOOKS.length}
                </span>
              </button>
            )}
            <span className="self-center text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Minha estante:
            </span>
            {(["quero", "lendo", "lido"] as ShelfStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={shelfFilter === s}
                onClick={() => setShelfFilter((x) => (x === s ? null : s))}
                className={cn(
                  chip,
                  "h-8 text-xs",
                  shelfFilter === s ? chipOn : chipOff,
                )}
              >
                {SHELF_LABEL[s]}{" "}
                <span className="tabular-nums opacity-70">{shelfCount(s)}</span>
              </button>
            ))}
          </div>
        ) : tab === "podcasts" ? (
          <div
            className="flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="Filtros de podcast"
          >
            {topRatedChip(ratedCount("podcast:"))}
            <span className="text-xs text-foreground/55">
              “Abrir no Spotify” abre o app direto no celular; “Ouvir aqui” toca
              dentro da Rutte.
            </span>
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-2"
            role="toolbar"
            aria-label="Filtros de vídeo"
          >
            {topRatedChip(ratedCount("video:"))}
            <button
              type="button"
              aria-pressed={onlyAnimated}
              onClick={() => setOnlyAnimated((v) => !v)}
              className={cn(
                chip,
                "h-8 text-xs",
                onlyAnimated ? chipOn : chipOff,
              )}
            >
              <Palette className="size-3.5" aria-hidden /> Só animados
            </button>
          </div>
        )}
      </div>

      {tab === "livros" && !topRated && !shelfFilter && <ReadingPlatforms />}

      {tab === "nomes" ? (
        <MentorsTab query={q} />
      ) : tab === "livros" ? (
        books.length + freeBooks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
            {topRated
              ? "Você ainda não avaliou livros aqui. Toque nas estrelas de um livro para dar sua nota."
              : shelfFilter
                ? `Nenhum livro marcado como “${SHELF_LABEL[shelfFilter]}” neste tema.`
                : "Nenhum livro encontrado."}
          </p>
        ) : (
          ordered
            .filter(
              (t) =>
                books.some((b) => b.topic === t.id) ||
                freeBooks.some((b) => b.topic === t.id),
            )
            .map((t) => (
              <section
                key={t.id}
                aria-labelledby={`bk-${t.id}`}
                className="space-y-2"
              >
                <h2
                  id={`bk-${t.id}`}
                  className="flex items-center gap-2 font-bold"
                >
                  <t.icon
                    className="size-5"
                    style={{ color: t.color }}
                    aria-hidden
                  />{" "}
                  {t.label}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {freeBooks
                    .filter((b) => b.topic === t.id)
                    .sort(
                      (x, y) =>
                        Number(x.category !== "classico") -
                        Number(y.category !== "classico"),
                    )
                    .map((b) => (
                      <FreeBookCard key={b.url} book={b} />
                    ))}
                  {books
                    .filter((b) => b.topic === t.id)
                    .map((b) => (
                      <BookCard
                        key={b.googleId}
                        book={b}
                        status={shelf[b.googleId]}
                      />
                    ))}
                </div>
              </section>
            ))
        )
      ) : tab === "podcasts" ? (
        podcasts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
            {topRated
              ? "Você ainda não avaliou podcasts."
              : "Nenhum podcast encontrado."}
          </p>
        ) : (
          ordered
            .filter((t) => podcasts.some((p) => p.topic === t.id))
            .map((t) => (
              <section
                key={t.id}
                aria-labelledby={`pc-${t.id}`}
                className="space-y-2"
              >
                <h2
                  id={`pc-${t.id}`}
                  className="flex items-center gap-2 font-bold"
                >
                  <t.icon
                    className="size-5"
                    style={{ color: t.color }}
                    aria-hidden
                  />{" "}
                  {t.label}
                  <span className="text-sm font-medium text-foreground/45">
                    {podcasts.filter((p) => p.topic === t.id).length}
                  </span>
                </h2>
                {(() => {
                  // populares primeiro; mostra 6 por tema até tocar em "Ver mais"
                  const list = podcasts
                    .filter((p) => p.topic === t.id)
                    .sort((a, b) => (topRated ? 0 : Number(!!b.featured) - Number(!!a.featured)));
                  const all = openTopics.includes(t.id) || topic !== "ALL" || !!query || topRated;
                  const shown = all ? list : list.slice(0, 6);
                  return (
                    <>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {shown.map((p) => (
                          <PodcastCard key={p.spotifyId} podcast={p} />
                        ))}
                      </div>
                      {list.length > 6 && topic === "ALL" && !query && !topRated && (
                        <button
                          type="button"
                          onClick={() => setOpenTopics((o) => (o.includes(t.id) ? o.filter((x) => x !== t.id) : [...o, t.id]))}
                          aria-expanded={all}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary"
                        >
                          {all ? "Ver menos" : `Ver mais ${list.length - 6} podcasts de ${t.label}`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </section>
            ))
        )
      ) : videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
          {topRated
            ? "Você ainda não avaliou vídeos. Abra um vídeo e dê sua nota abaixo do player."
            : "Nenhum vídeo encontrado."}
        </p>
      ) : (
        ordered
          .filter((t) => videos.some((v) => t.videoAreas.includes(v.area)))
          .map((t) => (
            <section
              key={t.id}
              aria-labelledby={`vd-${t.id}`}
              className="space-y-2"
            >
              <h2
                id={`vd-${t.id}`}
                className="flex items-center gap-2 font-bold"
              >
                <t.icon
                  className="size-5"
                  style={{ color: t.color }}
                  aria-hidden
                />{" "}
                {t.label}
              </h2>
              <div
                className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:thin]"
                role="list"
                aria-label={`Vídeos de ${t.label}`}
              >
                {videos
                  .filter((v) => t.videoAreas.includes(v.area))
                  .map((v) => (
                    <div
                      key={v.youtubeId}
                      role="listitem"
                      className="w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-[260px]"
                    >
                      <VideoCard video={v} onPlay={player.play} />
                    </div>
                  ))}
              </div>
            </section>
          ))
      )}

      <VideoPlayerDialog video={player.video} onClose={player.close} />
    </div>
  );
}
