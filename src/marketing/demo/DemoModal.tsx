import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DemoArtTab } from './DemoArtTab'
import { DemoMessagesTab } from './DemoMessagesTab'

type Tab = 'arte' | 'mensagens'

// Moldura de celular (igual ao mockup do StudioMenu): tamanho fixo de "tela" (mesma largura de
// referência usada no resto do app/prints, ver CLAUDE.md seção 3), escalada pra caber na janela.
const FRAME_W = 390
const FRAME_H = 844
const BEZEL = 10
const MARGIN = 32

function useFitScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const compute = () => {
      const availW = window.innerWidth - MARGIN
      const availH = window.innerHeight - MARGIN
      setScale(Math.min(1, availW / (FRAME_W + BEZEL * 2), availH / (FRAME_H + BEZEL * 2)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])
  return scale
}

export default function DemoModal({ onClose, onWantApp }: { onClose: () => void; onWantApp: () => void }) {
  const [tab, setTab] = useState<Tab>('arte')
  const scale = useFitScale()

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: FRAME_W + BEZEL * 2, height: FRAME_H + BEZEL * 2, transform: `scale(${scale})` }}
        className="relative flex-none rounded-[44px] bg-gradient-to-br from-[#342027] to-[#140d10] p-[10px] shadow-[0_24px_70px_rgba(0,0,0,.55),0_0_0_1px_rgba(255,255,255,.08)_inset]"
      >
        <div className="absolute top-[14px] left-1/2 h-[10px] w-[62px] -translate-x-1/2 rounded-full bg-black/80" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="press absolute -top-3 -right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[15px] text-[#2A1E27] shadow-[0_4px_14px_rgba(0,0,0,.35)]"
        >
          ✕
        </button>

        <div className="flex h-full w-full flex-col overflow-hidden rounded-[34px] bg-[#4A2140] text-white">
          <div className="flex flex-col gap-3 px-5 pt-8 pb-3">
            <div>
              <div className="text-[11px] font-bold tracking-[.08em] text-[#C9A15B] uppercase">Teste o LashBox</div>
              <h3 className="text-[18px] font-extrabold tracking-[-.02em] text-white">Sem cadastro, sem compromisso</h3>
            </div>

            <div className="flex gap-2 rounded-[14px] bg-white/[0.08] p-1">
              <button
                type="button"
                onClick={() => setTab('arte')}
                className={`press flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[11px] text-[13.5px] font-semibold ${
                  tab === 'arte' ? 'bg-white text-[#2A1E27]' : 'text-white/70'
                }`}
              >
                Criar uma arte
              </button>
              <button
                type="button"
                onClick={() => setTab('mensagens')}
                className={`press flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[11px] text-[13.5px] font-semibold ${
                  tab === 'mensagens' ? 'bg-white text-[#2A1E27]' : 'text-white/70'
                }`}
              >
                Mensagens prontas
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6">{tab === 'arte' ? <DemoArtTab onWantApp={onWantApp} /> : <DemoMessagesTab />}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
