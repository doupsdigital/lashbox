import { NavLink } from 'react-router-dom'

const ICONS: Record<string, string> = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  msg: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',
  kits: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
}

const tabs = [
  { label: 'Início', to: '/inicio', icon: 'home' },
  { label: 'Criar', to: '/criar', icon: 'spark' },
  { label: 'Mensagens', to: '/mensagens', icon: 'msg' },
  { label: 'Kits', to: '/kits', icon: 'kits' },
  { label: 'Estúdio', to: '/estudio', icon: 'user' },
]

export function TabBar() {
  return (
    <nav className="pb-safe shrink-0 border-t border-[#EFE6EA] bg-white/85 backdrop-blur-xl">
      <div className="grid h-[72px] grid-cols-5 px-1 pt-2">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} className="flex flex-col items-center gap-1 text-[10.5px] font-semibold">
            {({ isActive }) => (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isActive ? 'var(--color-plum)' : 'var(--color-faint)'}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={ICONS[t.icon]} />
                </svg>
                <span style={{ color: isActive ? 'var(--color-plum)' : 'var(--color-faint)' }}>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
