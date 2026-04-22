import { useState } from 'react'
import { Settings, ActivityConfig } from '../types'
import { saveSettings } from '../lib/db'

interface SettingsProps {
  settings: Settings
  onSaved: (settings: Settings) => void
}

export default function SettingsPanel({ settings, onSaved }: SettingsProps) {
  const [form, setForm] = useState<Settings>(JSON.parse(JSON.stringify(settings)))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateField(field: keyof Settings, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateActivity(id: string, field: keyof ActivityConfig, value: string | number) {
    setForm(prev => ({
      ...prev,
      activityConfig: prev.activityConfig.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }))
  }

  async function handleSave() {
    setSaving(true)
    await saveSettings(form)
    onSaved(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const positive = form.activityConfig.filter(a => a.category === 'positive')
  const negative = form.activityConfig.filter(a => a.category === 'negative')

  const inputStyle = {
    padding: '0.4rem 0.7rem',
    borderRadius: '8px',
    border: '1px solid #2a2a4e',
    background: '#1a1a2e',
    color: '#fff',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const renderActivity = (a: ActivityConfig) => (
    <div key={a.id} style={{
      padding: '0.8rem',
      borderRadius: '10px',
      background: '#1a1a2e',
      marginBottom: '0.6rem',
    }}>
      <div style={{ color: '#fff', fontWeight: 500, marginBottom: '0.6rem' }}>{a.name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <div>
          <label style={{ color: '#a0a0b0', fontSize: '0.75rem' }}>
            Points {a.inputType === 'time' ? 'per hour' : '(flat)'}
          </label>
          <input
            type="number"
            value={a.pointsPerUnit}
            onChange={e => updateActivity(a.id, 'pointsPerUnit', parseFloat(e.target.value))}
            style={inputStyle}
          />
        </div>
        {a.inputType === 'time' && (
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.75rem' }}>Max hours</label>
            <input
              type="number"
              value={a.maxUnits ?? ''}
              onChange={e => updateActivity(a.id, 'maxUnits', parseFloat(e.target.value))}
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>

      {saved && (
        <div style={{
          background: '#1a3a2e',
          border: '1px solid #4ecca3',
          color: '#4ecca3',
          padding: '0.8rem 1.2rem',
          borderRadius: '10px',
          marginBottom: '1rem',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          ✅ Settings saved!
        </div>
      )}

      {/* General settings */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>General</div>

        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Kid's name</label>
          <input
            type="text"
            value={form.kidName}
            onChange={e => updateField('kidName', e.target.value)}
            style={{ ...inputStyle, marginTop: '0.4rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Daily goal (pts)</label>
            <input
              type="number"
              value={form.dailyGoal}
              onChange={e => updateField('dailyGoal', parseInt(e.target.value))}
              style={{ ...inputStyle, marginTop: '0.4rem' }}
            />
          </div>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Weekly goal (pts)</label>
            <input
              type="number"
              value={form.weeklyGoal}
              onChange={e => updateField('weeklyGoal', parseInt(e.target.value))}
              style={{ ...inputStyle, marginTop: '0.4rem' }}
            />
          </div>
        </div>
      </div>

      {/* Positive activities */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#4ecca3', fontWeight: 600, marginBottom: '1rem' }}>
          ✅ Good activities
        </div>
        {positive.map(renderActivity)}
      </div>

      {/* Negative activities */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#e94560', fontWeight: 600, marginBottom: '1rem' }}>
          ❌ Negative activities
        </div>
        {negative.map(renderActivity)}
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%',
        padding: '0.9rem',
        borderRadius: '10px',
        border: 'none',
        background: '#e94560',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}