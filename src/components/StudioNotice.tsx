import { useNavigate } from 'react-router-dom'
import { useStudio } from '../state/studio'

/** Aviso para preencher o Meu Estúdio, mostrado nas ferramentas do Kit enquanto ele estiver vazio. */
export function StudioNotice() {
  const { isComplete } = useStudio()
  const navigate = useNavigate()
  if (isComplete) return null
  return (
    <button
      type="button"
      onClick={() => navigate('/estudio')}
      className="press flex cursor-pointer items-center gap-3 rounded-[20px] border border-[#C9A15B]/30 bg-[#C9A15B]/15 p-3.5 text-left"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-base font-bold text-[#E8C27E]">!</div>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="text-[15px] font-bold text-[#E8C27E]">Complete seu estúdio</div>
        <div className="text-[13px] text-[#E8C27E]/80">Seus dados preenchem as mensagens e artes sozinhos</div>
      </div>
      <div className="text-lg text-[#E8C27E]">→</div>
    </button>
  )
}
