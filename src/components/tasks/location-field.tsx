import { Car, Bus, Footprints, MapPin, Navigation, PersonStanding, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/form-controls';
import { directionsUrl, getMapsKey, loadGoogleMaps, mapsUrl, shortPlace, wazeUrl, type TravelMode } from '@/lib/maps';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { TaskLocation } from '@/types';

/** Chave do Google Maps (atualiza quando é salva nas Configurações). */
export function useMapsKey() {
  const [key, setKey] = useState(getMapsKey);
  useEffect(() => {
    const on = () => setKey(getMapsKey());
    window.addEventListener('rutte:maps-key', on);
    return () => window.removeEventListener('rutte:maps-key', on);
  }, []);
  return key;
}

const MODES: { mode: TravelMode; icon: typeof Car }[] = [
  { mode: 'driving', icon: Car },
  { mode: 'transit', icon: Bus },
  { mode: 'walking', icon: Footprints },
];

/** Botões "Como chegar" (Google Maps por modo + Waze) — funcionam sem chave. */
export function RouteLinks({ location, compact }: { location: TaskLocation; compact?: boolean }) {
  const label = { driving: 'Carro', transit: 'Transporte', walking: 'A pé' } as const;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', compact && 'gap-1')}>
      {!compact && <span className="mr-0.5 text-xs font-semibold text-foreground/60">Como chegar:</span>}
      {MODES.map(({ mode, icon: Icon }) => (
        <a
          key={mode}
          href={directionsUrl(location, mode)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium hover:border-primary hover:text-primary"
          aria-label={`Como chegar de ${label[mode].toLowerCase()} (abre o Google Maps)`}
        >
          <Icon className="size-3.5" aria-hidden /> {label[mode]}
        </a>
      ))}
      <a
        href={wazeUrl(location)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium hover:border-primary hover:text-primary"
        aria-label="Navegar com o Waze"
      >
        <Navigation className="size-3.5" aria-hidden /> Waze
      </a>
    </div>
  );
}

/** Mini-mapa com o ponto do local (precisa da chave e das coordenadas). */
function MiniMap({ location, apiKey }: { location: TaskLocation; apiKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const theme = useUI((s) => s.theme);

  useEffect(() => {
    let cancelled = false;
    if (location.lat == null || location.lng == null || !ref.current) return;
    (async () => {
      try {
        await loadGoogleMaps(apiKey);
        const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
        if (cancelled || !ref.current) return;
        const center = { lat: location.lat!, lng: location.lng! };
        const map = new Map(ref.current, {
          center,
          zoom: 16,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          colorScheme: theme === 'dark' ? google.maps.ColorScheme.DARK : google.maps.ColorScheme.LIGHT,
        });
        new AdvancedMarkerElement({ map, position: center, title: location.name || location.address });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey, location.lat, location.lng, location.name, location.address, theme]);

  if (failed || location.lat == null) return null;
  return <div ref={ref} className="h-44 w-full overflow-hidden rounded-xl border border-border bg-muted" role="img" aria-label={`Mapa de ${shortPlace(location)}`} />;
}

/** Resumo do local escolhido: nome, endereço, mapa e rotas. */
export function LocationPreview({ location, apiKey, onClear }: { location: TaskLocation; apiKey?: string; onClear?: () => void }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-card p-3">
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          {location.name && <p className="font-semibold leading-snug">{location.name}</p>}
          <a href={mapsUrl(location)} target="_blank" rel="noreferrer" className="text-sm text-foreground/75 hover:text-primary hover:underline">
            {location.address}
          </a>
        </div>
        {onClear && (
          <button type="button" onClick={onClear} className="grid size-7 shrink-0 place-items-center rounded-md text-foreground/50 hover:bg-muted hover:text-primary" aria-label="Remover local">
            <X className="size-4" />
          </button>
        )}
      </div>
      {apiKey && <MiniMap location={location} apiKey={apiKey} />}
      <RouteLinks location={location} />
    </div>
  );
}

/**
 * Campo de endereço. Com a chave do Google Maps: autocompletar (PlaceAutocompleteElement).
 * Sem a chave (ou se o Google falhar): campo de texto comum.
 */
export function LocationField({ value, onChange }: { value?: TaskLocation; onChange: (l: TaskLocation | undefined) => void }) {
  const apiKey = useMapsKey();
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [text, setText] = useState(value?.address ?? '');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!apiKey || value) return;
    let cancelled = false;
    let el: google.maps.places.PlaceAutocompleteElement | null = null;
    const onAuthFail = () => setStatus('error');
    window.addEventListener('rutte:maps-auth-failure', onAuthFail);
    setStatus('loading');
    (async () => {
      try {
        await loadGoogleMaps(apiKey);
        const { PlaceAutocompleteElement } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
        if (cancelled || !host.current) return;
        el = new PlaceAutocompleteElement({ includedRegionCodes: ['br'], requestedLanguage: 'pt-BR' });
        el.id = 'f-location';
        el.style.width = '100%';
        el.addEventListener('gmp-select', async (ev) => {
          const place = ev.placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
          onChangeRef.current({
            address: place.formattedAddress ?? place.displayName ?? '',
            name: place.displayName ?? undefined,
            placeId: place.id,
            lat: place.location?.lat(),
            lng: place.location?.lng(),
          });
        });
        el.addEventListener('gmp-error', () => setStatus('error'));
        host.current.replaceChildren(el);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      window.removeEventListener('rutte:maps-auth-failure', onAuthFail);
      el?.remove();
    };
  }, [apiKey, value]);

  if (value) return <LocationPreview location={value} apiKey={apiKey || undefined} onClear={() => (onChange(undefined), setText(''))} />;

  const useGoogle = apiKey && status !== 'error';
  return (
    <div className="space-y-1.5">
      {useGoogle ? (
        <>
          <div ref={host} className="rutte-place-input min-h-10" />
          {status === 'loading' && <p className="text-xs text-foreground/50">Carregando sugestões do Google…</p>}
        </>
      ) : (
        <div className="flex gap-2">
          <Input
            id="f-location"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                e.preventDefault();
                onChange({ address: text.trim() });
              }
            }}
            onBlur={() => text.trim() && onChange({ address: text.trim() })}
            placeholder="Rua, número, bairro, cidade ou nome do lugar"
            autoComplete="street-address"
          />
        </div>
      )}
      {status === 'error' && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          O Google Maps não respondeu (confira a chave em Configurações). Você pode digitar o endereço normalmente.
        </p>
      )}
      {!apiKey && (
        <p className="flex items-center gap-1 text-xs text-foreground/50">
          <PersonStanding className="size-3.5" aria-hidden /> Para sugestões de endereço e mapa, adicione sua chave do Google Maps em Configurações.
        </p>
      )}
    </div>
  );
}
