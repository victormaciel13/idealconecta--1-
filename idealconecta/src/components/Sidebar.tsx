import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home, Megaphone, BookOpen, Briefcase, GraduationCap, Plane,
  Heart, Image, Award, LogOut, Rocket, Target
} from 'lucide-react'

const colabLinks = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/comunicados', icon: Megaphone, label: 'Comunicados' },
  { to: '/politicas', icon: BookOpen, label: 'Políticas e Documentos' },
  { to: '/cargos', icon: Briefcase, label: 'Descrição de Cargos' },
  { to: '/pdi', icon: Target, label: 'Meu PDI' },
  { to: '/treinamentos', icon: GraduationCap, label: 'Treinamentos' },
  { to: '/ferias', icon: Plane, label: 'Férias e Solicitações' },
  { to: '/beneficios', icon: Heart, label: 'Benefícios' },
  { to: '/galeria', icon: Image, label: 'Galeria de Fotos' },
  { to: '/reconhecimentos', icon: Award, label: 'Reconhecimentos' },
]

export function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => { await signOut(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo-box"><img src="/logo-ideal.jpg" alt="Ideal Empregos" className="brand-logo-img" /></div>
      </div>

      <nav className="nav-links">
        {colabLinks.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={l.to === '/'}>
            <l.icon size={19} />
            <span>{l.label}</span>
          </NavLink>
        ))}
        <button className="nav-item" onClick={handleSignOut}>
          <LogOut size={19} />
          <span>Sair</span>
        </button>
      </nav>

      <div className="sidebar-cta">
        <Rocket size={22} />
        <b>Ideal<br/>é para toda vida!</b>
      </div>
    </aside>
  )
}