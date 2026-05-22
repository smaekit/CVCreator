import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { login } from './authApi'
import { AuthShell, TextField, SubmitButton } from './AuthShell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const token = await login(email, password)
      localStorage.setItem('token', token)
      navigate('/cvs')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your studio."
      subtitle="Open the dashboard, compose another CV, ship it to a new opportunity."
      sideQuote="Every great application starts with a CV that knows exactly where it's going."
      footer={
        <span>
          New to Pitchpaper?{' '}
          <Link to="/register" className="font-semibold text-zinc-900 underline decoration-rose-400 decoration-2 underline-offset-4 transition hover:decoration-rose-600">
            Create an account
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
          id="login-email"
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

        <TextField
          id="login-password"
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
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

        <SubmitButton pending={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
          {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
