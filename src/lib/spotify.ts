/**
 * Abrir conteúdo no Spotify: tenta o app (spotify:...) e, se ele não abrir em ~1,5 s,
 * cai para o site (open.spotify.com), que no celular também oferece abrir o app.
 */

export type SpotifyKind = 'show' | 'episode' | 'audiobook' | 'search';

export const spotifyWebUrl = (kind: SpotifyKind, id: string) =>
  kind === 'search' ? `https://open.spotify.com/search/${encodeURIComponent(id)}` : `https://open.spotify.com/${kind}/${id}`;

const spotifyAppUri = (kind: SpotifyKind, id: string) => (kind === 'search' ? `spotify:search:${encodeURIComponent(id)}` : `spotify:${kind}:${id}`);

export const spotifyEmbedUrl = (id: string) => `https://open.spotify.com/embed/show/${id}?utm_source=generator&theme=0`;

export function openSpotify(kind: SpotifyKind, id: string) {
  const web = spotifyWebUrl(kind, id);
  let left = false;
  const mark = () => {
    left = true;
  };
  window.addEventListener('blur', mark, { once: true });
  document.addEventListener('visibilitychange', mark, { once: true });
  window.setTimeout(() => {
    window.removeEventListener('blur', mark);
    document.removeEventListener('visibilitychange', mark);
    if (!left && document.visibilityState === 'visible') window.open(web, '_blank', 'noopener');
  }, 1500);
  window.location.href = spotifyAppUri(kind, id);
}

const q = (s: string) => encodeURIComponent(s);

/** Onde ouvir o audiolivro de um título (links de busca, sempre válidos). */
export function audiobookLinks(title: string, author: string) {
  const term = `${title} ${author.split(',')[0]}`;
  return [
    { label: 'Spotify', app: true, href: `https://open.spotify.com/search/${q(term)}/audiobooks`, search: term },
    { label: 'Audible', href: `https://www.audible.com.br/search?keywords=${q(term)}` },
    { label: 'Google Play', href: `https://play.google.com/store/search?q=${q(`${term} audiolivro`)}&c=books` },
    { label: 'Ubook', href: `https://www.ubook.com/busca?q=${q(title)}` },
  ];
}
