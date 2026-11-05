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
      className="press flex cursor-pointer items-center gap-3 rounded-[20px] bg-gold-soft p-3.5 text-left"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-gold-ink">!</div>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="text-[15px] font-bold text-gold-ink">Complete seu estúdio</div>
        <div className="text-[13px] text-gold-ink/80">Seus dados preenchem as mensagens e artes sozinhos</div>
      </div>
      <div className="text-lg text-gold-ink">→</div>
    </button>
  )
}
