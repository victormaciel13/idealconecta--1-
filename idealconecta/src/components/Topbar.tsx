import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Search, Bell, MessageCircle, HelpCircle } from 'lucide-react'

export function Topbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!profile) return
    supabase.from('notificacoes').select('id', { count: 'exact', head: true })
      .eq('destinatario_id', profile.id).eq('lida', false)
      .then(({ count }) => setUnread(count ?? 0))
  }, [profile])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple keyword router — expand as more pages are indexed
    const q = busca.toLowerCase()
    if (q.includes('férias') || q.includes('ferias')) navigate('/ferias')
    else if (q.includes('holerite')) navigate('/holerite')
    else if (q.includes('benef')) navigate('/beneficios')
    else if (q.includes('comunicado')) navigate('/comunicados')
    else if (q.includes('treinamento')) navigate('/treinamentos')
    else if (q.includes('cargo')) navigate('/cargos')
    else if (q.includes('pol') || q.includes('documento')) navigate('/politicas')
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="topbar-eyebrow">Intranet Ideal</span>
        <span className="topbar-sub">Portal do Colaborador</span>
      </div>

      <form className="topbar-search" onSubmit={submitSearch}>
        <Search size={18} />
        <input placeholder="Buscar no portal..." value={busca} onChange={e => setBusca(e.target.value)} />
      </form>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" onClick={() => navigate('/notificacoes')} title="Notificações">
          <Bell size={20} />
          {unread > 0 && <span className="topbar-badge">{unread}</span>}
        </button>
        <button className="topbar-icon-btn" title="Mensagens"><MessageCircle size={20} /></button>
        <button className="topbar-icon-btn" title="Ajuda"><HelpCircle size={20} /></button>

        <div className="topbar-user">
          <div className="topbar-avatar">{profile?.nome?.[0] || profile?.sobrenome?.[0] || '👤'}{profile?.sobrenome?.[0] || ''}</div>
          <div className="topbar-user-text">
            <span>Olá, {profile?.nome ? profile.nome : 'colaborador(a)'}! 👋</span>
            <small>{greeting()}, seja bem-vindo(a)</small>
          </div>
        </div>
      </div>
    </header>
  )
}
