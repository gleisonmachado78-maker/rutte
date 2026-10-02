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

## Personalização

Na primeira visita (sem `user` no banco) abre `src/components/onboarding/onboarding.tsx`: nome, momento de vida,
até 3 objetivos, horário em que rende mais, maior dificuldade, módulos e plano inicial. As regras ficam em
`src/lib/onboarding.ts` (objetivos → áreas da vida, afazeres iniciais, objetivo de treino; momento → categorias;
dificuldade → dica do dia). `useModules()` esconde Academia, Roda da Vida e o seletor Pessoal/Empresa conforme a
escolha. Reabre pelo menu “Personalizar a Rutte” (mantém os dados). Ao adicionar um objetivo novo, cadastre-o em
`GOALS` com áreas e afazeres iniciais.

## Foco (Pomodoro) e visual

- Timer em `src/store/focus.ts` (Zustand persistido `rutte:focus`): guarda `endsAt` (horário de término), então segue
  certo ao trocar de página, recarregar ou com a aba em segundo plano. `FocusEngine` (no layout) detecta o fim da fase,
  registra o pomodoro (`focusSessions` no banco + histórico do afazer), toca o aviso e atualiza o título da aba;
  `FocusPill` mostra o mini-cronômetro fora da página `/focus`.
- Caixas leves: regra global em `src/index.css` para `.bg-card.border` (borda fina + sombra discreta); cantos em neon
  só com a classe opcional `.hud` (timer do Foco). Brilhos (`btn-neon`, `shadow-neon`) são sutis — manter assim,
  com especificidade zero (`:where`) para não sobrescrever destaques.
- Navegação: menu lateral em grupos “Organizar” e “Evoluir” + menu de Configurações (nome da pessoa); no celular,
  barra inferior com 4 atalhos (`primary` em `NAV`) + “Mais” (gaveta com o resto e as configurações).

## Biblioteca

`/library`: abas Livros e Vídeos por tema (`TOPICS` em `src/lib/library.ts`; vídeos entram no tema pela área da
Roda da Vida). Livros em `src/lib/books.ts` — só edições brasileiras com capa real do Google Livros (conferir
`https://books.google.com/books/content?id=ID&printsec=frontcover&img=1&zoom=1` → imagem > 2 KB). Onde comprar =
links de busca (Amazon por ISBN, Estante Virtual, Google Livros). Estante pessoal em `bookShelf` no banco. Cada
vídeo tem descrição curta em `VIDEO_DESC` ou no campo `desc` (`src/lib/videos.ts`).

## Avaliações

`ratings` no banco: chave `tipo:id` (`book:googleId`, `free:url`, `video:youtubeId`, `prayer:id`, `meditation:id`)
→ `{ stars 1–5, note?, at }`. Componente `StarRating`/`StarsBadge` em `components/ui/star-rating.tsx`;
hooks `useRatings`/`useSetRating`. Filtro “Mais bem avaliados” na Biblioteca e “Minhas favoritas” nas orações.

## Local dos compromissos (Google Maps)

`Task.location` (endereço, nome, placeId, lat/lng). `src/lib/maps.ts`: chave da pessoa (localStorage `rutte:maps-key`
ou `VITE_GOOGLE_MAPS_API_KEY` no `.env` — nunca no código), carregador oficial e links de rota. Com chave,
`location-field.tsx` usa `PlaceAutocompleteElement` (evento `gmp-select` → `placePrediction.toPlace()` →
`fetchFields`) e mini-mapa com `AdvancedMarkerElement`; sem chave, campo de texto comum. “Como chegar” (Google Maps
por modo + Waze) são links e funcionam sem chave. A chave é cadastrada em Configurações → Google Maps.

## Gratidão

`/gratitude`: diário (o que tenho / já tive / ainda terei; um registro por dia em `gratitude`), respiração guiada
(`components/gratitude/breathing.tsx`), meditação do dia (roteiros guiados em `src/lib/meditations.ts`, rodízio
pelo dia do ano com `meditationOfDay`/`dailyPick`; vídeo do dia), oração e reflexão do dia, orações por tema tradicionais de domínio público e reflexões (`src/lib/gratitude.ts`), vídeos
verificados em `src/lib/gratitude-videos.ts` e “Relembrar”. Livros gratuitos (`src/lib/free-books.ts`, com `category` clássico/técnica e `needsSignup`) e plataformas legais
para ler best-sellers (`src/lib/reading-platforms.ts`): só domínio
público ou publicações oficiais gratuitas — nunca PDFs piratas.

## Dados de exemplo

Seed com datas relativas a "hoje" (tarefas atrasadas/hoje/futuras, ~3 meses de treinos). "Restaurar exemplos"
substitui **todos** os dados; o usuário pode exportar/importar backup JSON pelo menu.

## Meus PDFs

`src/lib/local-files.ts` (IndexedDB `rutte-files`): a pessoa anexa o próprio PDF a um livro (`MyPdf` no card).
O arquivo fica só no navegador dela — nunca no código, no repositório (`*.pdf` no .gitignore), no backup ou no build.
Não incluir PDFs de livros protegidos em `free-books.ts`.

## Podcasts e audiolivros

Aba Podcasts na Biblioteca (`src/lib/podcasts.ts`, IDs conferidos em `https://open.spotify.com/oembed?url=https://open.spotify.com/show/ID`;
o `title` do oEmbed de um show é o do último episódio — usar o nome do programa). `src/lib/spotify.ts`: `openSpotify` tenta o app
(`spotify:show:ID`) e cai para open.spotify.com; “Ouvir aqui” usa o embed. Cada livro tem links de audiolivro (Spotify, Audible,
Google Play, Ubook — buscas).

## Holograma 3D dos exercícios

`components/gym/exercise-hologram-3d.tsx` (three.js, carregado sob demanda no modal "Como fazer") + `src/lib/exercise-3d.ts`
(esqueleto 3D com IK de dois segmentos e vetor de polo; dicas de profundidade em `Motion.d3`: afastamento de mãos/pés,
`armPole`/`legPole`, `slerpHands`; coreografias só do 3D em `OVERRIDE_3D`, ex.: crucifixo deitado). Usa as mesmas poses de
`exercise-motion.ts` — o plano 2D vira X/Y e cada lado do corpo ganha profundidade Z (`DEPTH`). Material holográfico em shader
(fresnel + linhas de varredura, blending aditivo), cor de `--neon`, OrbitControls (arrastar para girar, sem zoom), auto-rotação.
Miniaturas continuam em 2D (limite de contextos WebGL). Sem WebGL, cai para o 2D. Liberar tudo no unmount.

## Relacionamento amoroso

Na área `relacionamentos` da Roda da Vida, `LoveTips` pergunta a situação (`relationship: casal | solteiro` no banco).
Casal: `LIFE_TIPS.relacionamentos`. Solteiro: etapas `SINGLE_STEPS` (começar, onde conhecer, ações, cuidados) com `SINGLE_TIPS`;
`how` de cada dica vira o “o que fazer” do afazer.

## Rutte IA

`/assistant` (`src/pages/assistant.tsx`, `src/lib/ai.ts`, `src/store/chat.ts` persist `rutte:chat`): conversa com a API da Anthropic direto do
navegador (header `anthropic-dangerous-direct-browser-access`), streaming SSE e ferramentas `criar_afazer`, `concluir_afazer`,
`adiar_afazer` (loop de até 5 rodadas). Chave da pessoa em localStorage `rutte:ai-key` (nunca no código), modelo em `rutte:ai-model`.
`buildContext` resume afazeres, perfil, Roda da Vida, academia, foco e gratidão a cada envio. Personalidades em `PERSONAS`.
Pesquisa na web: ferramenta oficial `web_search_20250305` (liga/desliga em `rutte:ai-web`); blocos `server_tool_use` /
`web_search_tool_result` e citações vão inteiros dentro da rodada e são removidos ao guardar o histórico (`compact`). Fontes
aparecem sob a resposta. Relatórios: `src/lib/reports.ts` (`buildReport` por tema/período, calculado no aparelho) +
`components/assistant/report-card.tsx`; a IA chama `gerar_relatorio`; o menu “Relatórios” gera sem usar a IA.
