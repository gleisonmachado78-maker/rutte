import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { RutteLogo } from '@/components/brand/rutte';
import { cn } from '@/lib/utils';
import { cloudData } from '@/lib/supabase';

export interface TourStep {
  /** seletor do elemento destacado; sem alvo = cartão no centro */
  target?: string;
  /** alvo alternativo (ex.: no celular, a seção fica dentro de "Mais") */
  fallback?: string;
  title: string;
  text: string;
}

/** Primeiro elemento visível que casa com o seletor. */
function findVisible(selector?: string): HTMLElement | null {
  if (!selector) return null;
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

const PAD = 6;
const CARD_W = 340;

/**
 * Tutorial guiado: escurece a tela, destaca uma parte por vez e explica para que serve.
 * Passos cujo alvo não existe (ex.: módulo desligado) são pulados automaticamente.
 */
export function Tour({ steps, onFinish }: { steps: TourStep[]; onFinish: (completed: boolean) => void }) {
  // remove passos sem alvo visível (mantém os de centro)
  const usable = useMemo(() => steps.filter((s) => !s.target || findVisible(s.target) || findVisible(s.fallback)), [steps]);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viaMore, setViaMore] = useState(false);
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);
  const step = usable[i];
  const last = i === usable.length - 1;

  const measure = useCallback(() => {
    setVw(window.innerWidth);
    setVh(window.innerHeight);
    const main = findVisible(step?.target);
    const el = main ?? findVisible(step?.fallback);
    setViaMore(!main && !!el);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    const el = findVisible(step?.target) ?? findVisible(step?.fallback);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    measure();
  }, [measure, step]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  const next = () => (last ? onFinish(true) : setI((x) => x + 1));
  const back = () => setI((x) => Math.max(0, x - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish(false);
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!step) return null;

  // Posição do cartão: ao lado do alvo (direita/esquerda) ou acima/abaixo; no celular, embaixo/em cima
  const w = Math.min(CARD_W, vw - 24);
  let style: React.CSSProperties = { width: w, left: (vw - w) / 2, top: '50%', transform: 'translateY(-50%)' };
  if (rect) {
    const spaceRight = vw - rect.right;
    if (vw >= 768 && spaceRight > w + 24) {
      style = { width: w, left: rect.right + 16, top: Math.min(Math.max(12, rect.top - 8), vh - 260) };
    } else if (rect.top > vh / 2) {
      style = { width: w, left: Math.min(Math.max(12, rect.left + rect.width / 2 - w / 2), vw - w - 12), bottom: vh - rect.top + 14 };
    } else {
      style = { width: w, left: Math.min(Math.max(12, rect.left + rect.width / 2 - w / 2), vw - w - 12), top: rect.bottom + 14 };
    }
  }

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-text">
      {/* fundo escuro com "buraco" no alvo */}
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-neon transition-all duration-300 ease-out"
          style={{ left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 9999px rgba(5,7,13,.74), 0 0 30px rgb(var(--neon) / .55)' }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(5,7,13,.74)]" aria-hidden />
      )}
      {/* bloqueia cliques no app durante o tutorial */}
      <div className="absolute inset-0" onClick={() => undefined} aria-hidden />

      <div className="absolute rounded-2xl border border-white/10 bg-navy p-4 text-white shadow-2xl transition-all duration-300 ease-out sm:p-5" style={style}>
        <div className="flex items-start gap-3">
          {rect ? <Sparkles className="mt-0.5 size-5 shrink-0 text-neon" aria-hidden /> : <RutteLogo glow className="w-12 shrink-0" />}
          <div className="min-w-0 flex-1">
            <h2 id="tour-title" className="font-bold leading-snug">
              {step.title}
            </h2>
            <p id="tour-text" className="mt-1 text-sm leading-relaxed text-white/75">
              {step.text}
              {viaMore && <span className="mt-1 block text-white/55">No celular, fica no menu “Mais”.</span>}
            </p>
          </div>
          <button type="button" onClick={() => onFinish(false)} className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white" aria-label="Pular tutorial">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 flex-wrap gap-1" aria-label={`Passo ${i + 1} de ${usable.length}`}>
            {usable.map((_, k) => (
              <span key={k} className={cn('h-1.5 rounded-full transition-all', k === i ? 'w-5 bg-primary' : 'w-1.5 bg-white/20')} />
            ))}
          </div>
          {i > 0 && (
            <button type="button" onClick={back} className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="size-4" /> Voltar
            </button>
          )}
          <button type="button" onClick={next} autoFocus className="btn-neon inline-flex h-9 items-center gap-1 rounded-lg px-3.5 text-sm font-semibold text-white">
            {last ? <Check className="size-4" /> : null}
            {last ? 'Começar' : i === 0 ? 'Vamos lá' : 'Próximo'}
            {!last && <ArrowRight className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Roteiro do tutorial de boas-vindas. */
export function welcomeSteps(name: string): TourStep[] {
  const more = '[data-tour="more"]';
  return [
    { title: `Bem-vindo(a) à Rutte${name ? `, ${name}` : ''}! 👋`, text: 'Sou a sua secretária digital. Em menos de 1 minuto eu te mostro onde fica cada coisa. Você pode pular quando quiser.' },
    { target: '[data-tour="new-task"]', title: 'Crie afazeres em segundos', text: 'Use este botão (ou a tecla N no computador) para anotar tudo o que você precisa fazer — com data, prioridade, lembrete e até local do compromisso.' },
    { target: '[data-tour="nav-/"]', title: 'Início', text: 'Seu resumo do dia: o que é prioridade, o que está atrasado, sua agenda de hoje e seus objetivos.' },
    { target: '[data-tour="nav-/tasks"]', title: 'Afazeres', text: 'Todos os afazeres em lista ou Kanban, com filtros por data, prioridade, categoria e projeto. Sua lista começa vazia — é só sua.' },
    { target: '[data-tour="nav-/calendar"]', title: 'Calendário', text: 'Veja o mês ou a semana e abra a rota até cada compromisso.' },
    { target: '[data-tour="nav-/focus"]', title: 'Foco (Pomodoro)', text: 'Escolha uma atividade e foque por 25 minutos; a Rutte cuida das pausas e registra seu tempo.' },
    { target: '[data-tour="nav-/notes"]', fallback: more, title: 'Notas', text: 'Blocos de notas com várias caixas: textos, listas, ideias e resumos. Tudo salva sozinho.' },
    { target: '[data-tour="nav-/assistant"]', fallback: more, title: 'Rutte IA', text: 'Converse com a Rutte: ela monta planos, cria afazeres, pesquisa na web e gera relatórios. Funciona com o Gemini grátis.' },
    { target: '[data-tour="nav-/life"]', fallback: more, title: 'Roda da Vida', text: 'Dê uma nota de 0 a 10 para cada área da sua vida e veja onde focar, com dicas práticas.' },
    { target: '[data-tour="nav-/gym"]', fallback: more, title: 'Academia', text: 'Plano de treino, cargas, recordes e um holograma 3D mostrando como fazer cada exercício.' },
    { target: '[data-tour="nav-/gratitude"]', fallback: more, title: 'Gratidão', text: 'Diário de gratidão, meditação guiada do dia e orações para começar e terminar o dia em paz.' },
    { target: '[data-tour="nav-/library"]', fallback: more, title: 'Biblioteca', text: 'Livros, audiolivros, vídeos e podcasts escolhidos por tema para você crescer.' },
    { target: '[data-tour="account"]', fallback: more, title: 'Sua conta e configurações', text: 'Aqui você muda o tema, personaliza a Rutte, faz backup, configura a IA e sai da conta. Dá para rever este tutorial por aqui também.' },
    { title: 'Tudo pronto! 🚀', text: `${cloudData ? 'Seus dados ficam salvos na sua conta e aparecem em qualquer aparelho.' : 'Seus dados ficam guardados neste aparelho, só na sua conta.'} Que tal começar criando o seu primeiro afazer?` },
  ];
}
