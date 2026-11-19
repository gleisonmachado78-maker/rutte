import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { reloadForNewVersion } from './lib/lazy-page';

// depois de uma atualização do site, um pedaço antigo pode não existir mais: recarrega para pegar a versão nova
window.addEventListener('vite:preloadError', (e) => {
  if (reloadForNewVersion()) e.preventDefault();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
