import { api } from '../../lib/api'

export interface TimePoint { date: Date; value: number }

export interface Kpi { value: number; prev: number; spark: number[] }

export interface AdminStats {
  generatedAt: Date
  kpis: {
    totalUsers: Kpi
    totalCvs: Kpi
    pdfDownloads: Kpi
    avgCvsPerUser: Kpi
  }
  cvsCreated: {
    daily: TimePoint[]
    weekly: TimePoint[]
    monthly: TimePoint[]
  }
  userGrowth: TimePoint[]
  themeUsage: { key: string; label: string; count: number; swatch: string }[]
  topCompanies: { name: string; count: number }[]
  activity: { type: 'register' | 'cv' | 'pdf'; who: string; when: string; meta?: string | null }[]
  pricing: {
    targetUsers: number
    currentUsers: number
    weeklyUserGrowth: number
    projectedWeeksToTarget: number
    projectedDate: Date
    activationRate: number
    repeatRate: number
    avgCvsPerUser: number
    score: number
    verdict: { label: string; tone: 'emerald' | 'amber' | 'rose'; body: string }
    criteria: { label: string; met: boolean; value: string }[]
  }
}

// Server returns ISO-strings for dates; map them to Date for the chart components
interface ServerTimePoint { date: string; value: number }
interface ServerAdminStats extends Omit<AdminStats, 'generatedAt' | 'cvsCreated' | 'userGrowth' | 'pricing'> {
  generatedAt: string
  cvsCreated: { daily: ServerTimePoint[]; weekly: ServerTimePoint[]; monthly: ServerTimePoint[] }
  userGrowth: ServerTimePoint[]
  pricing: Omit<AdminStats['pricing'], 'projectedDate'> & { projectedDate: string }
}

function hydratePoints(points: ServerTimePoint[]): TimePoint[] {
  return points.map(p => ({ date: new Date(p.date), value: p.value }))
}

export async function getAdminStats(days = 30): Promise<AdminStats> {
  const { data } = await api.get<ServerAdminStats>('/admin/stats', { params: { days } })
  return {
    ...data,
    generatedAt: new Date(data.generatedAt),
    cvsCreated: {
      daily: hydratePoints(data.cvsCreated.daily),
      weekly: hydratePoints(data.cvsCreated.weekly),
      monthly: hydratePoints(data.cvsCreated.monthly),
    },
    userGrowth: hydratePoints(data.userGrowth),
    pricing: { ...data.pricing, projectedDate: new Date(data.pricing.projectedDate) },
  }
}
