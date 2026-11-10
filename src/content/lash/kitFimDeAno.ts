// Conteúdo do Kit Agenda de Fim de Ano (v2) vem deste JSON. Não escreva textos aqui.
import raw from './kit-fim-de-ano-v2.json'

export interface VoucherStyle {
  id: 'natal' | 'rosa' | 'dourado' | 'minimal'
  name: string
}

export interface ComboFormula {
  base: 'A' | 'M' | 'A+M' | '2A' | 'A+2M'
  factor: number
  round: 'down5' | 'up5' | 'none'
}

export interface Combo {
  id: string
  season: string
  title: string
  how: string
  why: string
  formula: ComboFormula
  message: string
}

export interface KitArt {
  id: string
  title: string
  headline: string
  subline: string
  details?: string
  footer: 'studio'
  photo: 'optional' | 'none' | 'required'
  palette?: 'black'
  usesCombo?: boolean
  /** Categoria usada nos chips da galeria "Criar" (arts genéricas); as do Kit não têm. */
  category?: string
  /** Miolo explícito da arte. Quando ausente, cai na heurística antiga (ver artKind). */
  kind?: 'text' | 'urgent' | 'price' | 'list' | 'beforeAfter' | 'menu' | 'quote' | 'bullets' | 'photo'
  /** "list": horários; "bullets": tópicos (string ou {t:string}). */
  items?: (string | { t: string })[]
  /** "menu": linhas da tabela, [nome, preço]. */
  rows?: [string, string][]
  /** "menu": nota embaixo da tabela (ex.: "Valores válidos para [mês]"). */
  note?: string
  /** "quote": depoimento e autora. */
  quote?: string
  author?: string
  /** "beforeAfter": rótulos das 2 fotos (ex.: ["Antes","Depois"]). */
  labels?: [string, string]
}

export interface PlanItem {
  date: string
  title: string
  todo: string
  links: { art?: string; message?: string; tool?: string }
}

export interface KitMessageItem {
  id: string
  group: string
  title: string
  text: string
}

interface KitFimDeAnoContent {
  key: 'kit_fim_de_ano'
  title: string
  subtitle: string
  price: string
  tools: string[]
  studioTokens: Record<string, string>
  voucher: {
    styles: VoucherStyle[]
    fields: string[]
    defaultMessage: string
    sendToBuyer: string
    sendToRecipient: string
  }
  combos: Combo[]
  comboDefaults: { data_limite: string; data_uso: string; vagas: string }
  arts: KitArt[]
  plan: PlanItem[]
  listaVip: { statuses: string[]; tip: string }
  messages: KitMessageItem[]
}

export const kitFimDeAno = raw as unknown as KitFimDeAnoContent

export function getArt(id: string | undefined): KitArt | undefined {
  return kitFimDeAno.arts.find((a) => a.id === id)
}

export function getCombo(id: string | undefined): Combo | undefined {
  return kitFimDeAno.combos.find((c) => c.id === id)
}

export function getKitMessage(id: string | undefined): KitMessageItem | undefined {
  if (!id) return undefined
  return kitFimDeAno.messages.find((m) => m.id === id)
}

/** Item do plano de hoje (ou o último, se o plano já tiver terminado). */
export function nextPlanItem(): PlanItem {
  const d = new Date()
  const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return kitFimDeAno.plan.find((p) => p.date >= todayKey) ?? kitFimDeAno.plan[kitFimDeAno.plan.length - 1]
}

/** Que "kind" de miolo a arte usa: texto simples, urgência (vagas), preço (combo), lista (horários), ou um dos 5 tipos novos. */
export function artKind(art: KitArt): NonNullable<KitArt['kind']> {
  if (art.kind) return art.kind
  if (art.id === 'bf-ultima') return 'urgent'
  if (art.usesCombo) return 'price'
  if (art.id === 'natal-ultimos' || art.id === 'reveillon') return 'list'
  return 'text'
}
