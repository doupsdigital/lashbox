// Cria a campanha de lançamento do LashBox no Meta Ads (Marketing API / Graph API), a partir de
// marketing/campanha-lashbox/campanha.json. Lê o token em META_ACCESS_TOKEN (variável de ambiente
// ou .env na raiz do projeto) — NUNCA imprime o token, nunca grava em arquivo.
//
// REGRA DE OURO: o script só faz LEITURAS (GET) na campanha de referência do StudioMenu
// ("[STUDIOMENU] - CAMPANHA WHATSAPP X1"). Nada nela pode ser alterado por este script.
//
// Uso:
//   node scripts/meta/criar-campanha.mjs --simular   → não cria nada; só mostra o que seria criado
//   node scripts/meta/criar-campanha.mjs              → cria de verdade (tudo como PAUSED)
//
// O script é seguro para rodar de novo: marketing/campanha-lashbox/resultado.json guarda os IDs já
// criados, e cada passo pula o que já existe — então um erro no meio não duplica nada.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const CAMPAIGN_DIR = path.join(ROOT, 'marketing/campanha-lashbox')
const CONFIG_PATH = path.join(CAMPAIGN_DIR, 'campanha.json')
const RESULT_PATH = path.join(CAMPAIGN_DIR, 'resultado.json')

// Confira em developers.facebook.com/docs/graph-api/guides/versioning se já existe uma versão mais
// nova — pode trocar aqui ou passar META_GRAPH_API_VERSION=vXX.0 no ambiente, sem editar o código.
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

const SIMULATE = process.argv.includes('--simular')

function loadToken() {
  if (process.env.META_ACCESS_TOKEN) return process.env.META_ACCESS_TOKEN
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return null
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (key !== 'META_ACCESS_TOKEN') continue
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    return value || null
  }
  return null
}

const TOKEN = loadToken()

async function graphGet(edgePath, params = {}) {
  const url = new URL(`${GRAPH_BASE}/${edgePath}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  }
  url.searchParams.set('access_token', TOKEN)
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(`GET ${edgePath}: ${json.error.message} (código ${json.error.code})`)
  return json
}

async function graphPost(edgePath, body = {}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(body)) {
    params.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  }
  params.set('access_token', TOKEN)
  const res = await fetch(`${GRAPH_BASE}/${edgePath}`, { method: 'POST', body: params })
  const json = await res.json()
  if (json.error) throw new Error(`POST ${edgePath}: ${json.error.message} (código ${json.error.code})`)
  return json
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
}
function loadResult() {
  return fs.existsSync(RESULT_PATH) ? JSON.parse(fs.readFileSync(RESULT_PATH, 'utf8')) : {}
}
function saveResult(result) {
  fs.writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2) + '\n')
}

function resolveTitulo(cfg, ad) {
  if (ad.conjunto === 'C3') return cfg.textos.C3.titulos[ad.titulo_ref]
  return cfg.textos[ad.conjunto].titulo
}

// --- Passo 1: acesso à conta, página e pixel -------------------------------------------------

async function checkAccess(cfg) {
  console.log('[1] Conferindo acesso à conta de anúncios, página e pixel…')
  const account = await graphGet(cfg.conta_de_anuncios.id, { fields: 'name,currency,timezone_name,account_status' })
  console.log(`  Conta: ${account.name} · moeda ${account.currency} · fuso ${account.timezone_name} · status ${account.account_status}`)
  const page = await graphGet(cfg.pagina_facebook.id, { fields: 'name' })
  console.log(`  Página: ${page.name}`)
  const pixel = await graphGet(cfg.pixel.id, { fields: 'name' })
  console.log(`  Pixel: ${pixel.name}`)
  return account
}

// --- Passo 2: o pixel recebeu eventos de lashbox.app nas últimas 48h? ------------------------

async function checkPixelRecentEvents(cfg) {
  console.log('\n[2] Conferindo se o pixel recebeu eventos de lashbox.app nas últimas 48h…')
  const now = Math.floor(Date.now() / 1000)
  const since = now - 48 * 3600

  try {
    const stats = await graphGet(`${cfg.pixel.id}/stats`, { aggregation: 'event', start_time: since, end_time: now })
    const total = (stats.data || []).reduce((sum, row) => sum + (row.count ?? row.value ?? 0), 0)
    if (total > 0) {
      console.log(`  OK — ${total} evento(s) nas últimas 48h (via /stats).`)
      return true
    }
  } catch (err) {
    console.log(`  /stats não funcionou (${err.message}); tentando /activities…`)
  }

  try {
    const activities = await graphGet(`${cfg.pixel.id}/activities`, { fields: 'event,timestamp', limit: 100 })
    const recentes = (activities.data || []).filter((row) => new Date(row.timestamp).getTime() / 1000 > since)
    if (recentes.length > 0) {
      console.log(`  OK — ${recentes.length} evento(s) nas últimas 48h (via /activities).`)
      return true
    }
  } catch (err) {
    console.log(`  /activities também não funcionou (${err.message}).`)
  }

  console.log('  Nenhum evento recente confirmado.')
  return false
}

// --- Passo 3: copiar o público do melhor conjunto do StudioMenu (SOMENTE LEITURA) ------------

async function resolveAudience(cfg) {
  console.log('\n[3] Procurando o público de referência (somente leitura, nada é alterado)…')
  const campaignsResp = await graphGet(`${cfg.conta_de_anuncios.id}/campaigns`, { fields: 'id,name', limit: 500 })
  const ref = (campaignsResp.data || []).find((c) => c.name === cfg.publico.campanha_referencia)
  if (!ref) {
    console.log(`  Campanha "${cfg.publico.campanha_referencia}" não encontrada — usando a alternativa do campanha.json.`)
    return { source: 'alternativa (campanha de referência não encontrada)', targeting: cfg.publico.alternativa_se_nao_for_possivel }
  }

  const adsetsResp = await graphGet(`${ref.id}/adsets`, { fields: 'id,name,targeting', limit: 500 })
  const adsets = adsetsResp.data || []
  if (adsets.length === 0) {
    console.log('  Campanha de referência sem conjuntos — usando a alternativa.')
    return { source: 'alternativa (sem conjuntos na campanha de referência)', targeting: cfg.publico.alternativa_se_nao_for_possivel }
  }

  let best = null
  for (const adset of adsets) {
    const insightsResp = await graphGet(`${adset.id}/insights`, { fields: 'spend,actions,cost_per_action_type', date_preset: 'maximum' }).catch(() => null)
    const row = insightsResp?.data?.[0]
    if (!row) continue
    const purchaseAction = (row.actions || []).find((a) => a.action_type.includes('purchase'))
    const resultados = purchaseAction ? Number(purchaseAction.value) : 0
    if (resultados < 3) continue
    const costAction = (row.cost_per_action_type || []).find((a) => a.action_type.includes('purchase'))
    const custoPorResultado = costAction ? Number(costAction.value) : Infinity
    if (!best || custoPorResultado < best.custoPorResultado) best = { adset, resultados, custoPorResultado }
  }

  if (!best) {
    console.log('  Nenhum conjunto da campanha de referência tem 3+ resultados — usando a alternativa.')
    return { source: 'alternativa (nenhum conjunto de referência com 3+ resultados)', targeting: cfg.publico.alternativa_se_nao_for_possivel }
  }

  console.log(`  Conjunto escolhido: "${best.adset.name}" (${best.resultados} resultados, custo/resultado ${best.custoPorResultado.toFixed(2)})`)

  const targeting = JSON.parse(JSON.stringify(best.adset.targeting || {}))
  const excluded = targeting.excluded_custom_audiences || []
  if (excluded.length) {
    const namesResp = await graphGet(`${cfg.conta_de_anuncios.id}/customaudiences`, { fields: 'id,name', limit: 500 }).catch(() => ({ data: [] }))
    const nameById = new Map((namesResp.data || []).map((a) => [a.id, a.name]))
    targeting.excluded_custom_audiences = excluded.filter((a) => {
      const name = nameById.get(a.id) || ''
      const isStudioMenu = /studiomenu/i.test(name)
      if (isStudioMenu) console.log(`  Removendo exclusão de cliente do StudioMenu: "${name}"`)
      return !isStudioMenu
    })
  }
  if (!targeting.targeting_automation) targeting.targeting_automation = { advantage_audience: 1 }

  return { source: `conjunto "${best.adset.name}" da campanha "${cfg.publico.campanha_referencia}"`, targeting }
}

// --- Passo 4: subir as 14 imagens (adimages), uma por anúncio -------------------------------

async function ensureImages(cfg, result) {
  console.log('\n[4] Enviando as imagens dos anúncios (adimages)…')
  result.images = result.images || {}
  for (const [adName, ad] of Object.entries(cfg.anuncios)) {
    const pending = {}
    for (const sizeKey of ['imagem_4x5', 'imagem_9x16']) {
      const key = `${adName}__${sizeKey}`
      if (!result.images[key]) {
        pending[key] = fs.readFileSync(path.join(CAMPAIGN_DIR, ad[sizeKey])).toString('base64')
      }
    }
    if (Object.keys(pending).length === 0) {
      console.log(`  "${adName}": já enviadas — pulando.`)
      continue
    }
    const resp = await graphPost(`${cfg.conta_de_anuncios.id}/adimages`, pending)
    for (const key of Object.keys(pending)) {
      const info = resp.images?.[key]
      if (!info) throw new Error(`Upload de "${key}" não retornou hash.`)
      result.images[key] = { hash: info.hash, url: info.url }
    }
    saveResult(result)
    console.log(`  "${adName}": enviado.`)
  }
  return result.images
}

// --- Passo 5: criar campanha, conjuntos, criativos e anúncios (tudo PAUSED) ------------------

async function ensureCampaign(cfg, result) {
  console.log('\n[5a] Campanha…')
  if (result.campaign?.id) {
    console.log(`  Já existe: ${result.campaign.id} — pulando.`)
    return result.campaign.id
  }
  const resp = await graphPost(`${cfg.conta_de_anuncios.id}/campaigns`, {
    name: cfg.campanha.nome,
    objective: cfg.campanha.objective,
    special_ad_categories: cfg.campanha.special_ad_categories,
    status: cfg.campanha.status,
    is_adset_budget_sharing_enabled: false,
  })
  result.campaign = { id: resp.id, name: cfg.campanha.nome }
  saveResult(result)
  console.log(`  Criada: ${resp.id}`)
  return resp.id
}

async function ensureAdSets(cfg, result, campaignId, audience) {
  console.log('\n[5b] Conjuntos…')
  result.adsets = result.adsets || {}
  const common = cfg.configuracao_comum_dos_conjuntos
  for (const conjunto of cfg.conjuntos) {
    if (result.adsets[conjunto.chave]?.id) {
      console.log(`  "${conjunto.nome}" já existe: ${result.adsets[conjunto.chave].id} — pulando.`)
      continue
    }
    // Sem publisher_platforms/facebook_positions/instagram_positions no targeting = posicionamentos
    // Advantage+ (automáticos), como pedido.
    const resp = await graphPost(`${cfg.conta_de_anuncios.id}/adsets`, {
      name: conjunto.nome,
      campaign_id: campaignId,
      daily_budget: conjunto.daily_budget_centavos,
      optimization_goal: common.optimization_goal,
      billing_event: common.billing_event,
      bid_strategy: common.bid_strategy,
      status: common.status,
      promoted_object: { pixel_id: cfg.pixel.id, custom_event_type: common.promoted_object.custom_event_type },
      targeting: audience.targeting,
    })
    result.adsets[conjunto.chave] = { id: resp.id, name: conjunto.nome }
    saveResult(result)
    console.log(`  Criado "${conjunto.nome}": ${resp.id}`)
  }
}

async function ensureCreative(cfg, result, adName, ad, images) {
  result.creatives = result.creatives || {}
  if (result.creatives[adName]?.id) return result.creatives[adName].id

  const img4x5 = images[`${adName}__imagem_4x5`]
  const img9x16 = images[`${adName}__imagem_9x16`]
  const titulo = resolveTitulo(cfg, ad)
  const texto = cfg.textos[ad.conjunto].texto_principal
  const advantageOff = cfg.advantage_creative_desligado
    ? { degrees_of_freedom_spec: { creative_features_spec: { standard_enhancements: { enroll_status: 'OPT_OUT' } } } }
    : {}

  const fallbackBody = {
    name: `Criativo · ${adName}`,
    object_story_spec: {
      page_id: cfg.pagina_facebook.id,
      link_data: {
        link: cfg.link_final,
        message: texto,
        name: titulo,
        description: cfg.descricao_padrao,
        call_to_action: { type: cfg.call_to_action, value: { link: cfg.link_final } },
        image_hash: img4x5.hash,
      },
    },
    url_tags: cfg.url_tags,
    ...advantageOff,
  }

  let body = fallbackBody
  if (img9x16) {
    // Personalização por posicionamento: 4x5 no feed, 9x16 em Stories/Reels.
    body = {
      name: `Criativo · ${adName}`,
      object_story_spec: { page_id: cfg.pagina_facebook.id },
      asset_feed_spec: {
        images: [
          { hash: img4x5.hash, adlabels: [{ name: 'img_4x5' }] },
          { hash: img9x16.hash, adlabels: [{ name: 'img_9x16' }] },
        ],
        bodies: [{ text: texto }],
        titles: [{ text: titulo }],
        descriptions: [{ text: cfg.descricao_padrao }],
        link_urls: [{ website_url: cfg.link_final }],
        call_to_action_types: [cfg.call_to_action],
        asset_customization_rules: [
          {
            customization_spec: { publisher_platforms: ['facebook', 'instagram'], facebook_positions: ['feed', 'right_hand_column'], instagram_positions: ['stream', 'explore'] },
            image_label: { name: 'img_4x5' },
          },
          {
            customization_spec: { publisher_platforms: ['facebook', 'instagram'], facebook_positions: ['story', 'facebook_reels'], instagram_positions: ['story', 'reels'] },
            image_label: { name: 'img_9x16' },
          },
        ],
      },
      url_tags: cfg.url_tags,
      ...advantageOff,
    }
  }

  let resp
  try {
    resp = await graphPost(`${cfg.conta_de_anuncios.id}/adcreatives`, body)
  } catch (err) {
    if (body === fallbackBody) throw err
    console.log(`  Personalização por posicionamento falhou para "${adName}" (${err.message}); usando só a imagem 4x5.`)
    resp = await graphPost(`${cfg.conta_de_anuncios.id}/adcreatives`, fallbackBody)
  }

  result.creatives[adName] = { id: resp.id }
  saveResult(result)
  console.log(`  Criativo "${adName}": ${resp.id}`)
  return resp.id
}

async function ensureAd(cfg, result, adName, ad, creativeId) {
  result.ads = result.ads || {}
  if (result.ads[adName]?.id) {
    console.log(`  "${adName}" já existe: ${result.ads[adName].id} — pulando.`)
    return result.ads[adName].id
  }
  const adsetId = result.adsets[ad.conjunto].id
  const resp = await graphPost(`${cfg.conta_de_anuncios.id}/ads`, {
    name: adName,
    adset_id: adsetId,
    creative: { creative_id: creativeId },
    status: 'PAUSED',
  })
  result.ads[adName] = { id: resp.id }
  saveResult(result)
  console.log(`  Criado "${adName}": ${resp.id}`)
  return resp.id
}

// --- Passo 6: links de pré-visualização ------------------------------------------------------

async function generatePreviews(cfg, result) {
  console.log('\n[6] Gerando links de pré-visualização…')
  result.previews = result.previews || {}
  const formats = { feed_facebook: 'MOBILE_FEED_STANDARD', stories_instagram: 'INSTAGRAM_STORY', reels_instagram: 'INSTAGRAM_REELS' }
  for (const [adName, ad] of Object.entries(result.ads || {})) {
    result.previews[adName] = result.previews[adName] || {}
    for (const [label, adFormat] of Object.entries(formats)) {
      if (result.previews[adName][label]) continue
      const resp = await graphGet(`${ad.id}/previews`, { ad_format: adFormat }).catch((err) => {
        console.log(`  Não consegui gerar preview "${label}" para "${adName}": ${err.message}`)
        return null
      })
      const iframe = resp?.data?.[0]?.body
      if (iframe) {
        result.previews[adName][label] = iframe
        console.log(`  OK: ${adName} · ${label}`)
      }
    }
  }
  saveResult(result)
}

// --- Modo simulação: imprime o plano sem chamar a API para criar nada -----------------------

function printDryRunPlan(cfg, audience) {
  console.log(`\nCampanha: "${cfg.campanha.nome}" · ${cfg.campanha.objective} · status ${cfg.campanha.status}`)
  console.log(`\nPúblico (${audience.source}):`)
  console.log(JSON.stringify(audience.targeting, null, 2))
  for (const conjunto of cfg.conjuntos) {
    console.log(`\n  Conjunto "${conjunto.nome}" · orçamento diário R$ ${(conjunto.daily_budget_centavos / 100).toFixed(2)} · status PAUSED`)
    for (const adName of conjunto.ads) {
      const ad = cfg.anuncios[adName]
      console.log(`    Anúncio "${adName}"`)
      console.log(`      Título: ${resolveTitulo(cfg, ad)}`)
      console.log(`      Imagens: ${ad.imagem_4x5} (feed) + ${ad.imagem_9x16} (stories/reels)`)
      console.log(`      Link: ${cfg.link_final} · CTA ${cfg.call_to_action} · descrição "${cfg.descricao_padrao}"`)
    }
  }
  console.log(`\nUTM em todos os anúncios: ${cfg.url_tags}`)
  console.log('Tudo seria criado como PAUSED — nada vai ao ar sem revisão manual.')
}

// --- main -------------------------------------------------------------------------------------

async function main() {
  console.log(SIMULATE ? '=== LashBox · Criar campanha no Meta Ads (MODO SIMULAÇÃO) ===' : '=== LashBox · Criar campanha no Meta Ads (MODO REAL) ===')
  const cfg = loadConfig()

  if (!TOKEN) {
    if (!SIMULATE) {
      console.error('\nFaltou o token: coloque META_ACCESS_TOKEN=... no .env (na raiz do projeto) e rode de novo.')
      process.exit(1)
    }
    console.log('\nSem META_ACCESS_TOKEN no .env — simulação 100% offline (nenhuma chamada à API). O que seria criado:\n')
    printDryRunPlan(cfg, { source: 'alternativa (sem token para conferir a campanha de referência)', targeting: cfg.publico.alternativa_se_nao_for_possivel })
    return
  }

  if (SIMULATE) {
    console.log('\nToken encontrado — fazendo as leituras de verdade (passos 1 a 3) e simulando o resto (nada é criado).\n')
    await checkAccess(cfg)
    const pixelOk = await checkPixelRecentEvents(cfg)
    if (!pixelOk) console.log('\n(Simulação) Em modo real, o script pararia aqui — pixel sem eventos recentes.')
    const audience = await resolveAudience(cfg)
    printDryRunPlan(cfg, audience)
    return
  }

  // MODO REAL
  const result = loadResult()
  await checkAccess(cfg)
  const pixelOk = await checkPixelRecentEvents(cfg)
  if (!pixelOk) {
    console.error('\nPARANDO: o pixel não recebeu eventos de lashbox.app nas últimas 48h. Confira o pixel (Kiwify + index.html) antes de criar a campanha.')
    process.exit(1)
  }

  result.audience = result.audience || (await resolveAudience(cfg))
  saveResult(result)

  const images = await ensureImages(cfg, result)
  const campaignId = await ensureCampaign(cfg, result)
  await ensureAdSets(cfg, result, campaignId, result.audience)

  for (const [adName, ad] of Object.entries(cfg.anuncios)) {
    const creativeId = await ensureCreative(cfg, result, adName, ad, images)
    await ensureAd(cfg, result, adName, ad, creativeId)
  }

  await generatePreviews(cfg, result)

  console.log('\n=== Pronto. Campanha, conjuntos e anúncios criados como PAUSED. ===')
  console.log('Resultado salvo em marketing/campanha-lashbox/resultado.json (sem token).')
}

main().catch((err) => {
  console.error(`\nErro: ${err.message}`)
  process.exit(1)
})
