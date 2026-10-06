import { ArrowRight, BellRing, BookOpen, CalendarDays, CircleCheck, Dumbbell, Heart, NotebookPen, PieChart, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DevCredit } from '@/components/brand/credit';
import { RutteLogo } from '@/components/brand/rutte';

/** Páginas públicas (abrem sem login): página inicial, Política de Privacidade e Termos de Uso. */

const CONTACT = 'gleisonmachado78@gmail.com';
const UPDATED = '6 de outubro de 2026';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-navy text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_85%_110%,rgb(185_27_28/0.35),transparent_60%),radial-gradient(700px_400px_at_5%_-10%,rgb(127_29_28/0.4),transparent_60%)]" aria-hidden />
      <header className="relative mx-auto flex max-w-5xl items-center gap-3 px-5 py-5">
        <Link to="/sobre" className="flex items-center gap-2.5">
          <RutteLogo className="w-10" />
          <span className="font-brand text-2xl font-bold">Rutte</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm text-white/75">
          <Link to="/privacidade" className="hidden hover:text-white sm:inline">Privacidade</Link>
          <Link to="/termos" className="hidden hover:text-white sm:inline">Termos</Link>
          <Link to="/" className="rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:brightness-110">Entrar</Link>
        </nav>
      </header>
      <main className="relative mx-auto max-w-5xl px-5 pb-16">{children}</main>
      <footer className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-6 text-sm text-white/55">
          <span>© 2026 Rutte</span>
          <Link to="/privacidade" className="hover:text-white">Política de Privacidade</Link>
          <Link to="/termos" className="hover:text-white">Termos de Uso</Link>
          <a href={`mailto:${CONTACT}`} className="hover:text-white">{CONTACT}</a>
          <DevCredit className="ml-auto text-sm" />
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------- página inicial ------------------------------------------- */

const ORGANIZE = [
  { icon: CircleCheck, t: 'Afazeres', d: 'Prioridade, prazos, subtarefas, Kanban e recorrência.' },
  { icon: CalendarDays, t: 'Agenda', d: 'Seu calendário com os eventos do Google Agenda juntos.' },
  { icon: BellRing, t: 'Alertas', d: 'Aviso com som antes de cada compromisso, até com o app fechado.' },
  { icon: Timer, t: 'Foco', d: 'Pomodoro para render sem distração.' },
  { icon: NotebookPen, t: 'Notas', d: 'Blocos com caixas de texto e listas.' },
];
const EVOLVE = [
  { icon: PieChart, t: 'Roda da Vida', d: 'Veja o equilíbrio entre as áreas da sua vida.' },
  { icon: Dumbbell, t: 'Academia', d: 'Treinos, cargas e evolução mês a mês.' },
  { icon: Heart, t: 'Gratidão', d: 'Diário, meditações e orações.' },
  { icon: BookOpen, t: 'Biblioteca', d: 'Livros, vídeos, podcasts e grandes nomes.' },
];

function Feature({ f }: { f: (typeof ORGANIZE)[number] }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-colors hover:border-primary/40 hover:bg-white/[0.06]">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-neon ring-1 ring-primary/30">
        <f.icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 font-bold">{f.t}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/65">{f.d}</p>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-neon">{kicker}</p>
      <h2 className="mt-2 font-brand text-3xl font-bold sm:text-4xl">{title}</h2>
    </div>
  );
}

export function AboutPage() {
  return (
    <Shell>
      {/* topo: texto + celular com a tela real */}
      <section className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
            <span className="size-2 rounded-full bg-neon shadow-[0_0_10px_rgba(255,46,59,.9)]" aria-hidden /> Sua secretária digital
          </span>
          <h1 className="mt-5 font-brand text-5xl font-bold leading-[1.05] sm:text-6xl">
            Organize o dia.
            <br />
            <span className="italic text-neon">Evolua</span> a vida.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0">
            A Rutte junta afazeres, agenda, alertas, foco e desenvolvimento pessoal em um só app — e ainda conversa com você pela Rutte IA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to="/" className="btn-neon inline-flex h-12 items-center gap-2 rounded-xl px-6 font-bold text-white">
              Começar agora <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link to="/privacidade" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 font-semibold text-white/85 hover:bg-white/5">
              <ShieldCheck className="size-5" aria-hidden /> Seus dados
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60 lg:justify-start">
            <li className="flex items-center gap-1.5"><CircleCheck className="size-4 text-neon" aria-hidden /> Funciona no celular e no computador</li>
            <li className="flex items-center gap-1.5"><CircleCheck className="size-4 text-neon" aria-hidden /> Integra com o Google Agenda</li>
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-[300px]">
          <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(185,27,28,.45),transparent_65%)] blur-2xl" aria-hidden />
          <div className="relative rounded-[44px] bg-gradient-to-br from-[#323a52] to-[#0d111d] p-3 shadow-[0_40px_100px_rgba(0,0,0,.6)] ring-1 ring-white/10">
            <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <img src="/sobre-app.jpg" alt="Tela inicial da Rutte com o resumo do dia" className="w-full rounded-[34px]" width={600} height={1290} />
          </div>
        </div>
      </section>

      {/* organize */}
      <section className="mt-6">
        <SectionTitle kicker="Organize seu dia" title={<>Tudo o que você precisa fazer, <span className="text-neon">no lugar certo</span></>} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ORGANIZE.map((f) => <Feature key={f.t} f={f} />)}
        </div>
      </section>

      {/* rutte ia em destaque */}
      <section className="mt-12 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-white/[0.03] to-transparent p-7 sm:p-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-neon-lg">
            <Sparkles className="size-8" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-brand text-3xl font-bold">Rutte IA</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-white/75">Peça um resumo do dia, um relatório do mês, uma pesquisa na web ou diga “me lembra de pagar a conta amanhã” — ela cria o afazer para você.</p>
          </div>
        </div>
      </section>

      {/* evolua */}
      <section className="mt-12">
        <SectionTitle kicker="Evolua como pessoa" title={<>Cuide de você <span className="text-neon">por inteiro</span></>} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EVOLVE.map((f) => <Feature key={f.t} f={f} />)}
        </div>
      </section>

      {/* dados e google */}
      <section className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:grid-cols-[auto_1fr]">
        <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-neon">
          <ShieldCheck className="size-7" aria-hidden />
        </span>
        <div>
          <h2 className="font-brand text-3xl font-bold">Seus dados, do seu jeito</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-white/75 sm:grid-cols-3">
            <li><strong className="block text-white">No seu aparelho</strong>Seus afazeres e notas ficam guardados no seu celular ou computador.</li>
            <li><strong className="block text-white">Google com permissão</strong>A agenda só é acessada quando você conecta, direto do seu navegador, e você pode desconectar quando quiser.</li>
            <li><strong className="block text-white">Acesso aprovado</strong>Login com e-mail e senha, e cada cadastro é aprovado antes de entrar.</li>
          </ul>
          <Link to="/privacidade" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neon hover:underline">
            Ler a Política de Privacidade <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* chamada final */}
      <section className="mt-12 text-center">
        <h2 className="font-brand text-4xl font-bold">Pronto para organizar sua rotina?</h2>
        <Link to="/" className="btn-neon mt-6 inline-flex h-12 items-center gap-2 rounded-xl px-7 font-bold text-white">
          Entrar na Rutte <ArrowRight className="size-5" aria-hidden />
        </Link>
      </section>
    </Shell>
  );
}

/* ------------------------------------------- textos legais ------------------------------------------- */

function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Shell>
      <article className="mx-auto max-w-3xl py-8 text-[15px] leading-relaxed text-white/80 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="font-brand text-4xl font-bold text-white">{title}</h1>
        <p className="text-sm text-white/50">Última atualização: {UPDATED}</p>
        {children}
      </article>
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Política de Privacidade">
      <p>Esta política explica quais dados a Rutte (“nós”, “o app”), desenvolvida por era. consultoria, usa, para quê, onde ficam guardados e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).</p>

      <h2>1. Dados que usamos</h2>
      <ul>
        <li><strong>Conta:</strong> e-mail e senha (a senha é guardada de forma criptografada pelo nosso provedor de login, o Supabase). Também registramos data do cadastro, último acesso e, se informado, seu nome.</li>
        <li><strong>Conteúdo que você cria</strong> (afazeres, notas, treinos, avaliações, diário etc.): fica guardado <strong>no seu próprio aparelho</strong>, separado por conta. Não enviamos esse conteúdo para os nossos servidores.</li>
        <li><strong>Alertas com o app fechado</strong> (opcional): se você ligar essa opção, guardamos no servidor apenas a lista dos próximos alertas (horário, título curto e um texto de aviso) e o endereço de notificação do seu navegador, só para enviar o aviso na hora certa. Alertas já enviados são apagados em até 2 dias.</li>
        <li><strong>Google Agenda</strong> (opcional): veja a seção 3.</li>
        <li><strong>Rutte IA e Google Maps</strong> (opcionais): as chaves que você informar ficam só no seu aparelho; as perguntas que você fizer à IA são enviadas diretamente do seu aparelho ao provedor escolhido (Google Gemini ou Anthropic Claude).</li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Permitir o seu login e proteger a sua conta.</li>
        <li>Fazer o app funcionar: organizar seus afazeres, mostrar sua agenda e enviar os alertas que você pediu.</li>
        <li>Administração do serviço: aprovar cadastros, bloquear contas em caso de abuso e dar suporte.</li>
      </ul>
      <p>Não vendemos dados, não usamos seus dados para publicidade e não os compartilhamos com terceiros além dos provedores necessários para o serviço funcionar (Supabase para login e alertas; Vercel para hospedar o site).</p>

      <h2>3. Google Agenda (dados de usuários do Google)</h2>
      <p>Quando você escolhe “Conectar Google Agenda”, a Rutte pede ao Google a permissão <code>calendar.events</code>, que dá acesso aos eventos da sua agenda. Usamos esse acesso apenas para:</p>
      <ul>
        <li>mostrar seus eventos no calendário da Rutte;</li>
        <li>avisar você antes dos eventos, se os alertas estiverem ligados;</li>
        <li>criar um evento no seu Google Agenda quando você toca em “Enviar para o Google Agenda” em um afazer.</li>
      </ul>
      <p>O acesso acontece <strong>diretamente entre o seu navegador e o Google</strong>: os eventos não são enviados nem guardados nos nossos servidores (exceto o título e o horário do aviso, se você ligar os alertas com o app fechado). O token de acesso fica só no seu aparelho e expira em cerca de 1 hora. Você pode desconectar a qualquer momento pelo menu “Google Agenda” da Rutte ou em <a className="text-neon hover:underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>.</p>
      <p>O uso e a transferência, para qualquer outro app, de informações recebidas das APIs do Google seguem a <a className="text-neon hover:underline" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Política de Dados do Usuário dos Serviços de API do Google</a>, incluindo os requisitos de Uso Limitado. Não usamos dados do Google para publicidade, não os vendemos e não permitimos que pessoas os leiam, exceto com o seu consentimento explícito, para segurança ou quando exigido por lei.</p>

      <h2>4. Onde os dados ficam e por quanto tempo</h2>
      <ul>
        <li>Conteúdo do app: no seu aparelho, até você apagar (menu “Apagar meus dados”) ou limpar os dados do navegador.</li>
        <li>Conta e perfil: no Supabase, enquanto a conta existir.</li>
        <li>Alertas pendentes: no Supabase, até serem enviados (e apagados em até 2 dias depois).</li>
      </ul>

      <h2>5. Seus direitos</h2>
      <p>Você pode pedir a qualquer momento acesso, correção ou exclusão dos seus dados e da sua conta, e revogar consentimentos (por exemplo, desligar os alertas ou desconectar o Google). Basta escrever para <a className="text-neon hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>. Respondemos em até 15 dias.</p>

      <h2>6. Segurança</h2>
      <p>Usamos conexão criptografada (HTTPS), regras de acesso no banco de dados que impedem uma conta de ver dados de outra e guardamos o mínimo necessário no servidor.</p>

      <h2>7. Crianças</h2>
      <p>A Rutte não é destinada a menores de 13 anos.</p>

      <h2>8. Mudanças</h2>
      <p>Se esta política mudar, atualizamos a data no topo e avisamos no app quando a mudança for importante.</p>

      <h2>9. Contato</h2>
      <p>Dúvidas sobre privacidade: <a className="text-neon hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </Legal>
  );
}

export function TermsPage() {
  return (
    <Legal title="Termos de Uso">
      <p>Ao criar uma conta ou usar a Rutte, você concorda com estes termos.</p>
      <h2>1. O serviço</h2>
      <p>A Rutte é um app de organização pessoal e desenvolvimento (afazeres, agenda, alertas, notas, foco e conteúdos). O acesso pode depender de aprovação do administrador.</p>
      <h2>2. Sua conta</h2>
      <ul>
        <li>Você é responsável por manter sua senha em segredo e pelas atividades feitas com a sua conta.</li>
        <li>Use um e-mail válido e informações verdadeiras.</li>
        <li>Podemos bloquear ou encerrar contas usadas de forma abusiva, ilegal ou que prejudiquem o serviço.</li>
      </ul>
      <h2>3. Seus dados e conteúdo</h2>
      <p>O conteúdo que você cria é seu e fica guardado no seu aparelho. Faça backups pelo menu “Backup dos dados” — se você limpar o navegador ou trocar de aparelho sem backup, o conteúdo pode ser perdido. Veja como tratamos dados na <a className="text-neon hover:underline" href="/privacidade">Política de Privacidade</a>.</p>
      <h2>4. Integrações de terceiros</h2>
      <p>Google Agenda, Google Maps, Spotify, YouTube e provedores de IA são serviços de terceiros, com termos próprios. A Rutte IA pode cometer erros: confira informações importantes.</p>
      <h2>5. Conteúdos e links</h2>
      <p>Livros, vídeos e podcasts indicados pertencem aos seus autores e são acessados nas plataformas oficiais. Não hospedamos cópias de obras protegidas.</p>
      <h2>6. Disponibilidade e responsabilidade</h2>
      <p>Trabalhamos para manter o app disponível e os alertas pontuais, mas não garantimos funcionamento ininterrupto. Alertas dependem do seu aparelho, do navegador e da internet; não deixe compromissos críticos dependerem só deles.</p>
      <h2>7. Mudanças</h2>
      <p>Podemos atualizar estes termos; a data no topo indica a versão atual.</p>
      <h2>8. Contato</h2>
      <p><a className="text-neon hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
    </Legal>
  );
}
