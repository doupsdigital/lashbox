# LashBox: contexto completo do projeto

Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto. Resume o que foi feito até 05/11/2026 (Fase 2, Fundação, e os ajustes antes de colocar no ar), para continuar o trabalho em qualquer computador.

## 1. O produto

- **O que é:** um app (PWA) em português, por **assinatura**, para **lash designers**. "A caixa de ferramentas da lash designer": artes prontas, vale-presente, ofertas calculadas, mensagens prontas e um plano de divulgação — tudo com o nome, a foto e os preços da própria lash, direto do celular.
- **Plano completo do produto:** `referencia/LASHBOX-PLANO.md` (oferta, preços, conteúdo, etapas). Leia antes de mexer em preço, posicionamento ou no calendário de lançamento.
- **Como é vendido:** Kiwify, produto de **assinatura "LashBox"** (mensal R$ 22,90 ou anual R$ 149,00 — preços decididos na hora, diferentes dos R$ 19,90/R$ 147 do plano original, para melhorar a margem depois da taxa da Kiwify), mais **kits sazonais** avulsos (hoje só **"LashBox · Kit Fim de Ano"**, R$ 14,90) comprados dentro do app. **Nenhum kit é bônus da assinatura** — nem o Kit Fim de Ano: ele é só o primeiro kit à venda, bloqueado (prévia desfocada + "R$ 14,90 · Comprar") até a compra, liberado por `my_products()`.
- **Situação:** **no ar em produção e vendendo de verdade** em https://lashbox.app — GitHub, Supabase, Vercel, domínio (Hostinger), Resend e **Kiwify** todos configurados e testados de ponta a ponta, inclusive um pagamento de assinatura real (Pix Automático) com reembolso, confirmando que o webhook funciona. Não há mais pendência de infraestrutura — ver seção 8.
- **Reaproveitado do Agenda Lotada** (`../agendalotada`, mesma dona): o motor de login (link mágico + código de 8 dígitos), o motor de artes/exportação PNG, o vale-presente, o Montador de ofertas, o conteúdo e as ferramentas do **Kit Agenda de Fim de Ano** (agora "Kit Fim de Ano" do LashBox) e os textos de referência das mensagens.

## 2. Como trabalhar com a dona do projeto

- Mesmas regras do Agenda Lotada: ela não é programadora, fala português, um passo de cada vez.
- **Git:** só commit/push quando ela pedir. Nunca commitar `.env`. Nunca colar tokens no chat.
- **Painéis (Supabase, Vercel, Kiwify, Resend):** ela mesma clica; dê o passo a passo. Não use as CLIs.
- Linguagem simples e direta em pt-BR nos textos do produto.

## 3. Configurar este computador

```bash
cd lashbox
npm install
```

- **Variáveis do Supabase:** o projeto já existe (ref `bgtqyndumongrgowkzfs`, São Paulo). `.env.local` (fora do Git) já está preenchido neste computador com a URL e a chave anon/publishable. Em outro computador, copie `.env.example` para `.env.local` e peça esses dois valores à dona (Supabase → Project Settings → API Keys; a chave "anon public" não é segredo). **Sem esse arquivo, `npm run dev` roda em modo local**: sem login, com uma assinatura anual "ativa" simulada (`state/subscription.tsx`), para testar todas as telas livremente.

### Comandos

| Comando | Para quê |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:5190 (porta fixa, diferente da 5180 do Agenda Lotada) |
| `npm run build` | Checa os tipos (`tsc -b`) e gera o build em `dist/` |
| `npm run preview` | Build final em http://localhost:4190 |
| `npm run icons` | Gera os ícones (PWA, apple-touch, favicons, `icone-64/128/256.webp`) a partir de `public/icone-lashbox.png` |

Para tirar prints das telas (390×844), sem Supabase:
```bash
VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite --port 5191 --strictPort --host 127.0.0.1
node scripts/screenshot.mjs        # as 16 telas do app, logada, com o estúdio preenchido
node scripts/screenshot-auth.mjs   # /lp, /entrar e /assinatura-vencida, via ?preview=
```
As duas usam `playwright-core` (instalado com `npm install --no-save playwright-core` na primeira vez; rode `npx playwright-core install chromium` se faltar o navegador). Os prints saem em `referencia/prints/` (fora do Git).

O parâmetro `?preview=lp|entrar|expired` em qualquer URL força essa tela mesmo sem Supabase — só funciona em `npm run dev` (bloqueado em produção, ver `devPreview()` em `App.tsx`).

O parâmetro `?lockKits=1` (também só em `npm run dev`) força todos os kits bloqueados mesmo no modo local, que por padrão libera tudo — útil para ver/testar a prévia desfocada e o botão de comprar sem precisar de uma compra de verdade (ver `devForceLocked()` em `state/purchases.tsx`). `scripts/screenshot-kits.mjs` usa esse parâmetro para tirar prints dos dois estados.

Para pular o onboarding ao testar manualmente, grave no localStorage antes de abrir `/inicio`:
- `lashbox:onboarding-seen` = `"1"`
- `lashbox:studio:v1` = `JSON.stringify({ ownerName, studioName, neighborhood, city, whatsapp, instagram, pixKey, bookingLink, servicePrice, maintenancePrice, palette, address: "" })`

## 4. Arquitetura

```
src/
  App.tsx                 Rotas e o "Gate" (vendas/login → carregamento → assinatura vencida → app)
  main.tsx                Providers: AuthProvider, StudioProvider, SubscriptionProvider
  screens/                Login, Onboarding, Home, Studio, ExpiredSubscription, LandingPage
    create/                Gallery (/criar), ArtEditor (/criar/:modeloId), Gift (/vale-presente)
    sell/                  Hub (/vender), Combos (/vender/ofertas), FairPrice (/vender/preco-justo), Goal (/vender/meta)
    messages/              Library (/mensagens: mensagens + minhas clientes)
    plan/                  Plan (/planejar: esta semana + datas do ano)
    kits/                  Kits (/kits), KitDetail (/kits/:key)
  components/             ui.tsx, TabBar.tsx, Messages.tsx, StudioNotice.tsx
                           art/StoryBoard.tsx, GiftBoard.tsx, ScaledBoard.tsx (motor de artes, do Agenda Lotada)
  content/lash/           Conteúdo do nicho "lash" — trocar esta pasta inteira é o bastante para uma "Nail Box"
                           arts.json, messages.json, week-plan.json, year-dates.json, kits.json,
                           home-suggestions.json, kit-fim-de-ano-v2.json (+ kitFimDeAno.ts), index.ts
  state/                  auth.tsx (login), studio.tsx (Meu Estúdio), subscription.tsx (situação da assinatura),
                          purchases.tsx (quais kits sazonais a usuária já comprou, via my_products())
  lib/                    supabase.ts, config.ts (links externos), combo.ts, exportBoard.ts, artPalettes.ts,
                          studioTokens.ts, studioPhoto.ts, studioFooter.ts, vipList.ts, artDraft.ts, text.ts
supabase/                 migrations/ (2, aplicadas), functions/ (request-login e kiwify-webhook, publicadas),
                          templates/link-magico.html (já colado no painel do Supabase) — ver seção 8
scripts/                  gerar-icones.mjs, screenshot.mjs, screenshot-auth.mjs, screenshot-kits.mjs
public/                   favicon-maleta.svg (silhueta simplificada do favicon, ver seção "Regras do app")
```

### Rotas

| Rota | Tela | Observação |
|---|---|---|
| `/` | — | Redireciona para `/inicio` (logada) ou `/lp` (não logada) |
| `/lp` | LandingPage | Página de vendas **provisória** (só logo + "Entrar") |
| `/entrar` | Login | Link mágico + código de 8 dígitos |
| `/boas-vindas` | Onboarding | 3 passos, termina em `/estudio` |
| `/inicio` | Home | "Para postar hoje", 4 áreas, kits da temporada |
| `/criar`, `/criar/:modeloId` | Gallery, ArtEditor | Galeria por categoria + editor de arte |
| `/vale-presente` | GiftScreen | Vale-presente (4 estilos × 3 paletas) |
| `/vender`, `/vender/ofertas`, `/vender/preco-justo`, `/vender/meta` | SellHub, Combos, FairPrice, Goal | — |
| `/mensagens` | MessagesLibrary | Segmentado: Mensagens / Minhas clientes |
| `/planejar` | PlanScreen | Segmentado: Esta semana / Datas do ano |
| `/kits`, `/kits/:key` | Kits, KitDetail | Loja de kits + Kit Fim de Ano (ferramentas embutidas) |
| `/estudio` | StudioScreen | Dados do estúdio + situação da assinatura + Sair |
| `/assinatura-vencida` | — | Não é uma rota: é o `status === 'expired'` do Gate (qualquer URL) |

A barra de abas (Início · Criar · Mensagens · Kits · Estúdio) aparece em `/inicio`, `/criar`, `/mensagens`, `/kits`, `/estudio`, `/planejar` e em todo `/vender*`. Em `/criar/:modeloId` e `/vale-presente` só aparece o botão de voltar.

### Regras do app

- **Onboarding:** `RequireStudioOnboarding` (em `App.tsx`) manda para `/boas-vindas` quem nunca viu o onboarding e ainda não preencheu nome/estúdio. Depois disso, nunca mais força — o `StudioNotice` (banner "Complete seu estúdio") é só um lembrete nas telas do Kit.
- **Galeria "Criar":** mistura as artes genéricas de exemplo (`content/lash/arts.json`, 9 modelos) com as 10 artes do Kit Fim de Ano (`kit-fim-de-ano-v2.json`), filtráveis pelas categorias do design (Todas/Agenda/Resultados/Valores/Cuidados/Clientes/Avisos) + um chip extra "Fim de Ano". `getAnyArt()` em `content/lash/index.ts` busca em ambos os catálogos por id, então `/criar/:modeloId` funciona para as duas origens.
- **Nenhum kit é bônus.** Todos (hoje só o Fim de Ano, que tem conteúdo de verdade) são comprados avulso, R$ 14,90, e liberados por `my_products()` (`state/purchases.tsx`, chave `fim-de-ano`). Bloqueado: prévia das artes desfocada (`blur(5px)`) + "R$ 14,90 · Comprar" (link de `KIT_CHECKOUT_URLS` em `src/lib/config.ts`, já preenchido) + "Já comprei, atualizar" (chama `my_products()` de novo). `/kits`, `/kits/:key`, o carrossel do Início e "Datas do ano" em `/planejar` só mostram kits com conteúdo real — **nenhuma tela mostra "em breve"**; um kit sem conteúdo simplesmente não entra em `kits.json`/`year-dates.json`.
- **Preço justo** (`/vender/preco-justo`): preço mínimo = material + horas × valor da hora; sugerido = mínimo × 1,3, arredondado para múltiplo de 5 — fórmula exata do plano (seção 3), diferente do número solto do mock do Claude Design.
- **Correções do plano aplicadas** (seção 5 do `LASHBOX-PLANO.md`):
  - `ArtEditor.tsx`: exportar uma arte do tipo "preço" (`kind==='price'`, ex. `bf-oferta`) sem título/preço preenchidos mostra um aviso e **bloqueia a exportação**, em vez de gerar um PNG com "R$" vazio.
  - `ArtEditor.tsx`: a foto só é considerada "ligada" (`effectivePhotoOn`) quando realmente existe uma URL de foto (do estúdio ou escolhida); sem foto, o fundo listrado nunca aparece — nem na prévia, nem na exportação — e um aviso pede para escolher uma foto ou desligar.
  - **Favicon:** `public/favicon-maleta.svg` é a silhueta simplificada (só a maleta, ameixa sobre blush), usada para 16/32/48px; o ícone completo (`icone-lashbox.png`) só entra a partir de 64px. Gerado por `npm run icons` (constante `FAVICON_SRC` em `scripts/gerar-icones.mjs`).
- **Minhas clientes:** generalização da Lista VIP do Agenda Lotada (`lib/vipList.ts`, chave `lashbox:vip:v1`, só no localStorage).
- **Meu Estúdio:** mesmos campos do Agenda Lotada (`state/studio.tsx`), com o visual de lista agrupada do design (`screens/Studio.tsx`) em vez do formulário empilhado original. Foto só no aparelho (IndexedDB, `lib/studioPhoto.ts`). Acrescenta o grupo "Assinatura" (plano, situação, próxima cobrança, link de gerenciar).

## 5. Login e assinatura (Supabase)

- **Fluxo de login** (`state/auth.tsx`, igual ao Agenda Lotada): e-mail → Edge Function `request-login` confere acesso → link mágico + código de 8 dígitos → `rpc('has_access')`.
- **Diferença importante em relação ao Agenda Lotada:** quando `has_access()` é falso, o LashBox **não desloga** a usuária — ele entra no status `'expired'` e mostra `/assinatura-vencida`, mantendo a sessão (os dados do estúdio continuam acessíveis). O Agenda Lotada desloga, porque lá é compra única, não assinatura.
- **Tabelas** (`supabase/migrations/20261105000000_inicial.sql` + `20261105010000_fix_subscriptions_unique_index.sql`, aplicadas):
  - `subscriptions`: email, kiwify_subscription_id, plan (mensal/anual), status (active/late/canceled/refunded), current_period_end. A própria usuária pode ler a sua (usado em `/estudio`); só o service role escreve. Índice único em `kiwify_subscription_id` **sem** `where ... is not null` — um índice parcial não é compatível com `upsert(onConflict: 'kiwify_subscription_id')` do supabase-js (descoberto no pagamento de teste: dava erro toda vez que tentava gravar). Um índice único comum já aceita vários `NULL` de qualquer forma.
  - `purchases`: compras avulsas de kits sazonais (email, kiwify_order_id, product_key, status). Só o service role acessa. `product_key` usa a mesma chave do kit no app (hoje só `fim-de-ano`).
  - `profiles`: name, studio (jsonb), onboarding (jsonb). **`client_list` (Minhas clientes) não existe no banco** — fica só no aparelho, por decisão do plano.
  - `webhook_logs`: todo webhook recebido, para depuração.
  - `has_access()`: verdadeiro com status `active`/`late`/`canceled` **e** `current_period_end` no futuro. `refunded` nunca libera. Isso libera só o app (assinatura); não tem relação com os kits.
  - `my_products()`: `product_key` de todos os kits sazonais comprados — **inclui o Kit Fim de Ano**, porque ele também é comprado avulso, não é bônus da assinatura.
- **Edge Functions** (`supabase/functions/`): **as duas publicadas e funcionando em produção**, "Verify JWT with legacy secret" desligado nas duas.
  - `request-login`: só envia o código se `has_access()` for verdadeiro ou houver alguma compra de kit — texto exato do plano, seção 3.
  - `kiwify-webhook`: trata assinatura (nova/renovada/atrasada/cancelada) e compras avulsas de kit, mais reembolso/chargeback (bloqueia a assinatura e revoga as compras do pedido na hora).
    - ✅ **Confirmado com um pagamento de assinatura real (mensal, Pix Automático) + reembolso.** Os nomes em `SUBSCRIPTION_EVENT_MAP` (`subscription_renewed`/`subscription_late`/`subscription_canceled`) e os campos em `extractSubscription()` (`Subscription.id`, `Subscription.plan.name`, `Subscription.next_payment`) bateram com o payload real de primeira — não precisaram de ajuste. O comentário "⚠️ pendência" ainda está no topo do arquivo por via das dúvidas com eventos que ainda não foram testados (atrasada/renovada de verdade, que só acontecem num ciclo de cobrança futuro), mas o evento de compra aprovada e o de reembolso já estão validados.
    - **Bug achado e corrigido no teste:** a Kiwify manda `order_refunded` e `subscription_canceled` quase ao mesmo tempo num reembolso. Como cada webhook é uma chamada HTTP separada, a ordem de chegada não é garantida — o `subscription_canceled` chegando depois sobrescrevia o status `refunded` de volta para `canceled` (que ainda dá acesso até o fim do período pago). Corrigido em `markSubscriptions()`: um `canceled` nunca rebaixa um status já `refunded`.
  - `KIWIFY_PRODUCT_MAP` (secret): `02038f60-d943-11f1-9837-753d41910a92:subscription,2562aa70-d945-11f1-8763-47ee04beed9a:fim-de-ano` (produto "LashBox" → `subscription`, "LashBox · Kit Fim de Ano" → `fim-de-ano`). O webhook está cadastrado em "Todos que sou produtor" na Kiwify (não dá para escolher só os produtos do LashBox nessa tela), então também recebe as vendas do Agenda Lotada — produto fora do mapa é ignorado, nunca grava nada.
  - `KIWIFY_WEBHOOK_TOKEN` (secret): o token é gerado pela própria Kiwify ao criar o webhook (não dá para escolher um customizado) — está salvo nos secrets do Supabase e no cadastro do webhook na Kiwify. Nunca foi colado no código nem no chat.
- **"Gerenciar assinatura" (`/estudio`, `src/lib/config.ts`):** a Kiwify **não tem um link fixo** de autoatendimento para a compradora cancelar ou trocar o cartão — confirmado na documentação oficial (`ajuda.kiwify.com.br/pt-br/article/como-cancelar-uma-assinatura-como-produtor-1wnont9/`, seção "Cancelando uma assinatura como comprador"): depois da compra e em cada renovação, a Kiwify manda um e-mail com um botão próprio para isso. Por isso, a tela mostra a explicação + um botão que abre `KIWIFY_BUYER_AREA_URL` (`https://dashboard.kiwify.com.br`, para entrar com o e-mail da compra), em vez de linkar direto para a assinatura. `KIWIFY_SUBSCRIPTION_CHECKOUT_URLS` (mensal/anual) é o link de checkout usado no botão "Renovar assinatura" de `/assinatura-vencida` — já preenchido.

## 6. Conteúdo (`src/content/lash/`)

| Arquivo | O que é | Status |
|---|---|---|
| `arts.json` | 9 artes genéricas de exemplo (Agenda/Resultados/Valores/Cuidados/Clientes/Avisos) | **Exemplo.** Os 20 modelos do dia a dia definitivos (seção 5 do plano) ainda não foram desenhados nem escritos — é a próxima fase (Fase 3). |
| `messages.json` | 24 mensagens genéricas de exemplo, 4 por categoria | **Exemplo.** O plano prevê ~60, reorganizadas da biblioteca do Agenda Lotada. |
| `week-plan.json` | Rotina semanal (Seg a Dom) do "Planejar → Esta semana" | **Exemplo**, repete toda semana. |
| `year-dates.json` | Calendário de datas comerciais do "Planejar → Datas do ano" | **Exemplo** (datas reais de 2026/2027, mas a lista de kits futuros é só ilustrativa). |
| `home-suggestions.json` | 7 sugestões rotativas do "Para postar hoje" | **Exemplo.** O plano pede 30; a escolha do dia é determinística (dia do ano % tamanho da lista), não um sorteio de verdade. |
| `kits.json` | Catálogo de kits à venda | Só entra aqui o que tem conteúdo de verdade — hoje só o Fim de Ano (R$ 14,90). Os próximos (Verão e Carnaval, Dia das Mães…) entram quando tiverem artes/mensagens reais. |
| `kit-fim-de-ano-v2.json` + `kitFimDeAno.ts` | Kit Fim de Ano completo (10 artes, 6 combos, plano de 5/11 a 15/1, 27 mensagens, vale-presente) | **Conteúdo real**, copiado do Agenda Lotada. |

## 7. O que ainda depende de você

Toda a infraestrutura está pronta e testada (ver seção 8). O que falta agora é conteúdo e produto:

1. **Conteúdo:** os 20 modelos de arte do dia a dia, as ~60 mensagens reorganizadas, os combos do ano todo e o calendário completo (Fase 3 do plano) ainda não foram escritos — hoje tudo isso usa o conteúdo de exemplo da seção 6.
2. **Página de vendas de verdade** (Fase 5): `/lp` hoje é só uma tela provisória com o logo e um botão.
3. **Páginas legais:** `TERMS_URL`/`PRIVACY_URL` (`src/lib/config.ts`) apontam para `/termos` e `/privacidade`, que ainda não existem.
4. **Próximos kits sazonais** (Verão e Carnaval, Dia da Mulher, Dia das Mães…): quando tiverem conteúdo real, criar o produto avulso na Kiwify, adicionar o id dele em `KIWIFY_PRODUCT_MAP` (secret do `kiwify-webhook`), o link de checkout em `KIT_CHECKOUT_URLS` e entrar em `kits.json`/`year-dates.json`.
5. **Eventos de assinatura ainda não vistos de verdade:** `subscription_renewed` (só acontece numa renovação futura) e `subscription_late` (pagamento atrasado). Os nomes batem com o esperado, mas vale conferir em `webhook_logs` quando o primeiro acontecer.

## 8. Hospedagem e domínios (já configurado)

- **GitHub:** `doupsdigital/lashbox` (privado), branch `main`. Acesso por token salvo no Gerenciador de Credenciais do Windows (Git Credential Manager) — nunca em arquivo do projeto. Só commit/push quando a dona pedir.
- **Supabase:** projeto `lashbox`, ref `bgtqyndumongrgowkzfs`, região São Paulo (sa-east-1).
  - Migration `20261105000000_inicial.sql` aplicada pelo SQL Editor.
  - Authentication → Sign In/Providers → Email: "Allow new users to sign up" desligado, "Email OTP length" = **8** (esse campo já voltou pro padrão 6 uma vez depois de salvo sozinho — se o código do e-mail vier com 6 dígitos de novo, confira esse campo primeiro).
  - URL Configuration: Site URL `https://lashbox.app`; Redirect URLs incluem `https://lashbox.app/`, `https://www.lashbox.app/`, `http://localhost:5190/`, `http://127.0.0.1:5190/` (e o domínio da Vercel).
  - SMTP customizado ligado (Resend): host `smtp.resend.com`, porta 465, usuário `resend`, remetente `acesso@lashbox.app` ("LashBox"). Senha = chave de API da Resend (fica só no painel do Supabase, nunca no código).
  - Template "Magic Link" (`Authentication → Emails → Templates`) já está com o nosso visual (mesmo conteúdo de `supabase/templates/link-magico.html`).
  - Edge Functions: `request-login` (sem secrets extras) e `kiwify-webhook` (secrets `KIWIFY_WEBHOOK_TOKEN` e `KIWIFY_PRODUCT_MAP`) — as duas publicadas.
- **Vercel:** projeto `lashbox` (conta doupsdigital, plano Hobby), ligado ao GitHub (deploy automático a cada push em `main`). Variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` cadastradas. Domínios: `lashbox.app` é o de Production; `www.lashbox.app` redireciona para ele (308); `lashbox.vercel.app` continua ativo como alternativa.
- **Domínio:** `lashbox.app`, comprado na **Hostinger**, expira em 05/11/2027 (renovação automática desligada — lembrar de ativar ou renovar manualmente). DNS também na Hostinger:
  - `A @ → 216.198.79.1` (Vercel, apex).
  - `CNAME www →` o CNAME de verificação da Vercel (específico deste domínio).
  - Registros do Resend: `TXT resend._domainkey` (DKIM), `CNAME rsend` e `CNAME send` (envio), `TXT _dmarc` (`v=DMARC1; p=none;`). **Não mexer nesses.**
- **Resend:** domínio `lashbox.app` verificado, região São Paulo, integrado via Hostinger. Remetente `acesso@lashbox.app`.
- **Kiwify:** conta da dona (mesma do Agenda Lotada), dois produtos:
  - **"LashBox"** (assinatura): id `02038f60-d943-11f1-9837-753d41910a92`. Planos Mensal (R$ 22,90) e Anual (R$ 149,00), "Até o cliente cancelar", cartão + boleto + Pix + Pix Automático, garantia 7 dias, página de vendas `https://lashbox.app/lp`, página de obrigado `https://lashbox.app/entrar`.
  - **"LashBox · Kit Fim de Ano"** (compra única): id `2562aa70-d945-11f1-8763-47ee04beed9a`. R$ 14,90, mesma configuração de pagamento e página de obrigado.
  - Links de checkout em `src/lib/config.ts` (`KIWIFY_SUBSCRIPTION_CHECKOUT_URLS`, `KIT_CHECKOUT_URLS`).
  - Webhook "LashBox" cadastrado em "Todos que sou produtor" → `https://bgtqyndumongrgowkzfs.supabase.co/functions/v1/kiwify-webhook`, eventos: Compra aprovada, Reembolso, Chargeback, Assinatura cancelada, Assinatura atrasada, Assinatura renovada.
  - Testado com uma assinatura mensal real (Pix Automático) + reembolso — ver seção 5 para os dois bugs encontrados e corrigidos nesse teste.
