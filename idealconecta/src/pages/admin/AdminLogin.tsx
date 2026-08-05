import { useState, useEffect, useRef } from 'react'
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
  const [checking, setChecking] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // A verificação de permissão observa o MESMO perfil global (useAuth) que o
  // ProtectedRoute usa — nada de consulta separada aqui. Assim as duas partes
  // do app sempre concordam sobre quem é admin, sem corrida entre elas.
  // Só decide quando: já não está "loading" E já temos um profile carregado.
  useEffect(() => {
    if (!checking) return
    if (loading) return           // contexto ainda buscando a sessão/perfil — espera
    if (!profile) return          // sessão já ok, mas perfil ainda não chegou — espera mais um instante

    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }

    if (profile.role === 'admin' || profile.role === 'gerente') {
      navigate('/admin', { replace: true })
    } else {
      setError('Este e-mail não tem permissão de gestor ou administrador.')
      supabase.auth.signOut()
      setChecking(false)
    }
  }, [checking, loading, profile, navigate])

  // Rede de segurança: se por qualquer motivo o perfil nunca chegar
  // (ex: cadastro sem linha em "colaboradores"), não trava para sempre em
  // "Verificando permissões..." — avisa e libera o formulário de novo.
  useEffect(() => {
    if (checking) {
      timeoutRef.current = setTimeout(() => {
        setChecking(false)
        setError('Não foi possível confirmar seu acesso. Verifique se seu usuário está cadastrado na tabela colaboradores e tente novamente.')
      }, 8000)
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [checking])

  if (loading && !checking) return <div className="loading-screen"><div className="spinner" /></div>
  if (session && !checking && !loading && profile) {
    if (profile.role === 'admin' || profile.role === 'gerente') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: senha })
    setSubmitting(false)
    if (authError) { setError('E-mail ou senha inválidos.'); return }
    setChecking(true) // o useEffect acima espera o perfil carregar e então decide
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card section-card">
        <div className="admin-login-header">
          <div className="admin-shield"><ShieldCheck size={32} /></div>
          <img src="/logo-ideal.png" alt="Ideal Empregos" className="admin-login-logo" />
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
          <button type="submit" className="submit-btn" disabled={submitting || checking}>
            {submitting ? 'Entrando...' : checking ? 'Verificando permissões...' : 'Entrar'}
          </button>
        </form>
        <button className="back-link" onClick={() => navigate('/login')}>← Sou colaborador</button>
      </div>
    </div>
  )
}