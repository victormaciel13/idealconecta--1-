import { useEffect, useState } from 'react'
import { useNavigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  Users, Megaphone, CheckSquare, Award, GraduationCap, BookOpen,
  Image, BarChart3, LogOut, Home
} from 'lucide-react'

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Visão geral', end: true },
  { to: '/admin/colaboradores', icon: Users, label: 'Colaboradores' },
  { to: '/admin/comunicados', icon: Megaphone, label: 'Comunicados' },
  { to: '/admin/aprovacoes', icon: CheckSquare, label: 'Aprovação de Férias' },
  { to: '/admin/reconhecimentos', icon: Award, label: 'Reconhecimentos' },
  { to: '/admin/treinamentos', icon: GraduationCap, label: 'Treinamentos' },
  { to: '/admin/treinamentos-acessos', icon: BarChart3, label: 'Acessos aos Treinamentos' },
  { to: '/admin/galeria', icon: Image, label: 'Galeria' },
  { to: '/admin/politicas', icon: BookOpen, label: 'Políticas' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/admin/login') }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-logo-box"><img src="/logo-ideal.jpg" alt="Ideal Empregos" className="brand-logo-img" /></div>
          <span className="admin-brand-label">Painel Admin</span>
        </div>
        <nav className="admin-nav">
          {adminLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <l.icon size={18} /> <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <NavLink to="/" className="admin-nav-item"><Home size={18} /> <span>Portal do colaborador</span></NavLink>
          <div className="admin-user">
            <div className="user-avatar">{profile?.nome?.[0]}{profile?.sobrenome?.[0]}</div>
            <div><span className="user-name">{profile?.nome}</span><span className="user-role">Admin</span></div>
          </div>
          <button className="admin-nav-item logout" onClick={handleSignOut}><LogOut size={18} /> <span>Sair</span></button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}

export function AdminHome() {
  const [stats, setStats] = useState({ colabs: 0, comunicados: 0, feriasPend: 0, treinamentos: 0, acessosTreino: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('colaboradores').select('id', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('comunicados').select('id', { count: 'exact', head: true }),
      supabase.from('ferias').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('treinamentos').select('id', { count: 'exact', head: true }),
      supabase.from('treinamento_acessos').select('id', { count: 'exact', head: true }),
    ]).then(([c, com, f, t, ta]) => {
      setStats({ colabs: c.count ?? 0, comunicados: com.count ?? 0, feriasPend: f.count ?? 0, treinamentos: t.count ?? 0, acessosTreino: ta.count ?? 0 })
    })
  }, [])

  return (
    <div className="admin-page">
      <h1 className="page-title">Visão geral</h1>
      <p className="page-sub">Painel de controle — Ideal Empregos</p>
      <div className="dashboard-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--accent-soft)' }}><Users size={22} color="var(--accent)" /></div><div><span className="stat-value">{stats.colabs}</span><span className="stat-label">Colaboradores ativos</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--info-soft)' }}><Megaphone size={22} color="var(--info)" /></div><div><span className="stat-value">{stats.comunicados}</span><span className="stat-label">Comunicados</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--warn-soft)' }}><CheckSquare size={22} color="var(--warn)" /></div><div><span className="stat-value">{stats.feriasPend}</span><span className="stat-label">Férias pendentes</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--good-soft)' }}><GraduationCap size={22} color="var(--good)" /></div><div><span className="stat-value">{stats.treinamentos}</span><span className="stat-label">Treinamentos</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--purple-soft)' }}><Users size={22} color="var(--primary-2)" /></div><div><span className="stat-value">{stats.acessosTreino}</span><span className="stat-label">Acessos a treinamentos</span></div></div>
      </div>
    </div>
  )
}
