export type CvThemeKey = 'burgundy' | 'nordic' | 'charcoal'

export interface CvTheme {
  key: CvThemeKey
  label: string
  swatch: string

  displayFont: string
  bodyFont: string
  monoFont?: string

  accent: string
  sidebarBg: string
  sidebarOverlay: string
  headerBg: string

  sidebarGroupLabel: string
  sidebarItemColor: string
  sidebarAvatarBg: string

  nameColor: string
  jobTitleColor: string
  bodyColor: string
  subtitleColor: string
  mutedColor: string

  dividerColor: string
  sectionLabelColor: string
  sectionLineOpacity: number

  zebraEven: string
  zebraOdd: string

  footerColor: string
  footerNameColor: string

  skillBorderColor: string
  skillTextColor: string
}

export const CV_THEMES: Record<CvThemeKey, CvTheme> = {
  burgundy: {
    key: 'burgundy',
    label: 'Burgundy',
    swatch: '#B5213F',
    displayFont: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif",
    bodyFont: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
    monoFont: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
    accent: '#B5213F',
    sidebarBg: '#912c4c',
    sidebarOverlay: 'rgba(10,0,5,0.22)',
    headerBg: '#F0E8E0',
    sidebarGroupLabel: '#E8A98A',
    sidebarItemColor: '#DDD5CF',
    sidebarAvatarBg: '#5C1028',
    nameColor: '#1A1A1A',
    jobTitleColor: '#B5213F',
    bodyColor: '#2A2A2A',
    subtitleColor: '#7A7370',
    mutedColor: '#9A9A9A',
    dividerColor: '#C8C0BB',
    sectionLabelColor: '#B5213F',
    sectionLineOpacity: 0.25,
    zebraEven: 'white',
    zebraOdd: '#F5EFE9',
    footerColor: '#AAA',
    footerNameColor: '#B5213F',
    skillBorderColor: '#B5213F',
    skillTextColor: '#B5213F',
  },
  nordic: {
    key: 'nordic',
    label: 'Nordic',
    swatch: '#1E3A5F',
    displayFont: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    bodyFont: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    accent: '#1E3A5F',
    sidebarBg: '#0F2540',
    sidebarOverlay: 'rgba(0,5,15,0.28)',
    headerBg: '#C8DDEF',
    sidebarGroupLabel: '#82B8E0',
    sidebarItemColor: '#C0D8EE',
    sidebarAvatarBg: '#0A1E35',
    nameColor: '#0A1929',
    jobTitleColor: '#1E3A5F',
    bodyColor: '#162034',
    subtitleColor: '#4A6380',
    mutedColor: '#7A98B4',
    dividerColor: '#B0C8DE',
    sectionLabelColor: '#1E3A5F',
    sectionLineOpacity: 0.3,
    zebraEven: 'white',
    zebraOdd: '#EAF3FB',
    footerColor: '#85A5C0',
    footerNameColor: '#1E3A5F',
    skillBorderColor: '#1E3A5F',
    skillTextColor: '#1E3A5F',
  },
  charcoal: {
    key: 'charcoal',
    label: 'Charcoal',
    swatch: '#0D1117',
    displayFont: "'Mona Sans', 'Segoe UI', system-ui, sans-serif",
    bodyFont: "'Mona Sans', 'Segoe UI', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
    accent: '#1F6FEB',
    sidebarBg: '#0D1117',
    sidebarOverlay: 'rgba(255,255,255,0.025)',
    headerBg: '#0D1117',
    sidebarGroupLabel: '#7D8590',
    sidebarItemColor: '#E6EDF3',
    sidebarAvatarBg: '#161B22',
    nameColor: '#0D1117',
    jobTitleColor: '#1F6FEB',
    bodyColor: '#1F2328',
    subtitleColor: '#656D76',
    mutedColor: '#8B949E',
    dividerColor: '#D0D7DE',
    sectionLabelColor: '#0D1117',
    sectionLineOpacity: 0.85,
    zebraEven: 'white',
    zebraOdd: '#F6F8FA',
    footerColor: '#8B949E',
    footerNameColor: '#1F6FEB',
    skillBorderColor: '#D0D7DE',
    skillTextColor: '#1F2328',
  },
}

export const DEFAULT_THEME: CvTheme = CV_THEMES.burgundy
