import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SUPER_ADMIN_EMAIL } from '../lib/types'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Determine where to redirect after successful login
  const redirectAfterLogin = async (userEmail: string) => {
    if (userEmail === SUPER_ADMIN_EMAIL) {
      navigate('/super-admin', { replace: true })
      return
    }

    // Check if user has school memberships
    const { data: memberships } = await supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .limit(1)

    if (memberships && memberships.length > 0) {
      navigate(`/school/${memberships[0].school_id}`, { replace: true })
    } else {
      navigate('/no-access', { replace: true })
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (supabaseError) {
        if (supabaseError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (supabaseError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.')
        } else if (supabaseError.message.includes('Too many requests')) {
          setError('Too many login attempts. Please try again later.')
        } else {
          setError(supabaseError.message || 'Sign in failed. Please try again.')
        }
        return
      }

      console.log('Signed in successfully', data)
      await redirectAfterLogin(email.trim())
    } catch {
      setError('Sign in failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter a password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    setLoading(true)
    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      })

      if (supabaseError) {
        if (supabaseError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (supabaseError.message.includes('Invalid email')) {
          setError('The email address is invalid.')
        } else if (supabaseError.message.includes('Password should be at least')) {
          setError('Password is too short. Please use a stronger password.')
        } else {
          setError(supabaseError.message || 'Sign up failed. Please try again.')
        }
        return
      }

      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }

      if (data?.user?.email_confirmed_at) {
        console.log('Signed up and confirmed successfully', data)
        await redirectAfterLogin(email.trim())
      } else {
        setSuccess('Account created successfully! Please check your email to confirm your account before signing in.')
        // Clear password fields after successful signup
        setPassword('')
        setConfirmPassword('')
      }
    } catch {
      setError('Sign up failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    clearMessages()
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setRemember(false)
    setShowPassword(false)
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <h1>School Management</h1>
        <p>
          {mode === 'signin'
            ? 'Welcome back! Please sign in to your account.'
            : 'Create an account to get started.'}
        </p>
      </header>

      <form
        className="login-card"
        onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
        noValidate
      >
        {error && <div className="login-error" role="alert">{error}</div>}
        {success && <div className="login-success" role="status">{success}</div>}

        {mode === 'signup' && (
          <>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </>
        )}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete={mode === 'signin' ? 'username' : 'email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrap">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {mode === 'signup' && (
          <>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrap">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </>
        )}

        {mode === 'signin' && (
          <div className="login-row">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
          </div>
        )}

        <button type="submit" className="primary" disabled={loading}>
          {loading
            ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
            : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>
      </form>

      <footer className="login-footer">
        <p>
          {mode === 'signin'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              switchMode(mode === 'signin' ? 'signup' : 'signin')
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </a>
        </p>
        <p>Need help? <a href="#" onClick={(e) => e.preventDefault()}>Contact Support</a></p>
      </footer>
    </main>
  )
}
