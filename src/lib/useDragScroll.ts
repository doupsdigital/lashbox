import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'

interface DragState {
  dragging: boolean
  startX: number
  startScroll: number
  moved: number
}

/**
 * Arrastar com o mouse pra rolar um carrossel horizontal (overflow-x-auto). Em touch, o scroll
 * nativo do navegador já funciona sozinho — isso só entra para ponteiros do tipo "mouse" (ver
 * e.pointerType), já que telas de toque não precisam de ajuda nenhuma pra rolar.
 *
 * O acompanhamento do arraste usa listeners em `window` (não `setPointerCapture`): capturar o
 * ponteiro no próprio elemento redireciona também o evento `click` seguinte pra ele, o que
 * silenciosamente quebra o clique nos cards/botões lá dentro (o clique nunca chega neles).
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const state = useRef<DragState>({ dragging: false, startX: 0, startScroll: 0, moved: 0 })

  const onMove = useCallback((e: PointerEvent) => {
    const s = state.current
    const el = ref.current
    if (!s.dragging || !el) return
    const dx = e.clientX - s.startX
    s.moved = Math.max(s.moved, Math.abs(dx))
    el.scrollLeft = s.startScroll - dx
  }, [])

  const stopDrag = useCallback(() => {
    if (!state.current.dragging) return
    state.current.dragging = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
  }, [onMove])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (e.pointerType !== 'mouse') return
      const el = ref.current
      if (!el) return
      state.current = { dragging: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', stopDrag)
      window.addEventListener('pointercancel', stopDrag)
    },
    [onMove, stopDrag],
  )

  useEffect(() => stopDrag, [stopDrag])

  // Depois de um arrasto de verdade (não só um clique), cancela o click que o navegador dispara
  // ao soltar o mouse — senão o card embaixo do cursor "navega sozinho" sem a pessoa ter clicado.
  const onClickCapture = useCallback((e: ReactMouseEvent) => {
    if (state.current.moved > 5) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return {
    ref,
    bind: { onPointerDown, onClickCapture },
  }
}
