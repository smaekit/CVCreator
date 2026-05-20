import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BilingualFieldPair } from './BilingualFieldPair'

interface Profile {
  firstName: string
  lastName: string
  pictureUrl: string | null
  introductionSv: string | null
  introductionEn: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [introSv, setIntroSv] = useState('')
  const [introEn, setIntroEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [pictureFile, setPictureFile] = useState<File | null>(null)

  useEffect(() => {
    api.get<Profile>('/profile').then((res) => {
      const p = res.data
      setProfile(p)
      setFirstName(p.firstName)
      setLastName(p.lastName)
      setIntroSv(p.introductionSv ?? '')
      setIntroEn(p.introductionEn ?? '')
    }).catch(() => {})
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', {
        firstName,
        lastName,
        introductionSv: introSv || null,
        introductionEn: introEn || null,
      })
      if (pictureFile) {
        const form = new FormData()
        form.append('file', pictureFile)
        const res = await api.post<{ url: string }>('/profile/picture', form)
        setProfile((p) => p ? { ...p, pictureUrl: res.data.url } : p)
        setPictureFile(null)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col flex-1 gap-1">
            <label className="text-sm font-medium">First name</label>
            <input
              className="border rounded p-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <label className="text-sm font-medium">Last name</label>
            <input
              className="border rounded p-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <BilingualFieldPair
          label="Introduction"
          sv={introSv}
          en={introEn}
          onChange={(sv, en) => { setIntroSv(sv); setIntroEn(en) }}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Profile picture</label>
          {profile?.pictureUrl && (
            <img src={profile.pictureUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-2" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setPictureFile(e.target.files?.[0] ?? null)} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
