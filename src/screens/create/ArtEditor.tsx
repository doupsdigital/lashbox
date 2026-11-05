import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { StoryBoard } from '../../components/art/StoryBoard'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StudioNotice } from '../../components/StudioNotice'
import { BackButton, SoftButton } from '../../components/ui'
import { artKind, getAnyArt } from '../../content/lash'
import { takeArtDraft } from '../../lib/artDraft'
import { exportNodeToPng, shareOrDownloadPng } from '../../lib/exportBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { useStudioPhotoUrl } from '../../lib/studioPhoto'
import { useStudio } from '../../state/studio'
import type { PaletteId } from '../../lib/artPalettes'

const PALETTES: { id: PaletteId; label: string }[] = [
  { id: 'rosa', label: 'Rosa' },
  { id: 'nude', label: 'Nude e dourado' },
  { id: 'preto', label: 'Preto e dourado' },
]

export function ArtEditor() {
  const { modeloId } = useParams()
  const art = getAnyArt(modeloId)
  const { studio } = useStudio()
  const { url: studioPhotoUrl } = useStudioPhotoUrl()

  const [palette, setPalette] = useState<PaletteId>(art?.palette === 'black' ? 'preto' : studio.palette)
  const [post, setPost] = useState(false)
  const [photoOn, setPhotoOn] = useState(art?.photo === 'optional')
  const [photoChoice, setPhotoChoice] = useState<'studio' | 'custom'>('studio')
  const [customUrl, setCustomUrl] = useState<string | null>(null)
  const [photoPosY, setPhotoPosY] = useState(40)
  const [vagas, setVagas] = useState('5')
  const [comboTitulo, setComboTitulo] = useState('')
  const [preco, setPreco] = useState('')
  const [dataLimite, setDataLimite] = useState('30/11')
  const [horariosText, setHorariosText] = useState('Seg · 14h\nTer · 10h')
  const [exporting, setExporting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!modeloId) return
    const draft = takeArtDraft(modeloId)
    if (draft) {
      setComboTitulo(draft.comboTitulo)
      setPreco(draft.preco)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => { if (customUrl) URL.revokeObjectURL(customUrl) }, [customUrl])

  if (!art) return <Navigate to="/criar" replace />

  const kind = artKind(art)
  const foot = studioFootStory(studio)
  const rawPhotoUrl = photoChoice === 'studio' ? studioPhotoUrl : customUrl
  // Correção: foto ligada sem imagem escolhida não deve mostrar/exportar o fundo listrado — some sozinha.
  const effectivePhotoOn = photoOn && !!rawPhotoUrl
  const horarios = horariosText.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 5)
  const pillText = `Até ${dataLimite} · vagas limitadas`

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (customUrl) URL.revokeObjectURL(customUrl)
    setCustomUrl(URL.createObjectURL(file))
    setPhotoChoice('custom')
    e.target.value = ''
  }

  const doExport = async () => {
    setFormError(null)
    // Correção: a arte não pode sair com "R$" sem valor quando o combo/preço não foi escolhido.
    if (kind === 'price' && (!comboTitulo.trim() || !preco.trim())) {
      setFormError('Preencha o título e o preço antes de exportar.')
      return
    }
    if (!exportRef.current) return
    setExporting(true)
    try {
      const h = post ? 1350 : 1920
      const blob = await exportNodeToPng(exportRef.current, 1080, h)
      await shareOrDownloadPng(blob, `${art.id}-${post ? 'post' : 'story'}.png`)
    } catch (e) {
      console.warn('exportar arte', e)
      const detail = e instanceof Error ? e.message : String(e)
      alert(`Não foi possível gerar a imagem. Tente de novo.\n\nDetalhe: ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  const boardProps = {
    art,
    palette,
    post,
    photoOn: effectivePhotoOn,
    photoUrl: rawPhotoUrl,
    photoPosY,
    foot1: foot.foot1 || 'Seu estúdio',
    foot2: foot.foot2,
    vagas,
    comboTitulo,
    preco,
    pillText,
    horarios,
  }

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/criar" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[23px] font-bold text-pretty">{art.title}</h1>
      <StudioNotice />

      <div className="flex justify-center rounded-[26px] bg-white p-4">
        <ScaledBoard width={1080} height={post ? 1350 : 1920} scale={post ? 0.25 : 0.19}>
          <StoryBoard {...boardProps} />
        </ScaledBoard>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-muted">FORMATO</span>
        <div className="flex gap-2 rounded-[11px] bg-[#EFE8EC] p-0.5">
          <button type="button" onClick={() => setPost(false)} className={`flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[9px] text-[14.5px] font-semibold ${!post ? 'bg-white shadow-sm' : ''}`}>
            Story
          </button>
          <button type="button" onClick={() => setPost(true)} className={`flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[9px] text-[14.5px] font-semibold ${post ? 'bg-white shadow-sm' : ''}`}>
            Post
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-semibold text-muted">PALETA</span>
        <div className="flex gap-4">
          {PALETTES.map((p) => (
            <button type="button" key={p.id} onClick={() => setPalette(p.id)} className="flex flex-1 cursor-pointer flex-col items-center gap-1.5">
              <div
                className="h-11 w-11 rounded-full border-[3px] border-white"
                style={{ background: p.id === 'rosa' ? '#E07A9B' : p.id === 'nude' ? '#D9BFA3' : '#1A1614', boxShadow: palette === p.id ? '0 0 0 2.5px #5B2A4E' : 'none' }}
              />
              <span className="text-center text-[11.5px] text-muted">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {art.photo === 'optional' && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-medium">Usar foto</span>
            <button
              type="button"
              onClick={() => setPhotoOn((v) => !v)}
              className="relative h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full transition-colors"
              style={{ background: photoOn ? '#34C759' : '#D9D0D5' }}
            >
              <span className="absolute top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow transition-all" style={{ left: photoOn ? 22 : 2 }} />
            </button>
          </div>
          {photoOn && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoChoice('studio')}
                  className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${photoChoice === 'studio' ? 'bg-plum text-white' : 'bg-lilac text-ink'}`}
                >
                  Foto do estúdio
                </button>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${photoChoice === 'custom' ? 'bg-plum text-white' : 'bg-lilac text-ink'}`}
                >
                  Escolher outra
                </button>
                <input ref={fileInput} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              </div>
              {!rawPhotoUrl && (
                <div className="rounded-xl bg-gold-soft px-3 py-2 text-[13px] text-gold-ink">
                  {photoChoice === 'studio' ? 'Você ainda não tem uma foto no Meu Estúdio. Escolha outra ou desligue a foto.' : 'Escolha uma foto para continuar.'}
                </div>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-muted">Posição da foto</span>
                <input type="range" min={0} max={100} value={photoPosY} onChange={(e) => setPhotoPosY(Number(e.target.value))} />
              </label>
            </>
          )}
        </div>
      )}

      {kind === 'urgent' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">Quantas vagas restam</span>
          <input value={vagas} onChange={(e) => setVagas(e.target.value)} className="h-[46px] rounded-[13px] bg-white px-[14px] text-base outline-none" />
        </label>
      )}

      {kind === 'price' && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-semibold">Título</span>
            <input value={comboTitulo} onChange={(e) => setComboTitulo(e.target.value)} placeholder="Ex.: Aplicação a partir de" className="h-[46px] rounded-[13px] bg-white px-[14px] text-base outline-none" />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[15px] font-semibold">Preço</span>
              <input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="180,00" className="h-[46px] rounded-[13px] bg-white px-[14px] text-base outline-none" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[15px] font-semibold">Válido até</span>
              <input value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className="h-[46px] rounded-[13px] bg-white px-[14px] text-base outline-none" />
            </label>
          </div>
        </>
      )}

      {kind === 'list' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">Horários (2 a 5, um por linha)</span>
          <textarea value={horariosText} onChange={(e) => setHorariosText(e.target.value)} rows={4} className="rounded-[13px] bg-white px-[14px] py-3 text-base outline-none" />
        </label>
      )}

      {formError && <div className="rounded-xl bg-blush px-3.5 py-2.5 text-sm font-medium text-plum">{formError}</div>}

      <div className="flex flex-col gap-2.5">
        <button type="button" disabled={exporting} onClick={doExport} className="press flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-full bg-plum text-[17px] font-semibold text-white disabled:opacity-60">
          {exporting ? 'Gerando…' : 'Compartilhar'}
        </button>
        <SoftButton className="h-[54px] text-[17px]" disabled={exporting} onClick={doExport}>
          {exporting ? 'Gerando…' : 'Salvar no celular'}
        </SoftButton>
      </div>

      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div ref={exportRef}>
          <StoryBoard {...boardProps} />
        </div>
      </div>
    </div>
  )
}
