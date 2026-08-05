import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Search, Bell, MessageCircle, HelpCircle, CheckCheck } from 'lucide-react'

export function Topbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [unread, setUnread] = useState(0)
  const [notifs, setNotifs] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (profile) loadNotifs() }, [profile])

  async function loadNotifs() {
    const { data } = await supabase.from('notificacoes').select('*').eq('destinatario_id', profile!.id).order('created_at', { ascending: false }).limit(15)
    setNotifs(data || [])
    setUnread((data || []).filter(n => !n.lida).length)
  }

  // Fecha os dropdowns ao clicar fora deles
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifs(false)
      if (helpRef.current && !helpRef.current.contains(target)) setShowHelp(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const marcarLida = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    loadNotifs()
  }

  const marcarTodasLidas = async () => {
    if (!profile) return
    await supabase.from('notificacoes').update({ lida: true }).eq('destinatario_id', profile.id).eq('lida', false)
    loadNotifs()
  }

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
        <div className="topbar-popper" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={() => { setShowNotifs(s => !s); setShowHelp(false) }} title="Notificações">
            <Bell size={20} />
            {unread > 0 && <span className="topbar-badge">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="topbar-panel">
              <div className="topbar-panel-head">
                <b>Notificações</b>
                {unread > 0 && <button className="link-btn" onClick={marcarTodasLidas}><CheckCheck size={13} /> Marcar todas como lidas</button>}
              </div>
              {notifs.length === 0 ? (
                <p className="empty" style={{ padding: '20px 16px' }}>Nenhuma notificação por aqui.</p>
              ) : (
                <div className="topbar-panel-list">
                  {notifs.map(n => (
                    <button key={n.id} className={`topbar-notif-item ${!n.lida ? 'unread' : ''}`} onClick={() => marcarLida(n.id)}>
                      {!n.lida && <span className="topbar-notif-dot" />}
                      <div>
                        <b>{n.titulo}</b>
                        {n.mensagem && <p>{n.mensagem}</p>}
                        <time>{new Date(n.created_at).toLocaleDateString('pt-BR')}</time>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-popper">
          <button className="topbar-icon-btn" title="Mensagens (em breve)" disabled><MessageCircle size={20} /></button>
        </div>

        <div className="topbar-popper" ref={helpRef}>
          <button className="topbar-icon-btn" onClick={() => { setShowHelp(s => !s); setShowNotifs(false) }} title="Ajuda">
            <HelpCircle size={20} />
          </button>
          {showHelp && (
            <div className="topbar-panel topbar-panel-help">
              <div className="topbar-panel-head"><b>Precisa de ajuda?</b></div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 13, margin: '4px 0' }}>Fale com seu Gestor 😁</p>
              
              </div>
            </div>
          )}
        </div>

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