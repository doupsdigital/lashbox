// Confere que nenhum link do conteúdo (plano da semana, datas do ano, sugestões do Início) aponta
// para uma arte, mensagem ou kit que não existe. Roda com: node scripts/verify-content.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.join(dir, '..', 'src', 'content', 'lash')

const readJson = (name) => JSON.parse(readFileSync(path.join(contentDir, name), 'utf8'))

const arts = readJson('arts.json')
const messages = readJson('messages.json')
const weekPlan = readJson('week-plan.json')
const yearDates = readJson('year-dates.json')
const homeSuggestions = readJson('home-suggestions.json')
const kits = readJson('kits.json')
const kitFimDeAno = readJson('kit-fim-de-ano-v2.json')

const artIds = new Set([...arts.map((a) => a.id), ...kitFimDeAno.arts.map((a) => a.id)])
const messageIds = new Set([...messages.map((m) => m.id), ...kitFimDeAno.messages.map((m) => m.id)])
const kitKeys = new Set(kits.map((k) => k.key))

const errors = []

for (const d of weekPlan) {
  if (d.links.art && !artIds.has(d.links.art)) errors.push(`week-plan dow=${d.dow}: arte "${d.links.art}" não existe`)
  if (d.links.message && !messageIds.has(d.links.message)) errors.push(`week-plan dow=${d.dow}: mensagem "${d.links.message}" não existe`)
}

for (const s of homeSuggestions) {
  if (!artIds.has(s.art)) errors.push(`home-suggestions "${s.caption.slice(0, 30)}…": arte "${s.art}" não existe`)
}

for (const d of yearDates) {
  if (d.kitKey && !kitKeys.has(d.kitKey)) errors.push(`year-dates "${d.label}": kit "${d.kitKey}" não existe em kits.json`)
}

// Cada arte referenciada numa categoria da galeria precisa ter uma categoria válida (não vazia).
for (const a of arts) {
  if (!a.category) errors.push(`arts.json "${a.id}": sem categoria`)
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s) de conteúdo:\n`)
  for (const e of errors) console.error(' - ' + e)
  process.exit(1)
}

console.log(`✓ Conteúdo ok: ${arts.length} artes, ${messages.length} mensagens, ${weekPlan.length} dias do plano, ${yearDates.length} datas do ano, ${homeSuggestions.length} sugestões do Início — todos os links resolvem.`)
