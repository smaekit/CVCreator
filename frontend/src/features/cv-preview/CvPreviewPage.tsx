import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CVPreview } from './CVPreview'
import { CV_THEMES, DEFAULT_THEME, type CvThemeKey } from './cvThemes'
import type { ResolvedCv } from '../cv-builder/cvBuilderApi'

export default function CvPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const themeKey = (searchParams.get('theme') ?? 'burgundy') as CvThemeKey
  const theme = CV_THEMES[themeKey] ?? DEFAULT_THEME
  const [cv, setCv] = useState<ResolvedCv | null>(null)

  useEffect(() => {
    if (!id || !token) return
    fetch(`/api/cvs/${id}/preview?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCv(data) })
  }, [id, token])

  if (!cv) return <div>Loading…</div>
  return (
    <>
      {/* Authoritative print page setup. Tells Chrome exactly what an A4 page is
          and that there are no margins. Overrides whatever defaults the printToPDF
          protocol would apply. Combined with PuppeteerSharp's PreferCSSPageSize
          this becomes the single source of truth for page geometry. */}
      <style>{`
        @page { size: 794px 1123px; margin: 0; }
        html, body { margin: 0; padding: 0; }
      `}</style>
      <CVPreview cv={cv} theme={theme} />
    </>
  )
}
