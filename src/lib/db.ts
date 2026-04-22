import { supabase } from './supabase'
import { Settings, ActivityLog } from '../types'

// ── Settings ──────────────────────────────────────────

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    kidName: data.kid_name,
    dailyGoal: data.daily_goal,
    weeklyGoal: data.weekly_goal,
    activityConfig: data.activity_config,
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const payload = {
    kid_name: settings.kidName,
    daily_goal: settings.dailyGoal,
    weekly_goal: settings.weeklyGoal,
    activity_config: settings.activityConfig,
  }

  if (settings.id) {
    await supabase.from('settings').update(payload).eq('id', settings.id)
  } else {
    await supabase.from('settings').insert(payload)
  }
}

// ── Activity Logs ──────────────────────────────────────

export async function getLogs(
  from: string,
  to: string
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('logged_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    date: row.date,
    activityType: row.activity_type,
    activityName: row.activity_name,
    value: row.value,
    unit: row.unit,
    points: row.points,
    note: row.note,
    loggedAt: row.logged_at,
  }))
}

export async function saveLog(log: ActivityLog): Promise<void> {
  await supabase.from('activity_logs').insert({
    date: log.date,
    activity_type: log.activityType,
    activity_name: log.activityName,
    value: log.value,
    unit: log.unit,
    points: log.points,
    note: log.note,
  })
}

export async function deleteLog(id: string): Promise<void> {
  await supabase.from('activity_logs').delete().eq('id', id)
}