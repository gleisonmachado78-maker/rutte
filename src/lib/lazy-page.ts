import { lazy, type ComponentType } from 'react';

/**
 * Telas carregadas sob demanda. Depois de uma atualização do site, um aparelho com a versão antiga aberta pede
 * pedaços (chunks) que não existem mais: em vez de quebrar a tela, recarrega uma vez para pegar a versão nova.
 */
const KEY = 'rutte:chunk-reload';

/** Recarrega a página (no máximo uma vez a cada 30 s). Devolve false se já tentou há pouco. */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* sem sessionStorage: recarrega mesmo assim */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('v', Date.now().toString(36));
  window.location.replace(url.toString());
  return true;
}

export const isChunkError = (err: unknown) =>
  /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically|ChunkLoadError|Unable to preload/i.test(String((err as Error)?.message ?? err));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyPage<M, C extends ComponentType<any>>(load: () => Promise<M>, pick: (m: M) => C) {
  return lazy(() =>
    load()
      .then((m) => ({ default: pick(m) }))
      .catch((err) => {
        // enquanto recarrega, não mostra erro
        if (isChunkError(err) && reloadForNewVersion()) return new Promise<{ default: C }>(() => {});
        throw err;
      }),
  );
}
