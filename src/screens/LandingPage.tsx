import { useNavigate } from 'react-router-dom'

/** Página de vendas provisória: só o logo e o botão "Entrar". A página de verdade vem depois (Fase 5). */
export function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-plum px-8 text-center text-white">
      <img src="/icone-256.webp" alt="LashBox" width={110} height={110} className="rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,.25)]" />
      <div className="flex flex-col gap-2">
        <div className="text-[30px] font-bold tracking-tight">LashBox</div>
        <p className="max-w-[280px] text-[16px] leading-[1.45] text-white/85">A caixa de ferramentas da lash designer.</p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/entrar')}
        className="press flex h-[54px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-full bg-white text-[17px] font-semibold text-plum"
      >
        Entrar
      </button>
    </div>
  )
}
