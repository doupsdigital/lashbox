# LashBox: contexto completo do projeto

Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto. Resume o que foi feito até 06/11/2026 (Fases 2 e 3: Fundação, os ajustes antes de colocar no ar, os 5 tipos novos de arte e o conteúdo definitivo do nicho lash), para continuar o trabalho em qualquer computador.

## 1. O produto

- **O que é:** um app (PWA) em português, por **assinatura**, para **lash designers**. "A caixa de ferramentas da lash designer": artes prontas, vale-presente, ofertas calculadas, mensagens prontas e um plano de divulgação — tudo com o nome, a foto e os preços da própria lash, direto do celular.
- **Plano completo do produto:** `referencia/LASHBOX-PLANO.md` (oferta, preços, conteúdo, etapas). Leia antes de mexer em preço, posicionamento ou no calendário de lançamento.
- **Como é vendido:** Kiwify, produto de **assinatura "LashBox"** (mensal R$ 19,90 ou anual R$ 149,00), mais **kits sazonais** avulsos (hoje só **"LashBox · Kit Fim de Ano"**, R$ 14,90) comprados dentro do app. **Nenhum kit é bônus da assinatura** — nem o Kit Fim de Ano: ele é só o primeiro kit à venda, bloqueado (prévia desfocada + "R$ 14,90 · Comprar") até a compra, liberado por `my_products()`.
  - O mensal começou em R$ 22,90 (acima dos R$ 19,90 do plano original, pra melhorar a margem depois da taxa da Kiwify) e voltou pra R$ 19,90 em 11/11/2026, a pedido da dona.
- **Situação:** **no ar em produção e vendendo de verdade** em https://lashbox.app — GitHub, Supabase, Vercel, domínio (Hostinger), Resend e **Kiwify** todos configurados e testados de ponta a ponta, inclusive um pagamento de assinatura real (Pix Automático) com reembolso, confirmando que o webhook funciona. Não há mais pendência de infraestrutura — ver seção 8.
- **Reaproveitado do Agenda Lotada** (`../agendalotada`, mesma dona): o motor de login (link mágico + código de 8 dígitos), o motor de artes/exportação PNG, o vale-presente, o Montador de ofertas, o conteúdo e as ferramentas do **Kit Agenda de Fim de Ano** (agora "Kit Fim de Ano" do LashBox) e os textos de referência das mensagens.
- **Gênero do nome do produto:** o LashBox é sempre tratado no masculino — "o LashBox", "o app LashBox", "do LashBox", "no LashBox" — nunca "a LashBox"/"da LashBox". Vale para `/lp`, `/termos`, `/privacidade`, os e-mails (`supabase/templates/link-magico.html`) e todas as telas do app. Ao escrever ou revisar qualquer texto novo do produto, confira a concordância.

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
| `npm run verify-content` | Confere que todo link do conteúdo (arte/mensagem/kit, em `week-plan.json`/`home-suggestions.json`/`year-dates.json`) aponta para algo que existe de verdade |

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
                           arts.json, messages.json, combos.json, week-plan.json, year-dates.json, kits.json,
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
| `/lp` | LandingPage | Página de vendas, visual escuro (ameixa/rosa/dourado) — venceu o teste A/B com a antiga versão clara |
| `/lp2` | — | Só redireciona para `/lp` (era a versão em teste; link antigo que ainda aponte pra cá continua funcionando) |
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
- **Galeria "Criar":** mistura as 20 artes do dia a dia (`content/lash/arts.json`) com as 10 artes do Kit Fim de Ano (`kit-fim-de-ano-v2.json`), filtráveis pelas categorias (Todas/Agenda/Valores/Resultados/Cuidados/Clientes/Avisos) + um chip extra "Fim de Ano". `getAnyArt()` em `content/lash/index.ts` busca em ambos os catálogos por id, então `/criar/:modeloId` funciona para as duas origens.
- **7 tipos de arte.** Além dos 4 originais (`text`, `urgent`, `price`, `list`, em `ClassicArtBoard` dentro de `components/art/StoryBoard.tsx`), existem 5 tipos novos — `beforeAfter`, `menu`, `quote`, `bullets`, `photo` — portados fiéis de `referencia/artes-novas/LashBox Art2.dc.html` e renderizados por `NewArtBoard` (mesmo arquivo), com paleta própria (`PAL2`, em `lib/artPalettes.ts`) e fontes Playfair Display + Jost. A conversão de unidade do protótipo (`cqw`, 1% da largura do board) para px é direta e constante: `CQW = 10.8` (board sempre tem 1080px de largura). Linhas de tabela/tópicos nunca ficam menores que 40px (Story) / 36px (Post); o subtítulo nunca fica menor que 36px — abaixo disso o texto quebra linha, não encolhe mais.
  - `menu`: tabela de nome+preço editável no `ArtEditor` (até 6 linhas); o preço de uma linha nova é preenchido sozinho com o preço do Meu Estúdio quando o nome contém "aplica" ou "manuten".
  - `quote` e `bullets`: depoimento+assinatura e lista de tópicos (3 a 6) editáveis diretamente no `ArtEditor`.
  - `beforeAfter` e `photo` exigem foto (duas e uma, respectivamente) — sem elas, a exportação é **bloqueada** com uma explicação, sem toggle de "usar foto" (que só existe para os 4 tipos antigos com `photo: 'optional'`).
- **Marcadores nos textos:** `[mês]` se preenche sozinho (mês atual, minúsculo) via `applyStudioTokens` (`lib/studioTokens.ts`). Qualquer outro marcador entre colchetes que não seja um dado do Meu Estúdio (`[dia]`, `[estilo]`, `[mimo]`, `[valor]`, `[data]`, `[X]`, `[sua novidade]`, `[nome da cliente]`…) vira um campo editável no `ArtEditor` (`findGenericMarkers`/`applyGenericMarkers`), com o próprio texto do marcador como placeholder. Deixar em branco não bloqueia a exportação, só avisa antes (confirmar/cancelar).
- **Nenhum kit é bônus.** Todos (hoje só o Fim de Ano, que tem conteúdo de verdade) são comprados avulso, R$ 14,90, e liberados por `my_products()` (`state/purchases.tsx`, chave `fim-de-ano`). Bloqueado: prévia das artes desfocada (`blur(5px)`) + lista do que vem dentro (`insideList` em `KitDetail.tsx`, contada a partir do próprio conteúdo — artes, mensagens, datas do plano) + "R$ 14,90 · Comprar" (link de `KIT_CHECKOUT_URLS` em `src/lib/config.ts`, com o e-mail da assinante já preenchido na query string quando logada) + "Já comprei, atualizar" (chama `my_products()` de novo). `/kits`, `/kits/:key`, o carrossel do Início e "Datas do ano" em `/planejar` só mostram kits com conteúdo real — **nenhuma tela mostra "em breve"**; um kit sem conteúdo simplesmente não entra em `kits.json`/`year-dates.json`.
  - `/kits/fim-de-ano?aba=plano` abre a tela do kit (já comprado) direto na aba "Plano dia a dia" — usado pelo card do Início (abaixo) para levar direto ao próximo passo, em vez de cair na aba "Ferramentas".
- **Destaque "Black Friday"**, em dois formatos diferentes (pra caber bem em cada lugar), ambos levando pra mesma tela de detalhes (`/kits/black-friday`):
  - **Compacto** (`components/KitPromoCard.tsx`, extraído em 11/11/2026 — degradê ameixa/rosa, ícone de presente, dourado no botão, cartão inteiro clicável) no carrossel **"Kits promocionais" do Início** (`Home.tsx`, renomeado de "Kits da temporada" em 11/11/2026, parte de baixo da tela), como primeiro item, lado a lado com o card normal do catálogo, largura fixa (`w-[260px] shrink-0`).
    - **Não comprado:** "Black Friday, Natal e Réveillon prontos 🎁" + texto do kit + botão "Ver o kit · R$ 14,90". Aparece de hoje até 31/12/2026 (constante `KIT_CARD_PROMO_END`) — depois disso some sozinho, mesmo sem ter sido comprado.
    - **Comprado:** vira "Seu Kit Fim de Ano" + "Próximo passo: {item de hoje do plano}" (`nextPlanItem()`, compartilhado com `KitDetail.tsx`) + botão "Ver plano" → `/kits/black-friday?aba=plano`. Fica visível enquanto o plano do kit durar (até 15/01/2027, a última data de `kitFimDeAno.plan`).
  - **Cheio** (`KitCard`, componente local de `Kits.tsx`, adicionado em 11/11/2026 — pedido explícito da dona: "igual o segundo [card]", mesmo tamanho/formato/cadeado do card normal do catálogo, não o compacto) no topo da tela **`/kits`**, antes de `visibleKitsCatalog.map` — mesmo template usado pros outros kits (badge de preço, ícone grande, prévia desfocada com cadeado, botão "R$ 14,90 · Comprar"), só com o ícone/cores/título/descrição do catálogo `black-friday`. Antes disso usava o card compacto aqui também, e sumia ao clicar em "Ver todos" no Início.
  - **`black-friday` é uma entrada cosmética do catálogo** (`content/lash/kits.json`, adicionada em 11/11/2026, `hidden: true` + `aliasOf: "fim-de-ano"`) — tela de detalhes própria (`/kits/black-friday`, título/subtítulo "Black Friday, Natal e Réveillon prontos" em vez de "Kit Fim de Ano", via `catalog.title`/`catalog.subtitle` em `KitDetail.tsx`), mas **não é um produto novo na Kiwify**: mesmo preço, mesmo link de checkout (`KIT_CHECKOUT_URLS['black-friday']`, igual ao de `fim-de-ano`) e o mesmo desbloqueio — `isUnlocked()` resolve `aliasOf` antes de checar `my_products()` (`state/purchases.tsx`, `realProductKey()`), então quem compra um já tem acesso aos dois. `hidden: true` tira essa entrada das listagens genéricas (`visibleKitsCatalog`, que filtra `!k.hidden`) — ela só existe pra ser acessada direto por essa chave, nunca aparece como um 3º card solto ao lado do destaque e do card normal.
  - Se um dia a Black Friday virar um produto de verdade separado (preço próprio, conteúdo próprio), é só: cadastrar na Kiwify, trocar `aliasOf` por um `KIWIFY_PRODUCT_MAP` novo (`supabase/functions/kiwify-webhook`), e dar um checkout/preço próprios — hoje é só cosmético, pensado pra não interromper o modelo de venda atual.
  - **Sem botão de esconder** (o "x" existiu e foi removido em 11/11/2026, a pedido da dona): enquanto a Black Friday durar, o card de destaque não deve poder ser dispensado — ela mesma controla quando ele sai, criando/removendo kits em `kits.json`.
  - **Pegadinha de CSS encontrada ao testar:** o card tinha `overflow-hidden` (pra recortar o círculo decorativo) dentro de um flex-column (`Home`'s wrapper com `overflow-auto`) — isso zera o `min-height` automático do item no flexbox, e ele era espremido a ~36px de altura sempre que faltava espaço na tela. Corrigido com `shrink-0` no card. Vale lembrar isso em qualquer novo card com `overflow-hidden` dentro de um flex-column que também tenha scroll.
  - **Todos os carrosséis horizontais do app** (este, Galeria, Mensagens, demo da `/lp`, vitrine da `/lp`) aceitam arrastar com o mouse (`lib/useDragScroll.ts`, adicionado em 11/11/2026) — sem isso, só rolavam por toque num celular de verdade. Importante: usa listeners em `window` pro arraste, nunca `setPointerCapture` no elemento — capturar o ponteiro redireciona também o `click` seguinte pro container, o que quebra silenciosamente o clique nos cards/botões lá dentro.
- **Preço justo** (`/vender/preco-justo`): preço mínimo = material + horas × valor da hora; sugerido = mínimo × 1,3, arredondado para múltiplo de 5 — fórmula exata do plano (seção 3), diferente do número solto do mock do Claude Design.
- **Correções do plano aplicadas** (seção 5 do `LASHBOX-PLANO.md`):
  - `ArtEditor.tsx`: exportar uma arte do tipo "preço" (`kind==='price'`, ex. `bf-oferta`) sem título/preço preenchidos mostra um aviso e **bloqueia a exportação**, em vez de gerar um PNG com "R$" vazio. Mesma ideia nos tipos novos: `beforeAfter`/`photo` sem foto e `menu`/`bullets` sem nenhuma linha/tópico também bloqueiam.
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

Todo o conteúdo abaixo é **definitivo** (Fase 3 concluída) — nada neste app usa texto de exemplo.

| Arquivo | O que é |
|---|---|
| `arts.json` | 20 artes do dia a dia (Agenda/Valores/Resultados/Cuidados/Clientes/Avisos), nos 7 tipos (seção 4). |
| `messages.json` | 70 mensagens prontas, em 10 categorias (Reativação, Divulgação, Preço, Agenda, Dúvidas, Pós-atendimento, Manutenção, Indicação, Parcerias, Avisos) — os chips de `/mensagens` vêm dessas categorias, não de uma lista fixa. |
| `combos.json` | 6 combos do dia a dia (ano todo) para o Montador de ofertas (`/vender/ofertas`) — `defaults` (data limite/uso, vagas) + `combos`, cada um com `formula.base` (`A`, `M`, `A+M`, `2A` ou `A+2M`), `factor` e `round`. O Kit Fim de Ano continua com os seus próprios combos de Black Friday (`kitFimDeAno.combos`), separados. |
| `week-plan.json` | Rotina semanal (Seg a Dom) do "Planejar → Esta semana", com link para uma arte, mensagem ou ferramenta por dia. |
| `year-dates.json` | Calendário de datas comerciais do "Planejar → Datas do ano" (2026/2027), cada uma com uma `tip`; `kitKey` só existe nas datas com kit à venda (hoje: Black Friday, Natal e Réveillon → Fim de Ano) — as outras não mostram chip de kit. |
| `home-suggestions.json` | 30 sugestões do "Para postar hoje" (uma por dia, escolha determinística: dia do ano % 30). |
| `kits.json` | Catálogo de kits à venda — só entra aqui o que tem conteúdo de verdade, hoje só o Fim de Ano (R$ 14,90). Os próximos (Verão e Carnaval, Dia das Mães…) entram quando tiverem artes/mensagens reais. |
| `kit-fim-de-ano-v2.json` + `kitFimDeAno.ts` | Kit Fim de Ano completo (10 artes, 6 combos, plano de 5/11 a 15/1, 27 mensagens, vale-presente), copiado do Agenda Lotada. |

## 7. O que ainda depende de você

Toda a infraestrutura e o conteúdo do dia a dia estão prontos (ver seção 8 e seção 6). A `/lp` e as páginas legais também já estão no ar (seção 9). O que falta agora:

1. **Pixel da Meta na Kiwify:** nos dois produtos ("LashBox" e "LashBox · Kit Fim de Ano"), em Configurações → Pixels, cadastrar o pixel `1514627327214218` (pixel novo, só do LashBox — o antigo `1042165951490026`, "lash", ficou com restrição da Meta), domínio `lashbox.app`, com **"Disparar Purchase ao gerar Pix" DESLIGADO** (senão conta venda antes de confirmar o pagamento). Em cada produto, a página de vendas também precisa apontar para `https://lashbox.app/lp`.
2. **Verificação de domínio da Meta:** `index.html` tem `<meta name="facebook-domain-verification" content="COLE_AQUI">` — trocar `COLE_AQUI` pelo código que o Business Manager da Meta dá em Configurações da Empresa → Segurança da Marca → Domínios, depois publicar de novo.
3. **Vídeo da `/lp`:** a seção "Em 3 toques" já tem o espaço pronto para um vídeo vertical em `public/lp/demo.mp4` (mudo, com legenda). Sem esse arquivo, mostra só a imagem de capa, sem botão de play — pode subir o vídeo quando tiver um gravado.
4. **Próximos kits sazonais** (Verão e Carnaval, Dia da Mulher, Dia das Mães…): quando tiverem conteúdo real, criar o produto avulso na Kiwify, adicionar o id dele em `KIWIFY_PRODUCT_MAP` (secret do `kiwify-webhook`), o link de checkout em `KIT_CHECKOUT_URLS` e entrar em `kits.json`/`year-dates.json`.
5. **Eventos de assinatura ainda não vistos de verdade:** `subscription_renewed` (só acontece numa renovação futura) e `subscription_late` (pagamento atrasado). Os nomes batem com o esperado, mas vale conferir em `webhook_logs` quando o primeiro acontecer.

## 9. Página de vendas, pixel e páginas legais

- **`/lp` é um bundle separado do app logado.** `src/main.tsx` decide, pela URL (`/lp`, `/lp2`, `/termos`, `/privacidade` → leve; qualquer outra → o app de verdade, com Supabase etc.) **antes** de importar qualquer um dos dois lados, então a `/lp` nunca baixa o código do app (nem registra o service worker — isso só acontece em `src/AppRoot.tsx`). `src/marketing/` tem: `LandingPage.tsx`, `Terms.tsx`, `Privacy.tsx`, mais `MarketingRoot.tsx` (as rotas), `MarketingLayout.tsx` (liga o pixel + aviso de cookies) e `pixel.ts`.
- **Visual escuro (ameixa/rosa/dourado), venceu o teste A/B.** Existiu uma `/lp2` com esse visual rodando em paralelo com a antiga `/lp` clara, com `lp_version` marcado nos eventos do Pixel para comparar as duas no Gerenciador de Eventos/Anúncios da Meta. A escura venceu: o conteúdo dela foi para dentro da própria `LandingPage.tsx` (que é `/lp` agora), o arquivo `LandingPage2.tsx` foi removido, o `lp_version` saiu dos eventos do pixel (não há mais nada pra comparar) e `/lp2` continua existindo só como rota que redireciona para `/lp` (`MarketingRoot.tsx`), caso algum link antigo (anúncio, bookmark) ainda aponte pra lá.
- **Visual:** fundo ameixa (`#5B2A4E` no topo, degradê para `#7A3A66`); seções alternam entre ameixa e um tom mais escuro (`#4A2140`); títulos brancos com destaque em rosa (`#E07A9B`); corpo de texto em branco a 75-85% de opacidade; dourado (`#C9A15B`) nos checks e badges; cards com fundo branco a 5-7% e borda branca a 10-14% de opacidade, deixando os prints claros do app "saltarem" do fundo escuro; botão primário rosa, secundário com contorno branco. No card Anual (plano), a cor inverte: vira o card claro/destaque da página (fundo blush, texto ameixa); CTA final também inverte (fundo rosa sólido, texto ameixa).
- **Capa (hero), reproduzida de `referencia/hero/LashBox Heros.dc.html` ("Hero A"):** fundo de foto (a própria arte "Antes e depois", `/lp/art-antes-depois.webp`) desfocada (`blur`, escalada para não mostrar borda) com dois degradês por cima (`linear-gradient(160deg,rgba(91,42,78,.86),rgba(122,58,102,.8))` + um degradê vertical mais sutil) — não é mais um fundo liso. Composição: o celular com a tela `/lp/screen-inicio.webp` atrás (girado -4°) e a própria arte "Antes e depois" na frente (girado +4°), com um círculo rosa (`border-[#E07A9B]`) em volta do nome do estúdio na arte e uma seta + "seu nome aqui ✨" em fonte manuscrita (`@fontsource/caveat`, só peso 700, importada em `MarketingRoot.tsx`) apontando pro círculo. Título ("Esqueça os templates do Canva." + "O LashBox faz tudo por você." em rosa) é o maior elemento da capa — tamanho fluido via `clamp()`, bem maior que o resto. A pílula "Ei, Lash Designer 👋" acima do título é só uma etiqueta (borda fina + fundo translúcido `bg-white/10`, sem sombra) — de propósito **não parece um botão clicável**, pra não competir com o botão de verdade ("Quero o app LashBox") logo abaixo. No celular, título, linha de apoio, botão e preço/garantia ficam **centralizados** (o título usa `text-balance` pra não deixar uma linha muito mais curta que as outras, sobrando espaço vazio de um lado só); no desktop, tudo alinhado à esquerda, como no mock original. As duas imagens da capa (fundo e celular) são carregadas com `loading="eager"` + `fetchPriority="high"` e têm `<link rel="preload">` injetado dinamicamente (nunca lazy, já que é o que carrega primeiro vindo do anúncio). Só a capa usa essa foto de fundo — as outras seções continuam com fundo liso (ameixa/`#4A2140`).
- **Seções da `/lp` (nessa ordem, numeradas nos comentários do `LandingPage.tsx`):** 1. Capa (acima) · 2. Como funciona (3 passos + vídeo escondido, ver item 3 da seção 7) · 3. O que tem dentro do app (4 áreas + prints) · 4. Vitrine de artes (carrossel) · 5. Planos · 6. Garantia · 7. Perguntas frequentes · Rodapé. As seções "Você conhece essa rotina?" (A dor), "Não é um pacote de templates. É um app." (O diferencial), "O LashBox é para você se…" (Para quem é) e a chamada final rosa invertida ("Enquanto você lê isso…") **foram removidas a pedido da dona** — a página ficou mais enxuta. Se precisar recriá-las, estão no histórico do Git (commits de 10/11/2026). O rodapé não tem mais o link "Já sou assinante · Entrar" (só termos/privacidade + suporte) — entrar continua acessível pelo botão do topo da página.
- **Vitrine de artes (seção 4):** carrossel com 8 artes variando entre as 3 paletas (Rosa, Nude e dourado, Preto e dourado), pra dar noção da variedade — antes eram só 4, todas na paleta Rosa. As 4 novas (`art-valores-nude`, `art-quote-nude`, `art-bullets-preto`, `art-valores-preto`) foram geradas com o próprio motor de artes do app (mesmo estúdio de demonstração "Studio Juliana Lash"), mudando só `palette` no `localStorage` antes de exportar — mesma técnica do `scripts/generate-lp-assets.mjs`, sem script salvo dessa vez. Imagens com `loading="lazy"` (a capa é a única parte da `/lp` com imagem eager).
- **Pixel da Meta** (`src/marketing/pixel.ts`, id em `META_PIXEL_ID` no `src/lib/config.ts`): `PageView` ao carregar a página; `ViewContent` uma vez, via `IntersectionObserver`, quando a seção `#planos` entra na tela; `AddToCart` (com `value`/`currency`) ao clicar em "Assinar mensal"/"Assinar anual", com no máximo 250ms de espera antes do redirecionamento pro checkout. **Não dispara `InitiateCheckout` nem `Purchase`** — isso é com a Kiwify. Para testar: Gerenciador de Eventos da Meta → aba "Testar eventos" → colar a URL `/lp` → navegar e clicar nos botões na própria aba; os eventos devem aparecer na hora.
- Os links de checkout (`KIWIFY_SUBSCRIPTION_CHECKOUT_URLS`) saem com a query string da página de vendas colada no final (UTMs, `fbclid` etc.) — mesma lógica do Agenda Lotada, em `lib/checkoutUrl.ts`.
- **Aviso de cookies:** `CookieNotice.tsx`, guardado em `localStorage` (`lashbox:cookie-notice:v1`), nunca bloqueia a página — fica fixo embaixo, acima (`z-50`) da barra fixa "Ver planos" do celular (`z-40`, só aparece depois que a seção do botão principal sai da tela). Enquanto o aviso está aberto, ele cobre a barra por completo (mesma faixa inferior); assim que é fechado, a barra aparece certinha por baixo.
- **Imagens da `/lp`** (`public/lp/*.webp` + `public/og-image.jpg`): todas geradas a partir do próprio app, com um estúdio de demonstração (Studio Juliana Lash) e fotos de banco de imagens com licença livre (Pexels) — nenhum marcador `[entre colchetes]` aparece nelas. Script usado: `scripts/generate-lp-assets.mjs` (recebe `LP_PHOTOS_DIR` com `antes.jpg`/`depois.jpg`/`studio-photo.jpg`); o `og-image.jpg` foi montado à parte (HTML+Playwright, não tem script salvo) a partir do `screen-inicio` gerado por esse script.
- **Páginas legais** (`/termos`, `/privacidade`): adaptadas das do Agenda Lotada para o modelo de assinatura (planos mensal/anual, renovação automática, cancelamento pela Kiwify, garantia de 7 dias, kits avulsos liberados para sempre, mudança de preço só vale para assinatura nova) e para a privacidade (foto e "Minhas clientes" só no aparelho, operadores Kiwify/Supabase/Vercel/Resend/Meta/Google Fonts). Linkadas no rodapé da `/lp`, em `/estudio` e em `/entrar`.

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
- **Meta (anúncios):** conta de anúncios `act_1626088674941828` ("Conta de Anúncios - 01"), página `1184875188046307` ("Vida de Lash Designer", sem conta de Instagram vinculada), pixel `1514627327214218` (pixel novo, só do LashBox, o mesmo `META_PIXEL_ID` da `/lp`; o antigo `1042165951490026`, "lash", foi abandonado por restrição da Meta — "Alguns dados do site foram bloqueados"). Ver seção 10 para a campanha de lançamento.
- **Kiwify:** conta da dona (mesma do Agenda Lotada), dois produtos:
  - **"LashBox"** (assinatura): id `02038f60-d943-11f1-9837-753d41910a92`. Planos Mensal (R$ 19,90) e Anual (R$ 149,00), "Até o cliente cancelar", cartão + boleto + Pix + Pix Automático, garantia 7 dias, página de vendas `https://lashbox.app/lp`, página de obrigado `https://lashbox.app/entrar`.
    - **A Kiwify não deixa editar o preço de um plano já criado** (campos ficam desabilitados) — é preciso criar um plano novo. Por isso, desde 11/11/2026, o produto "LashBox" tem **dois planos mensais**: o antigo (R$ 22,90, mantido só para quem já assinava por esse valor, nunca excluído) e o novo (R$ 19,90, `pay.kiwify.com.br/bIhLmOy`, em `KIWIFY_SUBSCRIPTION_CHECKOUT_URLS.mensal`), usado em toda venda nova a partir de agora.
  - **"LashBox · Kit Fim de Ano"** (compra única): id `2562aa70-d945-11f1-8763-47ee04beed9a`. R$ 14,90, mesma configuração de pagamento e página de obrigado.
  - Links de checkout em `src/lib/config.ts` (`KIWIFY_SUBSCRIPTION_CHECKOUT_URLS`, `KIT_CHECKOUT_URLS`).
  - Webhook "LashBox" cadastrado em "Todos que sou produtor" → `https://bgtqyndumongrgowkzfs.supabase.co/functions/v1/kiwify-webhook`, eventos: Compra aprovada, Reembolso, Chargeback, Assinatura cancelada, Assinatura atrasada, Assinatura renovada.
  - Testado com uma assinatura mensal real (Pix Automático) + reembolso — ver seção 5 para os dois bugs encontrados e corrigidos nesse teste.

## 10. Marketing — campanha de lançamento no Meta Ads

- **`marketing/`** (fora do app: no `.vercelignore`, nada em `src/` importa de lá) guarda a campanha de lançamento do LashBox no Meta Ads (Marketing API/Graph API), preparada neste computador (sem token) para ser criada de verdade no outro computador (com token).
  - `marketing/campanha-lashbox/campanha.json`: a fonte de verdade — conta de anúncios, página, pixel, textos dos 7 anúncios (3 conjuntos: "C1 · Não edite mais arte no Canva", "C2 · Pare de perder horas no Canva", "C3 · Explicativos"), orçamentos (R$ 20,00/dia por conjunto, ABO), link/CTA/descrição/UTM padrão, agendamento (próxima 05:00 no fuso da conta — ver abaixo), e a estratégia de público (copiar do conjunto de menor custo por resultado da campanha `[STUDIOMENU] - CAMPANHA WHATSAPP X1`, removendo exclusões de clientes do StudioMenu — com uma alternativa de público descrita no próprio arquivo, caso não seja possível).
  - **Agendamento (`start_time`):** os 3 conjuntos só começam a entregar a partir da próxima 05:00 no fuso da conta de anúncios (calculada dinamicamente no momento da criação real, não um horário fixo no código) — depois disso, rodam sem parar, sem pausar de madrugada nos dias seguintes (decisão explícita da dona: só a largada é agendada, não dayparting diário, que exigiria trocar o orçamento diário por orçamento total da campanha). O valor calculado é salvo uma única vez em `resultado.json` e reaplicado nos 3 conjuntos, mesmo que o script seja retomado depois de um erro no meio. Se a ativação manual (PAUSED → ACTIVE) na Meta acontecer depois desse horário já ter passado, a entrega começa imediatamente — o `start_time` só atrasa, não pausa de novo.
  - `marketing/campanha-lashbox/criativos/conjunto-01|02|03/`: as 14 imagens (4x5 + 9x16 de cada anúncio), copiadas de `referencia/CAMPANHA LASHBOX/` (que fica fora do Git) para nomes de pasta sem espaço.
  - `marketing/campanha-lashbox/LEIA-ME.md`: o passo a passo para o Claude Code do computador com o token — onde colocar `META_ACCESS_TOKEN` (no `.env` da raiz, nunca commitado), como rodar `--simular` antes de rodar de verdade, e o que mostrar à dona no final (IDs, orçamentos, público usado e links de pré-visualização).
  - `scripts/meta/criar-campanha.mjs`: cria a campanha, os 3 conjuntos e os 7 anúncios **todos como PAUSED**, via Graph API (`META_GRAPH_API_VERSION`, padrão `v26.0`). Lê o token de `META_ACCESS_TOKEN` (env ou `.env`), nunca imprime nem grava o token. `--simular` não escreve nada na API (só leituras, se houver token) e imprime o plano completo; sem `--simular`, roda de verdade e é **resumível**: salva cada ID criado em `marketing/campanha-lashbox/resultado.json` (sem token) e pula o que já existe se rodar de novo depois de um erro no meio.
    - **Regra de ouro:** o script só faz **GET** na campanha de referência do StudioMenu (mesma conta de anúncios) para copiar o público do conjunto que mais vende — nunca escreve nela.
  - ✅ **Campanha criada de verdade em 10/11/2026** (tudo PAUSED, largada 11/11 05:00), campanha `120248935334900218`, com o pixel novo `1514627327214218`. IDs de tudo em `marketing/campanha-lashbox/resultado.json` (fora do Git). A ativação é manual, no Gerenciador.
    - **Público:** copiado do conjunto `[STUDIOMENU] Lash (Imagem -> Landing Page)` (escolhido pela dona, `publico.conjunto_referencia` no `campanha.json`): Brasil, mulheres 20-42, interesses "Extensão de cílios" + "Salões de beleza", Advantage+ desligado, atribuição de 7 dias após o clique.
    - **Página sem Instagram:** o token não lê a página (sem `pages_read_engagement`), mas consegue anunciar com ela pelo ID — o script confirma isso gerando uma prévia de teste (`generatepreviews`, não cria nada). No Instagram, o anúncio aparece pela identidade automática da página (`instagram_user_id` `17841446712499043`, a mesma dos anúncios do StudioMenu; equivale a "Usar Página do Facebook" no Gerenciador). Decisão da dona: nenhuma conta de Instagram de verdade.
    - **Ajustes de API descobertos na criação real:** imagens sobem uma por chamada (`bytes`); `asset_feed_spec` precisa de `ad_formats: ['SINGLE_IMAGE']`; `standard_enhancements` foi descontinuado (as melhorias do Advantage+ criativo são desligadas uma a uma); o campo `observacao` do público alternativo é removido antes do envio.
    - **Pixel:** a conferência de eventos nas últimas 48h só avisa, não para mais (o pixel novo começa sem eventos). O pixel antigo `1042165951490026` ("lash") foi abandonado por restrição da Meta.
  - Pendência do item 1 da seção 7 (cadastrar o pixel nos dois produtos da Kiwify, com "Disparar Purchase ao gerar Pix" desligado) — agora com o pixel novo `1514627327214218`.

## 12. PostHog (análise de uso + gravação de sessão)

- **Configuração:** `VITE_POSTHOG_KEY` (Project API key, `phc_...`) e `VITE_POSTHOG_HOST` (`https://us.i.posthog.com`, projeto na região US) no `.env.local` (fora do Git) e nas variáveis de ambiente da Vercel (Settings → Environment Variables). **Sem essas duas variáveis, o PostHog simplesmente não carrega** — nada quebra, nenhuma chamada é feita (`src/lib/analytics.ts`, guardado por um `if (!KEY) return` em todo ponto de entrada).
- **Uma única instalação**, compartilhada por `/lp` e pelo app logado (mesmo domínio, mesmo projeto) — `src/lib/analytics.ts` é importado pelos dois bundles (`MarketingLayout.tsx` e `App.tsx`/`Shell`). Inicializa só depois do `window` `load` (`initAnalyticsDeferred()`), pra nunca atrasar a abertura da `/lp` (é o que recebe tráfego de anúncio).
- **Autocapture desligado, pageview automático ligado:** `autocapture:false` (só eventos nomeados, pra nunca capturar sem querer texto de mensagem ou nome de cliente); `capture_pageview:false` no init + `useTrackPageview()` (hook que dispara `$pageview` a cada troca de `pathname`/`search`, via `useLocation()`) chamado tanto no `Shell` do app quanto no `MarketingLayout` — cobre o carregamento inicial e as trocas de tela da SPA dos dois lados.
- **Gravação de sessão ligada, com mascaramento:**
  - `session_recording: { maskAllInputs: true }` — todo campo digitado (inputs/textareas) sai mascarado automaticamente.
  - Classe `ph-no-capture` (o PostHog esconde o bloco inteiro na gravação): aplicada em `ScaledBoard.tsx` (cobre **toda** prévia de arte/vale-presente do app — Início, Galeria, ArtEditor, Vale-presente, Kits — porque é o wrapper universal do motor de artes, então a foto do estúdio nunca aparece), em `MessageText` (`components/Messages.tsx`, cobre todo conteúdo de mensagem — Mensagens, Montador de ofertas, Vale-presente, Kit), nos nós ocultos de exportação do `ArtEditor.tsx`/`Gift.tsx` (já fora da tela, mas por garantia), no card de cada cliente e no modal de mensagem da aba "Minhas clientes" (`Library.tsx`), e no círculo da foto do estúdio em `Studio.tsx`.
  - **É preciso também ligar a gravação de sessão no painel do PostHog** (Project Settings → Session Replay) — o código só manda o que já vem mascarado; o projeto precisa ter a gravação ativada para gravar alguma coisa.
- **Identificação** (`src/components/AnalyticsBridge.tsx`, dentro de todos os providers do `AppRoot.tsx`): ao entrar (`status==='ready'`), `posthog.identify(user.id)` — **o id do Supabase, nunca o e-mail**. Propriedades de pessoa (`setPersonProperties`, atualizadas a cada mudança): `plano` (mensal/anual), `situacao_assinatura`, `tem_kit_fim_de_ano` (bool), `estudio_completo` (bool). No "Sair" (`status` vira `signedOut`), `posthog.reset()`.
- **Eventos nomeados** (nome exato + propriedades):

  | Evento | Propriedades | Onde |
  |---|---|---|
  | `lp_visualizada` | `utm_source`, `utm_campaign`, `utm_content` (se vierem na URL) | `/lp`, ao carregar |
  | `lp_planos_vistos` | — | `/lp`, quando a seção `#planos` entra na tela (`IntersectionObserver`) |
  | `lp_clique_plano` | `plano` (mensal\|anual) | `/lp`, clique em "Assinar mensal/anual" |
  | `login_codigo_enviado` | — | `/entrar`, link/código enviado com sucesso |
  | `login_concluido` | — | `/entrar`, código verificado com sucesso |
  | `onboarding_concluido` | — | `/boas-vindas`, ao terminar o 3º passo |
  | `estudio_salvo` | `campos_preenchidos` (número), `tem_foto` (sim\|não) | `/estudio`, ~1s depois da última mudança (nunca os dados em si) |
  | `arte_aberta` | `modelo`, `origem` (galeria\|para_postar_hoje\|plano\|kit) | Galeria, Início, Planejar, Kit — ao abrir uma arte |
  | `arte_exportada` | `modelo`, `formato` (story\|post), `paleta`, `acao` (compartilhar\|salvar) | `ArtEditor`, ao exportar — **o mais importante** |
  | `vale_presente_exportado` | `estilo` | `GiftScreen`, ao exportar |
  | `mensagem_copiada` | `id_mensagem`, `categoria` (nunca o texto) | Mensagens, Kit |
  | `legenda_copiada` | `origem` | Início ("Copiar legenda") |
  | `oferta_copiada` | `id_combo` | Montador de ofertas |
  | `calculadora_usada` | `tipo` (preco_justo\|meta) | Preço justo / Meta do mês, ~1s depois da última mudança |
  | `kit_visualizado` | `kit`, `comprado` (sim\|não) | `KitDetail`, ao abrir |
  | `kit_clique_comprar` | `kit` | `KitDetail`, clique em "Comprar" |
  | `assinatura_vencida_vista` | — | `/assinatura-vencida`, ao carregar |
  | `clique_renovar` | — | `/assinatura-vencida`, clique em "Renovar assinatura" |

- **Testado localmente** (`--simular` não existe aqui; foi um script Playwright descartável, não salvo no repo) com uma chave de teste e `posthog.debug()` ligado (só em `import.meta.env.DEV`): os 16 eventos do app foram confirmados de ponta a ponta, incluindo a chegada da requisição de rede (`/e/`); os 3 da `/lp` (`lp_visualizada`, `lp_planos_vistos`, `lp_clique_plano`) foram confirmados pelo log de debug do próprio PostHog no console (`send "evento" {...}`, com as propriedades certas no momento certo) — só não pela captura de rede do script de teste, por causa de uma particularidade de como aquele contexto descartável libera a fila de eventos (não afeta o funcionamento real, com uma chave de verdade). Também descobri, nesse teste: o Chromium automatizado do Playwright é detectado como bot pelo PostHog (um filtro real e correto para produção) — contornado só no teste com `opt_out_useragent_filter` atrás de uma env var de teste (`VITE_POSTHOG_TEST_MODE`) que nunca deve ser configurada na Vercel.
- **Privacidade:** `/privacidade` já cita o PostHog como operador (análise de uso + gravação de sessão mascarada, no app e na `/lp`) e o aviso de cookies da `/lp` já cita "medir nossos anúncios e melhorar o app".
- **Gráficos no painel do PostHog** (passo a passo, depois que as env vars estiverem na Vercel e o app no ar gerando eventos de verdade):
  1. **Funil de vendas** (`lp_visualizada` → `lp_planos_vistos` → `lp_clique_plano`): no painel, vá em **Product analytics → Funnels → New insight**. Adicione os 3 eventos nessa ordem (botão "+ Add step", escolher cada evento pelo nome exato). Em "Breakdown", pode adicionar `plano` do evento `lp_clique_plano` pra ver mensal vs. anual separado. Salve com um nome (ex.: "Funil da LP").
  2. **Uso semanal** (quantas artes cada assinante exporta por semana): **Product analytics → New insight → Trends**. Série: evento `arte_exportada`. No seletor de matemática da série (o "Σ" ao lado do nome do evento), troque de "Total count" para **"Average count per user"** e em "Interval" escolha **"Week"** — mostra, semana a semana, a média de artes exportadas por assinante. Para ver pessoa por pessoa (não só a média), troque "Display" para **"Table"** e em "Breakdown" escolha a opção de pessoa (aparece como "Person" nas propriedades) — a tabela sai com uma linha por assinante e a contagem de exportações em cada semana.

## 11. E-mail de divulgação do Kit Fim de Ano

- **`scripts/emails/kit-fim-de-ano.mjs`**: manda, pelo Resend, um lembrete do Kit Fim de Ano para quem tem assinatura ativa (mesma regra do `has_access()`) e **ainda não comprou** o kit (consulta `subscriptions` e `purchases` direto no Supabase, com o service role — por isso precisa de `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env`, além de `RESEND_API_KEY`; os três nunca são impressos). Remetente `LashBox <acesso@lashbox.app>` (mesmo domínio verificado do login), assunto "Sua Black Friday já está pronta 🎁", visual igual ao e-mail de link mágico (`supabase/templates/link-magico.html`): fundo blush, card branco, botão ameixa "Ver o kit no app" → `https://lashbox.app/kits/fim-de-ano`.
  - **Como rodar:**
    ```bash
    node scripts/emails/kit-fim-de-ano.mjs             # simula (padrão) — mostra quantas pessoas receberiam + a prévia, não envia nada
    node scripts/emails/kit-fim-de-ano.mjs --simular    # mesma coisa, explícito
    node scripts/emails/kit-fim-de-ano.mjs --enviar     # envia de verdade, pelo Resend
    ```
  - Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` no `.env`, a simulação mostra só a prévia do e-mail (assunto, remetente, texto), avisando que não dá pra saber quantas pessoas receberiam nem enviar de verdade — é o caso deste computador.
  - Testado em `--simular` sem essas credenciais (mostra a prévia certinha) e a prévia visual (HTML renderizado) conferida à parte.
  - **Ninguém foi avisado ainda** — a dona avisa quando quiser disparar de verdade (precisa rodar com `--enviar` no computador que tiver as três credenciais no `.env`).
