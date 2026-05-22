// Seeded mock data for the admin dashboard. All numbers are deterministic.
// Replace with real /admin/stats API once the backend endpoint exists.

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

export interface TimePoint { date: Date; value: number }

function generateDaily(days: number, base: number, growth: number, seed: number): TimePoint[] {
  const rng = seeded(seed)
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (days - 1 - i))
    const trend = base * Math.pow(1 + growth, i)
    const weeklyDip = (d.getDay() === 0 || d.getDay() === 6) ? 0.55 : 1
    const noise = 0.7 + rng() * 0.6
    return { date: d, value: Math.max(0, Math.round(trend * weeklyDip * noise)) }
  })
}

function bucketByWeek(daily: TimePoint[]): TimePoint[] {
  const out: TimePoint[] = []
  for (let i = 0; i < daily.length; i += 7) {
    const slice = daily.slice(i, i + 7)
    if (slice.length === 0) continue
    const value = slice.reduce((s, p) => s + p.value, 0)
    out.push({ date: slice[0].date, value })
  }
  return out
}

function bucketByMonth(daily: TimePoint[]): TimePoint[] {
  const byMonth = new Map<string, { date: Date; value: number }>()
  for (const p of daily) {
    const key = `${p.date.getFullYear()}-${p.date.getMonth()}`
    const existing = byMonth.get(key)
    if (existing) existing.value += p.value
    else byMonth.set(key, { date: new Date(p.date.getFullYear(), p.date.getMonth(), 1), value: p.value })
  }
  return [...byMonth.values()]
}

const cvsDaily = generateDaily(60, 4, 0.018, 42)
const usersDaily = generateDaily(60, 3, 0.022, 137)
const pdfsDaily = generateDaily(60, 6, 0.020, 99)

// Cumulative user growth from daily new-users
function cumulative(daily: TimePoint[]): TimePoint[] {
  let sum = 80 // starting baseline
  return daily.map(p => {
    sum += p.value
    return { date: p.date, value: sum }
  })
}

const userGrowth = cumulative(usersDaily)

function sumRange(arr: TimePoint[], days: number) {
  return arr.slice(-days).reduce((s, p) => s + p.value, 0)
}
function sumPrevRange(arr: TimePoint[], days: number) {
  return arr.slice(-days * 2, -days).reduce((s, p) => s + p.value, 0)
}

const period = 30
const totalUsers = userGrowth[userGrowth.length - 1].value
const totalUsersPrev = userGrowth[userGrowth.length - period - 1]?.value ?? totalUsers
const totalCvs = cvsDaily.reduce((s, p) => s + p.value, 0)
const totalPdfs = pdfsDaily.reduce((s, p) => s + p.value, 0)

const cvsThisPeriod = sumRange(cvsDaily, period)
const cvsPrevPeriod = sumPrevRange(cvsDaily, period)
const pdfsThisPeriod = sumRange(pdfsDaily, period)
const pdfsPrevPeriod = sumPrevRange(pdfsDaily, period)

const avgCvsPerUser = totalCvs / totalUsers
const avgCvsPerUserPrev = (totalCvs - cvsThisPeriod) / totalUsersPrev

// Weekly growth
const weeklyUserGrowth = sumRange(usersDaily, 7)

// Pricing-readiness thresholds
const target = 500
const projectedWeeksToTarget = Math.max(0, Math.round((target - totalUsers) / Math.max(weeklyUserGrowth, 1)))
const projectedDate = new Date()
projectedDate.setDate(projectedDate.getDate() + projectedWeeksToTarget * 7)

const activationRate = 0.68 // % of users who created at least one CV
const repeatRate = 0.42 // % of users who created 2+ CVs

const criteria = [
  { label: '100+ active users',           met: totalUsers >= 100,        value: `${totalUsers}` },
  { label: 'Activation rate > 30%',       met: activationRate > 0.30,    value: `${Math.round(activationRate * 100)}%` },
  { label: 'Repeat-creation > 30%',       met: repeatRate > 0.30,        value: `${Math.round(repeatRate * 100)}%` },
  { label: 'Weekly growth > 8 users',     met: weeklyUserGrowth > 8,     value: `${weeklyUserGrowth} / wk` },
  { label: 'Median 2+ CVs per user',      met: avgCvsPerUser >= 2,       value: avgCvsPerUser.toFixed(2) },
]
const score = Math.round((criteria.filter(c => c.met).length / criteria.length) * 100)
const verdict =
  score >= 80 ? { label: 'Ship pricing now', tone: 'emerald' as const, body: "Your funnel is sticky and growing. Roll out a paid plan this sprint." } :
  score >= 60 ? { label: 'Almost there',     tone: 'amber'   as const, body: "Close to monetization readiness. Tighten one or two criteria and you're set." } :
                { label: 'Keep growing',     tone: 'rose'    as const, body: "Focus on activation and repeat usage before introducing pricing." }

export const adminMock = {
  generatedAt: new Date(),
  isMock: true,

  kpis: {
    totalUsers: { value: totalUsers, prev: totalUsersPrev, spark: usersDaily.slice(-14).map(p => p.value) },
    totalCvs:   { value: totalCvs, prev: totalCvs - cvsThisPeriod + cvsPrevPeriod, spark: cvsDaily.slice(-14).map(p => p.value) },
    pdfDownloads: { value: totalPdfs, prev: totalPdfs - pdfsThisPeriod + pdfsPrevPeriod, spark: pdfsDaily.slice(-14).map(p => p.value) },
    avgCvsPerUser: { value: avgCvsPerUser, prev: avgCvsPerUserPrev, spark: [] as number[] },
  },

  cvsCreated: {
    daily:   cvsDaily.slice(-30),
    weekly:  bucketByWeek(cvsDaily),
    monthly: bucketByMonth(cvsDaily),
  },

  userGrowth: userGrowth.slice(-30),

  themeUsage: [
    { key: 'burgundy', label: 'Burgundy', count: Math.round(totalCvs * 0.46), swatch: '#B5213F' },
    { key: 'nordic',   label: 'Nordic',   count: Math.round(totalCvs * 0.33), swatch: '#1E3A5F' },
    { key: 'charcoal', label: 'Charcoal', count: Math.round(totalCvs * 0.21), swatch: '#0D1117' },
  ],

  topCompanies: [
    { name: 'Volvo Cars',         count: 28 },
    { name: 'Ericsson',           count: 22 },
    { name: 'Spotify',            count: 19 },
    { name: 'Klarna',             count: 17 },
    { name: 'H&M Group',          count: 14 },
    { name: 'Telia',              count: 12 },
    { name: 'King',               count: 11 },
    { name: 'Sinch',              count:  9 },
  ],

  activity: [
    { type: 'register' as const, who: 'erik.lindqvist@…',     when: '2 min ago'  },
    { type: 'pdf'      as const, who: 'sara.k@…',             when: '8 min ago', meta: 'Burgundy · EN' },
    { type: 'cv'       as const, who: 'marcus.j@…',           when: '14 min ago', meta: 'Volvo Cars · SV' },
    { type: 'register' as const, who: 'jens.bergh@…',         when: '32 min ago' },
    { type: 'pdf'      as const, who: 'olivia.svensson@…',    when: '47 min ago', meta: 'Charcoal · EN' },
    { type: 'cv'       as const, who: 'henrik.olsson@…',      when: '1 h ago',    meta: 'Spotify · EN' },
    { type: 'cv'       as const, who: 'malin.persson@…',      when: '1 h ago',    meta: 'Klarna · SV' },
    { type: 'register' as const, who: 'akram.h@…',            when: '2 h ago' },
  ],

  pricing: {
    targetUsers: target,
    currentUsers: totalUsers,
    weeklyUserGrowth,
    projectedWeeksToTarget,
    projectedDate,
    activationRate,
    repeatRate,
    avgCvsPerUser,
    score,
    verdict,
    criteria,
  },
}

export type AdminStats = typeof adminMock
