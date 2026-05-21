export type CvThemeKey = 'burgundy' | 'nordic' | 'charcoal'

export interface CvTheme {
  key: CvThemeKey
  label: string
  swatch: string

  displayFont: string
  bodyFont: string

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
    displayFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Lora', Georgia, serif",
    accent: '#B5213F',
    sidebarBg: '#701131',
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
    swatch: '#3A3028',
    displayFont: "'Fraunces', Georgia, serif",
    bodyFont: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    accent: '#4A4038',
    sidebarBg: '#272018',
    sidebarOverlay: 'rgba(0,0,0,0.2)',
    headerBg: '#EDEAE5',
    sidebarGroupLabel: '#C2AF9A',
    sidebarItemColor: '#D0C4B8',
    sidebarAvatarBg: '#1A1510',
    nameColor: '#1A1510',
    jobTitleColor: '#4A4038',
    bodyColor: '#28231E',
    subtitleColor: '#7A716A',
    mutedColor: '#9A918A',
    dividerColor: '#C8C0B8',
    sectionLabelColor: '#4A4038',
    sectionLineOpacity: 0.3,
    zebraEven: 'white',
    zebraOdd: '#F0EDE9',
    footerColor: '#A09890',
    footerNameColor: '#4A4038',
    skillBorderColor: '#4A4038',
    skillTextColor: '#4A4038',
  },
}

export const DEFAULT_THEME: CvTheme = CV_THEMES.burgundy
