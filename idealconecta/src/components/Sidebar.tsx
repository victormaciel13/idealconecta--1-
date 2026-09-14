import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home, Megaphone, BookOpen, Briefcase, Target, GraduationCap, Video,
  Umbrella, Heart, Image as ImageIcon, Award, LogOut, Rocket
} from 'lucide-react'

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-block">
          <div className="brand-logo-box"><img src="/logo-ideal.png" alt="Ideal Empregos" className="brand-logo-img" /></div>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={18} /><span>Início</span>
        </NavLink>
        <NavLink to="/comunicados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Megaphone size={18} /><span>Comunicados</span>
        </NavLink>
        <NavLink to="/politicas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} /><span>Políticas e Documentos</span>
        </NavLink>
        <NavLink to="/cargos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Briefcase size={18} /><span>Descrição de Cargos</span>
        </NavLink>
        <NavLink to="/pdi" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Target size={18} /><span>Meu PDI</span>
        </NavLink>
        <NavLink to="/treinamentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GraduationCap size={18} /><span>Treinamentos</span>
        </NavLink>
        <NavLink to="/palestras" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Video size={18} /><span>Palestras</span>
        </NavLink>
        <NavLink to="/ferias" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Umbrella size={18} /><span>Férias e Solicitações</span>
        </NavLink>
        <NavLink to="/beneficios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Heart size={18} /><span>Benefícios</span>
        </NavLink>
        <NavLink to="/galeria" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ImageIcon size={18} /><span>Galeria de Fotos</span>
        </NavLink>
        <NavLink to="/reconhecimentos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Award size={18} /><span>Reconhecimentos</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} /><span>Sair</span>
        </button>
      </div>

      <div className="sidebar-cta">
        <Rocket size={22} />
        <b>Ideal<br />é para toda vida!</b>
      </div>
    </aside>
  )
}