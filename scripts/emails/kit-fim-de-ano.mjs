// Envia (via Resend) um lembrete do Kit Fim de Ano para quem tem assinatura ativa e ainda não
// comprou o kit. Lê RESEND_API_KEY, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env (na raiz do
// projeto) — nunca impressos. O service role é necessário porque subscriptions/purchases só são
// legíveis pela própria usuária (RLS) ou pelo service role (ver supabase/migrations/).
//
// Uso:
//   node scripts/emails/kit-fim-de-ano.mjs             → simula (padrão, não envia nada)
//   node scripts/emails/kit-fim-de-ano.mjs --simular   → mesma coisa, explícito
//   node scripts/emails/kit-fim-de-ano.mjs --enviar    → envia de verdade pelo Resend

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const SEND = process.argv.includes('--enviar')

function loadEnvVar(name) {
  if (process.env[name]) return process.env[name]
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return null
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (key !== name) continue
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    return value || null
  }
  return null
}

const RESEND_API_KEY = loadEnvVar('RESEND_API_KEY')
const SUPABASE_URL = loadEnvVar('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = loadEnvVar('SUPABASE_SERVICE_ROLE_KEY')

const FROM = 'LashBox <acesso@lashbox.app>'
const SUBJECT = 'Sua Black Friday já está pronta 🎁'
const KIT_URL = 'https://lashbox.app/kits/fim-de-ano'

function buildHtml() {
  return `
<div style="background:#FBE8EE;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#2A1E27">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:24px;padding:28px 24px;text-align:center">
    <img src="https://lashbox.app/pwa-192.png" width="64" height="64" alt="LashBox" style="display:block;margin:0 auto 10px;border:0">
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">LashBox</div>
    <div style="display:inline-block;background:linear-gradient(135deg,#5B2A4E,#E07A9B);border-radius:18px;width:64px;height:64px;line-height:64px;margin-bottom:18px;font-size:30px">🎁</div>
    <div style="font-size:23px;font-weight:700;line-height:1.25;margin-bottom:14px">Sua Black Friday já está pronta</div>
    <div style="font-size:16px;line-height:1.55;color:#5A4E55;margin-bottom:24px;text-align:left">
      O <strong>Kit Fim de Ano</strong> traz 10 artes temáticas, vale-presente de Natal personalizado, ofertas de Black Friday e Natal já calculadas com os seus preços, e um plano dia a dia até janeiro.
      <br><br>
      A Black Friday é dia <strong>27/11</strong> — dá tempo de preparar tudo com calma.
    </div>
    <a href="${KIT_URL}" style="display:inline-block;background:#5B2A4E;color:#ffffff;text-decoration:none;font-weight:700;font-size:17px;padding:16px 32px;border-radius:999px">Ver o kit no app</a>
    <div style="font-size:13px;color:#8E808A;margin-top:28px">Você recebeu este e-mail por ser assinante do LashBox.</div>
  </div>
</div>`.trim()
}

function buildText() {
  return [
    'LashBox',
    '',
    'Sua Black Friday já está pronta 🎁',
    '',
    'O Kit Fim de Ano traz 10 artes temáticas, vale-presente de Natal personalizado, ofertas de',
    'Black Friday e Natal já calculadas com os seus preços, e um plano dia a dia até janeiro.',
    '',
    'A Black Friday é dia 27/11 — dá tempo de preparar tudo com calma.',
    '',
    `Ver o kit no app: ${KIT_URL}`,
    '',
    'Você recebeu este e-mail por ser assinante do LashBox.',
  ].join('\n')
}

/** null = não deu para consultar (sem credenciais do Supabase); [] = ninguém a avisar. */
async function fetchRecipients() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no .env — não consigo consultar quem receberia.')
    return null
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('email, status, current_period_end')
    .in('status', ['active', 'late', 'canceled'])
    .gt('current_period_end', new Date().toISOString())
  if (subsError) throw new Error(`Erro lendo subscriptions: ${subsError.message}`)

  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('email')
    .eq('product_key', 'fim-de-ano')
    .eq('status', 'active')
  if (purchasesError) throw new Error(`Erro lendo purchases: ${purchasesError.message}`)

  const purchasedEmails = new Set((purchases ?? []).map((p) => p.email.toLowerCase()))
  const subscriberEmails = new Set((subs ?? []).map((s) => s.email.toLowerCase()))
  return [...subscriberEmails].filter((email) => !purchasedEmails.has(email)).sort()
}

async function sendBatch(emails) {
  const html = buildHtml()
  const text = buildText()
  const CHUNK = 100 // limite do endpoint /emails/batch da Resend
  let sent = 0
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    const body = chunk.map((email) => ({ from: FROM, to: [email], subject: SUBJECT, html, text }))
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(`Resend recusou o lote ${Math.floor(i / CHUNK) + 1}: ${JSON.stringify(json)}`)
    sent += chunk.length
    console.log(`  Lote ${Math.floor(i / CHUNK) + 1}: ${chunk.length} enviado(s).`)
  }
  return sent
}

async function main() {
  console.log(SEND ? '=== LashBox · E-mail do Kit Fim de Ano (MODO REAL — vai enviar) ===' : '=== LashBox · E-mail do Kit Fim de Ano (MODO SIMULAÇÃO — não envia nada) ===')

  const recipients = await fetchRecipients()

  console.log(`\nAssunto: ${SUBJECT}`)
  console.log(`Remetente: ${FROM}`)
  console.log(`Link do botão: ${KIT_URL}`)
  console.log('\n--- Prévia (texto simples) ---')
  console.log(buildText())
  console.log('--- fim da prévia ---\n')

  if (recipients === null) {
    console.log('Sem conseguir consultar o Supabase — não dá pra saber quantas pessoas receberiam, nem enviar de verdade.')
    return
  }

  console.log(`Receberiam: ${recipients.length} assinante(s) com acesso ativo que ainda não compraram o Kit Fim de Ano.`)
  if (recipients.length > 0) {
    const preview = recipients.slice(0, 5)
    console.log(`  Exemplos: ${preview.join(', ')}${recipients.length > preview.length ? ` … e mais ${recipients.length - preview.length}` : ''}`)
  }

  if (!SEND) {
    console.log('\nSimulação — nada foi enviado. Rode com --enviar para enviar de verdade.')
    return
  }

  if (recipients.length === 0) {
    console.log('\nNinguém para enviar — nada a fazer.')
    return
  }
  if (!RESEND_API_KEY) {
    console.error('\nFaltou RESEND_API_KEY no .env — não dá para enviar de verdade.')
    process.exit(1)
  }

  console.log(`\nEnviando de verdade para ${recipients.length} pessoa(s)…`)
  const sent = await sendBatch(recipients)
  console.log(`\n=== Pronto. ${sent} e-mail(s) enviado(s) pelo Resend. ===`)
}

main().catch((err) => {
  console.error(`\nErro: ${err.message}`)
  process.exit(1)
})
