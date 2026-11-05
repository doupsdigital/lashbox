// Lista VIP do Kit Agenda de Fim de Ano: fica só no aparelho, nunca vai ao banco.
import { useCallback, useState } from 'react'

const STORAGE_KEY = 'lashbox:vip:v1'

export interface VipClient {
  id: string
  name: string
  whatsapp: string
  status: string
}

function load(): VipClient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(list: VipClient[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // armazenamento cheio ou bloqueado: o app continua funcionando
  }
}

export function useVipList() {
  const [list, setList] = useState<VipClient[]>(load)

  const update = useCallback((next: VipClient[]) => {
    save(next)
    setList(next)
  }, [])

  const add = useCallback(
    (name: string, whatsapp: string, firstStatus: string) => {
      const next = [...load(), { id: crypto.randomUUID(), name: name.trim(), whatsapp: whatsapp.trim(), status: firstStatus }]
      update(next)
    },
    [update],
  )

  const setStatus = useCallback(
    (id: string, status: string) => {
      update(load().map((c) => (c.id === id ? { ...c, status } : c)))
    },
    [update],
  )

  const remove = useCallback(
    (id: string) => {
      update(load().filter((c) => c.id !== id))
    },
    [update],
  )

  return { list, add, setStatus, remove }
}
