export interface ActivityConfig {
    id: string
    name: string
    category: 'positive' | 'negative'
    inputType: 'time' | 'completion'
    pointsPerUnit: number
    unit?: string
    maxUnits?: number
    penaltyAfterMax?: number
  }
  
  export interface Settings {
    id?: string
    kidName: string
    dailyGoal: number
    weeklyGoal: number
    activityConfig: ActivityConfig[]
  }
  
  export interface ActivityLog {
    id?: string
    date: string
    activityType: string
    activityName: string
    value?: number
    unit?: string
    points: number
    note?: string
    loggedAt?: string
  }