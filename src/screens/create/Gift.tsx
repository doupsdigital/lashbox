import { useRef, useState } from 'react'
import { GiftBoard } from '../../components/art/GiftBoard'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { CopyButton, MessageText, useMessageResolver } from '../../components/Messages'
import { StudioNotice } from '../../components/StudioNotice'
import { BackButton, SoftButton } from '../../components/ui'
import { kitFimDeAno } from '../../content/lash'
import { track } from '../../lib/analytics'
import { exportNodeToPng, shareOrDownloadPng } from '../../lib/exportBoard'
import { studioFootGift } from '../../lib/studioFooter'
import { useStudio } from '../../state/studio'

const STYLES = kitFimDeAno.voucher.styles
const PALETTES: { id: 'rosa' | 'nude' | 'preto'; label: string }[] = [
  { id: 'rosa', label: 'Rosa' },
  { id: 'nude', label: 'Nude' },
  { id: 'preto', label: 'Preto' },
]

export function GiftScreen() {
  const { studio } = useStudio()
  const resolve = useMessageResolver()
  const [style, setStyle] = useState<(typeof STYLES)[number]['id']>('rosa')
  const [palette, setPalette] = useState<'rosa' | 'nude' | 'preto'>('rosa')
  const [para, setPara] = useState('')
  const [de, setDe] = useState('')
  const [servico, setServico] = useState('Extensão de cílios')
  const [validade, setValidade] = useState('')
  const [mensagem, setMensagem] = useState(kitFimDeAno.voucher.defaultMessage)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const foot = studioFootGift(studio)

  const doExport = async () => {
    if (!exportRef.current) return
    setExporting(true)
    try {
      const blob = await exportNodeToPng(exportRef.current, 1080, 1350)
      await shareOrDownloadPng(blob, `vale-presente-${style}.png`)
      track('vale_presente_exportado', { estilo: style })
    } catch (e) {
      console.warn('exportar vale-presente', e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Não foi possível gerar a imagem. Tente de novo.\n\nDetalhe: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  const buyerMsg = resolve(kitFimDeAno.voucher.sendToBuyer, de)
  const recipientMsg = resolve(
    kitFimDeAno.voucher.sendToRecipient.replace(/\{de\}/g, de || '[de]').replace(/\{validade\}/g, validade || '[validade]'),
    para,
  )

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-night px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/criar" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight text-white">Vale-presente</h1>
      <StudioNotice />

      <div className="flex justify-center rounded-[26px] border border-white/[0.1] bg-white/[0.05] p-3.5">
        <ScaledBoard width={1080} height={1350} scale={0.3}>
          <GiftBoard
            style={style}
            palette={palette}
            para={para || 'Nome de quem recebe'}
            de={de || 'Nome de quem presenteia'}
            servico={servico}
            mensagem={mensagem}
            validade={validade || '00/00/0000'}
            foot={foot}
          />
        </ScaledBoard>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-white/60">ESTILO</span>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold ${style === s.id ? 'bg-[#E07A9B] text-white' : 'border border-white/20 text-white/80'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-white/60">PALETA</span>
        <div className="flex gap-2">
          {PALETTES.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setPalette(p.id)}
              className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${palette === p.id ? 'bg-[#E07A9B] text-white' : 'border border-white/20 text-white/80'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 overflow-hidden rounded-[22px] border border-white/[0.1] bg-white/[0.05] p-1">
        {[
          ['Para', para, setPara],
          ['De', de, setDe],
          ['Serviço', servico, setServico],
          ['Validade', validade, setValidade],
        ].map(([label, value, setter], i) => (
          <div key={label as string} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-white/[0.1]' : ''}`}>
            <div className="w-20 shrink-0 text-[15px] text-white/60">{label as string}</div>
            <input
              value={value as string}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              placeholder={label === 'Validade' ? '31/03/2027' : undefined}
              className="min-w-0 flex-1 bg-transparent text-right text-[16px] text-white outline-none placeholder:text-white/40"
            />
          </div>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-white">Mensagem no cartão</span>
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={2} className="rounded-[16px] border border-white/[0.15] bg-white/[0.08] px-[16px] py-3 text-base text-white outline-none placeholder:text-white/40" />
      </label>

      <div className="flex flex-col gap-2.5">
        <button type="button" disabled={exporting} onClick={doExport} className="press flex h-[54px] cursor-pointer items-center justify-center rounded-full bg-[#E07A9B] text-[17px] font-semibold text-white disabled:opacity-60">
          {exporting ? 'Gerando…' : 'Compartilhar'}
        </button>
        <SoftButton className="h-[54px] text-[17px] !border !border-white/15 !bg-white/[0.08] !text-white" disabled={exporting} onClick={doExport}>
          {exporting ? 'Gerando…' : 'Salvar no celular'}
        </SoftButton>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <h2 className="text-[19px] font-bold text-white">Mensagens prontas</h2>
        <div className="flex flex-col gap-2 rounded-[18px] border border-white/[0.12] bg-white/[0.07] p-3.5">
          <div className="text-[13px] font-semibold text-[#E07A9B]">Para quem comprou</div>
          <MessageText text={buyerMsg} name="" className="text-[15px] leading-[1.5] text-white/85" />
          <CopyButton text={buyerMsg} size="sm" />
        </div>
        <div className="flex flex-col gap-2 rounded-[18px] border border-white/[0.12] bg-white/[0.07] p-3.5">
          <div className="text-[13px] font-semibold text-[#E07A9B]">Para quem recebeu</div>
          <MessageText text={recipientMsg} name="" className="text-[15px] leading-[1.5] text-white/85" />
          <CopyButton text={recipientMsg} size="sm" />
        </div>
      </div>

      <div className="ph-no-capture" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div ref={exportRef}>
          <GiftBoard style={style} palette={palette} para={para} de={de} servico={servico} mensagem={mensagem} validade={validade} foot={foot} />
        </div>
      </div>
    </div>
  )
}
