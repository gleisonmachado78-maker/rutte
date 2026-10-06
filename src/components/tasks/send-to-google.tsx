import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useGoogleStatus } from '@/hooks/use-google';
import { addTaskToGoogle } from '@/lib/google-calendar';
import type { Task } from '@/types';

/** Botão do rodapé do afazer: cria o evento no Google Agenda (só aparece com o Google conectado). */
export function SendToGoogle({ task, icon }: { task: Task; icon: ReactNode }) {
  const { connected } = useGoogleStatus();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  if (!connected) return null;
  const send = async () => {
    setBusy(true);
    try {
      const link = await addTaskToGoogle(task);
      qc.invalidateQueries({ queryKey: ['gcal'] });
      toast.success('Enviado para o Google Agenda', link ? { action: { label: 'Abrir', onClick: () => window.open(link, '_blank', 'noopener') } } : undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button type="button" variant="outline" onClick={send} disabled={busy} title="Enviar para o Google Agenda">
      {busy ? <Loader2 className="animate-spin" /> : icon}
      <span className="hidden sm:inline">Google Agenda</span>
    </Button>
  );
}
