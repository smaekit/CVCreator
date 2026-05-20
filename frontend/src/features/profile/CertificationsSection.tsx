import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BilingualFieldPair } from './BilingualFieldPair'
import { getCertifications, createCertification, updateCertification, deleteCertification, type CertificationDto } from './collectionsApi'

export function CertificationsSection() {
  const qc = useQueryClient()
  const { data: certs = [] } = useQuery({ queryKey: ['certifications'], queryFn: getCertifications })
  const [formId, setFormId] = useState<string | 'new' | null>(null)
  const [nameSv, setNameSv] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [year, setYear] = useState('')
  const [link, setLink] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['certifications'] })

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { nameSv: nameSv || null, nameEn: nameEn || null, year: parseInt(year), link: link || null }
      return formId === 'new' ? createCertification(data) : updateCertification(formId!, data)
    },
    onSuccess: () => { invalidate(); setFormId(null) },
  })

  const deleteMutation = useMutation({ mutationFn: deleteCertification, onSuccess: invalidate })

  function openNew() { setNameSv(''); setNameEn(''); setYear(''); setLink(''); setFormId('new') }
  function openEdit(c: CertificationDto) {
    setNameSv(c.nameSv ?? ''); setNameEn(c.nameEn ?? '')
    setYear(String(c.year)); setLink(c.link ?? '')
    setFormId(c.id)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Certifications</h2>
      <ul className="flex flex-col gap-1">
        {certs.map(c => (
          <li key={c.id} className="flex items-center gap-2">
            <span className="flex-1">{c.nameSv ?? c.nameEn} ({c.year})</span>
            <button type="button" onClick={() => openEdit(c)} className="text-sm text-blue-600">Edit</button>
            <button type="button" onClick={() => deleteMutation.mutate(c.id)} className="text-sm text-red-600">Delete</button>
          </li>
        ))}
      </ul>
      {formId !== null ? (
        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate() }} className="flex flex-col gap-2 border rounded p-3">
          <BilingualFieldPair
            label="Name"
            sv={nameSv}
            en={nameEn}
            onChange={(sv, en) => { setNameSv(sv); setNameEn(en) }}
          />
          <input
            id="cert-year"
            placeholder="Year"
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="border rounded p-2 w-28"
            required
          />
          <input
            placeholder="Link (optional)"
            value={link}
            onChange={e => setLink(e.target.value)}
            className="border rounded p-2"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50">
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setFormId(null)} className="text-sm text-gray-600">Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={openNew} className="self-start text-sm text-blue-600">+ Add certification</button>
      )}
    </section>
  )
}
