/**
 * Fotos dos "Grandes nomes": vêm da Wikipédia em português (imagens livres do Wikimedia Commons).
 * Uma única consulta para todos, guardada no aparelho por 30 dias. Sem foto livre → foto do canal oficial no YouTube
 * (`photo` em mentors.ts); sem nenhuma → capa do podcast.
 */
import { useEffect, useState } from 'react';
import { MENTORS } from './mentors';

type Photo = { src: string; page: string; from: string };
const KEY = 'rutte:mentor-photos:v3';

/** Fotos fixas dos canais oficiais (não precisam de consulta). */
const CHANNEL: Record<string, Photo> = Object.fromEntries(
  MENTORS.filter((m) => m.photo).map((m) => [m.id, { src: m.photo!, page: m.photoFrom ?? '', from: 'canal oficial no YouTube' }]),
);
const TTL = 30 * 24 * 60 * 60 * 1000;

let cache: Record<string, Photo> | null = null;
let pending: Promise<Record<string, Photo>> | null = null;

function readCache(): Record<string, Photo> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { at, photos } = JSON.parse(raw) as { at: number; photos: Record<string, Photo> };
    return Date.now() - at < TTL ? photos : null;
  } catch {
    return null;
  }
}

async function fetchPhotos(): Promise<Record<string, Photo>> {
  const withWiki = MENTORS.filter((m) => m.wiki);
  const url =
    'https://pt.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&redirects=1' +
    '&prop=pageimages|pageprops&piprop=thumbnail&pithumbsize=400&pilicense=free&ppprop=disambiguation' +
    `&titles=${encodeURIComponent(withWiki.map((m) => m.wiki).join('|'))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as {
    query?: {
      normalized?: { from: string; to: string }[];
      redirects?: { from: string; to: string }[];
      pages?: { title: string; missing?: boolean; thumbnail?: { source: string }; pageprops?: { disambiguation?: string } }[];
    };
  };
  const q = data.query ?? {};
  // título pedido → título final (normalização e redirecionamentos)
  const final = (t: string) => {
    let x = q.normalized?.find((n) => n.from === t)?.to ?? t;
    x = q.redirects?.find((r) => r.from === x)?.to ?? x;
    return x;
  };
  const photos: Record<string, Photo> = {};
  for (const m of withWiki) {
    const title = final(m.wiki!);
    const page = q.pages?.find((p) => p.title === title);
    if (page && !page.missing && !page.pageprops?.disambiguation && page.thumbnail?.source) {
      photos[m.id] = { src: page.thumbnail.source, page: `https://pt.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`, from: 'Wikipédia' };
    }
  }
  // fotos avulsas do Commons (só quando a página da Wikipédia não tem uma)
  for (const m of MENTORS) {
    if (m.commons && !photos[m.id]) {
      photos[m.id] = {
        src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(m.commons)}?width=400`,
        page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(m.commons.replace(/ /g, '_'))}`,
        from: 'Wikimedia Commons',
      };
    }
  }
  try {
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), photos }));
  } catch {
    /* sem espaço: segue só na memória */
  }
  return photos;
}

/** Mapa id → foto. Começa vazio e preenche quando a consulta volta (ou na hora, se já estiver guardada). */
export function useMentorPhotos() {
  const [photos, setPhotos] = useState<Record<string, Photo>>(() => (cache ??= readCache()) ?? {});
  useEffect(() => {
    if (cache) return;
    pending ??= fetchPhotos().catch(() => ({}));
    let alive = true;
    pending.then((p) => {
      cache = p;
      if (alive) setPhotos(p);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { ...CHANNEL, ...photos };
}
