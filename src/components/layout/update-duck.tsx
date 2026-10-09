import { useEffect, useState } from 'react';

/** Frases que aparecem enquanto o pato dança e a nova versão carrega. */
const PHRASES = [
  'Quack! Estou trazendo novidades para você…',
  'Segura aí: a Rutte está trocando de roupa!',
  'O pato está instalando as melhorias. Já volta!',
  'Arrumando a casa para você render ainda mais…',
  'Atualizando com muito quack e carinho.',
];

const CHECK_EVERY = 60_000;
const isTyping = () => {
  const el = document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
};
const busy = () => isTyping() || !!document.querySelector('[role=dialog]');

/**
 * Confere de tempos em tempos se saiu uma versão nova do site (version.json gerado no build).
 * Quando sai, mostra o pato dançando com uma frase e recarrega — sem interromper quem está digitando.
 */
export function UpdateDuck() {
  const [phrase, setPhrase] = useState<string | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV || import.meta.env.MODE === 'single' || location.protocol !== 'https:') return;
    let pending = false;
    let done = false;

    const apply = () => {
      if (done) return;
      // aba escondida: espera a pessoa voltar para ela ver o pato; digitando ou com janela aberta: espera terminar
      if (document.visibilityState !== 'visible' || busy()) {
        window.setTimeout(apply, 4000);
        return;
      }
      done = true;
      setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
      window.setTimeout(() => location.reload(), 3200);
    };

    const check = async () => {
      if (done) return;
      if (pending) return; // já está esperando a hora certa de mostrar o pato
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const { id } = (await res.json()) as { id?: string };
        if (id && id !== __BUILD_ID__) {
          pending = true;
          apply();
        }
      } catch {
        /* sem internet: confere depois */
      }
    };

    const t = window.setInterval(check, CHECK_EVERY);
    const onVis = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    const first = window.setTimeout(check, 15_000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(first);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
    };
  }, []);

  // prévia: abra o site com #pato para ver a tela
  useEffect(() => {
    if (!location.hash.endsWith('pato')) return;
    setPhrase(PHRASES[0]);
    const t = window.setTimeout(() => setPhrase(null), 9000);
    return () => window.clearTimeout(t);
  }, []);

  if (!phrase) return null;
  return (
    <div role="status" aria-live="assertive" className="duck-screen fixed inset-0 z-[100] grid place-items-center bg-navy/95 px-6 text-center text-white backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative">
          <span className="duck-note duck-note-1" aria-hidden>♪</span>
          <span className="duck-note duck-note-2" aria-hidden>♫</span>
          <span className="duck-note duck-note-3" aria-hidden>♪</span>
          <span className="duck-dance block select-none text-[96px] leading-none sm:text-[120px]" aria-hidden>
            🦆
          </span>
          <span className="duck-shadow mx-auto mt-2 block h-2.5 w-20 rounded-full bg-black/40" aria-hidden />
        </div>
        <p className="font-brand mt-8 max-w-sm text-balance text-xl font-bold sm:text-2xl">{phrase}</p>
        <p className="mt-2 text-sm text-white/60">Nova versão da Rutte chegando · seus dados continuam salvos</p>
        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <span className="duck-bar block h-full rounded-full bg-primary shadow-neon" />
        </div>
      </div>
    </div>
  );
}
