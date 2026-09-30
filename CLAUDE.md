# Rutte — Sua secretária digital

Projeto **pessoal** (não é da Usee Brasil: não usar os vaults/Constituição da Usee aqui).
App web de produtividade: afazeres (Pessoal × Empresa), calendário, Roda da Vida com vídeos, Academia
(plano, registro de cargas, PRs, gerador de treino com holograma, hologramas de execução). Sem backend:
tudo roda no navegador e salva em `localStorage`.

Idioma: interface, textos e mensagens de commit em **português do Brasil**.

## Comandos

```bash
npm run dev            # http://localhost:5173
npm run build          # tsc -b + build de produção (dist/)
npm run build:html     # HTML único em dist-single/index.html (abre via file://, usa HashRouter)
npm run build:celular  # pacote ./celular: HTML único + manifesto PWA + ícones + sw.js
npm run logo           # regenera logo/ícones a partir de assets/rutte-original.png
```

Não há testes automatizados nem lint configurado além de `oxlint`. **Sempre rode `npm run build`** (checagem de
tipos estrita) antes de considerar uma mudança pronta. No Windows, o Node fica em `C:\Program Files\nodejs`
(pode não estar no PATH do shell: prefixe o PATH se `node` não for encontrado).

## Stack

React 19 + Vite 8 + TypeScript (strict) · Tailwind **v3** (config em `tailwind.config.js`, não v4) ·
componentes estilo shadcn escritos à mão sobre Radix (`src/components/ui`) · Zustand (estado de UI) ·
TanStack Query (dados) · react-hook-form + zod 4 · date-fns (pt-BR) · sonner (toasts) · lucide-react (ícones).
Alias `@/` → `src/`.

## Arquitetura

- `src/services/api.ts` — **Mock API** assíncrona sobre `localStorage` (chave `secretaria:db:v1`). Toda leitura/escrita
  passa por aqui; trocar por backend real = reimplementar este arquivo mantendo as assinaturas.
- `src/services/seed.ts` — dados de exemplo + `migrate()`. Ao mudar o formato do banco, **incremente `DB_VERSION`**
  e escreva a migração (nunca apague dados do usuário).
- `src/hooks/use-data.ts` — hooks do React Query (mutations otimistas + toasts). `useScopedTasks` aplica o filtro
  global Pessoal/Empresa.
- `src/store/ui.ts` — Zustand persistido (`secretaria:ui`): tema, escopo, filtros, drawer. Campos novos de filtro
  precisam entrar em `EMPTY_FILTERS` (o `merge` completa estados antigos).
- `src/types/index.ts` — contratos (`Task`, `GymData`, `WheelAssessment`…).
- `src/lib/` — regras puras: datas/prioridade (`task-utils`), filtros, áreas da vida e dicas (`life-areas`),
  vídeos (`videos`), academia (`gym`: PR, 1RM de Epley, séries mensais), gerador de treino (`workout-generator`),
  boas práticas (`training-habits`), IMC (`body`), animações dos exercícios (`exercise-motion` + `exercise-guide`).
- `src/pages/` — Dashboard `/`, Afazeres `/tasks`, Calendário `/calendar`, Roda da Vida `/life`, Academia `/gym`.
- `src/components/tasks/task-drawer.tsx` — drawer global de criação/edição (montado no layout).

## Convenções importantes

- **Paleta da marca** (tokens em `tailwind.config.js` / `src/index.css`): navy `#111727`, wine `#7F1D1C`,
  vermelho `#B91B1C`, cinza `#E5E7EB`, branco. `primary`/`neon` são variáveis CSS: no contexto **Empresa**
  (`html[data-scope=BUSINESS]`) o acento vira azul de mesmo tom. **Alertas** (urgente/atrasada) usam `brand`
  (sempre vermelho). Botões de destaque usam a classe `btn-neon`.
- Fontes: Plus Jakarta Sans (texto) e Fraunces (títulos `h1` e `.font-brand`).
- Acessibilidade: badges sempre com **ícone + texto** (nunca só cor); `aria-label` em botões só com ícone.
- **Nunca use `window.confirm/alert/prompt`** — use `askConfirm()` de `src/components/ui/confirm.tsx`
  (leitores de HTML no iPhone bloqueiam os diálogos nativos).
- Mobile-first: testar em 360–390 px sem rolagem horizontal; campos têm 16 px no celular (evita zoom no iOS);
  respeitar `env(safe-area-inset-*)`.
- Links internos com `<Link>` do React Router (o build HTML único usa `HashRouter`; não use `href="/rota"`).
- Assets da interface via `import` (ex.: `src/assets/rutte-logo.png`), não por caminho `/public`, para funcionarem
  no HTML único.
- Vídeos do YouTube em `src/lib/videos.ts`: só IDs **verificados** via oEmbed
  (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` → 200), em português,
  preferindo animados/ilustrados.
- Novo exercício na biblioteca: adicionar metadados em `workout-generator.ts` (`META`), guia/animação em
  `exercise-guide.ts` (senão cai no genérico do grupo muscular).

## Dados de exemplo

Seed com datas relativas a "hoje" (tarefas atrasadas/hoje/futuras, ~3 meses de treinos). "Restaurar exemplos"
substitui **todos** os dados; o usuário pode exportar/importar backup JSON pelo menu.
