import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Camera, Save, Check, AlertCircle, Sparkles } from 'lucide-react'
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

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const displayPicture = picturePreview ?? profile?.pictureUrl ?? null
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your name'
  const hasUnsavedPicture = !!pictureFile

  // Profile completeness — rough heuristic
  const filledCount = [firstName, lastName, introSv, introEn, displayPicture].filter(Boolean).length
  const completeness = Math.round((filledCount / 5) * 100)

  return (
    <div
      className="min-h-screen bg-zinc-50/60"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Page header */}
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
              <Sparkles className="h-3 w-3" />
              Your profile
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Tell the world who you are
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              The single source of truth. Every CV is composed from the pieces below.
            </p>
          </div>
          <div className="hidden flex-col items-end gap-1 sm:flex">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 tabular-nums">{completeness}% complete</span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }}
          className="flex flex-col gap-6"
        >
          {/* Hero card */}
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            {/* Decorative gradient band */}
            <div className="h-20 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400" />

            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
                {/* Picture */}
                <label
                  htmlFor="picture"
                  className="group relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl bg-white shadow-md ring-4 ring-white"
                >
                  {displayPicture
                    ? (
                      <img
                        src={displayPicture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    )
                    : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400">
                        <User className="h-10 w-10" />
                      </div>
                    )
                  }
                  <div className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                    <div className="flex flex-col items-center">
                      <Camera className="h-5 w-5" />
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">Change</span>
                    </div>
                  </div>
                  {hasUnsavedPicture && (
                    <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 ring-2 ring-white" title="Unsaved">
                      <AlertCircle className="h-3 w-3 text-amber-900" />
                    </span>
                  )}
                </label>
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  aria-label="Profile picture"
                  className="sr-only"
                />

                {/* Name + summary */}
                <div className="flex flex-1 flex-col gap-1 pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Display name
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                    {fullName}
                  </h2>
                </div>
              </div>

              {/* Name fields */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-xs font-semibold text-zinc-600">
                    First name
                  </label>
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Marcus"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-xs font-semibold text-zinc-600">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Jakobsson"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>

              {/* Introduction */}
              <div className="mt-4">
                <BilingualFieldPair
                  label="Introduction"
                  sv={introSv}
                  en={introEn}
                  onChange={(sv, en) => { setIntroSv(sv); setIntroEn(en) }}
                />
              </div>

              {/* Save row */}
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                <div className="text-xs text-zinc-500">
                  {saveMutation.isSuccess && !saveMutation.isPending && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </span>
                  )}
                  {saveMutation.isError && (
                    <span className="inline-flex items-center gap-1 text-red-700">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Failed to save profile. Please try again.
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </section>
        </form>

        {/* Section cards — outside the form to keep their own mini-forms isolated */}
        <div className="mt-6 flex flex-col gap-6">
          <AssignmentsSection />
          <SkillsSection />
          <EducationSection />
          <CertificationsSection />
          <LanguagesSection />
        </div>
      </div>
    </div>
  )
}
