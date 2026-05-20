import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BilingualFieldPair } from './BilingualFieldPair'
import { getProfile, upsertProfile, uploadPicture } from './profileApi'
import { SkillsSection } from './SkillsSection'
import { EducationSection } from './EducationSection'
import { CertificationsSection } from './CertificationsSection'
import { LanguagesSection } from './LanguagesSection'
import { AssignmentsSection } from './AssignmentsSection'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [introSv, setIntroSv] = useState('')
  const [introEn, setIntroEn] = useState('')
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [picturePreview, setPicturePreview] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  useEffect(() => {
    if (profile && !initialized) {
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
      setIntroSv(profile.introductionSv ?? '')
      setIntroEn(profile.introductionEn ?? '')
      setInitialized(true)
    }
  }, [profile, initialized])

  const saveMutation = useMutation({
    mutationFn: async () => {
      await upsertProfile({
        firstName,
        lastName,
        introductionSv: introSv || null,
        introductionEn: introEn || null,
      })
      if (pictureFile) {
        await uploadPicture(pictureFile)
        setPictureFile(null)
        setPicturePreview(null)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPictureFile(file)
    setPicturePreview(file ? URL.createObjectURL(file) : null)
  }

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  const displayPicture = picturePreview ?? profile?.pictureUrl ?? null

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }}
        className="flex flex-col gap-4"
      >
        <div className="flex gap-3">
          <div className="flex flex-col flex-1 gap-1">
            <label htmlFor="firstName" className="text-sm font-medium">First name</label>
            <input
              id="firstName"
              className="border rounded p-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <label htmlFor="lastName" className="text-sm font-medium">Last name</label>
            <input
              id="lastName"
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
          <label htmlFor="picture" className="text-sm font-medium">Profile picture</label>
          {displayPicture && (
            <img
              src={displayPicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          )}
          <input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {saveMutation.isError && (
          <p className="text-red-600 text-sm">Failed to save profile. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </form>
        <hr />
        <SkillsSection />
        <hr />
        <EducationSection />
        <hr />
        <CertificationsSection />
        <hr />
        <LanguagesSection />
        <hr />
        <AssignmentsSection />
    </div>
  )
}
