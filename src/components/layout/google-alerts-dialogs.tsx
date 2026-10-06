import { useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, BellRing, CalendarCheck2, CalendarDays, ExternalLink, Loader2, LogOut, Send, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/form-controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useAuth } from '@/components/auth/auth-gate';
import { useGoogleStatus } from '@/hooks/use-google';
import { askPermission, fireAlert, getAlertSettings, notify, permission, planAlerts, playChime, saveAlertSettings, type AlertSettings } from '@/lib/alerts';
import { disablePush, enablePush, pushSupported, syncReminders } from '@/lib/push';
import { useTasks } from '@/hooks/use-data';
import { addDays } from 'date-fns';
import { connectGoogle, disconnectGoogle, getClientId, getClientOverride, setClientId } from '@/lib/google-calendar';

type DProps = { open: boolean; onOpenChange: (o: boolean) => void };

/* ------------------------------------------- Google Agenda ------------------------------------------- */

export function GoogleCalendarDialog({ open, onOpenChange }: DProps) {
  const { configured, connected } = useGoogleStatus();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [cid, setCid] = useState(getClientOverride);

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

        {/* Configuração do administrador */}
        {isAdmin && (
          <details className="mt-5 rounded-xl border border-border p-3 text-sm" open={!configured}>
            <summary className="cursor-pointer font-semibold">Configuração (administrador)</summary>

            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-foreground/80">
              <dt className="text-foreground/55">Projeto</dt>
              <dd>Rutte (Google Cloud, <code>rutte-510817</code>)</dd>
              <dt className="text-foreground/55">Client ID</dt>
              <dd className="break-all font-mono text-xs">{getClientId()}</dd>
              <dt className="text-foreground/55">Site autorizado</dt>
              <dd><code>https://rutte.vercel.app</code></dd>
              <dt className="text-foreground/55">Situação</dt>
              <dd>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">Em teste</span> — só os e-mails cadastrados como usuários de teste conseguem conectar (até 100).
              </dd>
            </dl>

            <p className="mt-3 font-semibold">Liberar para um cliente</p>
            <p className="text-foreground/70">
              Em{' '}
              <a href="https://console.cloud.google.com/auth/audience?project=rutte-510817" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
                Google Cloud → Público <ExternalLink className="size-3" aria-hidden />
              </a>
              , clique em <strong>Add users</strong> e coloque o e-mail Google do cliente.
            </p>

            <p className="mt-3 font-semibold">Liberar para todos (verificação do Google)</p>
            <ul className="list-disc space-y-0.5 pl-5 text-foreground/70">
              <li>Página inicial: <a href="/sobre" target="_blank" className="text-primary hover:underline">rutte.vercel.app/sobre</a> ✓</li>
              <li>Política de Privacidade: <a href="/privacidade" target="_blank" className="text-primary hover:underline">rutte.vercel.app/privacidade</a> ✓</li>
              <li>Termos de Uso: <a href="/termos" target="_blank" className="text-primary hover:underline">rutte.vercel.app/termos</a> ✓</li>
              <li>Domínio próprio (ex.: rutte.com.br) ligado ao Vercel — pendente</li>
              <li>
                Enviar para verificação em{' '}
                <a href="https://console.cloud.google.com/auth/verification?project=rutte-510817" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
                  Central de verificação <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            </ul>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-foreground/55">Usar outro Client ID só neste aparelho (testes)</summary>
              <div className="mt-2 flex gap-2">
                <Input id="gcid" value={cid} onChange={(e) => setCid(e.target.value)} placeholder="000000000000-xxxx.apps.googleusercontent.com" className="font-mono text-xs" aria-label="Client ID para testes" />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (cid.trim() && !/\.apps\.googleusercontent\.com$/.test(cid.trim())) return toast.error('Esse não parece um Client ID do Google.');
                    setClientId(cid);
                    toast.success(cid.trim() ? 'Client ID de teste salvo neste aparelho' : 'Voltou a usar o Client ID da Rutte');
                  }}
                >
                  Salvar
                </Button>
              </div>
              <p className="mt-1 text-xs text-foreground/55">Deixe vazio e salve para voltar ao Client ID oficial da Rutte.</p>
            </details>
          </details>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------- Alertas --------------------------------------------- */

function Toggle({ id, checked, onChange, label, hint, icon }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string; icon: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/50">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-foreground/60">{hint}</span>
      </span>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0 cursor-pointer accent-[#E0393A]" />
    </label>
  );
}

export function AlertsDialog({ open, onOpenChange }: DProps) {
  const [s, setS] = useState<AlertSettings>(getAlertSettings);
  const [perm, setPerm] = useState(permission());
  const [busyPush, setBusyPush] = useState(false);
  const { data: tasks = [] } = useTasks();
  const update = (patch: Partial<AlertSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    saveAlertSettings(next);
    return next;
  };

  const enable = async () => {
    const p = await askPermission();
    setPerm(p);
    playChime(); // também destrava o som neste aparelho
    if (p === 'granted') {
      update({ enabled: true });
      toast.success('Alertas ligados');
      notify('🔔 Alertas da Rutte ligados', 'Você será avisado antes dos seus compromissos.', { tag: 'rutte-test' });
    } else {
      // sem notificação do sistema: continuam os avisos na tela, com som
      update({ enabled: true });
      if (p === 'denied') toast.warning('Notificações bloqueadas no navegador', { description: 'Os avisos aparecem na tela da Rutte com som. Para receber fora do app, libere as notificações do site (cadeado ao lado do endereço).' });
      else if (p === 'unsupported') toast.warning('Este navegador não mostra notificações', { description: 'Os avisos aparecem na tela da Rutte com som. No iPhone, instale a Rutte na tela de início para receber fora do app.' });
    }
  };

  const togglePush = async (on: boolean) => {
    setBusyPush(true);
    try {
      if (on) {
        await enablePush();
        const next = update({ push: true });
        const now = new Date();
        await syncReminders(planAlerts(tasks, [], now, addDays(now, 7), next));
        toast.success('Pronto: a Rutte avisa mesmo fechada');
      } else {
        update({ push: false });
        await disablePush();
        toast('Alertas com o app fechado desligados');
      }
    } catch (e) {
      update({ push: false });
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyPush(false);
    }
  };

  const on = s.enabled;
  const canPush = pushSupported() && perm === 'granted';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
          <Bell className="size-5 text-primary" aria-hidden /> Alertas no aparelho
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-foreground/70">
          A Rutte avisa com som e na tela quando algo precisa ser feito — dentro do app, com ele minimizado e até fechado.
        </DialogDescription>

        {!on ? (
          <div className="mt-4 space-y-2">
            <Button onClick={enable}>
              <Bell className="size-4" aria-hidden /> Ligar alertas
            </Button>
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

            <Toggle id="al-sound" checked={s.sound} onChange={(v) => { update({ sound: v }); if (v) playChime(); }} icon={<Volume2 className="size-5" />} label="Tocar som" hint="Um toque curto junto com cada aviso." />
            <Toggle
              id="al-push"
              checked={s.push}
              onChange={(v) => !busyPush && void togglePush(v)}
              icon={busyPush ? <Loader2 className="size-5 animate-spin" /> : <BellRing className="size-5" />}
              label="Avisar mesmo com a Rutte fechada"
              hint={canPush ? 'Os próximos alertas (horário e título) ficam guardados com segurança no servidor só para isso.' : 'Precisa das notificações liberadas. No iPhone, instale a Rutte na tela de início.'}
            />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => fireAlert('🔔 Teste da Rutte', 'Assim chegam os seus alertas.', { tag: 'rutte-test' })}>
                <Send className="size-4" aria-hidden /> Testar na tela
              </Button>
              {perm === 'granted' && (
                <Button variant="outline" onClick={() => { playChime(); notify('🔔 Teste da Rutte', 'Assim chegam os alertas fora do app.', { tag: 'rutte-test-2' }); }}>
                  <BellRing className="size-4" aria-hidden /> Testar notificação
                </Button>
              )}
              <Button variant="ghost" onClick={() => { update({ enabled: false }); if (s.push) void togglePush(false); toast('Alertas desligados'); }}>
                <BellOff className="size-4" aria-hidden /> Desligar
              </Button>
            </div>
          </div>
        )}

        <ul className="mt-5 list-disc space-y-1 pl-5 text-xs text-foreground/60">
          <li><strong>Dentro do app:</strong> aviso destacado na tela, com som e vibração.</li>
          <li><strong>Fora do app:</strong> notificação do celular/computador, com o som do aparelho — inclusive com a Rutte fechada, se ligado acima.</li>
          <li>Avisa nos afazeres com horário, nos eventos do Google Agenda e no resumo da manhã.</li>
          <li>No iPhone, instale a Rutte na tela de início (Compartilhar → Adicionar à Tela de Início) e ligue os alertas por lá.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
