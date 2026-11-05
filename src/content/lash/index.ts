// Conteúdo genérico do LashBox (galeria "Criar", biblioteca de mensagens, plano e kits).
// Separado por nicho: trocar esta pasta inteira é o bastante para virar "Nail Box" etc.
import genericArtsRaw from './arts.json'
import messagesRaw from './messages.json'
import weekPlanRaw from './week-plan.json'
import yearDatesRaw from './year-dates.json'
import kitsRaw from './kits.json'
import homeSuggestionsRaw from './home-suggestions.json'
import { kitFimDeAno, type KitArt } from './kitFimDeAno'

export type { KitArt }
export { kitFimDeAno, getArt as getKitArt, getCombo, getKitMessage, artKind } from './kitFimDeAno'

export const genericArts = genericArtsRaw as KitArt[]

/** Todas as artes conhecidas (genéricas do dia a dia + as do Kit Fim de Ano), por id. */
export const allArts: KitArt[] = [...genericArts, ...kitFimDeAno.arts]

export function getAnyArt(id: string | undefined): KitArt | undefined {
  return allArts.find((a) => a.id === id)
}

export const ART_CATEGORIES = ['Todas', 'Agenda', 'Resultados', 'Valores', 'Cuidados', 'Clientes', 'Avisos'] as const

export interface MessageItem {
  id: string
  category: string
  title: string
  text: string
}
export const messages = messagesRaw as MessageItem[]

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
  /** Toda data comercial está ligada a um kit com conteúdo real — nunca mostramos "em breve". */
  kitKey: string
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
}
export const kitsCatalog = kitsRaw as KitCatalogItem[]

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
