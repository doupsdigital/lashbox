// "Meu Estúdio": dados usados para preencher mensagens e artes em todo o app.
// Os textos ficam salvos no aparelho e no Supabase (profiles.studio). A foto fica só no aparelho (IndexedDB).
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth'

export interface Studio {
  ownerName: string
  studioName: string
  neighborhood: string
  city: string
  address: string
  whatsapp: string
  instagram: string
  pixKey: string
  bookingLink: string
  servicePrice: string
  maintenancePrice: string
  palette: 'rosa' | 'nude' | 'preto'
}

const STORAGE_KEY = 'lashbox:studio:v1'

export const emptyStudio = (): Studio => ({
  ownerName: '',
  studioName: '',
  neighborhood: '',
  city: '',
  address: '',
  whatsapp: '',
  instagram: '',
  pixKey: '',
  bookingLink: '',
  servicePrice: '',
  maintenancePrice: '',
  palette: 'rosa',
})

function load(): Studio {
  const base = emptyStudio()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    return { ...base, ...(JSON.parse(raw) as Partial<Studio>) }
  } catch {
    return base
  }
}

function isFilled(s: Studio) {
  return !!(s.ownerName || s.studioName)
}

/** O estúdio remoto, se tiver algo preenchido, vale mais; campos que só existem no local entram junto. */
function merge(local: Studio, remote: Studio | null): Studio {
  if (!remote || !isFilled(remote)) return local
  const out = { ...remote }
  for (const k of Object.keys(local) as (keyof Studio)[]) {
    if (!out[k] && local[k]) (out as Studio)[k] = local[k] as never
  }
  return out
}

interface StudioStore {
  studio: Studio
  setField: <K extends keyof Studio>(key: K, value: Studio[K]) => void
  /** Preencheu o essencial (nome + nome do estúdio)? Usado para o aviso "Complete seu estúdio". */
  isComplete: boolean
  loading: boolean
}

const StudioContext = createContext<StudioStore | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const [studio, setStudio] = useState<Studio>(load)
  const [loading, setLoading] = useState(false)
  const userId = status === 'ready' ? (user?.id ?? null) : null
  const hydrated = useRef(false)
  const pushedSnapshot = useRef<string | null>(null)

  useEffect(() => {
    if (!userId || !supabase) {
      hydrated.current = status === 'local'
      return
    }
    let alive = true
    setLoading(true)
    const db = supabase
    ;(async () => {
      try {
        const { data, error } = await db.from('profiles').select('studio').eq('id', userId).maybeSingle()
        if (error) throw error
        if (!alive) return
        const merged = merge(load(), (data?.studio as Studio | null) ?? null)
        setStudio(merged)
        pushedSnapshot.current = JSON.stringify(merged)
        hydrated.current = true
      } catch (e) {
        console.warn('meu estúdio: sincronização', e)
        hydrated.current = true
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [userId, status])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studio))
    } catch {
      // armazenamento cheio ou bloqueado: o app continua funcionando
    }
  }, [studio])

  useEffect(() => {
    if (!userId || !supabase || !hydrated.current) return
    const db = supabase
    const snap = JSON.stringify(studio)
    if (pushedSnapshot.current === snap) return
    const t = window.setTimeout(async () => {
      try {
        const { error } = await db.from('profiles').upsert({ id: userId, studio })
        if (error) throw error
        pushedSnapshot.current = snap
      } catch (e) {
        console.warn('meu estúdio: envio', e)
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [studio, userId])

  const store = useMemo<StudioStore>(
    () => ({
      studio,
      setField: (key, value) => setStudio((s) => ({ ...s, [key]: value })),
      isComplete: isFilled(studio),
      loading,
    }),
    [studio, loading],
  )

  return <StudioContext.Provider value={store}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const s = useContext(StudioContext)
  if (!s) throw new Error('useStudio precisa estar dentro de StudioProvider')
  return s
}
