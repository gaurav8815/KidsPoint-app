import { useState } from 'react'
import { Settings, ActivityLog, ActivityConfig } from '../types'
import { saveLog } from '../lib/db'

interface LogActivityProps {
  settings: Settings
  onLogged: () => void
}

export default function LogActivity({ settings, onLogged }: LogActivityProps) {
  const [selected, setSelected] = useState<ActivityConfig | null>(null)
  const [hours, setHours] = useState<number>(1)
  const [done, setDone] = useState<boolean>(true)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<{ msg: string; positive: boolean } | null>(null)

  function calcPoints(activity: ActivityConfig, value: number): number {
    if (activity.inputType === 'completion') {
      return done ? activity.pointsPerUnit : 0
    }
    if (activity.maxUnits && value > activity.maxUnits) {
      const base = activity.maxUnits * activity.pointsPerUnit
      const excess = value - activity.maxUnits
      const penalty = activity.penaltyAfterMax ?? Math.abs(activity.pointsPerUnit)
      return base - excess * penalty
    }
    return value * activity.pointsPerUnit
  }

  async function handleLog() {
    if (!selected) return
    setSaving(true)

    const value = selected.inputType === 'time' ? hours : undefined
    const points = calcPoints(selected, value ?? 1)

    const log: ActivityLog = {
      date: new Date().toISOString().slice(0, 10),
      activityType: selected.id,
      activityName: selected.name,
      value,
      unit: selected.unit,
      points,
      note: note || undefined,
    }

    await saveLog(log)
    setSaving(false)
    setFlash({ msg: `${points >= 0 ? '+' : ''}${points} points logged!`, positive: points >= 0 })
    setSelected(null)
    setHours(1)
    setNote('')
    onLogged()
    setTimeout(() => setFlash(null), 3000)
  }

  const positive = settings.activityConfig.filter(a => a.category === 'positive')
  const negative = settings.activityConfig.filter(a => a.category === 'negative')

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

      {flash && (
        <div style={{
          background: flash.positive ? '#1a3a2e' : '#3a1a1e',
          border: `1px solid ${flash.positive ? '#4ecca3' : '#e94560'}`,
          color: flash.positive ? '#4ecca3' : '#e94560',
          padding: '0.8rem 1.2rem',
          borderRadius: '10px',
          marginBottom: '1rem',
          fontWeight: 600,
          fontSize: '1rem',
          textAlign: 'center',
        }}>
          {flash.msg}
        </div>
      )}

      {/* Positive activities */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#4ecca3', fontWeight: 600, marginBottom: '1rem' }}>
          ✅ Good activities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
          {positive.map(a => (
            <button key={a.id} onClick={() => setSelected(a)} style={{
              padding: '0.7rem',
              borderRadius: '10px',
              border: selected?.id === a.id ? '2px solid #4ecca3' : '2px solid transparent',
              background: selected?.id === a.id ? '#1a3a2e' : '#1a1a2e',
              color: selected?.id === a.id ? '#4ecca3' : '#a0a0b0',
              cursor: 'pointer',
              fontWeight: selected?.id === a.id ? 600 : 400,
              fontSize: '0.85rem',
              textAlign: 'center',
            }}>
              <div>{a.name}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>
                +{a.pointsPerUnit} {a.inputType === 'time' ? `pts/${a.unit}` : 'pts'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Negative activities */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#e94560', fontWeight: 600, marginBottom: '1rem' }}>
          ❌ Negative activities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
          {negative.map(a => (
            <button key={a.id} onClick={() => setSelected(a)} style={{
              padding: '0.7rem',
              borderRadius: '10px',
              border: selected?.id === a.id ? '2px solid #e94560' : '2px solid transparent',
              background: selected?.id === a.id ? '#3a1a1e' : '#1a1a2e',
              color: selected?.id === a.id ? '#e94560' : '#a0a0b0',
              cursor: 'pointer',
              fontWeight: selected?.id === a.id ? 600 : 400,
              fontSize: '0.85rem',
              textAlign: 'center',
            }}>
              <div>{a.name}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>
                {a.pointsPerUnit} {a.inputType === 'time' ? `pts/${a.unit}` : 'pts'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      {selected && (
        <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>
            Log: {selected.name}
          </div>

          {selected.inputType === 'time' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>
                How many hours?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input
                  type="range"
                  min={0.5}
                  max={12}
                  step={0.5}
                  value={hours}
                  onChange={e => setHours(parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ color: '#fff', fontWeight: 600, minWidth: '50px' }}>
                  {hours}h
                </span>
              </div>
              <div style={{ color: '#a0a0b0', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Points: <span style={{
                  color: calcPoints(selected, hours) >= 0 ? '#4ecca3' : '#e94560',
                  fontWeight: 600,
                }}>
                  {calcPoints(selected, hours) >= 0 ? '+' : ''}{calcPoints(selected, hours)}
                </span>
              </div>
            </div>
          )}

          {selected.inputType === 'completion' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setDone(v)} style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '8px',
                    border: done === v ? `2px solid ${selected.category === 'positive' ? '#4ecca3' : '#e94560'}` : '2px solid transparent',
                    background: done === v ? (selected.category === 'positive' ? '#1a3a2e' : '#3a1a1e') : '#1a1a2e',
                    color: done === v ? (selected.category === 'positive' ? '#4ecca3' : '#e94560') : '#a0a0b0',
                    cursor: 'pointer',
                    fontWeight: done === v ? 600 : 400,
                  }}>
                    {v ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
              <div style={{ color: '#a0a0b0', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Points: <span style={{
                  color: calcPoints(selected, 1) >= 0 ? '#4ecca3' : '#e94560',
                  fontWeight: 600,
                }}>
                  {done ? (calcPoints(selected, 1) >= 0 ? '+' : '') + calcPoints(selected, 1) : 0}
                </span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. did math homework"
              style={{
                width: '100%',
                marginTop: '0.4rem',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #2a2a4e',
                background: '#1a1a2e',
                color: '#fff',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button onClick={handleLog} disabled={saving} style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            border: 'none',
            background: '#e94560',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : 'Log Activity'}
          </button>
        </div>
      )}
    </div>
  )
}