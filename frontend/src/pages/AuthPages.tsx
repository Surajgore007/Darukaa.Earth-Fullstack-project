import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

export function LoginPage() { return <AuthForm mode="login" /> }
export function RegisterPage() { return <AuthForm mode="register" /> }
function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const { login, register, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try { if (mode === 'login') await login(email, password); else await register(email, password, fullName); navigate('/dashboard') } catch { /* store exposes the message */ }
  }
  return <div className="auth-page"><div className="auth-panel"><Link to="/login" className="brand"><span className="brand-mark">D</span><span>Darukaa<span className="brand-muted">.Earth</span></span></Link><p className="eyebrow">LAND INTELLIGENCE PLATFORM</p><h1>{mode === 'login' ? 'Welcome back.' : 'Start mapping change.'}</h1><p className="auth-copy">Monitor the places where restoration creates a lasting difference.</p><form onSubmit={submit}>{mode === 'register' && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>{error && <div className="error-message">{error}</div>}<button className="primary-button" disabled={loading}>{loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><p className="auth-switch">{mode === 'login' ? 'New to Darukaa?' : 'Already have an account?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p></div><div className="auth-art"><div className="art-caption"><span>01</span><strong>Observe the living landscape.</strong><p>A clear view of restoration projects, sites, and the indicators that matter.</p></div></div></div>
}
