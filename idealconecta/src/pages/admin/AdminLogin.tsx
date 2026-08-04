import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export function AdminLogin() {
  const { session, loading, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (session && profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (session && profile?.role !== 'admin') return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (authError) { setError('E-mail ou senha inválidos.'); setSubmitting(false); return }
    // Check if user is admin
    const { data: perfil } = await supabase.from('colaboradores').select('role').eq('id', data.user.id).single()
    if (!perfil || (perfil.role !== 'admin' && perfil.role !== 'gerente')) {
      setError('Acesso restrito a gestores e administradores.')
      await supabase.auth.signOut()
    } else {
      navigate('/admin')
    }
    setSubmitting(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card section-card">
        <div className="admin-login-header">
          <div className="admin-shield"><ShieldCheck size={32} /></div>
          <img src="/logo-ideal.jpg" alt="Ideal Empregos" className="admin-login-logo" />
          <h2>Painel Administrativo</h2>
          <p>Acesso restrito a gestores e administradores.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group"><label>E-mail corporativo</label>
            <div className="input-icon"><Mail size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nome@idealempregos.com.br" /></div>
          </div>
          <div className="input-group"><label>Senha</label>
            <div className="input-icon"><Lock size={18} />
              <input type={showPw ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••••" />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'Verificando...' : 'Entrar'}</button>
        </form>
        <button className="back-link" onClick={() => navigate('/login')}>← Sou colaborador</button>
      </div>
    </div>
  )
}
