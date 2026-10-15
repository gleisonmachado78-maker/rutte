# Prompt — Design do site da Rutte

> Copie o texto abaixo e use em qualquer ferramenta de IA (Claude, ChatGPT, v0, Lovable, Figma AI…) para criar telas novas no mesmo visual da Rutte.

---

Crie a interface no estilo do site **Rutte — Sua secretária digital**: um app web de organização pessoal e profissional (afazeres, calendário, notas, foco, academia, biblioteca, roda da vida). O visual é **moderno, acolhedor e organizado**, com toque **neon discreto**. Ele deve parecer uma secretária competente e simpática, não um software corporativo frio.

## Identidade visual

**Paleta (obrigatória)**
- Navy `#111727`: cor base. É o fundo do modo escuro, o menu lateral e os textos no modo claro.
- Vermelho da marca `#B91B1C`: cor de destaque do contexto **Pessoal**, com brilho neon `#FF2E3B`.
- Roxo `#6D28D9`: cor de destaque do contexto **Empresa**, com brilho neon `#A855F7`. Use o mesmo layout do Pessoal, trocando só a cor de destaque.
- Vinho `#7F1D1C`: cor de apoio, para fundos de destaque e gradientes.
- Branco `#FFFFFF`: fundo do modo claro.
- Cinza `#E5E7EB`: bordas e superfícies suaves no modo claro.
- **Modo escuro** (com suporte também ao claro):
  - fundo `#111727`;
  - cartões `#1D2332`;
  - bordas `#2E3340`;
  - superfícies "muted" `#262B39`.
- **Cores de apoio para categorias** (áreas da vida), sempre acompanhadas de ícone e nome:
  - saúde `#DC2626`;
  - emocional `#DB2777`;
  - intelectual `#7C3AED`;
  - profissional `#2563EB`;
  - finanças `#059669`;
  - família `#D97706`;
  - social `#0891B2`;
  - lazer `#65A30D`.

**Tipografia**
- Textos e interface: **Plus Jakarta Sans** (400–800).
- Títulos de página (h1) e frases de destaque: **Fraunces** (serifada, 600–800, letter-spacing -0.01em).
- Hierarquia:
  - título de página 24–30px bold;
  - título de seção 18px bold;
  - corpo 14–15px;
  - rótulos 10–11px em CAIXA ALTA com espaçamento largo (tracking ~0.16em) e opacidade 45%.

**Formas e profundidade**
- Cantos arredondados:
  - botões e campos `rounded-xl` (12px);
  - cartões grandes `rounded-2xl`/`3xl` (16–24px);
  - selos e filtros em formato pílula (`rounded-full`).
- Cartões com borda fina de 1px e sombra discreta. No hover, sobem levemente (translateY -2px) e a sombra cresce.
- Brilho neon só em destaques, como o item ativo, o dia de hoje e o botão principal: `0 0 0 1px neon/30%, 0 0 10px neon/18%`.
- Ícones: **Lucide** com traço fino, 16–20px. Na cor de destaque quando ativos e com 50–65% de opacidade quando neutros.

## Estrutura das telas

**Menu lateral fixo (desktop)**
- Fundo navy e largura de 240px. Pode ser recolhido para 72px, ficando só com os ícones.
- Elementos, de cima para baixo:
  - logo e nome;
  - botão principal "+ Novo afazer" em vermelho, com brilho;
  - seletor de contexto **Todos · Pessoal · Empresa**, em segmentos;
  - grupos de navegação com rótulo pequeno em caixa alta ("ORGANIZAR", "EVOLUIR").
- Item ativo: fundo branco a 10% e uma barrinha de 3px na cor de destaque à esquerda.
- O rodapé fica sempre visível, com o avatar com iniciais, o nome, o status "☁ Salvo na nuvem" e uma engrenagem.

**Celular**
- Barra superior navy.
- Barra inferior com 5 ícones principais.
- Margem lateral de 16px.

**Página**
- Largura máxima de ~1150px e espaçamento vertical generoso (20–32px entre seções).
- Cabeçalho da página: título em Fraunces com ícone, uma linha de explicação em cinza (60% de opacidade) e as ações à direita, como busca e botão principal.

## Componentes padrão

- **Abas:**
  - Pílulas lado a lado com ícone e contador ao lado, em opacidade menor.
  - A ativa fica preenchida na cor de destaque.
  - Áreas extras vão num botão "Mais áreas ▾", que abre um painel com ícone, título e descrição de cada opção.
- **Filtros:** chips arredondados com borda fina. O ativo fica preenchido na cor de destaque com texto branco. Em telas pequenas, rolam para o lado.
- **Busca:** campo de 40px de altura com ícone de lupa à esquerda e um "x" para limpar.
- **Cartões de conteúdo** (como os podcasts e as playlists):
  - capa quadrada de 80–96px à esquerda;
  - título em 2 linhas no máximo;
  - selo pequeno ("OFICIAL", "POPULAR");
  - subtítulo em cinza;
  - ações em pílula, com a principal preenchida e a secundária com contorno;
  - estrelas de avaliação embaixo.
- **Seções por tema:**
  - título com emoji ou ícone colorido e a quantidade;
  - grade de 1, 2 ou 3 colunas;
  - 6 itens, depois o botão "Ver mais N itens de X".
- **Afazeres:**
  - cartão com checkbox redondo;
  - título;
  - selos de prioridade (Alta em vermelho, Média em âmbar…), status, categoria e projeto;
  - data com ícone;
  - barra colorida à esquerda na cor da área da vida;
  - item atrasado com um ponto vermelho.
- **Calendário:**
  - grade mensal;
  - dia de hoje com círculo na cor de destaque e brilho;
  - eventos com barra lateral na cor da área e fundo tingido a 24%;
  - repetições futuras com borda tracejada.
- **Notas:** caixas no estilo "post-it", com a cor escolhida no fundo suave e uma faixa colorida de 6px no topo. Elas podem ser arrastadas.
- **Estados vazios:**
  - borda tracejada;
  - ícone grande a 25% de opacidade;
  - frase acolhedora;
  - botão para começar.
- **Janelas (modais):** cantos de 16–24px. As de anúncio têm o topo em gradiente da cor de destaque para o navy.
- **Avisos (toasts):** no topo central, arredondados, com ação como "Desfazer".

## Movimento

- **Entrada de página:** sobe 22px com um leve desfoque, em 520ms (cubic-bezier .16,.8,.25,1).
- **Listas:** os itens entram em sequência (stagger), com 380ms cada.
- **Botões:** "afundam" levemente ao clicar (scale 0.95). Os cartões sobem no hover.
- **Movimento reduzido:** respeite `prefers-reduced-motion` e ofereça a opção de desligar as animações.

## Tom de voz

- A Rutte fala como uma **secretária próxima e gentil**, sempre em português do Brasil.
- Exemplos: "Bom dia, Ana! 👋", "Você tem 3 afazeres atrasados. Vamos resolver isso primeiro?", "Tudo em dia!".
- Frases curtas, positivas e diretas. Use emoji com moderação, só para dar calor humano.

## Acessibilidade

- Contraste adequado nos dois temas.
- Foco visível com um anel de 2px na cor de destaque.
- Áreas de toque de 36px ou mais.
- Rótulos descritivos (aria-label) nos botões que só têm ícone.
- A cor nunca é a única informação: sempre vem com ícone ou texto.
