/**
 * Destaque dos cartões da Biblioteca, na cor primária da Rutte (vermelho; azul no modo Empresa):
 * degradê leve, borda tingida, faixa à esquerda e brilho neon só no modo escuro.
 * A faixa é um ::before; quem usar deve dar um respiro à esquerda (ex.: `pl-4`) quando o conteúdo encostar na borda.
 */
export const HIGHLIGHT_CARD =
  "relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-primary/30 dark:from-primary/[0.12] dark:to-navy/40 dark:shadow-neon dark:hover:shadow-neon-lg before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-1 before:bg-gradient-to-b before:from-primary before:to-primary/30 before:content-['']";

/** Tom um pouco mais forte para itens em destaque (Top, clássicos…). */
export const HIGHLIGHT_STRONG = 'from-primary/[0.11] dark:from-primary/[0.18]';
