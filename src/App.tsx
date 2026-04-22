import { useState, useEffect, useCallback } from 'react'
import { Settings, ActivityLog } from './types'
import { getSettings, saveSettings, getLogs } from './lib/db'
import { defaultSettings } from './data/defaultSettings'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LogActivity from './components/LogActivity'
import History from './components/History'
import SettingsPanel from './components/Settings'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return monday.toISOString().slice(0, 10)
}

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [todayLogs, setTodayLogs] = useState<ActivityLog[]>([])
  const [weekLogs, setWeekLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSettings() {
    let s = await getSettings()
    if (!s) {
      await saveSettings(defaultSettings)
      s = await getSettings()
    }
    setSettings(s ?? defaultSettings)
  }

  const loadLogs = useCallback(async () => {
    const today = getToday()
    const weekStart = getWeekStart()
    const [tLogs, wLogs] = await Promise.all([
      getLogs(today, today),
      getLogs(weekStart, today),
    ])
    setTodayLogs(tLogs)
    setWeekLogs(wLogs)
  }, [])

  useEffect(() => {
    async function init() {
      await loadSettings()
      await loadLogs()
      setLoading(false)
    }
    init()
  }, [loadLogs])

  function handleSettingsSaved(newSettings: Settings) {
    setSettings(newSettings)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.2rem',
      }}>
        Loading KidPoints...
      </div>
    )
  }

  if (!settings) return null

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <Header
        kidName={settings.kidName}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            settings={settings}
            todayLogs={todayLogs}
            weekLogs={weekLogs}
          />
        )}
        {currentView === 'log' && (
          <LogActivity
            settings={settings}
            onLogged={loadLogs}
          />
        )}
        {currentView === 'history' && (
          <History onRefresh={loadLogs} />
        )}
        {currentView === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSaved={handleSettingsSaved}
          />
        )}
      </main>
    </div>
  )
}