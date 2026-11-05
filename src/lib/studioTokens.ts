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

export function applyStudioTokens(text: string, studio: Studio): string {
  let out = text
  for (const [token, path] of Object.entries(kitFimDeAno.studioTokens)) {
    const value = fieldValue(studio, path)
    if (value) out = out.split(token).join(value)
  }
  return out
}

/** Link do WhatsApp da cliente ([nome] já preenchido), para o botão "Chamar no WhatsApp" da Lista VIP. */
export function whatsAppLinkTo(number: string, message: string) {
  const d = digitsOnly(number)
  const withCountry = d.length <= 11 ? `55${d}` : d
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`
}
