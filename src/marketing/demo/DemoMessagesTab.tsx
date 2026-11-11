import { CopyButton } from '../../components/Messages'
import { messages } from '../../content/lash'
import { track } from '../../lib/analytics'
import { applyGenericMarkers } from '../../lib/studioTokens'
import { DEMO_MESSAGE_IDS } from './demoContent'

const DEMO_MESSAGES = DEMO_MESSAGE_IDS.map((id) => messages.find((m) => m.id === id)).filter(
  (m): m is NonNullable<typeof m> => !!m,
)

export function DemoMessagesTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] leading-[1.4] text-white/75">70 mensagens assim já vêm prontas no app — é só escolher e copiar.</p>
      {DEMO_MESSAGES.map((m) => {
        const text = applyGenericMarkers(m.text, { '[nome]': 'Maria' })
        return (
          <div key={m.id} className="flex flex-col gap-2.5 rounded-[20px] border border-white/[0.12] bg-white/[0.07] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14.5px] font-bold text-white">{m.title}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#E07A9B]">{m.category}</span>
            </div>
            <div className="whitespace-pre-wrap text-[14.5px] leading-[1.45] text-white/85">{text}</div>
            <CopyButton text={text} size="sm" onCopied={() => track('demo_mensagem_copiada', { id_mensagem: m.id })} />
          </div>
        )
      })}
    </div>
  )
}
