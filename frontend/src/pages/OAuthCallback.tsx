import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveSession, type AuthUser } from '../lib/api'
import { toast } from 'sonner'

export default function OAuthCallback() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    window.history.replaceState(null, '', window.location.pathname)
    if (!token) { toast.error('Social sign-in did not return a valid session.'); navigate('/auth/login', { replace: true }); return }
    saveSession(token, { id: '', name: '', email: '', githubConnected: false })
    api.get<{ user: AuthUser }>('/auth/me').then(({ data }) => { saveSession(token, data.user); navigate('/app/dashboard', { replace: true }) }).catch(() => { toast.error('Could not verify your account. Please try again.'); navigate('/auth/login', { replace: true }) })
  }, [navigate])
  return <div className="auth-page"><div className="auth-form-wrap">Completing secure sign-in…</div></div>
}
