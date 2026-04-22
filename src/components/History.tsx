import { useState } from 'react'
import { ActivityLog } from '../types'
import { getLogs, deleteLog } from '../lib/db'

interface HistoryProps {
  onRefresh: () => void
}

function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  }
}

function getMonthRange(offset = 0) {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  }
}

export default function History({ onRefresh }: HistoryProps) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [offset, setOffset] = useState(0)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load(v = view, o = offset) {
    setLoading(true)
    const range = v === 'week' ? getWeekRange(o) : getMonthRange(o)
    const data = await getLogs(range.from, range.to)
    setLogs(data)
    setLoaded(true)
    setLoading(false)
  }

  function switchView(v: 'week' | 'month') {
    setView(v)
    setOffset(0)
    load(v, 0)
  }

  function shift(dir: number) {
    const o = offset + dir
    setOffset(o)
    load(view, o)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await deleteLog(id)
    onRefresh()
    load()
  }

  const totalPts = Math.round(logs.reduce((s, l) => s + l.points, 0))

  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {} as Record<string, ActivityLog[]>)

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const rangeLabel = () => {
    const r = view === 'week' ? getWeekRange(offset) : getMonthRange(offset)
    if (view === 'week') {
      return `${r.from} → ${r.to}`
    }
    const d = new Date(r.from)
    return d.toLocaleDateString('en', { month: 'long', year: 'numeric' })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['week', 'month'] as const).map(v => (
          <button key={v} onClick={() => switchView(v)} style={{
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            background: view === v ? '#e94560' : '#16213e',
            color: view === v ? '#fff' : '#a0a0b0',
            fontWeight: view === v ? 600 : 400,
            fontSize: '0.85rem',
          }}>
            {v === 'week' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#16213e',
        borderRadius: '12px',
        padding: '0.8rem 1.2rem',
        marginBottom: '1rem',
      }}>
        <button onClick={() => shift(-1)} style={{
          background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.2rem',
        }}>←</button>
        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{rangeLabel()}</span>
        <button onClick={() => shift(1)} disabled={offset >= 0} style={{
          background: 'none', border: 'none', color: offset >= 0 ? '#3a3a5e' : '#a0a0b0',
          cursor: offset >= 0 ? 'not-allowed' : 'pointer', fontSize: '1.2rem',
        }}>→</button>
      </div>

      {!loaded ? (
        <button onClick={() => load()} style={{
          width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none',
          background: '#e94560', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
        }}>
          Load History
        </button>
      ) : loading ? (
        <div style={{ color: '#a0a0b0', textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <>
          {/* Total */}
          <div style={{
            background: '#16213e', borderRadius: '12px', padding: '1rem',
            textAlign: 'center', marginBottom: '1rem',
          }}>
            <div style={{ color: '#a0a0b0', fontSize: '0.8rem' }}>Total points</div>
            <div style={{
              fontSize: '2rem', fontWeight: 700,
              color: totalPts >= 0 ? '#4ecca3' : '#e94560',
            }}>
              {totalPts >= 0 ? '+' : ''}{totalPts}
            </div>
          </div>

          {/* Day by day */}
          {sortedDates.length === 0 ? (
            <div style={{ color: '#a0a0b0', textAlign: 'center', padding: '2rem' }}>
              No activities logged in this period.
            </div>
          ) : sortedDates.map(date => {
            const dayLogs = grouped[date]
            const dayTotal = Math.round(dayLogs.reduce((s, l) => s + l.points, 0))
            return (
              <div key={date} style={{
                background: '#16213e', borderRadius: '12px',
                padding: '1rem 1.2rem', marginBottom: '0.8rem',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '0.8rem',
                }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>
                    {new Date(date).toLocaleDateString('en', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </div>
                  <div style={{
                    color: dayTotal >= 0 ? '#4ecca3' : '#e94560',
                    fontWeight: 700,
                  }}>
                    {dayTotal >= 0 ? '+' : ''}{dayTotal} pts
                  </div>
                </div>
                {dayLogs.map(log => (
                  <div key={log.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '0.4rem 0',
                    borderTop: '1px solid #1a1a2e',
                  }}>
                    <div>
                      <span style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>{log.activityName}</span>
                      {log.value && (
                        <span style={{ color: '#6060a0', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                          {log.value}{log.unit}
                        </span>
                      )}
                      {log.note && (
                        <span style={{ color: '#6060a0', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                          — {log.note}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{
                        color: log.points >= 0 ? '#4ecca3' : '#e94560',
                        fontSize: '0.85rem', fontWeight: 600,
                      }}>
                        {log.points >= 0 ? '+' : ''}{log.points}
                      </span>
                      <button onClick={() => handleDelete(log.id!)} style={{
                        background: 'none', border: 'none', color: '#e94560',
                        cursor: 'pointer', fontSize: '0.8rem', padding: '0',
                      }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}