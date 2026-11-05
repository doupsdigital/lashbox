import type { ReactNode } from 'react'

/** Envolve uma arte (1080 de largura) numa prévia em escala, ou a mostra em tamanho real para exportar. */
export function ScaledBoard({ width, height, scale, children }: { width: number; height: number; scale: number; children: ReactNode }) {
  return (
    <div style={{ width: Math.round(width * scale), height: Math.round(height * scale), overflow: 'hidden', flex: 'none' }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: '0 0', position: 'relative' }}>{children}</div>
    </div>
  )
}
