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
