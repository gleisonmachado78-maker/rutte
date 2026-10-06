import { useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CalendarCheck2, CalendarDays, ExternalLink, Loader2, LogOut, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useAuth } from '@/components/auth/auth-gate';
import { useGoogleStatus } from '@/hooks/use-google';
import { askPermission, getAlertSettings, notify, permission, saveAlertSettings, type AlertSettings } from '@/lib/alerts';
import { connectGoogle, disconnectGoogle, getClientId, setClientId } from '@/lib/google-calendar';

type DProps = { open: boolean; onOpenChange: (o: boolean) => void };

/* ------------------------------------------- Google Agenda ------------------------------------------- */

export function GoogleCalendarDialog({ open, onOpenChange }: DProps) {
  const { configured, connected } = useGoogleStatus();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [cid, setCid] = useState(getClientId());

  const connect = async () => {
    setBusy(true);
    try {
      await connectGoogle(true);
      qc.invalidateQueries({ queryKey: ['gcal'] });
      toast.success('Google Agenda conectado', { description: 'Seus eventos aparecem no Calendário da Rutte.' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
          <CalendarDays className="size-5 text-primary" aria-hidden /> Google Agenda
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/70">
          Veja seus eventos do Google no Calendário da Rutte, receba alertas deles e envie afazeres para a sua agenda.
        </DialogDescription>

        {!configured ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-foreground/70">
            A conexão com o Google ainda está sendo preparada pelo administrador da Rutte. Assim que estiver pronta, o botão “Conectar” aparece aqui.
          </p>
        ) : connected ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <CalendarCheck2 className="size-5" aria-hidden /> Conectado. Seus eventos aparecem no Calendário.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/75">
              <li>No Calendário, os eventos do Google aparecem em azul.</li>
              <li>Em qualquer afazer, use “Enviar para o Google Agenda”.</li>
              <li>Ative os “Alertas no aparelho” para ser avisado antes dos eventos.</li>
            </ul>
            <Button variant="outline" onClick={() => { disconnectGoogle(); qc.removeQueries({ queryKey: ['gcal'] }); toast('Google Agenda desconectado'); }}>
              <LogOut className="size-4" aria-hidden /> Desconectar
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <Button onClick={connect} disabled={busy} className="w-full sm:w-auto">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CalendarDays className="size-4" aria-hidden />} Conectar com o Google
            </Button>
            <p className="text-xs text-foreground/55">Abre a janela do Google para você escolher a conta e autorizar. A Rutte só acessa os eventos da sua agenda, e o acesso fica guardado apenas neste aparelho.</p>
          </div>
        )}

        {/* Configuração do administrador: Client ID do Google Cloud */}
        {isAdmin && (
          <details className="mt-5 rounded-xl border border-border p-3 text-sm" open={!configured}>
            <summary className="cursor-pointer font-semibold">Configuração (administrador)</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-foreground/75">
              <li>
                No{' '}
                <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
                  Google Cloud <ExternalLink className="size-3" aria-hidden />
                </a>
                , ative a <strong>Google Calendar API</strong>.
              </li>
              <li>Em “Tela de permissão OAuth”, crie o app (Externo) e adicione o escopo de eventos do Calendar.</li>
              <li>Em “Credenciais”, crie um <strong>ID do cliente OAuth</strong> do tipo <strong>Aplicativo da Web</strong>, com a origem <code>https://rutte.vercel.app</code>.</li>
              <li>Cole o ID abaixo (termina em <code>.apps.googleusercontent.com</code>).</li>
            </ol>
            <Label htmlFor="gcid" className="mt-3 block">Client ID</Label>
            <div className="mt-1 flex gap-2">
              <Input id="gcid" value={cid} onChange={(e) => setCid(e.target.value)} placeholder="000000000000-xxxx.apps.googleusercontent.com" className="font-mono text-xs" />
              <Button
                variant="outline"
                onClick={() => {
                  if (cid.trim() && !/\.apps\.googleusercontent\.com$/.test(cid.trim())) return toast.error('Esse não parece um Client ID do Google.');
                  setClientId(cid);
                  toast.success(cid.trim() ? 'Client ID salvo neste aparelho' : 'Client ID removido');
                }}
              >
                Salvar
              </Button>
            </div>
            <p className="mt-2 text-xs text-foreground/55">Salvo aqui, vale só neste aparelho (bom para testar). Para valer para todos, peça para colocar o ID no código da Rutte.</p>
          </details>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------- Alertas --------------------------------------------- */

export function AlertsDialog({ open, onOpenChange }: DProps) {
  const [s, setS] = useState<AlertSettings>(getAlertSettings);
  const [perm, setPerm] = useState(permission());
  const update = (patch: Partial<AlertSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    saveAlertSettings(next);
  };

  const enable = async () => {
    const p = await askPermission();
    setPerm(p);
    if (p === 'granted') {
      update({ enabled: true });
      toast.success('Alertas ligados');
      notify('🔔 Alertas da Rutte ligados', 'Você será avisado antes dos seus compromissos.', { tag: 'rutte-test' });
    } else if (p === 'denied') {
      toast.error('O navegador bloqueou as notificações', { description: 'Libere nas configurações do site (cadeado ao lado do endereço) e tente de novo.' });
    } else if (p === 'unsupported') {
      toast.error('Este navegador não mostra notificações.', { description: 'No iPhone, instale a Rutte na tela de início (Compartilhar → Adicionar à Tela de Início) e abra por lá.' });
    }
  };

  const on = s.enabled && perm === 'granted';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
          <Bell className="size-5 text-primary" aria-hidden /> Alertas no aparelho
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/70">
          A Rutte avisa com uma notificação no celular ou no computador quando algo precisa ser feito.
        </DialogDescription>

        {!on ? (
          <div className="mt-4 space-y-2">
            <Button onClick={enable}>
              <Bell className="size-4" aria-hidden /> Ligar alertas
            </Button>
            {perm === 'denied' && <p className="text-xs text-primary">As notificações estão bloqueadas para este site. Libere nas configurações do navegador.</p>}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="al-lead">Avisar antes de cada compromisso</Label>
                <Select id="al-lead" value={String(s.lead)} onChange={(e) => update({ lead: Number(e.target.value) })}>
                  <option value="0">Na hora</option>
                  <option value="5">5 minutos antes</option>
                  <option value="15">15 minutos antes</option>
                  <option value="30">30 minutos antes</option>
                  <option value="60">1 hora antes</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="al-morning">Resumo do dia</Label>
                <Select id="al-morning" value={s.morning} onChange={(e) => update({ morning: e.target.value })}>
                  <option value="">Não enviar</option>
                  {['06:00', '07:00', '08:00', '09:00', '10:00'].map((h) => (
                    <option key={h} value={h}>Às {h}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => notify('🔔 Teste da Rutte', 'Assim chegam os seus alertas.', { tag: 'rutte-test' })}>
                <Send className="size-4" aria-hidden /> Enviar um teste
              </Button>
              <Button variant="ghost" onClick={() => { update({ enabled: false }); toast('Alertas desligados'); }}>
                <BellOff className="size-4" aria-hidden /> Desligar
              </Button>
            </div>
          </div>
        )}

        <ul className="mt-5 list-disc space-y-1 pl-5 text-xs text-foreground/60">
          <li>Avisa nos afazeres que têm horário, nos eventos do Google Agenda (se conectado) e manda o resumo da manhã.</li>
          <li>Funciona com a Rutte aberta ou minimizada. Se o app for fechado por completo, os avisos voltam quando você abrir.</li>
          <li>No iPhone, instale a Rutte na tela de início e ligue os alertas por lá (exigência da Apple).</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
