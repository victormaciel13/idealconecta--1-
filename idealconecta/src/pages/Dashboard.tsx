import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Umbrella, UserCircle, FileText, Edit3, Heart, Megaphone, Image as ImageIcon,
  BookOpen, Briefcase, GraduationCap, Rocket
} from 'lucide-react'
import type { Comunicado, Ferias } from '../types'

const aniversariantes = [
  { nome: 'Amanda Silva', depto: 'Recursos Humanos', dia: '03/08' },
  { nome: 'Carlos Eduardo', depto: 'Operações', dia: '08/08' },
  { nome: 'Juliana Martins', depto: 'Financeiro', dia: '15/08' },
  { nome: 'Rafael Souza', depto: 'Comercial', dia: '22/08' },
  { nome: 'Bruna Almeida', depto: 'Marketing', dia: '29/08' },
]
const avatarColors = ['#6D28D9','#2D1B69','#8B5CF6','#4C1D95','#7C3AED']

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [proximasFerias, setProximasFerias] = useState<Ferias | null>(null)
  const [fotos, setFotos] = useState<any[]>([])

  useEffect(() => {
    supabase.from('comunicados').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setComunicados(data || []))
    supabase.from('galeria').select('*').order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setFotos(data || []))
    if (profile) {
      supabase.from('ferias').select('*').eq('colaborador_id', profile.id).eq('status', 'aprovada')
        .gte('data_inicio', new Date().toISOString().slice(0, 10)).order('data_inicio', { ascending: true }).limit(1)
        .then(({ data }) => setProximasFerias(data?.[0] || null))
    }
  }, [profile])

  const tempoDeEmpresa = () => {
    if (!profile?.data_admissao) return '—'
    const inicio = new Date(profile.data_admissao)
    const hoje = new Date()
    let anos = hoje.getFullYear() - inicio.getFullYear()
    let meses = hoje.getMonth() - inicio.getMonth()
    if (meses < 0) { anos--; meses += 12 }
    return `${anos} ano${anos !== 1 ? 's' : ''} e ${meses} ${meses !== 1 ? 'meses' : 'mês'}`
  }

  const ini = (n: string) => n.split(' ').map(p => p[0]).slice(0, 2).join('')

  return (
    <div className="page dash-page">
      <div className="dash-layout">
        <div className="dash-main">
          {/* Hero banner */}
          <div className="hero-banner">
            <div className="hero-banner-text">
              <span className="hero-eyebrow">Bem-vindo(a) ao</span>
              <h1>Portal do Colaborador<br/>Ideal Empregos</h1>
              <p>Tudo o que você precisa, em um só lugar!</p>
              <button className="btn-accent" onClick={() => navigate('/politicas')}>Saiba mais</button>
            </div>
            <div className="hero-dots"><span className="dot active" /><span className="dot" /><span className="dot" /><span className="dot" /></div>
          </div>

          {/* Stat cards */}
          <div className="info-cards-row">
            <div className="info-mini-card">
              <div className="info-mini-icon"><Umbrella size={18} /></div>
              <div><span className="info-mini-label">Meu tempo de empresa</span>
                <b>{tempoDeEmpresa()}</b>
                <small>{profile?.data_admissao ? `Data de admissão: ${new Date(profile.data_admissao).toLocaleDateString('pt-BR')}` : 'Admissão não cadastrada'}</small>
              </div>
            </div>
            <div className="info-mini-card">
              <div className="info-mini-icon"><Umbrella size={18} /></div>
              <div><span className="info-mini-label">Próximas férias</span>
                {proximasFerias ? (
                  <>
                    <b>{new Date(proximasFerias.data_inicio).toLocaleDateString('pt-BR')}</b>
                    <small>a {new Date(proximasFerias.data_fim).toLocaleDateString('pt-BR')} ({proximasFerias.dias} dias)</small>
                  </>
                ) : (<><b>Nenhuma agendada</b><small>Solicite pelo módulo de Férias</small></>)}
              </div>
            </div>
            <div className="info-mini-card">
              <div className="info-mini-icon"><Briefcase size={18} /></div>
              <div><span className="info-mini-label">Minha área</span>
                <b>{profile?.departamento || 'Não definida'}</b>
                <small>{profile?.cargo || 'Cargo não definido'}</small>
              </div>
            </div>
          </div>

          {/* Comunicados + Galeria */}
          <div className="dash-two-col">
            <section className="section-card">
              <div className="section-head">
                <h2><Megaphone size={17} /> Comunicados recentes</h2>
                <button className="link-btn" onClick={() => navigate('/comunicados')}>Ver todos</button>
              </div>
              {comunicados.length === 0 ? (
                <p className="empty">Nenhum comunicado publicado ainda.</p>
              ) : (
                <ul className="mini-list">
                  {comunicados.map(c => (
                    <li key={c.id}><span>{c.titulo}</span><time>{new Date(c.created_at).toLocaleDateString('pt-BR')}</time></li>
                  ))}
                </ul>
              )}
              <button className="btn-outline full-w" onClick={() => navigate('/comunicados')}>Ver todos os comunicados</button>
            </section>

            <section className="section-card">
              <div className="section-head">
                <h2><ImageIcon size={17} /> O que rolou por aqui</h2>
                <button className="link-btn" onClick={() => navigate('/galeria')}>Ver galeria</button>
              </div>
              {fotos.length === 0 ? (
                <p className="empty">Nenhuma foto publicada ainda.</p>
              ) : (
                <div className="mini-gallery-grid">
                  {fotos.map(f => <img key={f.id} src={f.imagem_url} alt={f.titulo} />)}
                </div>
              )}
              <button className="btn-outline full-w" onClick={() => navigate('/galeria')}>Ver todas as fotos</button>
            </section>
          </div>

          {/* Quick links row */}
          <div className="quick-links-row">
            <button className="quick-link-card" onClick={() => navigate('/politicas')}>
              <BookOpen size={20} /><b>Políticas e Documentos</b>
              <p>Acesse todas as políticas, manuais e documentos importantes.</p>
              <span>Acessar</span>
            </button>
            <button className="quick-link-card" onClick={() => navigate('/cargos')}>
              <Briefcase size={20} /><b>Descrição de Cargos</b>
              <p>Consulte as descrições de cargos e responsabilidades.</p>
              <span>Acessar</span>
            </button>
            <button className="quick-link-card" onClick={() => navigate('/treinamentos')}>
              <GraduationCap size={20} /><b>Treinamentos</b>
              <p>Veja os treinamentos disponíveis e seu histórico.</p>
              <span>Acessar</span>
            </button>
          </div>
        </div>

        {/* Right rail */}
        <div className="dash-rail">
          <section className="section-card rail-card">
            <h2 className="rail-title">🚀 Acesso rápido</h2>
            <div className="quick-access-grid">
              <button onClick={() => navigate('/ferias')}><Umbrella size={20} /><span>Solicitar Férias</span></button>
              <button onClick={() => navigate('/meus-dados')}><UserCircle size={20} /><span>Perfil Profissional</span></button>
              <button onClick={() => navigate('/holerite')}><FileText size={20} /><span>Holerite</span></button>
              <button onClick={() => navigate('/meus-dados')}><Edit3 size={20} /><span>Atualizar Dados</span></button>
              <button onClick={() => navigate('/declaracoes')}><FileText size={20} /><span>Declarações</span></button>
              <button onClick={() => navigate('/beneficios')}><Heart size={20} /><span>Benefícios</span></button>
            </div>
          </section>

          <section className="section-card rail-card bday-rail">
            <div className="section-head">
              <h2 className="rail-title">🎉 Aniversariantes do mês</h2>
            </div>
            <div className="bday-rail-list">
              {aniversariantes.map((b, i) => (
                <div key={i} className="bday-rail-item">
                  <div className="bday-av" style={{ background: avatarColors[i % avatarColors.length] }}>{ini(b.nome)}</div>
                  <div><b>{b.nome}</b><small>{b.depto}</small></div>
                  <span className="bday-rail-date">{b.dia}</span>
                </div>
              ))}
            </div>
            <p className="bday-wish">🎉 Parabéns! Desejamos muita saúde e sucesso.</p>
          </section>

          <div className="oportunidades-banner">
            <Rocket size={26} />
            <b>Oportunidades internas</b>
            <p>Antes de buscar lá fora, a gente cresce aqui dentro.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
