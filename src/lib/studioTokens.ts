// Troca os marcadores do Meu Estúdio (ex.: [bairro], [whatsapp]) pelos dados preenchidos.
// Marcadores sem dado continuam no texto, para o MessageText destacar em amarelo.
import { kitFimDeAno } from '../content/lash/kitFimDeAno'
import type { Studio } from '../state/studio'

function digitsOnly(s: string) {
  return s.replace(/\D/g, '')
}

function fieldValue(studio: Studio, path: string): string {
  if (path === 'studio.whatsappLink') {
    const d = digitsOnly(studio.whatsapp)
    return d ? `https://wa.me/55${d}` : ''
  }
  const key = path.replace(/^studio\./, '') as keyof Studio
  const v = studio[key]
  return typeof v === 'string' ? v : ''
}

/** Nome do mês atual em português, minúsculo (ex.: "novembro"). Único marcador que se preenche sozinho, sem depender do Meu Estúdio. */
export function currentMonthName(): string {
  return new Date().toLocaleDateString('pt-BR', { month: 'long' })
}

export function applyStudioTokens(text: string, studio: Studio): string {
  let out = text.split('[mês]').join(currentMonthName())
  for (const [token, path] of Object.entries(kitFimDeAno.studioTokens)) {
    const value = fieldValue(studio, path)
    if (value) out = out.split(token).join(value)
  }
  return out
}

/**
 * Resolve [mês] e os dados do Meu Estúdio no headline/subline/note/quote/author de uma arte, para
 * prévias (galeria "Criar", "Para postar hoje", kits) que não têm campo editável para os outros
 * marcadores livres — esses continuam aparecendo como [estilo], [dia] etc. até a lash abrir o editor.
 */
export function resolveArtPreview<T extends { headline: string; subline: string; note?: string; quote?: string; author?: string }>(
  art: T,
  studio: Studio,
): T {
  return {
    ...art,
    headline: applyStudioTokens(art.headline, studio),
    subline: applyStudioTokens(art.subline, studio),
    note: art.note ? applyStudioTokens(art.note, studio) : art.note,
    quote: art.quote ? applyStudioTokens(art.quote, studio) : art.quote,
    author: art.author ? applyStudioTokens(art.author, studio) : art.author,
  }
}

const MARKER_RE = /\[[^\]]+\]/g

/** Marcadores livres de um texto (ex.: [dia], [mimo], [estilo]) — tudo que não é dado do estúdio nem [mês], que já se preenchem sozinhos. */
export function findGenericMarkers(text: string): string[] {
  const known = new Set([...Object.keys(kitFimDeAno.studioTokens), '[mês]'])
  const found = text.match(MARKER_RE) ?? []
  return Array.from(new Set(found.filter((m) => !known.has(m))))
}

/** Troca cada marcador livre pelo valor preenchido (ou mantém o texto do marcador, se vazio). */
export function applyGenericMarkers(text: string, values: Record<string, string>): string {
  let out = text
  for (const [marker, value] of Object.entries(values)) {
    if (value) out = out.split(marker).join(value)
  }
  return out
}

/** Link do WhatsApp da cliente ([nome] já preenchido), para o botão "Chamar no WhatsApp" da Lista VIP. */
export function whatsAppLinkTo(number: string, message: string) {
  const d = digitsOnly(number)
  const withCountry = d.length <= 11 ? `55${d}` : d
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`
}
