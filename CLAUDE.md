# LashBox: contexto completo do projeto

Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto. Resume o que foi feito até 05/11/2026 (Fase 2, Fundação, e os ajustes antes de colocar no ar), para continuar o trabalho em qualquer computador.

## 1. O produto

- **O que é:** um app (PWA) em português, por **assinatura**, para **lash designers**. "A caixa de ferramentas da lash designer": artes prontas, vale-presente, ofertas calculadas, mensagens prontas e um plano de divulgação — tudo com o nome, a foto e os preços da própria lash, direto do celular.
- **Plano completo do produto:** `referencia/LASHBOX-PLANO.md` (oferta, preços, conteúdo, etapas). Leia antes de mexer em preço, posicionamento ou no calendário de lançamento.
- **Como é vendido:** Kiwify, produto de **assinatura** (mensal R$ 19,90 ou anual R$ 147), mais **kits sazonais** avulsos (R$ 14,90 cada) comprados dentro do app. **Nenhum kit é bônus da assinatura** — nem o Kit Fim de Ano, que já tem conteúdo pronto: ele é só o primeiro kit à venda, bloqueado (prévia desfocada + "R$ 14,90 · Comprar") até a compra, liberado por `my_products()`. Nada disso está configurado na Kiwify ainda — ver seção 7.
- **Situação:** só roda neste computador. Nada foi criado no Supabase, na Vercel, no GitHub remoto ou na Kiwify. `git init` foi feito, mas **nenhum commit** (a dona pediu para só commitar quando ela mandar).
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

- **Variáveis do Supabase:** copie `.env.example` para `.env.local` e preencha, quando o projeto existir. **Sem esse arquivo, `npm run dev` roda em modo local**: sem login, com uma assinatura anual "ativa" simulada (`state/subscription.tsx`), para testar todas as telas livremente.

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
supabase/                 migrations/ (1 arquivo, schema completo), functions/ (kiwify-webhook, request-login),
                          templates/link-magico.html — nada disso foi aplicado ainda
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
- **Nenhum kit é bônus.** Todos (hoje só o Fim de Ano, que tem conteúdo de verdade) são comprados avulso, R$ 14,90, e liberados por `my_products()` (`state/purchases.tsx`, chave `fim-de-ano`). Bloqueado: prévia das artes desfocada (`blur(5px)`) + "R$ 14,90 · Comprar" (link de `KIT_CHECKOUT_URLS` em `src/lib/config.ts`, vazio até existir na Kiwify) + "Já comprei, atualizar" (chama `my_products()` de novo). `/kits`, `/kits/:key`, o carrossel do Início e "Datas do ano" em `/planejar` só mostram kits com conteúdo real — **nenhuma tela mostra "em breve"**; um kit sem conteúdo simplesmente não entra em `kits.json`/`year-dates.json`.
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
- **Tabelas** (`supabase/migrations/20261105000000_inicial.sql`, ainda não aplicada):
  - `subscriptions`: email, kiwify_subscription_id, plan (mensal/anual), status (active/late/canceled/refunded), current_period_end. A própria usuária pode ler a sua (usado em `/estudio`); só o service role escreve.
  - `purchases`: compras avulsas de kits sazonais (email, kiwify_order_id, product_key, status). Só o service role acessa. `product_key` usa a mesma chave do kit no app (hoje só `fim-de-ano`).
  - `profiles`: name, studio (jsonb), onboarding (jsonb). **`client_list` (Minhas clientes) não existe no banco** — fica só no aparelho, por decisão do plano.
  - `webhook_logs`: todo webhook recebido, para depuração.
  - `has_access()`: verdadeiro com status `active`/`late`/`canceled` **e** `current_period_end` no futuro. `refunded` nunca libera. Isso libera só o app (assinatura); não tem relação com os kits.
  - `my_products()`: `product_key` de todos os kits sazonais comprados — **inclui o Kit Fim de Ano**, porque ele também é comprado avulso, não é bônus da assinatura.
- **Edge Functions** (`supabase/functions/`, código pronto, **não publicadas**):
  - `request-login`: só envia o código se `has_access()` for verdadeiro ou houver alguma compra de kit — texto exato do plano, seção 3.
  - `kiwify-webhook`: trata assinatura (nova/renovada/atrasada/cancelada) e compras avulsas de kit, mais reembolso/chargeback (bloqueia a assinatura e revoga as compras do pedido na hora).
    - ⚠️ **Os nomes exatos dos eventos de assinatura da Kiwify (renovada/atrasada/cancelada) e os campos do payload (id da assinatura, plano, próxima cobrança) são um palpite, não foram confirmados.** Estão isolados em `SUBSCRIPTION_EVENT_MAP` e `extractSubscription()`, no topo do arquivo, com um comentário bem visível. **Antes de publicar, confirme com um pagamento de teste de assinatura na Kiwify e ajuste essas duas partes** (o comentário no arquivo explica onde olhar: o `payload` completo fica em `webhook_logs`).
  - `KIWIFY_PRODUCT_MAP` precisa mapear o produto de assinatura para a chave especial `subscription`, e cada kit sazonal pago para sua chave (ex.: `id-da-kiwify:fim-de-ano`). O webhook vai receber também as vendas de outros produtos da dona (ex.: Agenda Lotada) — produto fora do mapa é ignorado, nunca grava nada.
- **"Gerenciar assinatura" (`/estudio`, `src/lib/config.ts`):** a Kiwify **não tem um link fixo** de autoatendimento para a compradora cancelar ou trocar o cartão — confirmado na documentação oficial (`ajuda.kiwify.com.br/pt-br/article/como-cancelar-uma-assinatura-como-produtor-1wnont9/`, seção "Cancelando uma assinatura como comprador"): depois da compra e em cada renovação, a Kiwify manda um e-mail com um botão próprio para isso. Por isso, a tela mostra a explicação + um botão que abre `KIWIFY_BUYER_AREA_URL` (hoje `https://dashboard.kiwify.com.br`, para entrar com o e-mail da compra), em vez de linkar direto para a assinatura. `KIWIFY_SUBSCRIPTION_CHECKOUT_URLS` (mensal/anual) é o link de checkout usado no botão "Renovar assinatura" de `/assinatura-vencida` — ainda vazio.

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

## 7. O que depende de você

1. **Domínio** `lashbox.app` (ou o que for escolhido) — nada no código depende disso ainda, mas os links de e-mail/manifesto citam `lashbox.app` como referência.
2. **Supabase:** criar o projeto (região São Paulo), aplicar a migration (`supabase/migrations/20261105000000_inicial.sql`) pelo SQL Editor, configurar o template de e-mail (`supabase/templates/link-magico.html`, OTP de 8 dígitos) e o SMTP do Resend, publicar as duas Edge Functions e os secrets (`KIWIFY_WEBHOOK_TOKEN`, `KIWIFY_PRODUCT_MAP`). Depois, preencher `.env.local` com a URL e a chave do projeto.
3. **Vercel:** criar o projeto (framework Vite, raiz do repositório), configurar o domínio e as variáveis de ambiente.
4. **Resend:** domínio de envio verificado, remetente `acesso@lashbox.app` (ou o domínio escolhido).
5. **Kiwify:** criar o produto de **assinatura** "LashBox" (2 planos) e o produto avulso **"LashBox · Kit Fim de Ano"** (R$ 14,90 — diferente do "Kit Agenda de Fim de Ano" do Agenda Lotada, outro produto da mesma dona); **testar um pagamento de assinatura de verdade** para confirmar os nomes dos eventos/campos do webhook (ver aviso na seção 5 acima) antes de publicar `kiwify-webhook`.
6. **GitHub:** criar o repositório remoto quando quiser subir o código (ainda não foi feito nenhum commit).
7. **Conteúdo:** os 20 modelos de arte do dia a dia, as ~60 mensagens reorganizadas, os combos do ano todo e o calendário completo (Fase 3 do plano) ainda não foram escritos — hoje tudo isso usa o conteúdo de exemplo da seção 6.
8. **Página de vendas de verdade** (Fase 5): `/lp` hoje é só uma tela provisória com o logo e um botão.
