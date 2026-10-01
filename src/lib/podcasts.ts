import type { TopicId } from './library';

export interface Podcast {
  topic: TopicId;
  /** id do programa no Spotify (open.spotify.com/show/ID) */
  spotifyId: string;
  title: string;
  host: string;
  /** capa vinda do oEmbed do Spotify */
  thumb: string;
  desc: string;
}

/** Podcasts em português, IDs conferidos via oEmbed do Spotify. */
export const PODCASTS: Podcast[] = [];
