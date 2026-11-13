/**
 * Planos da Rutte (base para virar SaaS). Ainda não há cobrança: durante o beta todo mundo usa
 * o plano "beta", com tudo liberado. Preços ficam em `price` — `null` mostra "Em breve" (o dono decide os valores).
 * Para começar a limitar recursos no futuro, use `planAllows()` com os ids de `PlanFeature`.
 */

export type PlanId = 'gratis' | 'pro' | 'empresa' | 'beta';

export type PlanFeature =
  | 'afazeres'
  | 'agenda'
  | 'foco'
  | 'notas'
  | 'notas-midia'
  | 'roda-da-vida'
  | 'academia'
  | 'gratidao'
  | 'biblioteca'
  | 'google-agenda'
  | 'alertas-push'
  | 'ia'
  | 'relatorios'
  | 'nuvem'
  | 'empresa'
  | 'suporte';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** preço mensal em reais; null = "Em breve" */
  price: number | null;
  highlight?: boolean;
  features: PlanFeature[];
  /** linhas mostradas no cartão do plano */
  bullets: string[];
}

const BASE: PlanFeature[] = ['afazeres', 'agenda', 'foco', 'notas', 'roda-da-vida', 'gratidao', 'biblioteca'];

export const PLANS: Plan[] = [
  {
    id: 'gratis',
    name: 'Grátis',
    tagline: 'Para organizar a rotina pessoal',
    price: 0,
    features: BASE,
    bullets: ['Afazeres, calendário e Foco (Pomodoro)', 'Notas com listas', 'Roda da Vida, Gratidão e Biblioteca', 'Dados guardados no seu aparelho'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para quem quer render todos os dias',
    price: null,
    highlight: true,
    features: [...BASE, 'notas-midia', 'academia', 'google-agenda', 'alertas-push', 'ia', 'relatorios', 'nuvem'],
    bullets: [
      'Tudo do Grátis',
      'Notas com imagens e desenho',
      'Google Agenda e alertas no celular',
      'Rutte IA e relatórios',
      'Academia completa',
      'Seus dados na nuvem, em qualquer aparelho',
    ],
  },
  {
    id: 'empresa',
    name: 'Empresa',
    tagline: 'Para separar a vida pessoal do trabalho',
    price: null,
    features: [...BASE, 'notas-midia', 'academia', 'google-agenda', 'alertas-push', 'ia', 'relatorios', 'nuvem', 'empresa', 'suporte'],
    bullets: ['Tudo do Pro', 'Lado Empresa com cor própria', 'Afazeres e notas de trabalho separados', 'Suporte prioritário'],
  },
];

/** Plano atual de todas as contas enquanto a Rutte está em beta. */
export const BETA_PLAN: Plan = {
  id: 'beta',
  name: 'Beta',
  tagline: 'Acesso antecipado: todos os recursos liberados',
  price: 0,
  features: PLANS.find((p) => p.id === 'empresa')!.features,
  bullets: [],
};

export const currentPlan = (): Plan => BETA_PLAN;

export const planAllows = (plan: Plan, feature: PlanFeature) => plan.features.includes(feature);

export const formatPrice = (price: number | null) =>
  price === null ? 'Em breve' : price === 0 ? 'R$ 0' : price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
