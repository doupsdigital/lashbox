import { useNavigate } from 'react-router-dom'
import { ScaledBoard } from '../../components/art/ScaledBoard'
import { StoryBoard } from '../../components/art/StoryBoard'
import { studioFootStory } from '../../lib/studioFooter'
import { usePurchases } from '../../state/purchases'
import { useStudio } from '../../state/studio'
import { kitFimDeAno, kitsCatalog } from '../../content/lash'

const ICONS: Record<string, string> = {
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-4 0M12 7c2-4 6-3 4 0',
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  cal: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
}

export function Kits() {
  const navigate = useNavigate()
  const { studio } = useStudio()
  const { isUnlocked } = usePurchases()
  const foot = studioFootStory(studio)
  const previewArts = kitFimDeAno.arts.slice(0, 3)

  return (
    <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-lilac px-5 pt-6 pb-8">
      <h1 className="text-[34px] font-bold tracking-tight">Kits</h1>

      {kitsCatalog.map((k) => {
        const unlocked = isUnlocked(k.key)
        return (
          <div key={k.key} className="flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(42,30,39,.04),0_10px_30px_rgba(91,42,78,.09)]">
            <div className="relative flex h-[150px] items-center justify-center" style={{ background: `linear-gradient(135deg,${k.color1},${k.color2})` }}>
              <div className="absolute -top-10 -right-[30px] h-40 w-40 rounded-full bg-white/17" />
              <div className="absolute -bottom-[50px] -left-5 h-[130px] w-[130px] rounded-full bg-white/10" />
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONS[k.icon]} />
              </svg>
              <div
                className="absolute left-3.5 top-3.5 rounded-xl px-2.5 py-1.5 text-[12.5px] font-semibold"
                style={{ background: 'rgba(255,255,255,.9)', color: unlocked ? '#8A6A24' : '#5B2A4E' }}
              >
                {unlocked ? 'Comprado' : k.price}
              </div>
            </div>
            <div className="flex flex-col gap-3.5 p-[18px]">
              <div>
                <div className="text-[21px] font-bold tracking-tight">{k.name}</div>
                <div className="mt-0.5 text-[14px] text-muted">{kitFimDeAno.arts.length} artes · {k.desc}</div>
              </div>
              <div className="relative flex gap-2">
                {previewArts.map((a) => (
                  <div key={a.id} className="flex-1 overflow-hidden rounded-[10px]" style={{ filter: unlocked ? 'none' : 'blur(5px)' }}>
                    <ScaledBoard width={1080} height={1920} scale={0.09}>
                      <StoryBoard art={a} palette={a.palette === 'black' ? 'preto' : studio.palette} post={false} photoOn={false} photoUrl={null} photoPosY={40} foot1={foot.foot1 || 'Seu estúdio'} foot2={foot.foot2} />
                    </ScaledBoard>
                  </div>
                ))}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B2A4E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(`/kits/${k.key}`)}
                className="press flex h-[50px] cursor-pointer items-center justify-center rounded-full text-[16px] font-semibold"
                style={{ background: unlocked ? '#5B2A4E' : '#C9A15B', color: '#fff' }}
              >
                {unlocked ? 'Abrir kit' : `${k.price} · Comprar`}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
