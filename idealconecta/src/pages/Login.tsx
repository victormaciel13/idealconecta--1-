import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react'

export function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'login' | 'primeiro'>('login')
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (session) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setError('E-mail ou senha inválidos.')
    else navigate('/')
    setSubmitting(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setSubmitting(true)
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: { data: { nome, sobrenome, full_name: `${nome} ${sobrenome}` } }
    })
    if (error) setError(error.message)
    else { setError(''); alert('Conta criada! Verifique seu e-mail para confirmar.'); setMode('login') }
    setSubmitting(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-box">
            <img src="/logo-ideal.jpg" alt="Ideal Empregos" className="login-logo-img" />
          </div>
          <h2>IdealConecta<br/>seu portal</h2>
          <p className="login-desc">Férias, holerite, benefícios e comunicados — tudo em um só lugar.</p>
          <ul className="login-features">
            <li><Check size={18} /> Solicite férias em poucos cliques</li>
            <li><Check size={18} /> Baixe seu holerite quando quiser</li>
            <li><Check size={18} /> Acompanhe comunicados da empresa</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <img src="/logo-ideal.jpg" alt="Ideal Empregos" className="login-mobile-logo" />
        <div className="login-card">
          <h3>{mode === 'login' ? 'Área do Colaborador' : 'Primeiro Acesso'}</h3>
          <p className="login-sub">{mode === 'login' ? 'Acesse com seu e-mail e senha.' : 'Crie sua conta para acessar o portal.'}</p>

          <div className="seg">
            <button className={`seg-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Entrar</button>
            <button className={`seg-btn ${mode === 'primeiro' ? 'active' : ''}`} onClick={() => setMode('primeiro')}>Primeiro acesso</button>
          </div>

          <button className="google-btn" onClick={handleGoogle} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Entrar com Google
          </button>

          <div className="divider"><span>ou use seu e-mail</span></div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {mode === 'primeiro' && (
              <div className="form-row">
                <div className="input-group"><label>Nome</label><input type="text" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Seu nome" /></div>
                <div className="input-group"><label>Sobrenome</label><input type="text" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required placeholder="Seu sobrenome" /></div>
              </div>
            )}
            <div className="input-group"><label>E-mail</label>
              <div className="input-icon"><Mail size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" /></div>
            </div>
            <div className="input-group"><label>Senha</label>
              <div className="input-icon"><Lock size={18} />
                <input type={showPw ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••••" minLength={6} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
        <p className="login-foot">IdealConecta · Ideal Empregos</p>
        <button className="admin-access-link" onClick={() => navigate('/admin/login')}>Acesso gestor / administrador →</button>
      </div>
    </div>
  )
}
