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
        business: { DEFAULT: '#1B4FB9', neon: '#2E8BFF' },
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
        neon: '0 0 0 1px rgb(var(--neon) / .35), 0 0 16px rgb(var(--neon) / .45)',
        'neon-lg': '0 0 0 1px rgb(var(--neon) / .5), 0 0 28px rgb(var(--neon) / .6)',
        'neon-brand': '0 0 0 1px rgb(255 46 59 / .4), 0 0 20px rgb(255 46 59 / .5)',
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
      },
      animation: {
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'slide-in-left': 'slide-in-left 200ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'zoom-in': 'zoom-in 150ms ease-out',
      },
    },
  },
  plugins: [],
}
