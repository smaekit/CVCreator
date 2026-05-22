import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Award, ExternalLink, Pencil, Trash2, Check, X, Calendar, Link2, AlertCircle } from 'lucide-react'
import { BilingualFieldPair } from './BilingualFieldPair'
import { getCertifications, createCertification, updateCertification, deleteCertification, type CertificationDto } from './collectionsApi'
import { SectionCard, EmptyState, IconButton, FieldLabel } from './AssignmentsSection'

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
    <SectionCard
      icon={<Award className="h-5 w-5" />}
      accentClass="bg-emerald-50 text-emerald-600 ring-emerald-100"
      title="Certifications"
      count={certs.length}
      onAdd={formId === null ? openNew : undefined}
      addLabel="+ Add certification"
    >
      {certs.length === 0 && formId === null && (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title="No certifications yet"
          hint="AWS, Azure, CKA, Scrum… anything that backs your claims with a third-party stamp."
        />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {certs.map(c => {
          if (formId === c.id) {
            return (
              <div key={c.id} className="sm:col-span-2">
                <CertificationForm
                  nameSv={nameSv} nameEn={nameEn}
                  setNameSv={setNameSv} setNameEn={setNameEn}
                  year={year} setYear={setYear}
                  link={link} setLink={setLink}
                  onCancel={() => setFormId(null)}
                  onSubmit={() => saveMutation.mutate()}
                  isPending={saveMutation.isPending}
                />
              </div>
            )
          }
          const hasSv = !!c.nameSv
          const hasEn = !!c.nameEn
          return (
            <article
              key={c.id}
              className="group relative flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-emerald-200 hover:shadow-[0_2px_8px_rgba(16,185,129,0.08)]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/60 ring-1 ring-emerald-200">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                {/* Test asserts findByText(`${nameSv ?? nameEn} (${year})`) — keep as single text node */}
                <h3 className="text-sm font-semibold text-zinc-900 leading-tight">
                  {(c.nameSv ?? c.nameEn)} ({c.year})
                </h3>
                {hasSv && hasEn && c.nameSv !== c.nameEn && (
                  <p className="mt-0.5 text-[11px] italic text-zinc-500">
                    {c.nameSv === (c.nameSv ?? c.nameEn) ? c.nameEn : c.nameSv}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    <span className="tabular-nums">{c.year}</span>
                  </span>
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify
                    </a>
                  )}
                  {(!hasSv || !hasEn) && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Missing {!hasSv ? 'SV' : 'EN'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <IconButton onClick={() => openEdit(c)} label="Edit">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </IconButton>
                <IconButton onClick={() => deleteMutation.mutate(c.id)} label="Delete" tone="danger">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </IconButton>
              </div>
            </article>
          )
        })}
      </div>

      {formId === 'new' && (
        <div className="mt-3">
          <CertificationForm
            nameSv={nameSv} nameEn={nameEn}
            setNameSv={setNameSv} setNameEn={setNameEn}
            year={year} setYear={setYear}
            link={link} setLink={setLink}
            onCancel={() => setFormId(null)}
            onSubmit={() => saveMutation.mutate()}
            isPending={saveMutation.isPending}
          />
        </div>
      )}
    </SectionCard>
  )
}

function CertificationForm(p: {
  nameSv: string; nameEn: string
  setNameSv: (s: string) => void; setNameEn: (s: string) => void
  year: string; setYear: (s: string) => void
  link: string; setLink: (s: string) => void
  onCancel: () => void; onSubmit: () => void; isPending: boolean
}) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); p.onSubmit() }}
      className="flex flex-col gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4"
    >
      <BilingualFieldPair
        label="Name"
        sv={p.nameSv}
        en={p.nameEn}
        onChange={(sv, en) => { p.setNameSv(sv); p.setNameEn(en) }}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
        <div>
          <FieldLabel icon={<Calendar className="h-3.5 w-3.5" />}>Year</FieldLabel>
          <input
            id="cert-year"
            placeholder="Year"
            type="number"
            value={p.year}
            onChange={e => p.setYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            required
          />
        </div>
        <div>
          <FieldLabel icon={<Link2 className="h-3.5 w-3.5" />}>Verification link (optional)</FieldLabel>
          <input
            placeholder="Link (optional)"
            value={p.link}
            onChange={e => p.setLink(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={p.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {p.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={p.onCancel}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </form>
  )
}
