/**
 * Google Maps: chave, carregamento da API JavaScript e links de rota.
 * A chave é da conta Google Cloud da pessoa (Maps JavaScript API + Places API (New)).
 * Ela fica só no navegador (localStorage) ou em VITE_GOOGLE_MAPS_API_KEY no .env — nunca no código.
 */
import type { TaskLocation } from '@/types';

const KEY_STORAGE = 'rutte:maps-key';

export function getMapsKey(): string {
  try {
    const saved = localStorage.getItem(KEY_STORAGE)?.trim();
    if (saved) return saved;
  } catch {
    /* sem armazenamento */
  }
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? '';
}

export function setMapsKey(key: string) {
  try {
    if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* sem armazenamento */
  }
  window.dispatchEvent(new Event('rutte:maps-key'));
}

let loading: Promise<void> | null = null;
let loadedKey = '';

/**
 * Carregador oficial ("dynamic library import") do Google Maps.
 * Depois dele, `google.maps.importLibrary('places' | 'maps' | 'marker')` fica disponível.
 */
export function loadGoogleMaps(key: string): Promise<void> {
  if (loading && loadedKey === key) return loading;
  loadedKey = key;
  loading = new Promise<void>((resolve, reject) => {
    const w = window as unknown as { google?: { maps?: { importLibrary?: unknown } }; gm_authFailure?: () => void };
    if (w.google?.maps?.importLibrary) return resolve();
    // Chave inválida/sem permissão: o Google chama esta função global
    w.gm_authFailure = () => window.dispatchEvent(new Event('rutte:maps-auth-failure'));
    const params = new URLSearchParams({ key, v: 'weekly', language: 'pt-BR', region: 'BR', loading: 'async', callback: '__rutteMapsReady' });
    (window as unknown as Record<string, unknown>).__rutteMapsReady = () => resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    s.async = true;
    s.onerror = () => {
      loading = null;
      reject(new Error('Não foi possível carregar o Google Maps (sem internet ou chave bloqueada).'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/* --------------------------- Links (funcionam sem chave) --------------------------- */

export type TravelMode = 'driving' | 'transit' | 'walking';

export const TRAVEL_LABEL: Record<TravelMode, string> = {
  driving: 'Carro',
  transit: 'Transporte',
  walking: 'A pé',
};

const destination = (l: TaskLocation) => (l.lat != null && l.lng != null ? `${l.lat},${l.lng}` : l.address);

/** Rota até o local a partir de onde a pessoa estiver (abre o app do Google Maps no celular). */
export function directionsUrl(l: TaskLocation, mode: TravelMode = 'driving') {
  const p = new URLSearchParams({ api: '1', destination: destination(l), travelmode: mode });
  if (l.placeId) p.set('destination_place_id', l.placeId);
  return `https://www.google.com/maps/dir/?${p}`;
}

/** Ver o lugar no Google Maps. */
export function mapsUrl(l: TaskLocation) {
  const p = new URLSearchParams({ api: '1', query: l.name ? `${l.name}, ${l.address}` : destination(l) });
  if (l.placeId) p.set('query_place_id', l.placeId);
  return `https://www.google.com/maps/search/?${p}`;
}

/** Navegar pelo Waze. */
export function wazeUrl(l: TaskLocation) {
  return l.lat != null && l.lng != null
    ? `https://waze.com/ul?ll=${l.lat},${l.lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(l.address)}&navigate=yes`;
}

/** Texto curto para listas: nome do lugar ou começo do endereço. */
export const shortPlace = (l: TaskLocation) => l.name || l.address.split(',').slice(0, 2).join(',');
