# Rutte — código da estética (front-end)

Tudo o que define a aparência da Rutte, pronto para copiar para outro projeto **React + Vite + Tailwind CSS 3**.
O código completo do app (todas as telas) está em `rutte-frontend-codigo.zip`, na mesma pasta.

## Resumo visual

| Item | Valor |
|---|---|
| Fundo claro / escuro | Branco `#FFFFFF` / Navy `#111727` |
| Cartões no escuro | `#1D2332` · bordas `#2E3340` · áreas suaves `#262B39` |
| Cor principal (Pessoal) | Vermelho `#B91B1C` · brilho neon `#FF2E3B` |
| Cor principal (Empresa) | Roxo `#6D28D9` · brilho neon `#A855F7` |
| Vinho (botão de perigo) | `#7F1D1C` |
| Texto | Navy `#111727` no claro, branco no escuro |
| Fonte do texto | Plus Jakarta Sans (400–800) |
| Fonte dos títulos (h1) | Fraunces (600–800, serifada) |
| Cantos | 12px (xl) e 16px (2xl); botões em pílula |
| Animações | entrada de página com leve desfoque, itens surgindo em cascata, brilho neon nos destaques |

Cores das áreas da vida: Saúde `#DC2626`, Emocional `#DB2777`, Intelectual `#7C3AED`, Profissional `#2563EB`, Finanças `#059669`, Relacionamento `#E11D48`, Família `#D97706`, Social `#0891B2`, Espiritualidade `#9333EA`, Lazer `#65A30D`.

## Como usar em outro projeto

1. Instale: `npm i -D tailwindcss@3 postcss autoprefixer` e `npm i clsx tailwind-merge class-variance-authority @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot lucide-react`.
2. Copie `tailwind.config.js`, `postcss.config.js` e `src/index.css` (abaixo).
3. Coloque as fontes no `<head>` do `index.html`.
4. Copie os componentes de `src/components/ui` e o `cn()` de `src/lib/utils.ts`.
5. Modo escuro: classe `dark` no `<html>`. Lado Empresa (roxo): `data-scope="BUSINESS"` no `<html>`.

## Fontes (`index.html`, dentro do `<head>`)

```html
<meta name="theme-color" content="#111727" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=swap" rel="stylesheet" />
```

## Configuração e estilos globais

### Tailwind
`tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta obrigatória
        navy: '#111727',
        wine: '#7F1D1C',
        // Acento de destaque: vermelho (Pessoal/Todos) ou azul de mesmo tom (Empresa) — ver src/index.css
        primary: { DEFAULT: 'rgb(var(--primary) / <alpha-value>)', foreground: '#FFFFFF' },
        neon: 'rgb(var(--neon) / <alpha-value>)',
        // Cores fixas (não mudam com o contexto)
        brand: { DEFAULT: '#B91B1C', neon: '#FF2E3B' },
        business: { DEFAULT: '#6D28D9', neon: '#A855F7' },
        surface: '#E5E7EB',
        white: '#FFFFFF',
        // Tokens semânticos (definidos em src/index.css para claro/escuro)
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        ring: 'rgb(var(--primary) / <alpha-value>)',
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
      boxShadow: {
        neon: '0 0 0 1px rgb(var(--neon) / .3), 0 0 10px rgb(var(--neon) / .18)',
        'neon-lg': '0 0 0 1px rgb(var(--neon) / .4), 0 0 16px rgb(var(--neon) / .28)',
        'neon-brand': '0 0 0 1px rgb(255 46 59 / .3), 0 0 10px rgb(255 46 59 / .2)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      keyframes: {
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'zoom-in': { from: { opacity: '0', transform: 'scale(.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'page-in': { from: { opacity: '0', transform: 'translateY(22px)', filter: 'blur(3px)' }, to: { opacity: '1', transform: 'none', filter: 'none' } },
        'item-in': { from: { opacity: '0', transform: 'translateY(8px) scale(.985)' }, to: { opacity: '1', transform: 'none' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(.92)' }, '60%': { opacity: '1', transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } },
        'fresh-glow': { '0%': { boxShadow: '0 0 0 0 rgb(var(--neon) / .55)' }, '70%': { boxShadow: '0 0 0 10px rgb(var(--neon) / 0)' }, '100%': { boxShadow: '0 0 0 0 rgb(var(--neon) / 0)' } },
      },
      animation: {
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'slide-in-left': 'slide-in-left 200ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'zoom-in': 'zoom-in 150ms ease-out',
        'page-in': 'page-in 520ms cubic-bezier(.16,.8,.25,1) both',
        'item-in': 'item-in 380ms cubic-bezier(.2,.7,.3,1) both',
        'pop-in': 'pop-in 420ms cubic-bezier(.2,.9,.3,1.2) both',
        'fresh-glow': 'fresh-glow 1.4s ease-out 2',
      },
    },
  },
  plugins: [],
}
```

### PostCSS
`postcss.config.js`

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

### Estilos globais, cores claro/escuro e efeitos
`src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Modo claro: Branco #FFFFFF, Navy #111727, Cinza #E5E7EB */
    --background: 255 255 255;
    --foreground: 17 23 39;
    --card: 255 255 255;
    --border: 229 231 235;
    --muted: 229 231 235;
    /* Acento: vermelho da marca #B91B1C + brilho neon */
    --primary: 185 27 28;
    --neon: 255 46 59;
    color-scheme: light;
  }

  /* Contexto Empresa: azul com o mesmo tom (saturação/luminosidade) do vermelho */
  html[data-scope='BUSINESS'],
  [data-scope-local='BUSINESS'] {
    --primary: 109 40 217;
    --neon: 168 85 247;
  }

  .dark {
    /* Modo escuro: Navy #111727 com superfícies derivadas (navy + branco translúcido) */
    --background: 17 23 39;
    --foreground: 255 255 255;
    --card: 29 35 50;
    --border: 46 51 64;
    --muted: 38 43 57;
    color-scheme: dark;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  h1,
  .font-brand {
    @apply font-display;
    font-optical-sizing: auto;
    letter-spacing: -0.01em;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    -webkit-tap-highlight-color: transparent;
  }

  *:focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
  }
}

/* Caixas leves: borda fina e sombra discreta. Especificidade zero (:where) para não
   sobrescrever destaques como border-neon/shadow-neon. Cantos em neon só onde há a classe .hud. */
@layer components {
  :where(.bg-card.border:not(input, textarea, select)) {
    box-shadow: 0 1px 2px rgb(17 23 39 / 0.04), 0 1px 1px rgb(17 23 39 / 0.02);
    transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
  }
  :where(.dark .bg-card.border:not(input, textarea, select)) {
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.03);
  }
  :where(button.bg-card.border, a.bg-card.border):hover {
    box-shadow: 0 4px 14px -6px rgb(17 23 39 / 0.18);
  }
  :where(.dark button.bg-card.border, .dark a.bg-card.border):hover {
    box-shadow: 0 0 0 1px rgb(var(--neon) / 0.18);
  }

  /* Painel com cantos em neon (opcional): timer do Foco e destaques pontuais */
  .hud {
    --hud: rgb(var(--neon) / 0.55);
    background-image:
      linear-gradient(var(--hud), var(--hud)), linear-gradient(var(--hud), var(--hud)),
      linear-gradient(var(--hud), var(--hud)), linear-gradient(var(--hud), var(--hud)),
      linear-gradient(var(--hud), var(--hud)), linear-gradient(var(--hud), var(--hud)),
      linear-gradient(var(--hud), var(--hud)), linear-gradient(var(--hud), var(--hud));
    background-size: 12px 2px, 2px 12px, 12px 2px, 2px 12px, 12px 2px, 2px 12px, 12px 2px, 2px 12px;
    background-position:
      left 6px top 6px, left 6px top 6px, right 6px top 6px, right 6px top 6px,
      left 6px bottom 6px, left 6px bottom 6px, right 6px bottom 6px, right 6px bottom 6px;
    background-repeat: no-repeat;
  }
}

@layer utilities {
  /* Brilho neon para textos e ícones de destaque */
  .text-glow {
    text-shadow: 0 0 10px rgb(var(--neon) / 0.35);
  }
  .icon-glow {
    filter: drop-shadow(0 0 4px rgb(var(--neon) / 0.35));
  }
  .logo-glow {
    filter: drop-shadow(0 0 8px rgb(255 46 59 / 0.3));
  }
  /* Botão primário neon */
  .btn-neon {
    background-color: rgb(var(--primary));
    background-image: linear-gradient(180deg, rgb(255 255 255 / 0.1), transparent);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.15), 0 4px 12px -6px rgb(var(--primary) / 0.5);
  }
  .btn-neon:hover {
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.15), 0 6px 16px -6px rgb(var(--primary) / 0.6);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Holograma do gerador de treino */
@keyframes holo-scan {
  from { transform: translateY(-20px); }
  to { transform: translateY(400px); }
}
@keyframes holo-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: .55; }
  94% { opacity: .95; }
  96% { opacity: .7; }
}
@keyframes holo-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes holo-ring {
  to { stroke-dashoffset: -120; }
}
@keyframes holo-pulse {
  0%, 100% { transform: scale(1); opacity: .9; }
  50% { transform: scale(1.18); opacity: 1; }
}
.holo-scan { animation: holo-scan 3.2s linear infinite; }
.holo-scan-fast { animation: holo-scan 0.9s linear infinite; }
.holo-flicker { animation: holo-flicker 5s steps(1) infinite; }
.holo-float { animation: holo-float 4s ease-in-out infinite; }
.holo-ring { animation: holo-ring 6s linear infinite; }
.holo-ring-rev { animation: holo-ring 9s linear infinite reverse; }
.holo-pulse { animation: holo-pulse 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.holo-region { transition: fill 400ms ease, filter 400ms ease; }

/* iPhone: campos com 16px evitam o zoom automático ao tocar */
@media (max-width: 640px) {
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* Tela inicial do iPhone: sem destaque azul ao tocar e sem “puxar” a página inteira */
html {
  -webkit-text-size-adjust: 100%;
  overscroll-behavior-y: none;
}
button,
a {
  touch-action: manipulation;
}

/* Campo de endereço do Google (PlaceAutocompleteElement) acompanha o tema */
.rutte-place-input > gmp-place-autocomplete {
  width: 100%;
  color-scheme: light;
}
.dark .rutte-place-input > gmp-place-autocomplete {
  color-scheme: dark;
}

/* ------------------------------ Microanimações ------------------------------ */
@layer utilities {
  /* filhos entram em cascata (até 12 com atraso; os demais juntos) */
  .stagger > * {
    animation: item-in 480ms cubic-bezier(0.16, 0.8, 0.25, 1) both;
  }
  .stagger > *:nth-child(2) { animation-delay: 40ms; }
  .stagger > *:nth-child(3) { animation-delay: 80ms; }
  .stagger > *:nth-child(4) { animation-delay: 120ms; }
  .stagger > *:nth-child(5) { animation-delay: 160ms; }
  .stagger > *:nth-child(6) { animation-delay: 200ms; }
  .stagger > *:nth-child(7) { animation-delay: 240ms; }
  .stagger > *:nth-child(8) { animation-delay: 280ms; }
  .stagger > *:nth-child(9) { animation-delay: 310ms; }
  .stagger > *:nth-child(10) { animation-delay: 340ms; }
  .stagger > *:nth-child(11) { animation-delay: 360ms; }
  .stagger > *:nth-child(n + 12) { animation-delay: 540ms; }

  /* risco que "corre" sobre o texto ao concluir */
  .strike {
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-position: 0 55%;
    background-size: 0% 1.5px;
    transition: background-size 380ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity 300ms;
  }
  .strike-on {
    background-size: 100% 1.5px;
    opacity: 0.6;
  }
}

/* check que "pula" ao marcar */
[role='checkbox'][data-state='checked'],
button[role='checkbox'][aria-checked='true'] {
  animation: check-pop 360ms cubic-bezier(0.2, 1.4, 0.4, 1);
}
@keyframes check-pop {
  0% { transform: scale(0.8); }
  55% { transform: scale(1.18); }
  100% { transform: scale(1); }
}
@keyframes item-in {
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

/* leve "afundar" ao tocar em botões (propriedade scale soma com os transforms existentes) */
button:not(:disabled):active,
a[role='button']:active {
  scale: 0.95;
}

/* aceno do "Bom dia 👋" */
.wave {
  display: inline-block;
  transform-origin: 70% 75%;
  animation: wave 1.6s ease-in-out 0.4s 2;
}
@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(16deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
}

/* sem animações: quando o sistema pede (modo Automático) ou quando a pessoa desliga no app */
@media (prefers-reduced-motion: reduce) {
  html:not([data-motion='on']) *,
  html:not([data-motion='on']) *::before,
  html:not([data-motion='on']) *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  html:not([data-motion='on']) button:not(:disabled):active {
    scale: 1;
  }
}
html[data-motion='off'] *,
html[data-motion='off'] *::before,
html[data-motion='off'] *::after {
  animation-duration: 1ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 1ms !important;
}
html[data-motion='off'] button:not(:disabled):active {
  scale: 1;
}

/* ---------- Pato dançando (tela de atualização) ---------- */
@keyframes duck-dance {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  15% { transform: translate(-14px, -18px) rotate(-14deg); }
  30% { transform: translate(-18px, 0) rotate(-6deg); }
  50% { transform: translate(0, -6px) rotate(0); }
  65% { transform: translate(14px, -18px) rotate(14deg); }
  80% { transform: translate(18px, 0) rotate(6deg); }
}
@keyframes duck-shadow { 0%, 50%, 100% { transform: scaleX(1); opacity: .45; } 25%, 75% { transform: scaleX(.6); opacity: .2; } }
@keyframes duck-note { 0% { transform: translateY(0) rotate(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-70px) rotate(25deg); opacity: 0; } }
@keyframes duck-bar { from { width: 0; } to { width: 100%; } }
@keyframes duck-in { from { opacity: 0; } to { opacity: 1; } }
/* o pato dança mesmo com as animações reduzidas: é a graça da tela */
html .duck-screen { animation: duck-in .35s ease-out both !important; }
html .duck-dance { animation: duck-dance 1.1s ease-in-out infinite !important; transform-origin: 50% 90%; }
html .duck-shadow { animation: duck-shadow .55s ease-in-out infinite !important; }
html .duck-bar { animation: duck-bar 3.2s ease-in-out both !important; }
html .duck-note { position: absolute; font-size: 28px; color: rgb(var(--neon)); text-shadow: 0 0 12px rgb(var(--neon) / .7); animation: duck-note 1.8s ease-out infinite !important; }
.duck-note-1 { left: -28px; top: 30px; }
.duck-note-2 { right: -30px; top: 10px; animation-delay: .6s !important; }
.duck-note-3 { left: 50%; top: -20px; animation-delay: 1.2s !important; }

/* entrada suave de cartões (guia da meta) */
.fade-up { animation: item-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

@keyframes duck-indet { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
html .duck-indet { animation: duck-indet 1.4s ease-in-out infinite !important; }

/* ---------- Rutte trabalhando no computador (tela de atualização) ---------- */
@keyframes rw-head { 0%, 100% { transform: rotate(-2deg); } 30% { transform: rotate(4deg) translateX(2px); } 55% { transform: rotate(5deg) translateX(3px) translateY(1px); } 80% { transform: rotate(0deg); } }
@keyframes rw-hand { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes rw-line { 0% { transform: scaleX(0); opacity: 1; } 18%, 80% { transform: scaleX(1); opacity: 1; } 95%, 100% { transform: scaleX(1); opacity: 0; } }
@keyframes rw-check { 0%, 10% { transform: scale(0); } 18% { transform: scale(1.25); } 24%, 85% { transform: scale(1); } 95%, 100% { transform: scale(0); } }
@keyframes rw-gear { to { transform: rotate(360deg); } }
@keyframes rw-progress { 0% { transform: scaleX(0.05); } 85%, 100% { transform: scaleX(1); } }
@keyframes rw-cursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes rw-steam { 0% { transform: translateY(4px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-12px); opacity: 0; } }
@keyframes rw-spark { 0%, 100% { transform: scale(0.4); opacity: 0.2; } 50% { transform: scale(1); opacity: 1; } }
html .rw-head { animation: rw-head 3.6s ease-in-out infinite !important; }
html .rw-hand { animation: rw-hand 0.32s ease-in-out infinite !important; transform-box: fill-box; }
html .rw-hand-2 { animation-delay: 0.16s !important; }
html .rw-line { animation: rw-line 4.4s ease-out infinite !important; }
html .rw-check { animation: rw-check 4.4s ease-out infinite !important; }
html .rw-gear { animation: rw-gear 3s linear infinite !important; }
html .rw-progress { animation: rw-progress 4.4s ease-in-out infinite !important; }
html .rw-cursor { animation: rw-cursor 0.9s steps(1) infinite !important; }
html .rw-steam { animation: rw-steam 2.2s ease-out infinite !important; transform-box: fill-box; }
html .rw-spark { animation: rw-spark 2.4s ease-in-out infinite !important; transform-box: fill-box; transform-origin: center; }
html .rw-line, html .rw-check, html .rw-steam, html .rw-spark { animation-delay: var(--d, 0s) !important; }
@keyframes rw-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
@keyframes rw-look { 0%, 35%, 100% { transform: translateX(0); } 45%, 75% { transform: translateX(2.5px) translateY(-0.5px); } }
@keyframes rw-plant { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2.5deg); } }
html .rw-blink { animation: rw-blink 4s ease-in-out infinite !important; }
html .rw-look { animation: rw-look 3.6s ease-in-out infinite !important; }
html .rw-plant { animation: rw-plant 5s ease-in-out infinite !important; }
```


## Componentes base

### Utilitário cn()
`src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id') {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
```

### Botão
`src/components/ui/button.tsx`

```tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[.98]',
  {
    variants: {
      variant: {
        primary: 'btn-neon text-white hover:brightness-110',
        secondary: 'bg-muted text-foreground hover:bg-border',
        outline: 'border border-border bg-transparent hover:bg-muted',
        ghost: 'hover:bg-muted',
        danger: 'bg-wine text-white hover:bg-primary',
        link: 'text-primary underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
```

### Campos de formulário
`src/components/ui/form-controls.tsx`

```tsx
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, ChevronDown } from 'lucide-react';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const field =
  'w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(field, 'h-10', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(field, 'min-h-[88px] py-2 leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(field, 'h-10 appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50"
      />
    </div>
  ),
);
Select.displayName = 'Select';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground/60', className)} {...props} />;
}

export const Checkbox = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer grid size-5 shrink-0 place-items-center rounded-md border-2 border-foreground/30 transition-all duration-200 hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Check className="size-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
```

### Janelas e gavetas (Radix)
`src/components/ui/sheet.tsx`

```tsx
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

function Overlay({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Overlay className={cn('fixed inset-0 z-40 bg-navy/60 backdrop-blur-[2px] data-[state=open]:animate-fade-in', className)} />
  );
}

/** Slide-over lateral (direita para detalhes, esquerda para menu mobile). Tela cheia em telas pequenas. */
export function SheetContent({
  side = 'right',
  className,
  children,
  hideClose,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: 'left' | 'right';
  hideClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-full flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl outline-none',
          side === 'right'
            ? 'right-0 sm:max-w-xl data-[state=open]:animate-slide-in-right sm:border-l sm:border-border'
            : 'left-0 max-w-[85vw] sm:max-w-xs data-[state=open]:animate-slide-in-left',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))] grid size-10 place-items-center rounded-xl text-foreground/60 transition-all duration-200 hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <Overlay className="z-[60]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none data-[state=open]:animate-zoom-in',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
```

### Confirmação
`src/components/ui/confirm.tsx`

```tsx
import { create } from 'zustand';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './sheet';

/**
 * Confirmação dentro do próprio app (substitui window.confirm, que não aparece
 * em muitos leitores de HTML do iPhone e em páginas embutidas).
 */
interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (ok: boolean) => void;
}

const useConfirmStore = create<ConfirmState>(() => ({ open: false, title: '' }));

export function askConfirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().resolve?.(false);
    useConfirmStore.setState({ ...opts, open: true, resolve });
  });
}

function settle(ok: boolean) {
  const { resolve } = useConfirmStore.getState();
  useConfirmStore.setState({ open: false, resolve: undefined });
  resolve?.(ok);
}

export function ConfirmHost() {
  const { open, title, message, confirmLabel, danger } = useConfirmStore();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && settle(false)}>
      <DialogContent>
        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        {message && <DialogDescription className="mt-2 text-sm text-foreground/70">{message}</DialogDescription>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => settle(false)}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => settle(true)} autoFocus>
            {confirmLabel ?? 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Menu suspenso
`src/components/ui/dropdown.tsx`

```tsx
import * as DM from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuLabel = ({ className, ...p }: ComponentPropsWithoutRef<typeof DM.Label>) => (
  <DM.Label className={cn('px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/50', className)} {...p} />
);
export const DropdownMenuSeparator = () => <DM.Separator className="my-1 h-px bg-border" />;

export function DropdownMenuContent({ className, align = 'start', ...props }: ComponentPropsWithoutRef<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-[12rem] max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-xl data-[state=open]:animate-zoom-in',
          className,
        )}
        {...props}
      />
    </DM.Portal>
  );
}

const itemCls =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-muted data-[disabled]:opacity-50';

export function DropdownMenuItem({ className, ...props }: ComponentPropsWithoutRef<typeof DM.Item>) {
  return <DM.Item className={cn(itemCls, '[&_svg]:size-4', className)} {...props} />;
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DM.CheckboxItem>) {
  return (
    <DM.CheckboxItem
      className={cn(itemCls, 'pl-8', className)}
      onSelect={(e) => e.preventDefault()}
      {...props}
    >
      <span className="absolute left-2 grid size-4 place-items-center rounded border border-foreground/30 data-[state=checked]:border-primary">
        <DM.ItemIndicator>
          <Check className="size-3 text-primary" strokeWidth={3} />
        </DM.ItemIndicator>
      </span>
      {children}
    </DM.CheckboxItem>
  );
}
```

### Estrelas
`src/components/ui/star-rating.tsx`

```tsx
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRatings, useSetRating } from '@/hooks/use-data';
import { cn } from '@/lib/utils';

const LABELS = ['', 'Não gostei', 'Mais ou menos', 'Bom', 'Muito bom', 'Excelente'];

/** Chave da avaliação: tipo + id do item ("book:abc", "video:xyz", "prayer:salmo-23"). */
export type RatingKind = 'book' | 'free' | 'video' | 'prayer' | 'meditation' | 'podcast' | 'mentor' | 'playlist';
export const ratingKey = (kind: RatingKind, id: string) => `${kind}:${id}`;

/** Lê a nota (0 = sem avaliação) de um item. */
export function useStars(key: string) {
  const { data = {} } = useRatings();
  return data[key]?.stars ?? 0;
}

/** Estrelas somente leitura (selo pequeno). */
export function StarsBadge({ stars, className }: { stars: number; className?: string }) {
  if (!stars) return null;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full bg-amber-400/95 px-1.5 py-0.5 text-[11px] font-bold text-navy', className)} title={`Sua nota: ${stars} de 5`}>
      <Star className="size-3 fill-current" aria-hidden />
      {stars}
      <span className="sr-only"> de 5 estrelas</span>
    </span>
  );
}

/**
 * Avaliação do usuário: 1 a 5 estrelas + opinião curta opcional.
 * Clicar de novo na mesma estrela remove a nota.
 */
export function StarRating({ itemKey, label, withNote = true, className }: { itemKey: string; label: string; withNote?: boolean; className?: string }) {
  const { data = {} } = useRatings();
  const setRating = useSetRating();
  const current = data[itemKey];
  const stars = current?.stars ?? 0;
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState(current?.note ?? '');
  const [editing, setEditing] = useState(false);

  useEffect(() => setNote(current?.note ?? ''), [current?.note]);

  const shown = hover || stars;
  const rate = (n: number) => setRating.mutate({ key: itemKey, stars: n === stars ? 0 : n, note: n === stars ? undefined : note });
  const saveNote = () => {
    setEditing(false);
    if (stars && note.trim() !== (current?.note ?? '')) setRating.mutate({ key: itemKey, stars, note });
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={`Sua avaliação: ${label}`} className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'} — ${LABELS[n]}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              className="grid size-7 place-items-center rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Star className={cn('size-[18px] transition-colors', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-foreground/25')} aria-hidden />
            </button>
          ))}
        </div>
        <span className="text-xs text-foreground/55">{shown ? LABELS[shown] : 'Avalie'}</span>
        {withNote && stars > 0 && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-primary hover:underline dark:text-neon">
            {current?.note ? 'Editar opinião' : '+ Sua opinião'}
          </button>
        )}
      </div>
      {withNote && stars > 0 && !editing && current?.note && <p className="text-xs italic leading-snug text-foreground/70">“{current.note}”</p>}
      {withNote && editing && (
        <input
          autoFocus
          value={note}
          maxLength={140}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveNote();
            if (e.key === 'Escape') {
              setNote(current?.note ?? '');
              setEditing(false);
            }
          }}
          placeholder="O que achou? (até 140 caracteres)"
          aria-label="Sua opinião"
          className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
        />
      )}
    </div>
  );
}
```


## Marca e cores das áreas

### Logo da Rutte
`src/components/brand/rutte.tsx`

```tsx
import logoUrl from '@/assets/rutte-logo.png';
import { cn } from '@/lib/utils';

/**
 * Logo da Rutte em PNG de alta resolução (public/rutte-logo.png, gerado por `npm run logo`):
 * traço vermelho da marca sobre oval branco. `glow` adiciona o brilho neon.
 */
export function RutteLogo({
  className,
  glow = false,
  title = 'Rutte',
}: {
  className?: string;
  glow?: boolean;
  title?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt={title}
      width={1108}
      height={1024}
      draggable={false}
      className={cn('h-auto shrink-0 select-none object-contain', glow && 'logo-glow', className)}
    />
  );
}

export const BRAND = {
  name: 'Rutte',
  tagline: 'Sua secretária digital',
};
```

### Crédito "by era. consultoria"
`src/components/brand/credit.tsx`

```tsx
import { cn } from '@/lib/utils';

/** Assinatura de quem desenvolveu a Rutte. */
export function DevCredit({ className }: { className?: string }) {
  return (
    <p className={cn('text-[11px] tracking-wide text-white/40', className)}>
      by <span className="font-semibold text-white/65">era.</span> consultoria
    </p>
  );
}
```

### Áreas da vida (nomes, ícones e cores)
`src/lib/life-areas.ts`

```ts
import {
  BookOpen,
  Brain,
  Briefcase,
  Church,
  HeartHandshake,
  HeartPulse,
  House,
  TreePalm,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { LifeAreaId } from '@/types';

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  short: string;
  icon: LucideIcon;
  color: string;
  /** Pergunta-guia para dar a nota */
  question: string;
}

/** Áreas da Roda da Vida. As cores são de apoio (não substituem a paleta da marca) e sempre vêm com ícone + nome. */
export const LIFE_AREAS: LifeArea[] = [
  { id: 'saude', name: 'Saúde & Bem-estar', short: 'Saúde', icon: HeartPulse, color: '#DC2626', question: 'Como estão seu corpo, sono, alimentação e exercícios?' },
  { id: 'emocional', name: 'Equilíbrio Emocional', short: 'Emocional', icon: Brain, color: '#DB2777', question: 'Você lida bem com estresse, ansiedade e emoções?' },
  { id: 'intelectual', name: 'Desenvolvimento Intelectual', short: 'Intelectual', icon: BookOpen, color: '#7C3AED', question: 'Está aprendendo, lendo e evoluindo?' },
  { id: 'profissional', name: 'Carreira & Profissional', short: 'Profissional', icon: Briefcase, color: '#2563EB', question: 'Está satisfeito com seu trabalho e crescimento?' },
  { id: 'financas', name: 'Finanças', short: 'Finanças', icon: Wallet, color: '#059669', question: 'Suas contas, reservas e investimentos estão em ordem?' },
  { id: 'relacionamentos', name: 'Relacionamento Amoroso', short: 'Relacionamento', icon: HeartHandshake, color: '#E11D48', question: 'Como está sua vida amorosa — com seu par ou na busca por um?' },
  { id: 'familia', name: 'Família', short: 'Família', icon: House, color: '#D97706', question: 'Você tem tempo de qualidade com sua família?' },
  { id: 'social', name: 'Vida Social', short: 'Social', icon: Users, color: '#0891B2', question: 'Suas amizades e conexões estão nutridas?' },
  { id: 'espiritualidade', name: 'Espiritualidade', short: 'Espiritualidade', icon: Church, color: '#9333EA', question: 'Você se sente conectado à sua fé e propósito?' },
  { id: 'lazer', name: 'Lazer & Diversão', short: 'Lazer', icon: TreePalm, color: '#65A30D', question: 'Você descansa e faz coisas de que gosta?' },
];

export const LIFE_AREA_BY_ID = Object.fromEntries(LIFE_AREAS.map((a) => [a.id, a])) as Record<LifeAreaId, LifeArea>;

export const emptyScores = () =>
  Object.fromEntries(LIFE_AREAS.map((a) => [a.id, 5])) as Record<LifeAreaId, number>;

export interface LifeTip {
  title: string;
  /** Recorrência sugerida (RRULE simples) */
  recurrence?: 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY';
  /** explicação curta (vira o "o que fazer" do afazer) */
  how?: string;
}

/** Dicas de atividades para desenvolver cada área (sugestões — o usuário adapta). */
export const LIFE_TIPS: Record<LifeAreaId, LifeTip[]> = {
  saude: [
    { title: 'Caminhar 30 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Beber 2 litros de água', recurrence: 'FREQ=DAILY' },
    { title: 'Dormir antes das 23h (sem celular na cama)', recurrence: 'FREQ=DAILY' },
    { title: 'Agendar check-up e exames de rotina' },
    { title: 'Planejar as refeições da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Alongar 10 minutos ao acordar', recurrence: 'FREQ=DAILY' },
  ],
  emocional: [
    { title: 'Escrever 3 coisas pelas quais sou grato', recurrence: 'FREQ=DAILY' },
    { title: 'Respiração 4-7-8 por 5 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Diário: como me senti hoje e por quê', recurrence: 'FREQ=DAILY' },
    { title: 'Desconectar das redes por 1 hora', recurrence: 'FREQ=DAILY' },
    { title: 'Conversar com alguém de confiança sobre o que me preocupa' },
    { title: 'Pesquisar/agendar sessão de terapia' },
  ],
  intelectual: [
    { title: 'Ler 10 páginas de um livro', recurrence: 'FREQ=DAILY' },
    { title: 'Escolher o próximo livro do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Estudar 25 min (técnica Pomodoro)', recurrence: 'FREQ=DAILY' },
    { title: 'Assistir a uma aula ou documentário', recurrence: 'FREQ=WEEKLY' },
    { title: 'Anotar um aprendizado da semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Praticar um idioma por 15 minutos', recurrence: 'FREQ=DAILY' },
  ],
  profissional: [
    { title: 'Definir as 3 prioridades do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Atualizar currículo e LinkedIn' },
    { title: 'Revisar metas do trimestre', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um curso da minha área' },
    { title: 'Pedir feedback ao gestor ou a um colega' },
    { title: 'Bloquear 2h de foco sem interrupções', recurrence: 'FREQ=WEEKLY' },
  ],
  financas: [
    { title: 'Anotar todos os gastos do dia', recurrence: 'FREQ=DAILY' },
    { title: 'Revisar o orçamento do mês', recurrence: 'FREQ=MONTHLY' },
    { title: 'Separar 10% da renda para a reserva de emergência', recurrence: 'FREQ=MONTHLY' },
    { title: 'Cancelar assinaturas que não uso' },
    { title: 'Listar dívidas e montar plano de quitação' },
    { title: 'Estudar um investimento por 20 minutos', recurrence: 'FREQ=WEEKLY' },
  ],
  relacionamentos: [
    { title: 'Noite a dois sem celular', recurrence: 'FREQ=WEEKLY' },
    { title: 'Mandar uma mensagem carinhosa sem motivo', recurrence: 'FREQ=DAILY' },
    { title: 'Planejar um passeio ou viagem juntos' },
    { title: 'Conversa sobre planos e sonhos do casal', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer algo que meu par gosta' },
  ],
  familia: [
    { title: 'Ligar para meus pais', recurrence: 'FREQ=WEEKLY' },
    { title: 'Refeição em família sem telas', recurrence: 'FREQ=WEEKLY' },
    { title: 'Brincar/conversar 20 min com os filhos', recurrence: 'FREQ=DAILY' },
    { title: 'Organizar um almoço de domingo em família', recurrence: 'FREQ=MONTHLY' },
    { title: 'Lembrar datas importantes (aniversários) no calendário' },
  ],
  social: [
    { title: 'Mandar mensagem para um amigo que não vejo há tempo', recurrence: 'FREQ=WEEKLY' },
    { title: 'Marcar um café com um amigo' },
    { title: 'Participar de um grupo ou evento novo', recurrence: 'FREQ=MONTHLY' },
    { title: 'Fazer um trabalho voluntário' },
    { title: 'Elogiar alguém de forma sincera', recurrence: 'FREQ=DAILY' },
  ],
  espiritualidade: [
    { title: 'Oração ou meditação de 10 minutos', recurrence: 'FREQ=DAILY' },
    { title: 'Leitura devocional', recurrence: 'FREQ=DAILY' },
    { title: 'Ir ao culto/missa', recurrence: 'FREQ=WEEKLY' },
    { title: 'Momento de silêncio e reflexão sobre propósito', recurrence: 'FREQ=WEEKLY' },
    { title: 'Participar de um grupo de estudo ou pequeno grupo', recurrence: 'FREQ=WEEKLY' },
  ],
  lazer: [
    { title: 'Reservar 1 hora para um hobby', recurrence: 'FREQ=WEEKLY' },
    { title: 'Passeio ao ar livre no fim de semana', recurrence: 'FREQ=WEEKLY' },
    { title: 'Assistir a um filme sem culpa' },
    { title: 'Planejar as próximas férias' },
    { title: 'Aprender algo só por diversão (instrumento, desenho…)' },
    { title: 'Tarde sem compromissos', recurrence: 'FREQ=MONTHLY' },
  ],
};

/** Etapas para quem está solteiro(a) e quer encontrar um relacionamento. */
export const SINGLE_STEPS = [
  { id: 'comecar', label: 'Por onde começar', intro: 'Antes de procurar alguém, fique claro sobre o que você quer e cuide de quem você é.' },
  { id: 'onde', label: 'Onde conhecer pessoas', intro: 'Pessoas com valores parecidos costumam estar nos mesmos lugares que você gosta de frequentar.' },
  { id: 'acoes', label: 'Ações da semana', intro: 'Pequenas atitudes repetidas aumentam muito as chances de conhecer alguém especial.' },
  { id: 'cuidados', label: 'Cuidados', intro: 'Abra o coração, mas com segurança.' },
] as const;

export type SingleStepId = (typeof SINGLE_STEPS)[number]['id'];

/** Sugestões para quem está solteiro(a). */
export const SINGLE_TIPS: Record<SingleStepId, LifeTip[]> = {
  comecar: [
    { title: 'Escrever o que eu busco em um relacionamento', how: 'Liste 5 valores inegociáveis (respeito, fé, filhos, ambição…) e 3 coisas que você não aceita. Foque em valores, não em aparência.' },
    { title: 'Anotar o que aprendi com relações passadas', how: 'O que funcionou, o que não funcionou e o que você faria diferente. Isso evita repetir os mesmos padrões.' },
    { title: 'Fazer uma atividade só por mim', recurrence: 'FREQ=WEEKLY', how: 'Quem está bem consigo mesmo atrai relações mais saudáveis. Reserve um tempo para algo que te faz bem.' },
    { title: 'Renovar o visual (cabelo, roupas que me deixam confiante)', how: 'Não é para agradar ninguém: é para você se sentir bem e confiante ao sair.' },
    { title: 'Cuidar de feridas antigas (terapia, se precisar)', how: 'Se um término ainda dói ou você sente medo de se envolver, conversar com um psicólogo ajuda a começar leve.' },
  ],
  onde: [
    { title: 'Entrar em um grupo de hobby (corrida, trilha, dança, teatro)', recurrence: 'FREQ=WEEKLY', how: 'Atividades em grupo criam encontros naturais e repetidos — o jeito mais comum de as pessoas se conhecerem.' },
    { title: 'Fazer uma aula em grupo (dança de salão, idioma, culinária)', how: 'Aulas misturam pessoas novas toda semana e dão assunto pronto para puxar conversa.' },
    { title: 'Participar de um grupo da igreja ou da comunidade', recurrence: 'FREQ=WEEKLY', how: 'Bom caminho para quem quer alguém que compartilhe a mesma fé e os mesmos valores.' },
    { title: 'Aceitar convites de amigos para festas e encontros', how: 'Amigos em comum continuam sendo uma das principais formas de conhecer um par.' },
    { title: 'Pedir para amigos me apresentarem alguém', how: 'Diga aos amigos de confiança que você está aberto(a) a conhecer alguém e o que procura.' },
    { title: 'Fazer trabalho voluntário', recurrence: 'FREQ=MONTHLY', how: 'Você conhece pessoas generosas, com valores parecidos, fazendo algo que importa.' },
    { title: 'Criar um perfil honesto em um app de relacionamento', how: 'Fotos reais e atuais (sorrindo, fazendo algo que gosta) e uma bio sincera sobre quem você é e o que busca.' },
  ],
  acoes: [
    { title: 'Puxar conversa com uma pessoa nova', recurrence: 'FREQ=WEEKLY', how: 'Comece com algo do ambiente ou um elogio sincero e faça perguntas abertas. Sem pressão: é só treinar.' },
    { title: 'Ir a um lugar novo', recurrence: 'FREQ=WEEKLY', how: 'Sair da rotina de casa–trabalho multiplica as chances de cruzar com pessoas novas.' },
    { title: 'Convidar alguém interessante para um café', how: 'Primeiro encontro curto (30–60 min), leve e em lugar público. Se for bom, marque o segundo.' },
    { title: 'Praticar a escuta: perguntar mais e lembrar detalhes', recurrence: 'FREQ=DAILY', how: 'As pessoas se encantam por quem se interessa de verdade por elas.' },
    { title: 'Responder mensagens com interesse e sem joguinhos', how: 'Clareza e gentileza atraem quem também quer algo sério.' },
  ],
  cuidados: [
    { title: 'Marcar o primeiro encontro em lugar público e avisar um amigo', how: 'Compartilhe onde vai estar e com quem. Vá e volte por conta própria.' },
    { title: 'Nunca enviar dinheiro nem dados pessoais a quem conheci online', how: 'Pedidos de dinheiro, de documentos ou de fotos íntimas são sinais de golpe.' },
    { title: 'Observar sinais: respeito, coerência e como trata os outros', how: 'Repare em como a pessoa fala de ex, trata garçons e lida com um “não”.' },
  ],
};
```


## Estrutura da tela (menu lateral, barra do celular, topo)

### Layout do app
`src/components/layout/app-layout.tsx`

```tsx
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Building,
  CalendarDays,
  ChartPie,
  DatabaseBackup,
  Dumbbell,
  Ellipsis,
  GraduationCap,
  HandHeart,
  Layers,
  Link2,
  LayoutDashboard,
  Library,
  ListTodo,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  Timer,
  UserRound,
  WandSparkles,
  ShieldCheck,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DevCredit } from '@/components/brand/credit';
import { BRAND, RutteLogo } from '@/components/brand/rutte';
import { FocusEngine, FocusPill } from '@/components/focus/focus-engine';
import { Onboarding } from '@/components/onboarding/onboarding';
import { Tour, welcomeSteps } from '@/components/tour/tour';
import { useAuth } from '@/components/auth/auth-gate';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { Dialog, DialogTitle, SheetContent } from '@/components/ui/sheet';
import { useModules, useScopedTasks, useUser, useTutorialDone } from '@/hooks/use-data';
import { firstName } from '@/lib/onboarding';
import { isOverdue } from '@/lib/task-utils';
import { cn, initials } from '@/lib/utils';
import { useUI, type ScopeFilter } from '@/store/ui';
import { useAlertsRunner } from '@/hooks/use-alerts';
import { NewsPopup } from './news-popup';
import { SYNC_LABEL, useSyncState } from '@/hooks/use-sync-state';

interface NavEntry {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  end?: boolean;
  personalOnly?: boolean;
  module?: 'gym' | 'life';
  group: 'organizar' | 'evoluir' | 'ajustes';
  /** aparece na barra inferior do celular (o resto fica em "Mais") */
  primary?: boolean;
}

const NAV: NavEntry[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true, group: 'organizar', primary: true },
  { to: '/tasks', label: 'Afazeres', icon: ListTodo, group: 'organizar', primary: true },
  { to: '/calendar', label: 'Calendário', short: 'Agenda', icon: CalendarDays, group: 'organizar', primary: true },
  { to: '/focus', label: 'Foco', icon: Timer, group: 'organizar', primary: true },
  { to: '/notes', label: 'Notas', icon: StickyNote, group: 'organizar' },
  { to: '/links', label: 'Links', icon: Link2, group: 'organizar' },
  { to: '/assistant', label: 'Rutte IA', short: 'IA', icon: Sparkles, group: 'organizar' },
  { to: '/life', label: 'Roda da Vida', short: 'Roda', icon: ChartPie, module: 'life', group: 'evoluir' },
  { to: '/gym', label: 'Academia', short: 'Treino', icon: Dumbbell, personalOnly: true, module: 'gym', group: 'evoluir' },
  { to: '/gratitude', label: 'Gratidão', icon: HandHeart, group: 'evoluir' },
  { to: '/library', label: 'Biblioteca', short: 'Livros', icon: Library, group: 'evoluir' },
];

const GROUP_LABEL = { organizar: 'Organizar', evoluir: 'Evoluir', ajustes: 'Ajustes' } as const;

/** Itens visíveis: respeita os módulos escolhidos e o contexto (Academia some no modo Empresa). */
function useNav() {
  const scope = useUI((s) => s.scope);
  const modules = useModules();
  return NAV.filter((n) => !(n.personalOnly && scope === 'BUSINESS') && (!n.module || modules[n.module]));
}

const SCOPES: { value: ScopeFilter; label: string; icon: LucideIcon }[] = [
  { value: 'ALL', label: 'Todos', icon: Layers },
  { value: 'PERSONAL', label: 'Pessoal', icon: UserRound },
  { value: 'BUSINESS', label: 'Empresa', icon: Building },
];

/** Alterna o contexto global: tudo, só Pessoal (seu CPF) ou só Empresa. */
export function ScopeSwitcher({ collapsed, compact }: { collapsed?: boolean; compact?: boolean }) {
  const scope = useUI((s) => s.scope);
  const setScope = useUI((s) => s.setScope);
  return (
    <div role="radiogroup" aria-label="Contexto: pessoal ou empresa" className={cn('flex shrink-0 gap-0.5 rounded-lg bg-white/[0.06] p-0.5', collapsed && 'flex-col')}>
      {SCOPES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={scope === value}
          aria-label={label}
          title={label}
          onClick={() => setScope(value)}
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-semibold transition-colors duration-200',
            collapsed && 'flex-none',
            compact ? 'h-7' : 'h-8',
            scope === value
              ? value === 'PERSONAL'
                ? 'bg-brand text-white'
                : value === 'BUSINESS'
                  ? 'bg-business text-white'
                  : 'bg-white text-navy'
              : 'text-white/60 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {!collapsed && !(compact && value === 'ALL') && <span className={cn(compact && 'hidden min-[380px]:inline')}>{label}</span>}
        </button>
      ))}
    </div>
  );
}

function NavLinkItem({ entry, collapsed, onNavigate, badge }: { entry: NavEntry; collapsed?: boolean; onNavigate?: () => void; badge?: number }) {
  const { to, label, icon: Icon, end } = entry;
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      data-tour={`nav-${to}`}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium [@media(max-height:820px)]:h-9 transition-colors duration-200',
          isActive ? 'bg-white/10 text-white before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-primary' : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
          collapsed && 'justify-center px-0',
        )
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {!collapsed && <span>{label}</span>}
      {!!badge && (
        <span
          className={cn('grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white', collapsed ? 'absolute right-1 top-1' : 'ml-auto')}
          aria-label={`${badge} atrasadas`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavGroups({ collapsed, onNavigate, only }: { collapsed?: boolean; onNavigate?: () => void; only?: NavEntry[] }) {
  const { data: tasks = [] } = useScopedTasks();
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const visible = useNav();
  const nav = only ?? visible;
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-4">
      {(['organizar', 'evoluir', 'ajustes'] as const).map((g) => {
        const items = nav.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <div key={g} className="stagger flex flex-col gap-0.5">
            {!collapsed && <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{GROUP_LABEL[g]}</span>}
            {items.map((n) => (
              <NavLinkItem key={n.to} entry={n} collapsed={collapsed} onNavigate={onNavigate} badge={n.to === '/tasks' ? overdue : undefined} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/** Nome da pessoa + menu de configurações (tema, personalizar, backup, exemplos). */
function AccountMenu({ collapsed }: { collapsed?: boolean }) {
  const sync = useSyncState();
  const { data: user } = useUser();
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setTourOpen = useUI((s) => s.setTourOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const auth = useAuth();
  const navigate = useNavigate();
  const go = (to: string) => {
    setMobileMenu(false);
    navigate(to);
  };
  const name = user?.name && user.name !== 'Você' ? user.name : 'Você';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-white transition-colors hover:bg-white/[0.06]',
            collapsed && 'justify-center',
          )}
          aria-label="Configurações"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{initials(name) || <UserRound className="size-4" />}</span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-semibold">{firstName(name)}</span>
                <span className={cn('flex items-center gap-1 text-[11px]', sync === 'error' ? 'text-amber-300' : 'text-white/45')} title="Seus dados ficam guardados no seu login e aparecem em qualquer aparelho">
                  {sync !== 'local' && (sync === 'saved' ? <Cloud className="size-3" aria-hidden /> : sync === 'saving' ? <RefreshCw className="size-3 animate-spin" aria-hidden /> : <CloudOff className="size-3" aria-hidden />)}
                  {SYNC_LABEL[sync]}
                </span>
              </span>
              <Settings className="size-4 shrink-0 text-white/45" aria-hidden />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-60">
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </DropdownMenuItem>
          {auth.isAdmin && (
            <DropdownMenuItem
              onSelect={() => {
                setMobileMenu(false);
                navigate('/admin');
              }}
            >
              <ShieldCheck /> Administração (contas)
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => {
              setMobileMenu(false);
              setOnboardingOpen(true);
            }}
          >
            <WandSparkles /> Personalizar a Rutte
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setMobileMenu(false);
              setTourOpen(true);
            }}
          >
            <GraduationCap /> Ver tutorial de novo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => go('/settings')}>
            <Settings /> Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=alertas')}>
            <Bell /> Alertas no aparelho
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=google')}>
            <CalendarDays /> Google Agenda
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=ia')}>
            <Sparkles /> Rutte IA (Gemini ou Claude)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=dados')}>
            <DatabaseBackup /> Backup e dados
          </DropdownMenuItem>
          {auth.email && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => auth.signOut()}>
                <LogOut /> <span className="min-w-0">Sair<span className="block truncate text-xs text-foreground/50">{auth.email}</span></span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function AppLayout() {
  const modules = useModules();
  const { data: user, isLoading: userLoading } = useUser();
  const onboardingOpen = useUI((s) => s.onboardingOpen);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setScope = useUI((s) => s.setScope);
  const scope = useUI((s) => s.scope);
  const theme = useUI((s) => s.theme);
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const mobileMenuOpen = useUI((s) => s.mobileMenuOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const openNewTask = useUI((s) => s.openNewTask);
  const location = useLocation();
  useAlertsRunner();
  const nav = useNav();
  const primary = nav.filter((n) => n.primary);
  const more = nav.filter((n) => !n.primary);
  const showOnboarding = onboardingOpen || (!userLoading && user === null);
  const tourOpen = useUI((s) => s.tourOpen);
  const setTourOpen = useUI((s) => s.setTourOpen);
  const tutorialDone = useTutorialDone();
  // Tutorial: na primeira vez (depois da personalização) ou quando pedido no menu
  const showTour = !showOnboarding && !!user && (tourOpen || !user.tutorialDoneAt);

  // Sem o módulo Empresa não há separação: mostra tudo
  useEffect(() => {
    if (!modules.business && scope !== 'ALL') setScope('ALL');
  }, [modules.business, scope, setScope]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const motion = useUI((s) => s.motion);
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  // Contexto Empresa troca o acento da interface (vermelho → azul de mesmo tom)
  useEffect(() => {
    document.documentElement.dataset.scope = scope;
  }, [scope]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
  }, [location.pathname, setMobileMenu]);

  // Atalho: "n" abre um novo afazer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !el?.closest?.('input, textarea, select, [contenteditable], [role=dialog]')) {
        e.preventDefault();
        openNewTask();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openNewTask]);

  const title = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label;
  const moreActive = more.some((n) => location.pathname.startsWith(n.to));

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>

      {/* Menu lateral (computador) */}
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden flex-col gap-5 bg-navy px-3 py-4 [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:py-3 transition-all duration-200 md:flex', collapsed ? 'w-[72px]' : 'w-60')}>
        <div className={cn('flex shrink-0 items-center gap-2.5 px-1', collapsed && 'flex-col')}>
          <RutteLogo className="w-9 shrink-0" />
          {!collapsed && (
            <span className="font-brand min-w-0 flex-1 truncate text-xl font-bold text-white" title={BRAND.tagline}>
              {BRAND.name}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <Button onClick={() => openNewTask()} className={cn('h-10 shrink-0', collapsed && 'px-0')} aria-label="Novo afazer" title="Novo afazer (N)" data-tour="new-task">
          <Plus className="!size-[18px]" /> {!collapsed && 'Novo afazer'}
        </Button>

        {modules.business && <ScopeSwitcher collapsed={collapsed} />}

        {/* em telas baixas (notebook) a lista rola e o rodapé com as configurações fica sempre visível */}
        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_.15)_transparent]">
          <NavGroups collapsed={collapsed} />
        </div>

        <div className="shrink-0 border-t border-white/10 pt-3">
          <div data-tour="account">
            <AccountMenu collapsed={collapsed} />
          </div>
          {!collapsed && <DevCredit className="mt-2 px-2" />}
        </div>
      </aside>

      {/* Topo (celular) */}
      <header className="sticky top-0 z-20 flex h-[calc(3.25rem+env(safe-area-inset-top))] items-center gap-2.5 bg-navy px-4 pt-[env(safe-area-inset-top)] text-white md:hidden">
        <RutteLogo className="w-8" />
        <span className="font-brand truncate text-lg font-bold">{title ?? BRAND.name}</span>
        <div className="ml-auto">{modules.business && <ScopeSwitcher compact />}</div>
      </header>

      {/* "Mais" (celular): demais seções + configurações */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenu}>
        <SheetContent side="left" className="gap-5 bg-navy px-3 py-4" aria-describedby={undefined}>
          <DialogTitle className="flex items-center gap-2.5 px-1 text-white">
            <RutteLogo className="w-9" />
            <span className="font-brand text-xl font-bold">{BRAND.name}</span>
          </DialogTitle>
          {modules.business && <ScopeSwitcher />}
          <NavGroups onNavigate={() => setMobileMenu(false)} />
          <div className="mt-auto border-t border-white/10 pt-3">
            <AccountMenu />
            <DevCredit className="mt-2 px-2" />
          </div>
        </SheetContent>
      </Dialog>

      <main id="main" className={cn('pb-28 transition-all duration-200 md:pb-10', collapsed ? 'md:pl-[72px]' : 'md:pl-60')}>
        <div key={location.pathname} className="mx-auto w-full max-w-6xl animate-page-in px-4 py-5 sm:px-6 sm:py-8">
          <Outlet />
          <NewsPopup />
        </div>
      </main>

      {/* Barra inferior (celular): 4 atalhos + Mais */}
      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-navy pb-safe md:hidden">
        {primary.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            data-tour={`nav-${to}`}
            className={({ isActive }) => cn('flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors', isActive ? 'text-white' : 'text-white/45')}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('size-5', isActive && 'text-primary dark:text-neon')} aria-hidden />
                {short ?? label}
                <span className={cn('h-0.5 w-5 rounded-full', isActive ? 'bg-primary' : 'bg-transparent')} aria-hidden />
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMobileMenu(true)}
          data-tour="more"
          className={cn('flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors', moreActive ? 'text-white' : 'text-white/45')}
          aria-label="Mais opções"
        >
          <Ellipsis className={cn('size-5', moreActive && 'text-primary dark:text-neon')} aria-hidden />
          Mais
          <span className={cn('h-0.5 w-5 rounded-full', moreActive ? 'bg-primary' : 'bg-transparent')} aria-hidden />
        </button>
      </nav>

      {/* Botão flutuante (celular), fora da tela de Foco */}
      {location.pathname !== '/focus' && (
        <button
          type="button"
          onClick={() => openNewTask()}
          data-tour="new-task"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-primary pl-3.5 pr-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:brightness-110 active:scale-95 md:hidden"
          aria-label="Novo afazer"
        >
          <Plus className="size-5" aria-hidden />
          Novo Afazer
        </button>
      )}

      <TaskDrawer />
      <FocusEngine />
      <FocusPill />
      {showOnboarding && <Onboarding existing={user ?? null} onClose={() => setOnboardingOpen(false)} />}
      {showTour && (
        <Tour
          steps={welcomeSteps(user?.name && user.name !== 'Você' ? user.name.split(' ')[0] : '')}
          onFinish={(completed) => {
            setTourOpen(false);
            if (!user?.tutorialDoneAt) tutorialDone.mutate();
            if (completed) openNewTask();
          }}
        />
      )}
    </div>
  );
}
```

