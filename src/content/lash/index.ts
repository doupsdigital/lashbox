// Conteúdo genérico do LashBox (galeria "Criar", biblioteca de mensagens, plano e kits).
// Separado por nicho: trocar esta pasta inteira é o bastante para virar "Nail Box" etc.
import genericArtsRaw from './arts.json'
import messagesRaw from './messages.json'
import weekPlanRaw from './week-plan.json'
import yearDatesRaw from './year-dates.json'
import kitsRaw from './kits.json'
import homeSuggestionsRaw from './home-suggestions.json'
import combosRaw from './combos.json'
import { kitFimDeAno, type KitArt, type Combo } from './kitFimDeAno'

export type { KitArt, Combo }
export { kitFimDeAno, getArt as getKitArt, getCombo, getKitMessage, artKind, nextPlanItem } from './kitFimDeAno'

export const genericArts = genericArtsRaw as KitArt[]

/** Todas as artes conhecidas (genéricas do dia a dia + as do Kit Fim de Ano), por id. */
export const allArts: KitArt[] = [...genericArts, ...kitFimDeAno.arts]

export function getAnyArt(id: string | undefined): KitArt | undefined {
  return allArts.find((a) => a.id === id)
}

export const ART_CATEGORIES = ['Todas', 'Agenda', 'Valores', 'Resultados', 'Cuidados', 'Clientes', 'Avisos'] as const

/** Combos genéricos do dia a dia (Vender → Montador de ofertas). O Kit Fim de Ano tem os seus, separados. */
export const combos = combosRaw.combos as Combo[]
export const comboDefaults = combosRaw.defaults as { data_limite: string; data_uso: string; vagas: string }

export function getGenericCombo(id: string | undefined): Combo | undefined {
  return combos.find((c) => c.id === id)
}

export interface MessageItem {
  id: string
  category: string
  title: string
  text: string
}
export const messages = messagesRaw as MessageItem[]

/** Categorias das mensagens, derivadas dos dados (na ordem em que aparecem), com "Todas" na frente. */
export const MESSAGE_CATEGORIES = ['Todas', ...Array.from(new Set(messages.map((m) => m.category)))]

export interface WeekPlanItem {
  dow: number // 0 = domingo .. 6 = sábado
  label: string
  title: string
  detail: string
  tag: string
  links: { art?: string; message?: string; tool?: string }
}
export const weekPlan = weekPlanRaw as WeekPlanItem[]

export interface YearDateItem {
  date: string // AAAA-MM-DD
  label: string
  /** Só quando a data tem um kit com conteúdo real à venda — nunca mostramos "em breve". */
  kitKey: string | null
  kit: string
  tip: string
}
export const yearDates = yearDatesRaw as YearDateItem[]

/** Nenhum kit é bônus da assinatura: todos são comprados avulso (ver state/purchases.tsx). */
export interface KitCatalogItem {
  key: string
  name: string
  desc: string
  price: string
  color1: string
  color2: string
  icon: 'gift' | 'spark' | 'cal'
  /** Não entra nas listagens genéricas (`kitsCatalog.filter(k => !k.hidden)`) — só acessível direto por `/kits/:key`. */
  hidden?: boolean
  /** Entrada cosmética: é a mesma compra de outra chave (mesmo preço, mesmo checkout, mesmo produto na Kiwify). */
  aliasOf?: string
  /** Título/subtítulo próprios pra tela de detalhes — sem isso, usa os do conteúdo do kit (`kitFimDeAno.title/subtitle`). */
  title?: string
  subtitle?: string
}
export const kitsCatalog = kitsRaw as KitCatalogItem[]
/** Kits que aparecem nas listagens genéricas (Início, `/kits`) — exclui entradas cosméticas como `black-friday`. */
export const visibleKitsCatalog = kitsCatalog.filter((k) => !k.hidden)

export function getKitCatalog(key: string | undefined): KitCatalogItem | undefined {
  return kitsCatalog.find((k) => k.key === key)
}

export interface HomeSuggestion {
  art: string
  caption: string
  tag: string
}
export const homeSuggestions = homeSuggestionsRaw as HomeSuggestion[]

/** Escolhe uma sugestão "para postar hoje" de forma estável por dia (muda todo dia, mas não a cada render). */
export function suggestionOfTheDay(): HomeSuggestion {
  const day = Math.floor(Date.now() / 86_400_000)
  const i = day % homeSuggestions.length
  return homeSuggestions[i]
}
