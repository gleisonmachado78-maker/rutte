import { Bell, CalendarDays, Database, GraduationCap, KeyRound, LogOut, MapPin, Moon, Palette, RotateCcw, Settings, ShieldCheck, Sparkles, Sun, Trash2, UserRound, WandSparkles, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/auth-gate';
import { AiKeyDialog } from '@/components/layout/ai-key-dialog';
import { BackupDialog } from '@/components/layout/backup-dialog';
import { AlertsDialog, GoogleCalendarDialog } from '@/components/layout/google-alerts-dialogs';
import { MapsKeyDialog } from '@/components/layout/maps-key-dialog';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { Select } from '@/components/ui/form-controls';
import { useResetData, useUser, useWipeData } from '@/hooks/use-data';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';

type TabId = 'geral' | 'alertas' | 'google' | 'ia' | 'maps' | 'dados';
const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'alertas', label: 'Alertas', icon: Bell },
  { id: 'google', label: 'Google Agenda', icon: CalendarDays },
  { id: 'ia', label: 'Rutte IA', icon: Sparkles },
  { id: 'maps', label: 'Google Maps', icon: MapPin },
  { id: 'dados', label: 'Dados', icon: Database },
];

function Card({ icon: Icon, title, desc, children }: { icon: LucideIcon; title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="size-5 text-primary" aria-hidden /> {title}
      </h2>
      {desc && <p className="mt-1 text-sm text-foreground/65">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-foreground/55">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function GeneralTab() {
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const motion = useUI((s) => s.motion);
  const setMotion = useUI((s) => s.setMotion);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setTourOpen = useUI((s) => s.setTourOpen);
  const { data: user } = useUser();
  const auth = useAuth();
  return (
    <div className="space-y-4">
      <Card icon={Palette} title="Aparência">
        <Row label="Tema" hint="Claro ou escuro.">
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />} {theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
          </Button>
        </Row>
        <Row label="Animações" hint="Automático segue a configuração do aparelho.">
          <Select value={motion} onChange={(e) => setMotion(e.target.value as typeof motion)} aria-label="Animações" className="w-auto">
            <option value="auto">Automático</option>
            <option value="on">Sempre ligadas</option>
            <option value="off">Desligadas</option>
          </Select>
        </Row>
      </Card>

      <Card icon={WandSparkles} title="Personalização">
        <Row label="Deixar a Rutte do seu jeito" hint="Seu nome, rotina, objetivos e áreas que aparecem no menu.">
          <Button variant="outline" onClick={() => setOnboardingOpen(true)}>
            <WandSparkles className="size-4" /> Personalizar
          </Button>
        </Row>
        <Row label="Tutorial de boas-vindas" hint="Mostra de novo o passo a passo das telas.">
          <Button variant="outline" onClick={() => setTourOpen(true)}>
            <GraduationCap className="size-4" /> Ver tutorial
          </Button>
        </Row>
      </Card>

      <Card icon={UserRound} title="Conta">
        <Row label="Nome" hint="Como a Rutte chama você.">
          <span className="text-sm text-foreground/80">{user?.name || '—'}</span>
        </Row>
        {auth.email && (
          <Row label="E-mail de acesso">
            <span className="break-all text-sm text-foreground/80">{auth.email}</span>
          </Row>
        )}
        {auth.isAdmin && (
          <Row label="Administração" hint="Contas, pedidos de acesso e senhas.">
            <Button asChild variant="outline">
              <Link to="/admin">
                <ShieldCheck className="size-4" /> Abrir
              </Link>
            </Button>
          </Row>
        )}
        <Row label="Privacidade e termos">
          <span className="flex gap-3 text-sm">
            <a href="/privacidade" target="_blank" className="font-medium text-primary hover:underline">Privacidade</a>
            <a href="/termos" target="_blank" className="font-medium text-primary hover:underline">Termos</a>
          </span>
        </Row>
        {auth.email && (
          <Row label="Sair desta conta">
            <Button variant="outline" onClick={() => auth.signOut()}>
              <LogOut className="size-4" /> Sair
            </Button>
          </Row>
        )}
      </Card>
    </div>
  );
}

function DataTab() {
  const reset = useResetData();
  const wipe = useWipeData();
  return (
    <div className="space-y-4">
      <BackupDialog inline />
      <Card icon={KeyRound} title="Zona de cuidado" desc="Ações que substituem ou apagam seus dados neste aparelho. Faça um backup antes.">
        <Row label="Restaurar exemplos" hint="Troca tudo pelos dados de exemplo da Rutte.">
          <Button
            variant="outline"
            onClick={async () =>
              (await askConfirm({ title: 'Restaurar dados de exemplo?', message: 'Todos os seus afazeres, treinos e avaliações serão substituídos pelos exemplos.', confirmLabel: 'Substituir tudo', danger: true })) && reset.mutate()
            }
          >
            <RotateCcw className="size-4" /> Restaurar
          </Button>
        </Row>
        <Row label="Apagar meus dados" hint="Volta ao estado de primeiro acesso. Não dá para desfazer.">
          <Button
            variant="danger"
            onClick={async () =>
              (await askConfirm({ title: 'Apagar todos os seus dados?', message: 'Afazeres, notas, treinos, avaliações, perfil e conversas com a Rutte IA serão apagados deste aparelho.', confirmLabel: 'Apagar tudo', danger: true })) && wipe.mutate()
            }
          >
            <Trash2 className="size-4" /> Apagar
          </Button>
        </Row>
      </Card>
    </div>
  );
}

/** Aba Configurações: tudo o que dá para ajustar na Rutte, organizado em seções. */
export function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'geral') as TabId;
  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Settings className="size-7 text-primary" aria-hidden /> Configurações
        </h1>
        <p className="text-sm text-foreground/60">Aparência, alertas, integrações, Rutte IA e seus dados.</p>
      </header>

      <div role="tablist" aria-label="Seções" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'geral' ? {} : { tab: t.id }, { replace: true })}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold transition-colors',
              tab === t.id ? 'border-primary bg-primary text-white' : 'border-border bg-card text-foreground/70 hover:text-foreground',
            )}
          >
            <t.icon className="size-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="max-w-3xl">
        {tab === 'geral' && <GeneralTab />}
        {tab === 'alertas' && <AlertsDialog inline />}
        {tab === 'google' && <GoogleCalendarDialog inline />}
        {tab === 'ia' && <AiKeyDialog inline />}
        {tab === 'maps' && <MapsKeyDialog inline />}
        {tab === 'dados' && <DataTab />}
      </div>
    </div>
  );
}
