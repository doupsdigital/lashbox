import { useMemo, useState } from 'react'
import { CopyButton, MessageText, useMessageResolver } from '../../components/Messages'
import { track } from '../../lib/analytics'
import { normalize } from '../../lib/text'
import { whatsAppLinkTo } from '../../lib/studioTokens'
import { useDragScroll } from '../../lib/useDragScroll'
import { useVipList, type VipClient } from '../../lib/vipList'
import { MESSAGE_CATEGORIES, messages } from '../../content/lash'

const STATUS_COLORS: Record<string, [string, string]> = {
  'A chamar': ['#FFF1B8', '#7A5A00'],
  Enviada: ['#EDE1EA', '#5B2A4E'],
  Respondeu: ['#FBE8EE', '#B03A62'],
  Agendou: ['#DDF3E4', '#1E6B3A'],
}
const STATUSES = Object.keys(STATUS_COLORS)

function MessagesTab() {
  const [cat, setCat] = useState<string>('Todas')
  const [q, setQ] = useState('')
  const resolve = useMessageResolver()
  const chipsDrag = useDragScroll<HTMLDivElement>()

  const filtered = useMemo(() => {
    const qn = normalize(q.trim())
    return messages.filter((m) => (cat === 'Todas' || m.category === cat) && (!qn || normalize(`${m.title} ${m.text}`).includes(qn)))
  }, [cat, q])

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex h-[42px] items-center gap-2 rounded-[13px] border border-white/[0.15] bg-white/[0.08] px-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2} strokeLinecap="round">
          <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5" />
        </svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar mensagem" className="flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/40" />
      </div>
      <div ref={chipsDrag.ref} {...chipsDrag.bind} className="-mx-5 flex cursor-grab gap-2 overflow-x-auto px-5 select-none">
        {MESSAGE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`shrink-0 cursor-pointer rounded-[20px] px-4 py-2.5 text-[14.5px] font-semibold ${
              c === cat ? 'bg-[#E07A9B] text-white' : 'border border-white/20 text-white/80'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.map((m) => (
        <div key={m.id} className="flex flex-col gap-3 rounded-[24px] border border-white/[0.12] bg-white/[0.07] p-[18px]">
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-bold text-white">{m.title}</div>
            <div className="rounded-[9px] bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-[#E07A9B]">{m.category}</div>
          </div>
          <MessageText text={m.text} name="" className="text-[15px] leading-[1.5] text-white/85" />
          <CopyButton text={resolve(m.text)} onCopied={() => track('mensagem_copiada', { id_mensagem: m.id, categoria: m.category })} />
        </div>
      ))}
      {filtered.length === 0 && <div className="px-3 py-8 text-center text-[15px] text-white/50">Nenhuma mensagem encontrada.</div>}
    </div>
  )
}

function ClientsTab() {
  const { list, add, setStatus, remove } = useVipList()
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [picking, setPicking] = useState<VipClient | null>(null)
  const resolve = useMessageResolver()

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="text-[14px] text-white/60">{list.length} clientes na sua lista</div>
      </div>

      <div className="flex flex-col gap-2 rounded-[22px] border border-white/[0.1] bg-white/[0.05] p-3.5">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da cliente" className="h-12 min-w-0 flex-1 rounded-xl border border-white/[0.15] bg-white/[0.08] px-3.5 text-[15px] text-white outline-none placeholder:text-white/40" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp (opcional)" className="h-12 min-w-0 flex-1 rounded-xl border border-white/[0.15] bg-white/[0.08] px-3.5 text-[15px] text-white outline-none placeholder:text-white/40" />
        </div>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            add(name, whatsapp, STATUSES[0])
            setName('')
            setWhatsapp('')
          }}
          className="press flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#E07A9B] text-sm font-semibold text-white disabled:opacity-50"
        >
          + Adicionar
        </button>
      </div>

      {list.map((c) => {
        const [bg, color] = STATUS_COLORS[c.status] ?? ['#EDE1EA', '#5B2A4E']
        return (
          <div key={c.id} className="ph-no-capture flex flex-col gap-3 rounded-[22px] border border-white/[0.1] bg-white/[0.05] p-[14px]">
            <div className="flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-white">{c.name[0]?.toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16.5px] font-semibold text-white">{c.name}</div>
                {c.whatsapp && <div className="truncate text-[13px] text-white/60">{c.whatsapp}</div>}
              </div>
              <div className="shrink-0 rounded-[10px] px-2.5 py-1 text-[12.5px] font-semibold" style={{ background: bg, color }}>
                {c.status}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(c.id, s)}
                  className={`flex h-8 cursor-pointer items-center rounded-full px-3 text-[12px] font-semibold ${c.status === s ? 'bg-[#E07A9B] text-white' : 'border border-white/20 text-white/70'}`}
                >
                  {s}
                </button>
              ))}
              <button type="button" onClick={() => remove(c.id)} className="ml-auto text-xs font-semibold text-white/50 underline">
                Remover
              </button>
            </div>
            {c.whatsapp && (
              <button type="button" onClick={() => setPicking(c)} className="press flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#E07A9B]/40 bg-[#E07A9B]/15 text-[14.5px] font-semibold text-white">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z" />
                </svg>
                Chamar no WhatsApp
              </button>
            )}
          </div>
        )
      })}
      {list.length === 0 && <div className="px-3 py-8 text-center text-[15px] text-white/50">Nenhuma cliente ainda. Adicione a primeira acima.</div>}
      <div className="text-center text-[13px] text-white/50">Sua lista fica só no seu celular.</div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" role="dialog" aria-modal="true" onClick={() => setPicking(null)}>
          <div className="ph-no-capture animate-fade-up pb-safe max-h-[80vh] w-full max-w-[430px] overflow-auto rounded-t-[32px] bg-[#4A2140] px-5 pt-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-bold text-white">Mensagem para {picking.name}</div>
            <div className="flex flex-col gap-2.5 pb-6">
              {messages.map((m) => {
                const text = resolve(m.text, picking.name)
                return (
                  <a
                    key={m.id}
                    href={whatsAppLinkTo(picking.whatsapp, text)}
                    target="_blank"
                    rel="noopener"
                    onClick={() => setPicking(null)}
                    className="press flex flex-col gap-1 rounded-2xl border border-white/[0.12] bg-white/[0.07] p-3.5"
                  >
                    <div className="text-[13px] font-semibold text-[#E07A9B]">{m.title}</div>
                    <div className="truncate text-[14px] text-white/85">{text}</div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function MessagesLibrary() {
  const [tab, setTab] = useState<'messages' | 'clients'>('messages')
  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-night px-5 pt-6 pb-8">
      <h1 className="text-[34px] font-bold tracking-tight text-white">Mensagens</h1>
      <div className="flex gap-0.5 rounded-[11px] bg-white/[0.08] p-0.5">
        <button type="button" onClick={() => setTab('messages')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'messages' ? 'bg-white text-ink shadow-sm' : 'text-white/70'}`}>
          Mensagens
        </button>
        <button type="button" onClick={() => setTab('clients')} className={`flex-1 cursor-pointer rounded-[9px] py-2 text-[14.5px] font-semibold ${tab === 'clients' ? 'bg-white text-ink shadow-sm' : 'text-white/70'}`}>
          Minhas clientes
        </button>
      </div>
      {tab === 'messages' ? <MessagesTab /> : <ClientsTab />}
    </div>
  )
}
