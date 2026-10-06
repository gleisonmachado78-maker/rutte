import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { hasToken, isConfigured, listEvents, onGoogleChange, wantsGoogle } from '@/lib/google-calendar';

/** Estado da integração com o Google Agenda (atualiza ao conectar/desconectar). */
export function useGoogleStatus() {
  const [, bump] = useState(0);
  useEffect(() => onGoogleChange(() => bump((x) => x + 1)), []);
  return { configured: isConfigured(), connected: hasToken() || wantsGoogle() };
}

/** Eventos do Google Agenda no intervalo (só busca se estiver conectado). */
export function useGoogleEvents(from: Date, to: Date) {
  const { configured, connected } = useGoogleStatus();
  return useQuery({
    queryKey: ['gcal', from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)],
    queryFn: () => listEvents(from, to),
    enabled: configured && connected,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
