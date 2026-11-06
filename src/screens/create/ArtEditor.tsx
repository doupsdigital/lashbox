import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { StoryBoard } from '../../components/art/StoryBoard'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StudioNotice } from '../../components/StudioNotice'
import { BackButton, SoftButton } from '../../components/ui'
import { artKind, getAnyArt } from '../../content/lash'
import { takeArtDraft } from '../../lib/artDraft'
import { exportNodeToPng, shareOrDownloadPng } from '../../lib/exportBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { applyGenericMarkers, applyStudioTokens, findGenericMarkers } from '../../lib/studioTokens'
import { useStudioPhotoUrl } from '../../lib/studioPhoto'
import { useStudio } from '../../state/studio'
import type { PaletteId } from '../../lib/artPalettes'

/** Linha ["nome","preço"] com o preço vindo do Meu Estúdio quando o nome bate com "aplicação"/"manutenção". */
function autofillRowPrice(name: string, price: string, servicePrice: string, maintenancePrice: string) {
  if (price.trim()) return price
  const n = name.toLowerCase()
  if (n.includes('aplica') && servicePrice) return `R$ ${servicePrice}`
  if (n.includes('manuten') && maintenancePrice) return `R$ ${maintenancePrice}`
  return price
}

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
  // "Depois" do antes/depois — foto própria, nunca a do estúdio por padrão.
  const [photoChoice2, setPhotoChoice2] = useState<'studio' | 'custom'>('custom')
  const [customUrl2, setCustomUrl2] = useState<string | null>(null)
  const [vagas, setVagas] = useState('5')
  const [comboTitulo, setComboTitulo] = useState('')
  const [preco, setPreco] = useState('')
  const [dataLimite, setDataLimite] = useState('30/11')
  const [horariosText, setHorariosText] = useState(() => {
    const items = art?.items
    if (items?.length) return items.map((i) => (typeof i === 'string' ? i : i.t)).join('\n')
    return 'Seg · 14h\nTer · 10h'
  })
  const [rows, setRows] = useState<[string, string][]>(() => art?.rows ?? [])
  const [quoteText, setQuoteText] = useState(art?.quote ?? '')
  const [authorText, setAuthorText] = useState(art?.author ?? '')
  const [bulletItems, setBulletItems] = useState<string[]>(() => (art?.items ?? []).map((i) => (typeof i === 'string' ? i : i.t)))
  const [markerValues, setMarkerValues] = useState<Record<string, string>>({})
  const [exporting, setExporting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const fileInput2 = useRef<HTMLInputElement>(null)

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
  useEffect(() => () => { if (customUrl2) URL.revokeObjectURL(customUrl2) }, [customUrl2])

  if (!art) return <Navigate to="/criar" replace />

  const kind = artKind(art)
  const foot = studioFootStory(studio)
  const rawPhotoUrl = photoChoice === 'studio' ? studioPhotoUrl : customUrl
  const rawPhotoUrl2 = photoChoice2 === 'studio' ? studioPhotoUrl : customUrl2
  // Correção: foto ligada sem imagem escolhida não deve mostrar/exportar o fundo listrado — some sozinha.
  const effectivePhotoOn = photoOn && !!rawPhotoUrl
  const horarios = horariosText.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 5)
  const pillText = `Até ${dataLimite} · vagas limitadas`
  const labels = art.labels ?? ['Antes', 'Depois']

  // Marcadores livres (ex.: [dia], [estilo]) de headline/subline/nota — vira um campo editável por marcador.
  const markers = useMemo(
    () => findGenericMarkers([art.headline, art.subline, art.note ?? ''].join('\n')),
    [art],
  )
  const resolveText = (t: string) => applyGenericMarkers(applyStudioTokens(t, studio), markerValues)

  const resolvedArt = useMemo(
    () => ({
      ...art,
      headline: resolveText(art.headline),
      subline: resolveText(art.subline),
      note: art.note ? resolveText(art.note) : art.note,
      rows: kind === 'menu' ? rows : art.rows,
      quote: kind === 'quote' ? quoteText : art.quote,
      author: kind === 'quote' ? authorText : art.author,
      items: kind === 'bullets' ? bulletItems : art.items,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [art, studio, markerValues, kind, rows, quoteText, authorText, bulletItems],
  )

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (customUrl) URL.revokeObjectURL(customUrl)
    setCustomUrl(URL.createObjectURL(file))
    setPhotoChoice('custom')
    e.target.value = ''
  }

  const onPickFile2 = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (customUrl2) URL.revokeObjectURL(customUrl2)
    setCustomUrl2(URL.createObjectURL(file))
    setPhotoChoice2('custom')
    e.target.value = ''
  }

  const updateRow = (i: number, field: 0 | 1, value: string) => {
    setRows((rs) =>
      rs.map((r, idx) => {
        if (idx !== i) return r
        const next: [string, string] = [...r] as [string, string]
        next[field] = value
        if (field === 0) next[1] = autofillRowPrice(value, next[1], studio.servicePrice, studio.maintenancePrice)
        return next
      }),
    )
  }
  const addRow = () => setRows((rs) => (rs.length >= 6 ? rs : [...rs, ['', '']]))
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i))

  const updateBullet = (i: number, value: string) => setBulletItems((bs) => bs.map((b, idx) => (idx === i ? value : b)))
  const addBullet = () => setBulletItems((bs) => (bs.length >= 6 ? bs : [...bs, '']))
  const removeBullet = (i: number) => setBulletItems((bs) => bs.filter((_, idx) => idx !== i))
  const moveBullet = (i: number, dir: -1 | 1) =>
    setBulletItems((bs) => {
      const j = i + dir
      if (j < 0 || j >= bs.length) return bs
      const next = [...bs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const doExport = async () => {
    setFormError(null)
    // Correção: a arte não pode sair com "R$" sem valor quando o combo/preço não foi escolhido.
    if (kind === 'price' && (!comboTitulo.trim() || !preco.trim())) {
      setFormError('Preencha o título e o preço antes de exportar.')
      return
    }
    if (kind === 'photo' && art.photo === 'required' && !rawPhotoUrl) {
      setFormError('Escolha uma foto antes de exportar.')
      return
    }
    if (kind === 'beforeAfter' && art.photo === 'required' && (!rawPhotoUrl || !rawPhotoUrl2)) {
      setFormError(`Escolha as duas fotos (${labels[0]} e ${labels[1]}) antes de exportar.`)
      return
    }
    if (kind === 'menu' && rows.filter((r) => r[0].trim()).length === 0) {
      setFormError('Adicione pelo menos um item na tabela.')
      return
    }
    if (kind === 'bullets' && bulletItems.filter((b) => b.trim()).length === 0) {
      setFormError('Adicione pelo menos um tópico.')
      return
    }
    const blanks = markers.filter((m) => !markerValues[m]?.trim())
    if (blanks.length > 0) {
      const ok = window.confirm(
        `Alguns campos ainda estão em branco (${blanks.join(', ')}) e vão aparecer assim na arte. Quer exportar mesmo assim?`,
      )
      if (!ok) return
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
    art: resolvedArt,
    palette,
    post,
    photoOn: effectivePhotoOn,
    photoUrl: rawPhotoUrl,
    photoUrl2: rawPhotoUrl2,
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

      {kind === 'photo' && art.photo === 'required' && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-white p-3.5">
          <span className="text-[16px] font-medium">Foto (obrigatória)</span>
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
              {photoChoice === 'studio' ? 'Você ainda não tem uma foto no Meu Estúdio. Escolha outra.' : 'Escolha uma foto para continuar.'}
            </div>
          )}
        </div>
      )}

      {kind === 'beforeAfter' && art.photo === 'required' && (
        <div className="flex flex-col gap-3.5 rounded-[20px] bg-white p-3.5">
          <span className="text-[16px] font-medium">Fotos antes/depois (obrigatórias)</span>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-muted">{labels[0]}</span>
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
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-muted">{labels[1]}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPhotoChoice2('studio')}
                className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${photoChoice2 === 'studio' ? 'bg-plum text-white' : 'bg-lilac text-ink'}`}
              >
                Foto do estúdio
              </button>
              <button
                type="button"
                onClick={() => fileInput2.current?.click()}
                className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${photoChoice2 === 'custom' ? 'bg-plum text-white' : 'bg-lilac text-ink'}`}
              >
                Escolher outra
              </button>
              <input ref={fileInput2} type="file" accept="image/*" onChange={onPickFile2} className="hidden" />
            </div>
          </div>
          {(!rawPhotoUrl || !rawPhotoUrl2) && (
            <div className="rounded-xl bg-gold-soft px-3 py-2 text-[13px] text-gold-ink">Escolha as duas fotos para continuar.</div>
          )}
        </div>
      )}

      {kind === 'menu' && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-white p-3.5">
          <span className="text-[15px] font-semibold">Tabela de valores</span>
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r[0]}
                onChange={(e) => updateRow(i, 0, e.target.value)}
                placeholder="Nome"
                className="h-11 min-w-0 flex-1 rounded-[11px] bg-lilac px-3 text-sm outline-none"
              />
              <input
                value={r[1]}
                onChange={(e) => updateRow(i, 1, e.target.value)}
                placeholder="R$ 0"
                className="h-11 w-[96px] shrink-0 rounded-[11px] bg-lilac px-3 text-sm outline-none"
              />
              <button type="button" onClick={() => removeRow(i)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blush text-plum">
                ×
              </button>
            </div>
          ))}
          {rows.length < 6 && (
            <button type="button" onClick={addRow} className="press flex h-10 cursor-pointer items-center justify-center rounded-full bg-lilac text-sm font-semibold text-plum">
              + Adicionar item
            </button>
          )}
        </div>
      )}

      {kind === 'quote' && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-semibold">Depoimento</span>
            <textarea value={quoteText} onChange={(e) => setQuoteText(e.target.value)} rows={3} className="rounded-[13px] bg-white px-[14px] py-3 text-base outline-none" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-semibold">Assinatura</span>
            <input
              value={authorText}
              onChange={(e) => setAuthorText(e.target.value)}
              placeholder="Nome da cliente"
              className="h-[46px] rounded-[13px] bg-white px-[14px] text-base outline-none"
            />
          </label>
        </>
      )}

      {kind === 'bullets' && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-white p-3.5">
          <span className="text-[15px] font-semibold">Tópicos</span>
          {bulletItems.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={t}
                onChange={(e) => updateBullet(i, e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-[11px] bg-lilac px-3 text-sm outline-none"
              />
              <button type="button" disabled={i === 0} onClick={() => moveBullet(i, -1)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-lilac text-ink disabled:opacity-30">
                ↑
              </button>
              <button
                type="button"
                disabled={i === bulletItems.length - 1}
                onClick={() => moveBullet(i, 1)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-lilac text-ink disabled:opacity-30"
              >
                ↓
              </button>
              <button type="button" onClick={() => removeBullet(i)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blush text-plum">
                ×
              </button>
            </div>
          ))}
          {bulletItems.length < 6 && (
            <button type="button" onClick={addBullet} className="press flex h-10 cursor-pointer items-center justify-center rounded-full bg-lilac text-sm font-semibold text-plum">
              + Adicionar tópico
            </button>
          )}
        </div>
      )}

      {markers.length > 0 && (
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-white p-3.5">
          <span className="text-[15px] font-semibold">Preencha os detalhes</span>
          {markers.map((m) => (
            <label key={m} className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-muted">{m.slice(1, -1)}</span>
              <input
                value={markerValues[m] ?? ''}
                onChange={(e) => setMarkerValues((v) => ({ ...v, [m]: e.target.value }))}
                placeholder={m}
                className="h-11 rounded-[11px] bg-lilac px-3 text-sm outline-none"
              />
            </label>
          ))}
        </div>
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
