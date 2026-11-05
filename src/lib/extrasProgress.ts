// Progresso do calendário dos extras: fica só no aparelho, nunca vai ao banco.
import { useState } from 'react'

const STORAGE_KEY = 'lashbox:plan:v1'

type ExtrasProgress = Record<string, Record<string, boolean>>

function load(): ExtrasProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(data: ExtrasProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // armazenamento cheio ou bloqueado: o app continua funcionando
  }
}

export function isDayDone(productKey: string, day: number | string): boolean {
  return !!load()[productKey]?.[day]
}

function toggleDayDone(productKey: string, day: number | string): boolean {
  const data = load()
  const next = !data[productKey]?.[day]
  data[productKey] = { ...data[productKey], [day]: next }
  save(data)
  return next
}

export function useDayDone(productKey: string, day: number | string) {
  const [done, setDone] = useState(() => isDayDone(productKey, day))
  return [done, () => setDone(toggleDayDone(productKey, day))] as const
}
