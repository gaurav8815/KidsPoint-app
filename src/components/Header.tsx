interface HeaderProps {
  kidName: string
  currentView: string
  onNavigate: (view: string) => void
  onSignOut: () => void
}

export default function Header({ kidName, currentView, onNavigate, onSignOut }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'log', label: 'Log Activity' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <header style={{
      background: '#1a1a2e',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div>
        <div style={{ color: '#e94560', fontWeight: 700, fontSize: '1.3rem' }}>
          ⭐ KidPoints
        </div>
        <div style={{ color: '#a0a0b0', fontSize: '0.8rem' }}>
          {kidName}'s tracker
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: currentView === item.id ? '#e94560' : '#16213e',
              color: currentView === item.id ? '#fff' : '#a0a0b0',
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={onSignOut}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid #2a2a4e',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            background: 'transparent',
            color: '#a0a0b0',
            marginLeft: '0.5rem',
          }}
        >
          Sign Out
        </button>
      </nav>
    </header>
  )
}
