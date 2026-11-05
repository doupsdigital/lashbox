// Foto do Meu Estúdio: fica só no aparelho (IndexedDB), nunca é enviada ao servidor.
import { useEffect, useState } from 'react'

const DB_NAME = 'lashbox-studio'
const STORE = 'photos'
const KEY = 'main'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveStudioPhoto(blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function getStudioPhoto(): Promise<Blob | null> {
  const db = await openDb()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return blob
}

export async function removeStudioPhoto(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

/** URL (blob:) da foto do estúdio, pronta para usar em <img> ou na exportação. */
export function useStudioPhotoUrl() {
  const [url, setUrl] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let alive = true
    let current: string | null = null
    getStudioPhoto()
      .then((blob) => {
        if (!alive) return
        if (blob) {
          current = URL.createObjectURL(blob)
          setUrl(current)
        } else {
          setUrl(null)
        }
      })
      .catch(() => alive && setUrl(null))
    return () => {
      alive = false
      if (current) URL.revokeObjectURL(current)
    }
  }, [version])

  return { url, refresh: () => setVersion((v) => v + 1) }
}
