// Edge Function: kiwify-webhook
// Recebe os eventos da Kiwify (assinatura do LashBox + compras avulsas de kits sazonais) e
// atualiza `subscriptions` / `purchases`.
//
// ⚠️ PENDÊNCIA IMPORTANTE (ver CLAUDE.md e LASHBOX-PLANO.md, seção 3):
// Os nomes EXATOS dos eventos de assinatura da Kiwify (renovada/atrasada/cancelada) e dos
// campos do payload (id da assinatura, plano, próxima cobrança) ainda não foram confirmados
// com um pagamento de teste. Tudo que depende disso está isolado abaixo, em
// `SUBSCRIPTION_EVENT_MAP` e `extractSubscription()`. Quando o primeiro webhook de assinatura
// real chegar, confira o `payload` em `webhook_logs` e ajuste esses dois pontos.
//
// Assinatura do webhook (docs.kiwify.com.br/api-reference/webhooks/receiving):
//   a Kiwify adiciona ?signature=<hex> na URL; o valor é HMAC-SHA1 do corpo cru,
//   usando como chave o token cadastrado no webhook.
//
// Segredos (Edge Functions → Secrets):
//   KIWIFY_WEBHOOK_TOKEN      token do webhook na Kiwify (obrigatório)
//   KIWIFY_WEBHOOK_TOKEN_OLD  token antigo, só durante uma troca de token (opcional)
//   KIWIFY_PRODUCT_MAP        "id_do_produto:product_key,id_do_produto:product_key,..."
//                             mapeia o produto de ASSINATURA da Kiwify para 'subscription' e
//                             cada kit sazonal para sua chave (ex.: 'fim-de-ano'). Obrigatório;
//                             sem isso, a função recusa tudo.

export interface SubscriptionRow {
  email: string
  kiwify_subscription_id: string | null
  plan: 'mensal' | 'anual'
  status: 'active' | 'late' | 'canceled' | 'refunded'
  current_period_end: string | null
}

export interface PurchaseRow {
  email: string
  kiwify_order_id: string | null
  product_key: string
  status: 'active' | 'revoked'
  product: string | null
}

export interface LogRow {
  event_type: string | null
  order_id: string | null
  email: string | null
  signature_valid: boolean
  result: 'processed' | 'ignored' | 'rejected' | 'error'
  message: string
  payload: unknown
  raw_body: string | null
}

export interface Deps {
  tokens: string[]
  /** id do produto na Kiwify → product_key interno ('subscription' ou a chave de um kit) */
  productMap: Record<string, string>
  upsertSubscription: (row: SubscriptionRow) => Promise<void>
  findPurchase: (orderId: string, productKey: string) => Promise<{ status: string } | null>
  upsertPurchase: (row: PurchaseRow) => Promise<void>
  /** Marca todas as assinaturas desse e-mail (ou id de assinatura) como 'refunded'/'canceled'. Devolve quantas mudaram. */
  markSubscriptions: (match: { email?: string; kiwifySubscriptionId?: string }, status: 'refunded' | 'canceled') => Promise<number>
  /** Revoga todas as linhas de purchases com esse kiwify_order_id. Devolve quantas mudaram. */
  revokePurchaseOrder: (orderId: string) => Promise<number>
  log: (row: LogRow) => Promise<void>
}

// ───────────── ⚠️ CONFERIR COM A DOCUMENTAÇÃO / UM PAGAMENTO DE TESTE ─────────────
// Nomes de `webhook_event_type` esperados. Os 3 primeiros (compra/reembolso/chargeback) já
// foram confirmados no Agenda Lotada. Os 3 de assinatura são um palpite razoável e PRECISAM
// ser confirmados.
const EVENT_APPROVED = new Set(['order_approved'])
const EVENT_REFUND_OR_CHARGEBACK = new Set(['order_refunded', 'chargeback'])
const SUBSCRIPTION_EVENT_MAP: Record<string, 'renewed' | 'late' | 'canceled'> = {
  subscription_renewed: 'renewed',
  subscription_late: 'late',
  subscription_canceled: 'canceled',
}
const SUBSCRIPTION_STATUS_FALLBACK = new Set(['overdue', 'late']) // via order_status, se não houver webhook_event_type

/** Lê os campos de assinatura do payload. Caminhos ainda não confirmados — ver aviso no topo. */
function extractSubscription(payload: Json): { id: string | null; plan: 'mensal' | 'anual' | null; periodEnd: string | null } {
  const id = pick(payload, ['Subscription', 'id'], ['subscription_id'], ['Subscription', 'subscription_id'])
  const planRaw = (
    pick(payload, ['Subscription', 'plan', 'name'], ['Subscription', 'plan_name'], ['plan', 'name']) ?? ''
  ).toLowerCase()
  const plan: 'mensal' | 'anual' | null = planRaw.includes('anual') || planRaw.includes('year') ? 'anual' : planRaw.includes('mensal') || planRaw.includes('month') ? 'mensal' : null
  const periodEnd = pick(
    payload,
    ['Subscription', 'next_payment'],
    ['Subscription', 'next_payment_date'],
    ['subscription', 'next_payment'],
    ['access_until'],
  )
  return { id, plan, periodEnd }
}
// ─────────────────────────────────────────────────────────────────────────────────

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

export async function hmacSha1Hex(key: string, message: string) {
  const enc = new TextEncoder()
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', k, enc.encode(message)))
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// deno-lint-ignore no-explicit-any
type Json = any

function pick(p: Json, ...paths: string[][]): string | null {
  for (const path of paths) {
    let v: Json = p
    for (const k of path) v = v?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return null
}

export function parseProductMap(raw: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const part of raw.split(',')) {
    const [id, key] = part.split(':').map((s) => s.trim())
    if (id && key) map[id] = key
  }
  return map
}

function extractProducts(payload: Json): { productId: string; productName: string | null }[] {
  const list: { productId: string; productName: string | null }[] = []
  const add = (productId: string | null, productName: string | null) => {
    if (productId && !list.some((p) => p.productId === productId)) list.push({ productId, productName })
  }
  add(
    pick(payload, ['Product', 'product_id'], ['product', 'id'], ['Product', 'id']),
    pick(payload, ['Product', 'product_name'], ['product', 'name'], ['Product', 'name']),
  )
  return list
}

const respond = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method !== 'POST') return respond(405, { ok: false })

  const raw = await req.text()
  const signature = (new URL(req.url).searchParams.get('signature') ?? '').toLowerCase()

  let payload: Json = null
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = null
  }

  const eventType = pick(payload, ['webhook_event_type'])
  const orderStatus = pick(payload, ['order_status'])
  const orderId = pick(payload, ['order_id'], ['id'])
  const emailRaw = pick(payload, ['Customer', 'email'], ['customer', 'email'], ['Customer', 'Email'])
  const email = emailRaw ? emailRaw.toLowerCase() : null

  const base = { event_type: eventType, order_id: orderId, email, payload, raw_body: payload ? null : raw.slice(0, 5000) }

  if (!deps.tokens.length) {
    await deps.log({ ...base, signature_valid: false, result: 'error', message: 'KIWIFY_WEBHOOK_TOKEN não configurado' })
    return respond(500, { ok: false, reason: 'not_configured' })
  }
  let valid = false
  for (const t of deps.tokens) {
    if (signature && safeEqual(await hmacSha1Hex(t, raw), signature)) valid = true
  }
  if (!valid) {
    await deps.log({ ...base, signature_valid: false, result: 'rejected', message: 'assinatura inválida' })
    return respond(401, { ok: false, reason: 'invalid_signature' })
  }

  const done = async (result: LogRow['result'], message: string, status = 200) => {
    await deps.log({ ...base, signature_valid: true, result, message })
    return respond(status, { ok: result !== 'error', result, message })
  }

  if (!Object.keys(deps.productMap).length) {
    return done('error', 'KIWIFY_PRODUCT_MAP não configurado', 500)
  }
  if (!payload) return done('ignored', 'corpo não é JSON')
  if (!eventType && !orderStatus) return done('ignored', 'sem webhook_event_type (ex.: carrinho abandonado)')
  if (!email) return done('error', 'payload sem e-mail da compradora', 400)

  try {
    // 1. Reembolso / chargeback: bloqueia a assinatura e revoga compras do pedido na hora.
    if (EVENT_REFUND_OR_CHARGEBACK.has(eventType ?? '')) {
      if (!orderId) return done('error', 'payload sem order_id', 400)
      const sub = extractSubscription(payload)
      const n1 = await deps.markSubscriptions(sub.id ? { kiwifySubscriptionId: sub.id } : { email }, 'refunded')
      const n2 = await deps.revokePurchaseOrder(orderId)
      return done('processed', `reembolso/chargeback: ${n1} assinatura(s) bloqueada(s), ${n2} compra(s) revogada(s) para ${email}`)
    }

    // 2. Cancelamento de assinatura: usa até o fim do período já pago (current_period_end não muda aqui).
    if (SUBSCRIPTION_EVENT_MAP[eventType ?? ''] === 'canceled') {
      const sub = extractSubscription(payload)
      const n = await deps.markSubscriptions(sub.id ? { kiwifySubscriptionId: sub.id } : { email }, 'canceled')
      return done('processed', `assinatura cancelada para ${email} (${n} linha(s))`)
    }

    // 3. Renovação / pagamento atrasado: atualiza status e data do próximo período.
    const subEvent = SUBSCRIPTION_EVENT_MAP[eventType ?? '']
    if (subEvent === 'renewed' || subEvent === 'late' || (!eventType && SUBSCRIPTION_STATUS_FALLBACK.has(orderStatus ?? ''))) {
      const sub = extractSubscription(payload)
      await deps.upsertSubscription({
        email,
        kiwify_subscription_id: sub.id,
        plan: sub.plan ?? 'mensal',
        status: subEvent === 'late' ? 'late' : 'active',
        current_period_end: sub.periodEnd,
      })
      return done('processed', `assinatura ${subEvent ?? orderStatus} para ${email}`)
    }

    // 4. Compra aprovada: assinatura nova OU kit sazonal avulso (conforme KIWIFY_PRODUCT_MAP).
    if (EVENT_APPROVED.has(eventType ?? '')) {
      if (!orderId) return done('error', 'payload sem order_id', 400)
      const found = extractProducts(payload)
      const matched = found.map((p) => ({ ...p, productKey: deps.productMap[p.productId] })).filter((p) => p.productKey)
      if (!matched.length) {
        const ids = found.map((p) => p.productId).join(', ') || 'nenhum'
        return done('ignored', `produto(s) fora do KIWIFY_PRODUCT_MAP (id: ${ids})`)
      }
      const parts: string[] = []
      for (const m of matched) {
        if (m.productKey === 'subscription') {
          const sub = extractSubscription(payload)
          await deps.upsertSubscription({
            email,
            kiwify_subscription_id: sub.id,
            plan: sub.plan ?? 'mensal',
            status: 'active',
            current_period_end: sub.periodEnd,
          })
          parts.push('assinatura: liberada')
          continue
        }
        const existing = await deps.findPurchase(orderId, m.productKey)
        if (existing?.status === 'revoked') {
          parts.push(`${m.productKey}: ignorado (já reembolsado/estornado)`)
          continue
        }
        await deps.upsertPurchase({ email, kiwify_order_id: orderId, product_key: m.productKey, status: 'active', product: m.productName })
        parts.push(`${m.productKey}: liberado`)
      }
      return done('processed', `${email} (pedido ${orderId}): ${parts.join('; ')}`)
    }

    return done('ignored', `evento ${eventType ?? orderStatus} não altera acesso`)
  } catch (e) {
    return done('error', `erro no banco: ${errorMessage(e)}`, 500)
  }
}

/** Erros do supabase-js (ex.: PostgrestError) não são instâncias de Error; pega a .message deles. */
function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

// ───────────── Execução no Supabase (Deno) ─────────────
// deno-lint-ignore no-explicit-any
const D = (globalThis as any).Deno
if (D) {
  const { createClient } = await import('npm:@supabase/supabase-js@2')
  const env = (k: string) => D.env.get(k) ?? ''
  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const deps: Deps = {
    tokens: [env('KIWIFY_WEBHOOK_TOKEN'), env('KIWIFY_WEBHOOK_TOKEN_OLD')].filter(Boolean),
    productMap: parseProductMap(env('KIWIFY_PRODUCT_MAP')),
    upsertSubscription: async (row) => {
      const { error } = await db
        .from('subscriptions')
        .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'kiwify_subscription_id' })
      if (error) throw error
    },
    findPurchase: async (orderId, productKey) => {
      const { data, error } = await db.from('purchases').select('status').eq('kiwify_order_id', orderId).eq('product_key', productKey).maybeSingle()
      if (error) throw error
      return data
    },
    upsertPurchase: async (row) => {
      const { error } = await db.from('purchases').upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'kiwify_order_id,product_key' })
      if (error) throw error
    },
    markSubscriptions: async (match, status) => {
      let q = db.from('subscriptions').update({ status, updated_at: new Date().toISOString() })
      q = match.kiwifySubscriptionId ? q.eq('kiwify_subscription_id', match.kiwifySubscriptionId) : q.eq('email', match.email)
      // A Kiwify manda "order_refunded" e "subscription_canceled" quase juntos num reembolso.
      // 'refunded' é definitivo (bloqueia na hora); não deixa um 'canceled' que chegue logo
      // depois rebaixar o status de volta e reabrir o acesso até o fim do período.
      if (status === 'canceled') q = q.neq('status', 'refunded')
      const { data, error } = await q.select('id')
      if (error) throw error
      return data?.length ?? 0
    },
    revokePurchaseOrder: async (orderId) => {
      const { data, error } = await db.from('purchases').update({ status: 'revoked', updated_at: new Date().toISOString() }).eq('kiwify_order_id', orderId).select('product_key')
      if (error) throw error
      return data?.length ?? 0
    },
    log: async (row) => {
      const { error } = await db.from('webhook_logs').insert(row)
      if (error) console.error('webhook_logs', error)
    },
  }
  D.serve((req: Request) => handle(req, deps))
}
