import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLinks } from '@/hooks/use-data';
import { parseIcs, type FeedEvent } from '@/lib/ics';
import type { LifeLink } from '@/types';

/** Item de calendário vindo do portal de um link (entrega, prova, aula…). */
export interface LinkEvent extends FeedEvent {
  link: LifeLink;
}

/** O calendário do portal passa pela função /api/ics do site (o navegador não lê o .ics direto). */
export const icsEnabled = () => typeof location !== 'undefined' && location.protocol === 'https:';

async function fetchFeed(url: string): Promise<FeedEvent[]> {
  const res = await fetch(`/api/ics?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error((await res.text()) || 'Não foi possível ler o calendário');
  return parseIcs(await res.text());
}

/** Eventos de todos os links que têm calendário conectado. */
export function useLinkFeeds() {
  const { data: links = [] } = useLinks();
  const withFeed = links.filter((l) => l.icsUrl);
  const results = useQueries({
    queries: withFeed.map((l) => ({
      queryKey: ['ics', l.icsUrl],
      queryFn: () => fetchFeed(l.icsUrl!),
      enabled: icsEnabled(),
      staleTime: 30 * 60 * 1000,
      retry: 1,
    })),
  });
  const events = useMemo<LinkEvent[]>(
    () => results.flatMap((r, i) => (r.data ?? []).map((e) => ({ ...e, link: withFeed[i] }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results.map((r) => r.dataUpdatedAt).join(','), withFeed.map((l) => l.id).join(',')],
  );
  const errors = Object.fromEntries(results.map((r, i) => [withFeed[i]?.id, r.error ? String((r.error as Error).message) : ''])) as Record<string, string>;
  const loading = results.some((r) => r.isLoading);
  return { events, errors, loading };
}
