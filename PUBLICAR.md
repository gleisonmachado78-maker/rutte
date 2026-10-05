# Publicar a Rutte com login (Supabase + Vercel)

São duas contas gratuitas: o **Supabase** guarda as contas e os dados de cada pessoa; o **Vercel** coloca o site no ar.
Leva uns 15 minutos. Nada aqui pede cartão de crédito.

## 1. Supabase (login e dados)

1. Entre em <https://supabase.com> → **Start your project** → faça login (pode ser com o GitHub).
2. **New project**: dê um nome (ex.: `rutte`), crie uma senha do banco (guarde-a) e escolha a região **South America (São Paulo)**.
3. *(Só se for guardar os dados na nuvem — `VITE_SUPABASE_SYNC=1`.)* Abra **SQL Editor → New query**, cole o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria a tabela `rutte_data` com proteção
   (cada pessoa só enxerga os próprios dados). No modo padrão (só login) este passo não é necessário.
4. Abra **Project Settings → API** (ou **Data API**) e copie:
   - **Project URL** → vai em `VITE_SUPABASE_URL`
   - a chave **anon public** → vai em `VITE_SUPABASE_ANON_KEY`
   > A chave *anon* é feita para ficar no site (a proteção é a regra do passo 3). **Nunca** use a chave `service_role`.
5. (Opcional) **Authentication → Email templates**: traduza os e-mails de confirmação e de nova senha para português.

## 2. Vercel (site no ar)

1. Entre em <https://vercel.com> com a sua conta do **GitHub**.
2. **Add New → Project** → importe o repositório **`rutte`**.
3. O Vercel reconhece o Vite sozinho (o arquivo `vercel.json` já está pronto). Antes de publicar, abra
   **Environment Variables** e cadastre:
   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | Project URL do Supabase |
   | `VITE_SUPABASE_ANON_KEY` | chave anon public |
   | `VITE_SUPABASE_GOOGLE` | `0` (ou `1` se fizer o passo 4) |
   | `VITE_SUPABASE_SYNC` | `0` = dados só no aparelho (padrão) · `1` = também na nuvem |
4. Clique em **Deploy**. No fim, o Vercel mostra o endereço, algo como `https://rutte-xxxx.vercel.app`.

## 3. Ligar os dois

No Supabase: **Authentication → URL Configuration**
- **Site URL**: o endereço do Vercel (ex.: `https://rutte-xxxx.vercel.app`)
- **Redirect URLs**: adicione `https://rutte-xxxx.vercel.app/**`

Pronto: ao abrir o site, a primeira tela é o **login**. Quem cria conta recebe um e-mail para confirmar, entra,
responde as perguntas de personalização e vê o **tutorial**. A lista de afazeres começa **vazia**.

## 4. (Opcional) Entrar com Google

1. No Google Cloud Console crie um **OAuth Client ID** (tipo *Web*), com a URI de redirecionamento que o Supabase mostra em
   **Authentication → Providers → Google** (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
2. Cole o Client ID e o Secret nessa tela do Supabase e ative o Google.
3. No Vercel, mude `VITE_SUPABASE_GOOGLE` para `1` e faça um novo deploy (**Deployments → Redeploy**).

## Testar no computador (opcional)

Crie um arquivo `.env` na pasta do projeto (copie de `.env.example`), preencha as duas chaves e rode `npm run dev`.
Para o login funcionar em `http://localhost:5173`, adicione também `http://localhost:5173/**` em **Redirect URLs**.

## Como os dados funcionam

- **Quem usa:** todo cadastro aparece no Supabase em **Authentication → Users** (e-mail, data do cadastro, último acesso);
  dali dá para bloquear ou apagar uma conta.
- **Padrão (`VITE_SUPABASE_SYNC=0`):** o Supabase cuida só do login. Os dados de cada conta ficam **no aparelho**, cada
  e-mail no seu espaço (dois cadastros no mesmo celular não se misturam). Trocar de aparelho começa do zero — use
  o Backup do menu para levar os dados.
- **Com `VITE_SUPABASE_SYNC=1`:** os dados também vão para a nuvem (tabela `rutte_data`) e o mesmo login mostra os mesmos
  dados no celular e no computador; sem internet, as mudanças sobem quando a conexão volta.
- Chaves de IA (Gemini/Claude), chave do Google Maps e PDFs anexados ficam **só no aparelho** (não vão para a nuvem).
