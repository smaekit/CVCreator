import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, Loader2, Check, X } from 'lucide-react'
import { register } from './authApi'
import { AuthShell, TextField, SubmitButton } from './AuthShell'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setPending(true)
    try {
      await register(email, password)
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0]
      setError(msg ?? 'Registration failed.')
    } finally {
      setPending(false)
    }
  }

  const pwLongEnough = password.length >= 8
  const pwHasUpper = /[A-Z]/.test(password)
  const pwHasDigit = /\d/.test(password)

  return (
    <AuthShell
      eyebrow="Get started"
      title="Make your first CV today."
      subtitle="Free while in beta. One profile, infinite tailored CVs. No credit card."
      sideQuote="One profile. Every company. A CV crafted for the door you're knocking on."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-zinc-900 underline decoration-rose-400 decoration-2 underline-offset-4 transition hover:decoration-rose-600">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <TextField
          id="register-email"
          label="Email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          autoFocus
          leadingIcon={<Mail className="h-4 w-4" />}
        />

        <div>
          <TextField
            id="register-password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
            leadingIcon={<Lock className="h-4 w-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            }
          />
          {password.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px]">
              <PwRule met={pwLongEnough} label="8+ characters" />
              <PwRule met={pwHasUpper} label="One uppercase" hint />
              <PwRule met={pwHasDigit} label="One number" hint />
            </div>
          )}
        </div>

        <SubmitButton pending={pending}>
          {pending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Sparkles className="h-4 w-4" />
          }
          Register
        </SubmitButton>

        <p className="px-1 text-center text-[11px] leading-relaxed text-zinc-500">
          By creating an account you agree to the <span className="font-semibold text-zinc-700">(eventually-existing)</span> terms.
        </p>
      </form>
    </AuthShell>
  )
}

function PwRule({ met, label, hint }: { met: boolean; label: string; hint?: boolean }) {
  return (
    <span
      className={
        met
          ? 'inline-flex items-center gap-1 font-medium text-emerald-700'
          : hint
            ? 'inline-flex items-center gap-1 text-zinc-400'
            : 'inline-flex items-center gap-1 text-zinc-500'
      }
    >
      {met
        ? <Check className="h-3 w-3" />
        : <X className="h-3 w-3" />
      }
      {label}
      {hint && !met && <span className="text-[9px] uppercase tracking-wider opacity-60">recommended</span>}
    </span>
  )
}
