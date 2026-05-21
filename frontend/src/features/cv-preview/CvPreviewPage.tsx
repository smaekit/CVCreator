import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CVPreview } from './CVPreview'
import type { ResolvedCv } from '../cv-builder/cvBuilderApi'

export default function CvPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [cv, setCv] = useState<ResolvedCv | null>(null)

  useEffect(() => {
    if (!id || !token) return
    fetch(`/api/cvs/${id}/preview?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCv(data) })
  }, [id, token])

  if (!cv) return <div>Loading…</div>
  return <CVPreview cv={cv} />
}
