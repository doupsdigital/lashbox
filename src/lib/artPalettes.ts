// Paletas e ajuste de fonte das artes/vale-presente, portados fiel ao protótipo de referência
// (referencia/lash-artes/Lash Artes.dc.html).

export type PaletteId = 'rosa' | 'nude' | 'preto'

export interface Palette {
  name: string
  bg: string
  bg2: string
  ink: string
  accent: string
  onAccent: string
  deco: string
  card: string
  muted: string
}

export const PAL: Record<PaletteId, Palette> = {
  rosa: { name: 'Rosa', bg: '#FBE4EC', bg2: '#F6CCDA', ink: '#2F2638', accent: '#C2466E', onAccent: '#FFFFFF', deco: '#D98BA6', card: '#FFFFFF', muted: '#6B5A68' },
  nude: { name: 'Nude e dourado', bg: '#F3E7DB', bg2: '#E8D3BD', ink: '#43291C', accent: '#7D5A22', onAccent: '#FFFFFF', deco: '#C4A06A', card: '#FBF6EF', muted: '#7A6252' },
  preto: { name: 'Preto e dourado', bg: '#0E0D0C', bg2: '#1D1A16', ink: '#F8F1E4', accent: '#D6B26E', onAccent: '#0E0D0C', deco: '#B8924F', card: '#171410', muted: '#BDB19E' },
}

/** Diminui a fonte conforme o texto cresce, sem nunca passar do tamanho base nem ficar menor que o mínimo. */
export function fit(s: string | undefined, base: number, min: number, threshold: number) {
  const n = (s || '').length
  return n <= threshold ? base : Math.max(min, Math.round(base * Math.sqrt(threshold / n)))
}
