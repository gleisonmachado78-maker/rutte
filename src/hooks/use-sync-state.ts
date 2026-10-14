import { useEffect, useState } from 'react';
import { getSyncState, onSyncState, type SyncState } from '@/services/sync';

/** Situação do salvamento na nuvem (para mostrar "Salvo na nuvem", "Salvando…" etc.). */
export function useSyncState(): SyncState {
  const [s, setS] = useState(getSyncState);
  useEffect(() => {
    const off = onSyncState(setS);
    return () => {
      off();
    };
  }, []);
  return s;
}

export const SYNC_LABEL: Record<SyncState, string> = {
  saved: 'Salvo na nuvem',
  saving: 'Salvando na nuvem…',
  offline: 'Sem internet · salva ao voltar',
  error: 'Não salvou na nuvem · tentando de novo',
  local: 'Perfil e configurações',
};
