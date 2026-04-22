import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: '1px solid #2a2a4e',
    background: '#16213e',
    color: '#fff',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    marginTop: '0.4rem',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
          <div style={{ color: '#e94560', fontWeight: 700, fontSize: '1.5rem' }}>KidPoints</div>
          <div style={{ color: '#a0a0b0', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {isSignUp ? 'Create your parent account' : 'Sign in to your account'}
          </div>
        </div>

        {error && (
          <div style={{
            background: '#3a1a1e',
            border: '1px solid #e94560',
            color: '#e94560',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: '#1a3a2e',
            border: '1px solid #4ecca3',
            color: '#4ecca3',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            border: 'none',
            background: '#e94560',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0a0b0',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
