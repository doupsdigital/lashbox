import type { Combo } from '../content/lash/kitFimDeAno'

/** "123,00" (sem o "R$", que já vem no texto/template). */
export function money(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function roundPrice(n: number, round: Combo['formula']['round']) {
  if (round === 'down5') return Math.floor(n / 5) * 5
  if (round === 'up5') return Math.ceil(n / 5) * 5
  return Math.round(n * 100) / 100
}

function baseValue(base: Combo['formula']['base'], A: number, M: number) {
  if (base === 'A') return A
  if (base === 'M') return M
  if (base === 'A+M') return A + M
  if (base === 'A+2M') return A + 2 * M
  return 2 * A
}

export interface ComboPrice {
  precoCheio: number
  preco: number
}

/** Calcula o preço cheio e o preço final do combo, a partir dos preços da aplicação (A) e manutenção (M). */
export function computeCombo(combo: Combo, servicePrice: number, maintenancePrice: number): ComboPrice {
  const precoCheio = baseValue(combo.formula.base, servicePrice, maintenancePrice)
  const preco = roundPrice(precoCheio * combo.formula.factor, combo.formula.round)
  return { precoCheio, preco }
}

export interface ComboFields {
  data_limite: string
  data_uso: string
  vagas: string
}

/** Preenche {preco}, {preco_cheio} e os campos de data/vagas na mensagem do combo. */
export function fillComboMessage(combo: Combo, price: ComboPrice, fields: ComboFields) {
  return combo.message
    .replace(/\{preco_cheio\}/g, money(price.precoCheio))
    .replace(/\{preco\}/g, money(price.preco))
    .replace(/\{data_limite\}/g, fields.data_limite)
    .replace(/\{data_uso\}/g, fields.data_uso)
    .replace(/\{vagas\}/g, fields.vagas)
}
