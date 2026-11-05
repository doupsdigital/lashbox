// Edge Function: request-login
// Confere se o e-mail tem acesso (assinatura dentro do período pago) ou alguma compra de kit,
// e só então envia o link mágico. Como o cadastro público fica desligado no Supabase, esta
// função é o único jeito de criar conta.
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, reason: 'method' }, 405)

  let body: { email?: unknown; redirectTo?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, reason: 'invalid_email' }, 400)
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false, reason: 'invalid_email' }, 400)
  const redirectTo = typeof body.redirectTo === 'string' ? body.redirectTo : undefined

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 1. Tem acesso (assinatura dentro do período pago) ou alguma compra de kit?
  const { data: sub, error: sErr } = await admin
    .from('subscriptions')
    .select('id')
    .eq('email', email)
    .in('status', ['active', 'late', 'canceled'])
    .gt('current_period_end', new Date().toISOString())
    .limit(1)
    .maybeSingle()
  if (sErr) {
    console.error('subscriptions', sErr)
    return json({ ok: false, reason: 'server' }, 500)
  }

  let hasAccess = !!sub
  if (!hasAccess) {
    const { data: purchase, error: pErr } = await admin
      .from('purchases')
      .select('id')
      .eq('email', email)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    if (pErr) {
      console.error('purchases', pErr)
      return json({ ok: false, reason: 'server' }, 500)
    }
    hasAccess = !!purchase
  }
  if (!hasAccess) return json({ ok: false, reason: 'no_purchase' })

  // 2. Cria a conta se ainda não existir (funciona mesmo com cadastro público desligado)
  const { error: cErr } = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (cErr && cErr.code !== 'email_exists' && !/already/i.test(cErr.message)) {
    console.error('createUser', cErr)
    return json({ ok: false, reason: 'server' }, 500)
  }

  // 3. Envia o link mágico (fluxo "implicit": o link funciona em qualquer navegador)
  const pub = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, flowType: 'implicit' },
  })
  const { error: oErr } = await pub.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  })
  if (oErr) {
    console.error('signInWithOtp', oErr)
    if (oErr.status === 429 || /rate|seconds/i.test(oErr.message)) return json({ ok: false, reason: 'rate_limit' })
    return json({ ok: false, reason: 'server' }, 500)
  }

  return json({ ok: true })
})
