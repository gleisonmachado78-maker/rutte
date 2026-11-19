import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Component, type ReactNode } from 'react';
import { isChunkError, reloadForNewVersion } from '@/lib/lazy-page';

/** Se uma tela quebrar, mostra um aviso com "Recarregar" em vez de deixar o app em branco. */
export class PageErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // versão antiga aberta depois de uma atualização: tenta pegar a nova sozinho
    if (isChunkError(error)) reloadForNewVersion();
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const outdated = isChunkError(this.state.error);
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary dark:text-neon">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">{outdated ? 'Tem uma versão nova da Rutte' : 'Algo deu errado nesta tela'}</h1>
        <p className="text-sm text-foreground/60">{outdated ? 'Toque em recarregar para atualizar. Seus dados continuam salvos.' : 'Seus dados continuam salvos. Recarregue para tentar de novo.'}</p>
        <button
          type="button"
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('v', Date.now().toString(36));
            window.location.replace(url.toString());
          }}
          className="btn-neon mt-2 inline-flex h-11 items-center gap-2 rounded-xl px-5 font-semibold text-white"
        >
          <RefreshCw className="size-4" aria-hidden /> Recarregar
        </button>
      </div>
    );
  }
}
