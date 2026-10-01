# Rutte — Sua secretária digital

A Rutte é a secretária por trás da sua produtividade: afazeres Pessoais (seu CPF) e da Empresa, calendário e Roda da Vida com vídeos por área.

React + Vite + TypeScript · Tailwind CSS · Radix/shadcn-style · Zustand · TanStack Query · react-hook-form + zod · date-fns · sonner · lucide-react.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checagem de tipos + build de produção
npm run build:html  # gera um único HTML (dist-single/index.html) que abre com duplo clique, sem servidor
npm run build:celular  # pacote para celular em ./celular (HTML único + manifesto, ícones e service worker)
```

## Estrutura

```
src/
  types/            contratos (Task, Category, Project, Contact…)
  services/seed.ts  dados iniciais (datas relativas a "hoje")
  services/api.ts   Mock API assíncrona sobre localStorage (troque aqui por backend real)
  hooks/use-data.ts queries/mutations do React Query (otimistas) + toasts
  store/ui.ts       estado de UI (tema, sidebar, filtros, drawer, visualização) — persistido
  lib/              regras de datas/prioridade, filtro e utilitários
  components/ui     primitives (Button, Input, Select, Checkbox, Sheet, Dialog, Dropdown)
  components/tasks  card, badges, filtros, kanban, drawer de detalhe/edição
  components/layout sidebar retrátil, header + nav inferior + FAB mobile
  pages/            Dashboard (/), Afazeres (/tasks), Calendário (/calendar), Roda da Vida (/life)
  lib/life-areas.ts áreas da Roda da Vida
  lib/videos.ts     curadoria de vídeos do YouTube em português por área (IDs verificados via oEmbed)
  components/brand  logo da Rutte (SVG vetorizado; cor via currentColor)
```

## Notas

- Dados ficam em `localStorage` (`secretaria:db:v1`). "Restaurar exemplos" no menu recria o seed.
- Extensões ao contrato `Task`: `history` (log de alterações) e `attachments` (arquivos até 1 MB, como data URL).
- Concluir uma tarefa com `recurrenceRule` (`FREQ=DAILY|WEEKLY|MONTHLY|YEARLY`) gera a próxima ocorrência.
- Atalho: tecla **N** abre um novo afazer. Kanban aceita arrastar e soltar entre colunas.
- Paleta em `tailwind.config.js`: `navy #111727`, `wine #7F1D1C`, `primary #B91B1C`, `surface #E5E7EB`, `white #FFFFFF`.
- **Pessoal x Empresa:** cada afazer tem `scope` (`PERSONAL` | `BUSINESS`). O seletor global (Todos / Pessoal / Empresa) filtra Dashboard, Afazeres e Calendário; categorias e projetos também pertencem a um contexto.
- **Roda da Vida:** notas 0–10 por área, comparação com a avaliação anterior, "onde focar" (3 áreas mais baixas → criar afazer / ver vídeos) e histórico. Afazeres podem ter `lifeAreaId`.
- **Logo:** PNG em `public/rutte-logo.png` (1024px). `npm run logo` regenera o PNG, o favicon e o apple-touch-icon a partir de `assets/rutte-original.png`.
- **Cores:** acento vermelho neon (`--primary`/`--neon` em `src/index.css`); no contexto Empresa o acento vira azul de mesmo tom (`html[data-scope=BUSINESS]`). Alertas (urgente/atrasada) usam sempre `brand` (vermelho). Fontes: Plus Jakarta Sans (texto) e Fraunces (títulos e marca).
- **Vídeos:** maioria animados/ilustrados (`style: "animado"`), algumas palestras; filtro "Só animados".
- **Onde focar agora:** dicas de atividades por área (`LIFE_TIPS` em `src/lib/life-areas.ts`); um clique cria o afazer.
- **Academia (Pessoal):** plano semanal (ex.: seg peito, ter perna), registro do treino do dia com séries × kg × reps (pré-preenche a última carga), PR automático (maior carga; 1RM estimado por Epley), evolução mensal (carga máxima, treinos e volume) e histórico. Dados em `gym` no banco local; lógica em `src/lib/gym.ts`.
- **Gerador de treino:** questionário (objetivo, nível, dias, tempo, foco, local, restrições) + holograma corporal que acende os músculos treinados. Regras em `src/lib/workout-generator.ts` (divisão por nº de dias, séries/reps/descanso por objetivo, filtro por equipamento e restrição). O resultado é editável antes de aplicar; também cria lembretes semanais nos afazeres. Boas práticas (foco × acelerar) em `src/lib/training-habits.ts` viram afazeres recorrentes. No Treino do dia, a Rutte sugere subir a carga quando você bate o topo das repetições (sobrecarga progressiva).
- **Hologramas de execução:** cada exercício tem uma animação em neon (figura + equipamento) e um guia com passo a passo, erros comuns e respiração. Poses-chave e cinemática inversa em `src/lib/exercise-motion.ts`; textos em `src/lib/exercise-guide.ts` (exercícios criados pelo usuário usam a animação do grupo muscular). Aparecem no Treino do dia (miniatura), Plano semanal, Gerador e na aba "Exercícios".
- **Celular:** confirmações são feitas dentro do app (`askConfirm`, em `src/components/ui/confirm.tsx`) porque leitores de HTML do iPhone costumam bloquear `window.confirm`. Campos com 16px no celular (sem zoom no iOS), áreas seguras do notch, metas de "tela inicial" e PWA (manifesto + `sw.js`, registrado só em https). **Backup dos dados** (menu lateral) exporta/importa tudo em JSON para levar entre aparelhos.
- **Personalização:** na primeira visita a Rutte faz 6 perguntas (nome, momento de vida, objetivos, rotina, módulos, plano inicial) e adapta menus, categorias, afazeres iniciais, dica do dia, destaques da Roda da Vida e o objetivo do gerador de treino. Refaça pelo menu "Personalizar a Rutte".
- **Meditação do dia:** um roteiro guiado diferente a cada dia (passo a passo, com tempo e avanço automático) e um vídeo do dia, na página Gratidão. Orações mais profundas organizadas por tema, com oração e reflexão do dia.
- **Podcasts e audiolivros:** 33 podcasts em português por tema, que abrem direto no app do Spotify ou tocam dentro da Rutte; cada livro tem links de audiolivro.
- **Avaliações:** 1 a 5 estrelas (e opinião curta) em livros, vídeos, orações e meditações; filtro "Mais bem avaliados".
- **Foco (Pomodoro):** página `/focus` com campo "O que você vai fazer agora?" (texto livre ou um afazer), anel holográfico, fases configuráveis (25/5/15, longa a cada 4), som e vibração no fim, mini-cronômetro nas outras telas e registro dos pomodoros (também no histórico do afazer). Botão "Focar" dentro de cada afazer.
- O banco local migra sozinho (v1 → v2 → v3) sem perder dados.
