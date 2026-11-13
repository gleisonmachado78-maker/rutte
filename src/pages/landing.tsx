import {
  ArrowRight,
  BellRing,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Dumbbell,
  Headphones,
  Heart,
  Lock,
  NotebookPen,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DevCredit } from '@/components/brand/credit';
import { RutteLogo } from '@/components/brand/rutte';
import { formatPrice, PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';

/**
 * Página de apresentação (pública). Aparece para quem ainda não entrou e em /sobre.
 * `onAuth` abre o login/cadastro dentro do portão; sem ele, os botões levam a "/?entrar" ou "/?criar".
 */

type AuthMode = 'entrar' | 'criar';

function AuthButton({ mode, onAuth, className, children }: { mode: AuthMode; onAuth?: (m: AuthMode) => void; className?: string; children: ReactNode }) {
  if (onAuth)
    return (
      <button type="button" onClick={() => onAuth(mode)} className={className}>
        {children}
      </button>
    );
  return (
    <Link to={`/?${mode}`} className={className}>
      {children}
    </Link>
  );
}

const FEATURES: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: CircleCheck, t: 'Afazeres', d: 'Prioridades, prazos, subtarefas, Kanban e repetição. O que importa hoje aparece primeiro.' },
  { icon: CalendarDays, t: 'Agenda + Google Agenda', d: 'Seus compromissos e os eventos do Google no mesmo calendário, com local e rota.' },
  { icon: BellRing, t: 'Alertas no celular', d: 'Aviso com som antes de cada compromisso e um resumo do dia toda manhã.' },
  { icon: Timer, t: 'Foco (Pomodoro)', d: 'Blocos de foco com pausas e sons de chuva, mar ou floresta para concentrar.' },
  { icon: NotebookPen, t: 'Notas', d: 'Blocos de notas com listas, imagens, fotos e desenho à mão livre.' },
  { icon: Sparkles, t: 'Rutte IA', d: 'Converse para criar afazeres, pesquisar na web e gerar relatórios da sua semana.' },
  { icon: PieChart, t: 'Roda da Vida', d: 'Veja o equilíbrio entre saúde, carreira, finanças, família e as outras áreas.' },
  { icon: Dumbbell, t: 'Academia', d: 'Treinos, cargas, recordes e gerador de treino com demonstração em 3D.' },
  { icon: Heart, t: 'Gratidão', d: 'Diário, respiração guiada, meditações e orações do dia.' },
  { icon: BookOpen, t: 'Biblioteca', d: 'Livros, vídeos, podcasts e grandes nomes organizados por tema.' },
];

const STEPS = [
  { t: 'Crie sua conta', d: 'Leva menos de um minuto. Só e-mail e senha (ou Google).' },
  { t: 'Conte seus objetivos', d: 'Seis perguntas rápidas e a Rutte ajusta menus, dicas e o seu plano inicial.' },
  { t: 'Organize e evolua', d: 'Planeje o dia, foque no que importa e acompanhe o equilíbrio da sua vida.' },
];

const FAQ = [
  { q: 'A Rutte é paga?', a: 'Durante o beta, todos os recursos estão liberados de graça. Quando os planos pagos chegarem, você será avisado com antecedência e o plano Grátis continua existindo.' },
  { q: 'Funciona no celular?', a: 'Sim. A Rutte abre no navegador do celular e pode ser instalada na tela inicial como um app (Android e iPhone), com alertas de compromissos.' },
  { q: 'Meus dados ficam seguros?', a: 'Cada conta só enxerga os próprios dados. Imagens das notas e PDFs ficam apenas no seu aparelho, e você pode exportar ou apagar tudo quando quiser.' },
  { q: 'Dá para separar vida pessoal e trabalho?', a: 'Sim. Existe o lado Pessoal e o lado Empresa, cada um com sua cor, seus afazeres e suas notas. Você alterna com um toque.' },
  { q: 'Preciso de chave para usar a IA?', a: 'A Rutte IA funciona com uma chave sua da Anthropic ou do Google Gemini (o Gemini tem plano gratuito). A chave fica só no seu aparelho.' },
];

/** Prévia do app desenhada com os próprios componentes (sem imagem): dá uma ideia real da interface. */
function AppPreview() {
  const tasks = [
    { t: 'Enviar proposta para o cliente', tag: 'Hoje · 10:00', done: true },
    { t: 'Treino de pernas', tag: 'Hoje · 18:30', done: false },
    { t: 'Ler 20 páginas', tag: 'Hoje', done: false },
  ];
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-x-clip px-1 py-6 sm:overflow-visible" aria-hidden>
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(255_46_59/0.35),transparent)] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1D2332] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 truncate text-[11px] text-white/40">rutte.vercel.app</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            <p className="font-brand text-lg font-bold">Bom dia, Ana 👋</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['5', 'hoje'],
                ['0', 'atrasadas'],
                ['3', 'pomodoros'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-white/5 p-2 text-center">
                  <p className="font-mono text-lg font-bold">{v}</p>
                  <p className="text-[10px] text-white/50">{l}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-1.5">
              {tasks.map((t) => (
                <li key={t.t} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className={cn('grid size-4 place-items-center rounded-md border-2', t.done ? 'border-emerald-500 bg-emerald-500' : 'border-white/30')}>
                    {t.done && <Check className="size-2.5 text-white" strokeWidth={4} />}
                  </span>
                  <span className={cn('min-w-0 flex-1 truncate text-xs', t.done && 'text-white/40 line-through')}>{t.t}</span>
                  <span className="shrink-0 text-[10px] text-white/45">{t.tag}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden flex-col items-center justify-center rounded-xl bg-white/[0.03] p-3 sm:flex">
            <svg viewBox="0 0 120 120" className="w-28">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(255 46 59 / .15)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#FF2E3B" strokeWidth="8" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="110" transform="rotate(-90 60 60)" />
              <text x="60" y="66" textAnchor="middle" className="fill-white font-mono text-[20px] font-bold">
                16:24
              </text>
            </svg>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF2E3B]">Foco</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-white/50">
              <Headphones className="size-3" /> Chuva
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, eyebrow, title, desc, children, className }: { id?: string; eyebrow?: string; title: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF2E3B]">{eyebrow}</p>}
        <h2 className="mt-2 font-brand text-3xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">{title}</h2>
        {desc && <p className="mt-3 text-white/65">{desc}</p>}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function LandingPage({ onAuth }: { onAuth?: (m: AuthMode) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const nav = [
    ['#recursos', 'Recursos'],
    ['#como-funciona', 'Como funciona'],
    ['#planos', 'Planos'],
    ['#perguntas', 'Perguntas'],
  ];
  return (
    <div className="min-h-dvh overflow-x-clip bg-navy text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_85%_-10%,rgb(185_27_28/0.30),transparent_60%),radial-gradient(700px_400px_at_0%_40%,rgb(127_29_28/0.25),transparent_60%)]" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-navy/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <a href="#topo" className="flex items-center gap-2.5" aria-label="Rutte, início">
            <RutteLogo className="w-9" />
            <span className="font-brand text-2xl font-bold">Rutte</span>
          </a>
          <nav aria-label="Seções" className="ml-8 hidden items-center gap-6 text-sm text-white/70 md:flex">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <AuthButton mode="entrar" onAuth={onAuth} className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold text-white/80 hover:text-white sm:inline-flex">
              Entrar
            </AuthButton>
            <AuthButton mode="criar" onAuth={onAuth} className="btn-neon inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white">
              Criar conta grátis
            </AuthButton>
          </div>
        </div>
      </header>

      <main id="topo" className="relative mx-auto max-w-6xl px-5">
        {/* --------------------------------- herói --------------------------------- */}
        <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Beta aberto · todos os recursos liberados
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-6xl">
              Organize o que você precisa fazer. <span className="text-[#FF2E3B]">Evolua</span> no que você precisa ser.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70 lg:mx-0">
              A Rutte é a sua secretária digital: afazeres, agenda, foco, notas e hábitos num só lugar, com uma assistente de IA que conhece a sua rotina.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <AuthButton mode="criar" onAuth={onAuth} className="btn-neon inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-bold text-white">
                Começar agora <ArrowRight className="size-4" aria-hidden />
              </AuthButton>
              <AuthButton mode="entrar" onAuth={onAuth} className="inline-flex h-12 items-center rounded-xl border border-white/15 px-6 text-[15px] font-semibold text-white/85 hover:bg-white/5">
                Já tenho conta
              </AuthButton>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/55 lg:justify-start">
              {[
                [Smartphone, 'Funciona no celular'],
                [Lock, 'Seus dados só seus'],
                [ShieldCheck, 'Sem cartão de crédito'],
              ].map(([Icon, t]) => {
                const I = Icon as LucideIcon;
                return (
                  <li key={t as string} className="flex items-center gap-1.5">
                    <I className="size-4 text-white/40" aria-hidden /> {t as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <AppPreview />
        </section>

        {/* --------------------------------- recursos --------------------------------- */}
        <Section id="recursos" eyebrow="Recursos" title="Tudo o que a sua rotina pede, num app só" desc="Pare de pular entre agenda, bloco de notas, cronômetro e planilhas. A Rutte junta o essencial e conversa entre si.">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <li key={f.t} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#B91B1C]/20 text-[#FF2E3B]">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 font-semibold">{f.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{f.d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#6D28D9]/20 to-transparent p-5 text-center sm:flex-row sm:text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#6D28D9]/30 text-[#A855F7]">
              <Briefcase className="size-5" aria-hidden />
            </span>
            <p className="text-sm text-white/75">
              <strong className="text-white">Pessoal e Empresa, separados.</strong> Alterne com um toque: o lado Empresa ganha cor própria e guarda seus afazeres e notas de trabalho à parte.
            </p>
          </div>
        </Section>

        {/* --------------------------------- como funciona --------------------------------- */}
        <Section id="como-funciona" eyebrow="Como funciona" title="Em três passos você já está no controle">
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="font-brand text-5xl font-bold text-white/10">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-white/60">{s.d}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* --------------------------------- planos --------------------------------- */}
        <Section id="planos" eyebrow="Planos" title="Comece grátis. Cresça quando quiser." desc="Durante o beta, todas as contas têm acesso completo, sem custo. Os planos pagos ainda vão chegar.">
          <div className="grid gap-4 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={cn('relative flex flex-col rounded-2xl border p-6', p.highlight ? 'border-[#FF2E3B]/60 bg-[#B91B1C]/10 shadow-[0_0_0_1px_rgb(255_46_59/.25),0_20px_60px_-30px_rgb(255_46_59/.6)]' : 'border-white/10 bg-white/[0.03]')}>
                {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-[#B91B1C] px-3 py-1 text-[11px] font-bold uppercase tracking-wide">Mais completo</span>}
                <p className="text-lg font-bold">{p.name}</p>
                <p className="text-sm text-white/60">{p.tagline}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="font-brand text-4xl font-bold">{formatPrice(p.price)}</span>
                  {p.price !== null && p.price > 0 && <span className="text-sm text-white/50">/mês</span>}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-white/80">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
                <AuthButton mode="criar" onAuth={onAuth} className={cn('mt-6 inline-flex h-11 items-center justify-center rounded-xl text-sm font-bold', p.highlight ? 'btn-neon text-white' : 'border border-white/15 text-white/85 hover:bg-white/5')}>
                  {p.price === 0 ? 'Criar conta grátis' : 'Testar no beta'}
                </AuthButton>
              </div>
            ))}
          </div>
        </Section>

        {/* --------------------------------- perguntas --------------------------------- */}
        <Section id="perguntas" eyebrow="Perguntas frequentes" title="Ficou alguma dúvida?">
          <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-3 px-5 py-4 text-left font-semibold">
                  <span className="flex-1">{f.q}</span>
                  <ChevronDown className={cn('size-5 shrink-0 text-white/50 transition-transform', open === i && 'rotate-180')} aria-hidden />
                </button>
                {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-white/65">{f.a}</p>}
              </div>
            ))}
          </div>
        </Section>

        {/* --------------------------------- chamada final --------------------------------- */}
        <section className="mb-16 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#B91B1C]/30 via-[#7F1D1C]/20 to-transparent px-6 py-12 text-center sm:px-12">
          <RutteLogo glow className="mx-auto w-16" />
          <h2 className="mt-4 font-brand text-3xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">Sua rotina organizada a partir de hoje</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">Crie sua conta em menos de um minuto e deixe a Rutte cuidar do resto.</p>
          <AuthButton mode="criar" onAuth={onAuth} className="btn-neon mt-7 inline-flex h-12 items-center gap-2 rounded-xl px-7 text-[15px] font-bold text-white">
            Criar conta grátis <ArrowRight className="size-4" aria-hidden />
          </AuthButton>
        </section>
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-sm text-white/55">
          <span className="flex items-center gap-2">
            <RutteLogo className="w-6" /> © {new Date().getFullYear()} Rutte
          </span>
          <Link to="/privacidade" className="hover:text-white">
            Privacidade
          </Link>
          <Link to="/termos" className="hover:text-white">
            Termos de Uso
          </Link>
          <DevCredit className="ml-auto text-sm" />
        </div>
      </footer>
    </div>
  );
}
