import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../components/ui'
import { KIWIFY_BUYER_AREA_URL } from '../lib/config'
import { removeStudioPhoto, saveStudioPhoto, useStudioPhotoUrl } from '../lib/studioPhoto'
import { useAuth } from '../state/auth'
import { useStudio, type Studio } from '../state/studio'
import { useSubscription } from '../state/subscription'

const PALETTES: { id: Studio['palette']; label: string; swatch: string }[] = [
  { id: 'rosa', label: 'Rosa', swatch: '#E07A9B' },
  { id: 'nude', label: 'Nude e dourado', swatch: '#D9BFA3' },
  { id: 'preto', label: 'Preto e dourado', swatch: '#1A1614' },
]

const PLAN_LABEL: Record<string, string> = { mensal: 'Mensal', anual: 'Anual' }
const STATUS_LABEL: Record<string, string> = { active: 'Ativa', late: 'Pagamento atrasado', canceled: 'Cancelada', refunded: 'Reembolsada' }

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function Row({ label, value, onClick, danger, dot }: { label: string; value: string; onClick?: () => void; danger?: boolean; dot?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex min-h-12 w-full items-center gap-2.5 bg-white px-4 py-3.5 text-left disabled:cursor-default"
    >
      <div className={`flex-1 text-[16px] ${danger ? 'font-semibold text-danger' : ''}`}>{label}</div>
      <div className="flex max-w-[190px] items-center gap-1.5 truncate text-[15.5px] text-muted">
        {dot && <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: dot }} />}
        {value}
      </div>
      {onClick && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4B8BF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

function EditableRow({ label, value, onChange, money, optional }: { label: string; value: string; onChange: (v: string) => void; money?: boolean; optional?: boolean }) {
  const [editing, setEditing] = useState(false)
  if (editing) {
    return (
      <div className="flex min-h-12 items-center gap-2.5 bg-white px-4 py-3">
        <div className="flex-1 text-[16px]">{label}</div>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(money ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value)}
          onBlur={() => setEditing(false)}
          inputMode={money ? 'numeric' : undefined}
          className="min-w-0 max-w-[190px] flex-1 bg-transparent text-right text-[15.5px] text-plum outline-none"
        />
      </div>
    )
  }
  return <Row label={label} value={value ? (money ? `R$ ${value}` : value) : optional ? '—' : 'Adicionar'} onClick={() => setEditing(true)} />
}

export function StudioScreen() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { studio, setField, loading } = useStudio()
  const { subscription } = useSubscription()
  const { url: photoUrl, refresh: refreshPhoto } = useStudioPhotoUrl()
  const fileInput = useRef<HTMLInputElement>(null)
  const [editingPalette, setEditingPalette] = useState(false)

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await saveStudioPhoto(file)
    refreshPhoto()
    e.target.value = ''
  }

  const initials = (studio.ownerName || 'LB').trim().slice(0, 2).toUpperCase()
  const activePalette = PALETTES.find((p) => p.id === studio.palette) ?? PALETTES[0]

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <BackButton fallback="/inicio" />
        <div className="w-[38px]" />
      </div>

      <h1 className="text-[34px] font-bold tracking-tight">Meu Estúdio</h1>
      {loading && <div className="-mt-3 text-[13px] text-muted">Carregando…</div>}

      <div className="flex flex-col items-center gap-2">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-white shadow-[0_8px_20px_rgba(91,42,78,.25)]" style={{ background: 'linear-gradient(135deg,#E07A9B,#5B2A4E)' }}>
          {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[34px] font-bold text-white">{initials}</div>}
        </div>
        <button type="button" onClick={() => fileInput.current?.click()} className="cursor-pointer text-[15.5px] font-semibold text-rose">
          {photoUrl ? 'Alterar foto' : 'Adicionar foto'}
        </button>
        {photoUrl && (
          <button
            type="button"
            onClick={async () => {
              await removeStudioPhoto()
              refreshPhoto()
            }}
            className="text-[13px] font-semibold text-muted underline"
          >
            Remover foto
          </button>
        )}
        <input ref={fileInput} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">PERFIL</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <EditableRow label="Nome" value={studio.ownerName} onChange={(v) => setField('ownerName', v)} />
          <EditableRow label="Estúdio" value={studio.studioName} onChange={(v) => setField('studioName', v)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">ENDEREÇO</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <EditableRow label="Bairro" value={studio.neighborhood} onChange={(v) => setField('neighborhood', v)} />
          <EditableRow label="Cidade" value={studio.city} onChange={(v) => setField('city', v)} />
          <EditableRow label="Endereço" value={studio.address} onChange={(v) => setField('address', v)} optional />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">CONTATO</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <EditableRow label="WhatsApp" value={studio.whatsapp} onChange={(v) => setField('whatsapp', v)} />
          <EditableRow label="Instagram" value={studio.instagram} onChange={(v) => setField('instagram', v.replace(/^@/, ''))} />
          <EditableRow label="Chave Pix" value={studio.pixKey} onChange={(v) => setField('pixKey', v)} optional />
          <EditableRow label="Link de agendamento" value={studio.bookingLink} onChange={(v) => setField('bookingLink', v)} optional />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">PREÇOS</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <EditableRow label="Aplicação" value={studio.servicePrice} onChange={(v) => setField('servicePrice', v)} money />
          <EditableRow label="Manutenção" value={studio.maintenancePrice} onChange={(v) => setField('maintenancePrice', v)} money />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">PREFERÊNCIAS</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <Row label="Paleta preferida" value={activePalette.label} dot={activePalette.swatch} onClick={() => setEditingPalette((v) => !v)} />
          {editingPalette && (
            <div className="flex gap-2 bg-white p-3">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setField('palette', p.id)
                    setEditingPalette(false)
                  }}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-2xl p-2"
                  style={{ background: studio.palette === p.id ? '#FBE8EE' : 'transparent' }}
                >
                  <span className="h-7 w-7 rounded-full" style={{ background: p.swatch }} />
                  <span className="text-center text-[11.5px] font-semibold leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="pl-4 text-[13px] font-semibold tracking-[.03em] text-muted">ASSINATURA</div>
        <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
          <Row label="Plano" value={subscription.plan ? PLAN_LABEL[subscription.plan] : '—'} />
          <Row label="Situação" value={subscription.status ? STATUS_LABEL[subscription.status] : '—'} />
          <Row label="Próxima cobrança" value={formatDate(subscription.currentPeriodEnd)} />
          <a
            href={KIWIFY_BUYER_AREA_URL}
            target="_blank"
            rel="noopener"
            className="flex min-h-12 items-center justify-between gap-2.5 bg-white px-4 py-3.5 text-[16px] font-semibold text-plum"
          >
            Gerenciar assinatura
            <span className="text-[13.5px] font-medium text-muted">Pelo e-mail da Kiwify</span>
          </a>
        </div>
        <div className="px-4 text-[12.5px] leading-[1.4] text-muted">
          Depois da compra e em cada renovação, a Kiwify manda um e-mail com um botão para cancelar a assinatura ou trocar o cartão. Não achou o e-mail? O link acima abre a área da Kiwify para entrar com o mesmo e-mail da compra.
        </div>
      </div>

      <div className="flex flex-col gap-[1px] overflow-hidden rounded-[20px] bg-line">
        <button type="button" onClick={signOut} className="flex min-h-12 items-center bg-white px-4 py-3.5 text-left text-[16px] font-semibold text-danger">
          Sair
        </button>
      </div>
      <button type="button" onClick={() => navigate('/kits')} className="text-center text-[13px] text-muted underline">
        Ver todos os kits
      </button>
    </div>
  )
}
