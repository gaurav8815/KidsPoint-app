import { useState } from 'react'
import type { Settings, ActivityConfig } from '../types'
import { saveSettings } from '../lib/db'
import { deleteActivityLogs } from '../lib/db'
import { supabase } from '../lib/supabase'

interface SettingsProps {
  settings: Settings
  onSaved: (settings: Settings) => void
}

const emptyActivity: Omit<ActivityConfig, 'id'> = {
  name: '',
  category: 'positive',
  inputType: 'completion',
  pointsPerUnit: 10,
  unit: 'hours',
}

export default function SettingsPanel({ settings, onSaved }: SettingsProps) {
  const [form, setForm] = useState<Settings>(JSON.parse(JSON.stringify(settings)))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newActivity, setNewActivity] = useState({ ...emptyActivity })
  const [deleteConfirm, setDeleteConfirm] = useState<ActivityConfig | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  async function handleDeleteActivity() {
    if (!deleteConfirm) return
    setDeleting(true)
    await deleteActivityLogs(deleteConfirm.id)
    const updated = {
      ...form,
      activityConfig: form.activityConfig.filter(a => a.id !== deleteConfirm.id),
    }
    await saveSettings(updated)
    setForm(updated)
    onSaved(updated)
    setDeleteConfirm(null)
    setDeleting(false)
  }

  function handleAddActivity() {
    if (!newActivity.name.trim()) return
    const id = newActivity.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const activity: ActivityConfig = {
      ...newActivity,
      id,
      pointsPerUnit: newActivity.category === 'negative'
        ? -Math.abs(newActivity.pointsPerUnit)
        : Math.abs(newActivity.pointsPerUnit),
    }
    setForm(prev => ({
      ...prev,
      activityConfig: [...prev.activityConfig, activity],
    }))
    setNewActivity({ ...emptyActivity })
  }

  async function handleSave() {
    setSaving(true)
    await saveSettings(form)
    onSaved(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  }

  const positive = form.activityConfig.filter(a => a.category === 'positive')
  const negative = form.activityConfig.filter(a => a.category === 'negative')

  const renderActivity = (a: ActivityConfig) => (
    <div key={a.id} style={{
      padding: '0.8rem',
      borderRadius: '10px',
      background: '#1a1a2e',
      marginBottom: '0.6rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.6rem',
      }}>
        <div style={{ color: '#fff', fontWeight: 500 }}>{a.name}</div>
        <button
          onClick={() => setDeleteConfirm(a)}
          style={{
            background: 'none',
            border: '1px solid #e94560',
            color: '#e94560',
            borderRadius: '6px',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Delete
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <div>
          <label style={{ color: '#a0a0b0', fontSize: '0.75rem' }}>
            Points {a.inputType === 'time' ? 'per hour' : '(flat)'}
          </label>
          <input
            type="number"
            value={Math.abs(a.pointsPerUnit)}
            onChange={e => updateActivity(
              a.id,
              'pointsPerUnit',
              a.category === 'negative'
                ? -Math.abs(parseFloat(e.target.value))
                : Math.abs(parseFloat(e.target.value))
            )}
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

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#16213e',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid #e94560',
          }}>
            <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', marginBottom: '0.8rem' }}>
              Delete "{deleteConfirm.name}"?
            </div>
            <div style={{ color: '#a0a0b0', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This will <span style={{ color: '#e94560', fontWeight: 600 }}>permanently delete</span> this activity
              and <span style={{ color: '#e94560', fontWeight: 600 }}>all its historical logs</span>.
              This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1px solid #2a2a4e',
                  background: 'transparent',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteActivity}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#e94560',
                  color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* General */}
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
        <div style={{ color: '#4ecca3', fontWeight: 600, marginBottom: '1rem' }}>✅ Good activities</div>
        {positive.length === 0 && (
          <div style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            No positive activities yet.
          </div>
        )}
        {positive.map(renderActivity)}
      </div>

      {/* Negative activities */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#e94560', fontWeight: 600, marginBottom: '1rem' }}>❌ Negative activities</div>
        {negative.length === 0 && (
          <div style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            No negative activities yet.
          </div>
        )}
        {negative.map(renderActivity)}
      </div>

      {/* Add new activity */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>➕ Add new activity</div>
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Activity name</label>
          <input
            type="text"
            value={newActivity.name}
            onChange={e => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Swimming, Piano practice..."
            style={{ ...inputStyle, marginTop: '0.4rem' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Category</label>
            <select
              value={newActivity.category}
              onChange={e => setNewActivity(prev => ({
                ...prev,
                category: e.target.value as 'positive' | 'negative',
              }))}
              style={{ ...selectStyle, marginTop: '0.4rem' }}
            >
              <option value="positive">✅ Positive</option>
              <option value="negative">❌ Negative</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Type</label>
            <select
              value={newActivity.inputType}
              onChange={e => setNewActivity(prev => ({
                ...prev,
                inputType: e.target.value as 'time' | 'completion',
              }))}
              style={{ ...selectStyle, marginTop: '0.4rem' }}
            >
              <option value="completion">✔️ Completion (yes/no)</option>
              <option value="time">⏱️ Time-based (hours)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>
              Points {newActivity.inputType === 'time' ? 'per hour' : '(flat)'}
            </label>
            <input
              type="number"
              value={newActivity.pointsPerUnit}
              onChange={e => setNewActivity(prev => ({
                ...prev,
                pointsPerUnit: parseFloat(e.target.value),
              }))}
              style={{ ...inputStyle, marginTop: '0.4rem' }}
            />
          </div>
          {newActivity.inputType === 'time' && (
            <div>
              <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Max hours</label>
              <input
                type="number"
                value={newActivity.maxUnits ?? ''}
                onChange={e => setNewActivity(prev => ({
                  ...prev,
                  maxUnits: parseFloat(e.target.value),
                }))}
                style={{ ...inputStyle, marginTop: '0.4rem' }}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleAddActivity}
          disabled={!newActivity.name.trim()}
          style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '10px',
            border: 'none',
            background: newActivity.name.trim() ? '#4ecca3' : '#2a2a4e',
            color: newActivity.name.trim() ? '#1a1a2e' : '#a0a0b0',
            fontWeight: 700,
            cursor: newActivity.name.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.95rem',
          }}
        >
          Add Activity
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
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
        }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
