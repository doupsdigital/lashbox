# Campanha de lançamento do LashBox no Meta Ads — roteiro para o Claude Code do outro computador

Este computador tem o token da Meta; o outro não. Tudo (criativos, textos, configuração e o script)
já foi preparado e testado em modo de simulação lá, e está no GitHub (`doupsdigital/lashbox`). Este
arquivo é o passo a passo para rodar de verdade aqui.

## 1. Antes de começar

- Puxe a branch `main` mais recente (`git pull`).
- Leia `CLAUDE.md` (seção "Marketing — campanha de lançamento no Meta Ads") para o contexto completo.
- Confira `marketing/campanha-lashbox/campanha.json` — é a fonte de verdade de tudo que vai ser
  criado (textos, imagens, orçamentos, nomes). Não precisa editar nada nele para rodar a campanha
  como está.
- As 14 imagens já estão em `marketing/campanha-lashbox/criativos/conjunto-01/`, `conjunto-02/` e
  `conjunto-03/`.

## 2. Colocar o token

1. Na raiz do projeto, confira se existe um arquivo `.env` (não é o `.env.local` do Supabase — é
   outro, só para segredos de scripts locais). Se não existir, crie um.
2. Adicione a linha (sem aspas, sem espaço antes/depois do `=`):
   ```
   META_ACCESS_TOKEN=o_token_aqui
   ```
3. Confira que `.env` está no `.gitignore` (já está) — ele nunca deve ir para o Git. **Não cole o
   token no chat.**
4. O token precisa ter permissão (`ads_management`) na conta de anúncios `act_1626088674941828` e
   acesso de administrador/editor na página `1184875188046307` ("Vida de Lash Designer").

## 3. Rodar em modo de simulação primeiro

```bash
node scripts/meta/criar-campanha.mjs --simular
```

Com o token no `.env`, esse modo faz as leituras de verdade (conta, página, pixel, eventos
recentes do pixel, e a busca do público de referência na campanha do StudioMenu — **só leitura**)
e depois **imprime exatamente o que seria criado**, sem criar nada. Confira a saída com calma:

- A conta, a página e o pixel aparecem certinhos (nome, moeda, fuso)?
- O pixel recebeu eventos nas últimas 48h? Se não, o script avisa que pararia em modo real —
  **não rode em modo real até resolver isso** (confira o pixel na Kiwify e em `index.html`, seção 7
  do `CLAUDE.md`).
- O público veio do conjunto de referência do StudioMenu (mostra o nome do conjunto escolhido) ou
  caiu na alternativa (Brasil, mulheres, 20-45, Advantage+)? Se caiu na alternativa e você sabe que
  a campanha de referência existe, confira se o nome em `campanha.json` → `publico.campanha_referencia`
  está exatamente igual ao da Meta.
- Os 3 conjuntos, os 7 anúncios, os títulos e os orçamentos (R$ 20,00/dia cada) estão certos?
- **A "Largada agendada"** mostrada na saída — é a próxima 05:00 no fuso da conta de anúncios. Depois de ativados (PAUSED → ACTIVE), os conjuntos só começam a entregar a partir desse horário; depois disso rodam sem parar, sem pausar de madrugada nos dias seguintes.

**Importante sobre o horário:** o script calcula a "largada agendada" no momento em que roda de verdade (passo 4) — não quando você for ativar os conjuntos depois. Se você ativar (PAUSED → ACTIVE) antes desse horário, os conjuntos esperam e começam certinho às 05:00. Mas se você demorar pra ativar e esse horário já tiver passado, a Meta começa a entregar imediatamente ao ativar, não espera até a 05:00 do dia seguinte. Se isso acontecer e você quiser mesmo assim só às 05:00 de um dia específico, ative os conjuntos manualmente perto desse horário em vez de rodar o script de novo (rodar de novo não recalcula a largada dos conjuntos já criados).

## 4. Rodar de verdade

```bash
node scripts/meta/criar-campanha.mjs
```

Cria a campanha, os 3 conjuntos e os 7 anúncios **todos como PAUSED** (nada entra no ar sozinho).
Se algo der erro no meio, rode o mesmo comando de novo — o script usa
`marketing/campanha-lashbox/resultado.json` para saber o que já foi criado e não duplica nada.

## 5. O que me mostrar no final

Depois de rodar de verdade, me mostre:

1. **Tabela com os IDs** — campanha, cada conjunto e cada anúncio (tudo sai em
   `marketing/campanha-lashbox/resultado.json`).
2. **Orçamentos** — confirme que cada conjunto ficou com R$ 20,00/dia.
3. **Público usado** — de onde veio (conjunto do StudioMenu copiado, ou a alternativa) e um resumo
   dele (geo, idade, gênero, exclusões removidas, se houve).
4. **Links de pré-visualização** de cada anúncio (feed do Facebook, Stories e Reels do Instagram) —
   também salvos em `resultado.json`, em `previews`.
5. **Qualquer alternativa usada** — por exemplo, se algum anúncio caiu para só a imagem 4x5 (sem a
   personalização por posicionamento com a 9x16), ou se o público caiu na alternativa.

Depois disso, **tudo continua PAUSED** — a decisão de ativar (e quando) é manual, no Gerenciador de
Anúncios, depois de revisar visualmente cada anúncio pelos links de pré-visualização.

## 6. Regras de decisão do teste (depois de ativar)

- **Não mexer em nada nas primeiras 48h** depois de ativar.
- **Dia 3:** CTR do link acima de 1,2% é bom; abaixo de 0,7%, o gancho não está prendendo atenção.
- **Conjunto que gastar R$ 60 sem nenhum checkout iniciado:** pausar.
- **Venda com custo de até ~R$ 40:** vencedor; aumentar o orçamento 20% a 30% a cada 2 dias.

## Regra de ouro (não negociável)

O script só faz **leituras (GET)** na campanha `[STUDIOMENU] - CAMPANHA WHATSAPP X1` (mesma conta de
anúncios) para copiar o público do conjunto que mais vende. **Nada nela pode ser alterado** — nem
orçamento, nem status, nem público. Se o script (ou qualquer ajuste feito nele) tentar escrever
nessa campanha, pare e avise a dona antes de continuar.
