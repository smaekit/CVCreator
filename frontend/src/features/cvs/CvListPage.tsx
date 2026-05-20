import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCvs, createCv, deleteCv, type CvDto } from './cvsApi'

export default function CvListPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { data: cvs = [], isLoading } = useQuery({ queryKey: ['cvs'], queryFn: getCvs })

  const [showCreate, setShowCreate] = useState(false)
  const [company, setCompany] = useState('')
  const [language, setLanguage] = useState<'SV' | 'EN'>('SV')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cvs'] })

  const createMutation = useMutation({
    mutationFn: () => createCv({ company, language }),
    onSuccess: (cv) => {
      invalidate()
      setShowCreate(false)
      navigate(`/cv/${cv.id}`)
    },
  })

  const deleteMutation = useMutation({ mutationFn: deleteCv, onSuccess: invalidate })

  function handleDelete(e: React.MouseEvent, cv: CvDto) {
    e.stopPropagation()
    if (window.confirm(`Delete "${cv.name}"?`)) deleteMutation.mutate(cv.id)
  }

  function openCreate() {
    setCompany('')
    setLanguage('SV')
    setShowCreate(true)
  }

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My CVs</h1>
        <button
          type="button"
          onClick={openCreate}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          + New CV
        </button>
      </div>

      {cvs.length === 0 ? (
        <p className="text-gray-500">No CVs yet. Create one to get started.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cvs.map(cv => (
            <li
              key={cv.id}
              onClick={() => navigate(`/cv/${cv.id}`)}
              className="border rounded-lg p-4 flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{cv.name}</span>
                <button
                  type="button"
                  onClick={e => handleDelete(e, cv)}
                  className="text-sm text-red-600 shrink-0"
                >
                  Delete
                </button>
              </div>
              <span className="text-sm text-gray-500">{cv.company} · {cv.language}</span>
              <span className="text-xs text-gray-400">
                {new Date(cv.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 flex flex-col gap-4 shadow-xl">
            <h2 className="text-lg font-semibold">New CV</h2>
            <form
              onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
              className="flex flex-col gap-3"
            >
              <input
                placeholder="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="border rounded p-2"
                required
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('SV')}
                  className={`flex-1 rounded py-2 text-sm border ${language === 'SV' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700'}`}
                >
                  SV
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('EN')}
                  className={`flex-1 rounded py-2 text-sm border ${language === 'EN' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700'}`}
                >
                  EN
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-blue-600 text-white rounded px-3 py-2 text-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded px-3 py-2 text-sm border text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
