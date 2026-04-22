import { ActivityLog, Settings } from '../types'

interface DashboardProps {
  settings: Settings
  todayLogs: ActivityLog[]
  weekLogs: ActivityLog[]
}

function ProgressBar({ value, goal, label, color }: {
  value: number
  goal: number
  label: string
  color: string
}) {
  const pct = Math.min(Math.round((value / goal) * 100), 100)
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
          {value} / {goal} pts
        </span>
      </div>
      <div style={{ background: '#16213e', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct >= 100 ? '#4ecca3' : color,
          borderRadius: '10px',
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: pct >= 100 ? '#4ecca3' : '#a0a0b0', marginTop: '0.2rem' }}>
        {pct >= 100 ? '🎉 Goal reached!' : `${pct}%`}
      </div>
    </div>
  )
}

export default function Dashboard({ settings, todayLogs, weekLogs }: DashboardProps) {
  const todayPts = Math.round(todayLogs.reduce((s, l) => s + l.points, 0))
  const weekPts = Math.round(weekLogs.reduce((s, l) => s + l.points, 0))

  const recentLogs = [...todayLogs].slice(0, 5)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: "Today's Points", value: todayPts, color: '#e94560' },
          { label: 'This Week', value: weekPts, color: '#4ecca3' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#16213e',
            borderRadius: '12px',
            padding: '1.2rem',
            textAlign: 'center',
          }}>
            <div style={{ color: '#a0a0b0', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '2rem', fontWeight: 700 }}>
              {card.value >= 0 ? '+' : ''}{card.value}
            </div>
            <div style={{ color: '#a0a0b0', fontSize: '0.75rem' }}>points</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>Goals</div>
        <ProgressBar value={todayPts} goal={settings.dailyGoal} label="Daily goal" color="#e94560" />
        <ProgressBar value={weekPts} goal={settings.weeklyGoal} label="Weekly goal" color="#4ecca3" />
      </div>

      {/* Recent activity */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>Today's activity</div>
        {recentLogs.length === 0 ? (
          <div style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>No activities logged today yet.</div>
        ) : (
          recentLogs.map((log) => (
            <div key={log.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.6rem 0',
              borderBottom: '1px solid #1a1a2e',
            }}>
              <div>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{log.activityName}</div>
                {log.value && (
                  <div style={{ color: '#a0a0b0', fontSize: '0.75rem' }}>{log.value} {log.unit}</div>
                )}
              </div>
              <div style={{
                color: log.points >= 0 ? '#4ecca3' : '#e94560',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}>
                {log.points >= 0 ? '+' : ''}{log.points} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}