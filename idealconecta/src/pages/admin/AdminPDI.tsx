import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Target, TrendingUp, Users, MessageSquare, Check, Search, Wrench, Heart, Calendar
} from 'lucide-react'

const HARD_SKILLS_PADRAO = [
  'Excel', 'Pacote Office', 'Sistemas de folha de pagamento', 'Sistemas de ponto',
  'Legislação trabalhista (CLT)', 'Recrutamento e seleção (ATS)', 'Atendimento ao cliente',
  'Redação de documentos e relatórios', 'Organização de arquivos e processos', 'Indicadores e relatórios (KPIs)',
]
const SOFT_SKILLS_PADRAO = [
  'Comunicação', 'Resiliência', 'Trabalho em equipe', 'Organização', 'Proatividade',
  'Senso de urgência', 'Adaptabilidade', 'Ética e confidencialidade', 'Orientação a resultados',
  'Inteligência emocional', 'Atenção a detalhes', 'Gestão do tempo',
]

type Tab = 'painel' | 'competencias' | 'mentorias' | 'feedbacks'

export function AdminPDI() {
  const [tab, setTab] = useState<Tab>('painel')

  return (
    <div className="admin-page">
      <h1 className="page-title">PDI — Visão geral</h1>
      <p className="page-sub">Acompanhamento de desenvolvimento de todos os colaboradores.</p>

      <div className="pdi-tabs">
        <button className={tab === 'painel' ? 'active' : ''} onClick={() => setTab('painel')}><Target size={15} /> Painel</button>
        <button className={tab === 'competencias' ? 'active' : ''} onClick={() => setTab('competencias')}><TrendingUp size={15} /> Competências</button>
        <button className={tab === 'mentorias' ? 'active' : ''} onClick={() => setTab('mentorias')}><Users size={15} /> Mentorias</button>
        <button className={tab === 'feedbacks' ? 'active' : ''} onClick={() => setTab('feedbacks')}><MessageSquare size={15} /> Feedbacks</button>
      </div>

      {tab === 'painel' && <PainelTab />}
      {tab === 'competencias' && <CompetenciasTab />}
      {tab === 'mentorias' && <MentoriasTab />}
      {tab === 'feedbacks' && <FeedbacksTab />}
    </div>
  )
}

function PainelTab() {
  const [stats, setStats] = useState({ pdisAtivos: 0, pctMedio: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('pdis').select('*'),
      supabase.from('feedbacks').select('id', { count: 'exact', head: true }),
      supabase.from('mentoria_solicitacoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('pdi_acoes').select('prazo, status'),
    ]).then(([pdisRes, fbRes, mentRes, acoesRes]) => {
      const pdis = pdisRes.data || []
      const ativos = pdis.filter(p => p.status !== 'concluido')
      const pctMedio = pdis.length > 0 ? Math.round(pdis.reduce((s, p) => s + p.percentual_conclusao, 0) / pdis.length) : 0
      const atraso = (acoesRes.data || []).filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido').length
      setStats({ pdisAtivos: ativos.length, pctMedio, acoesAtraso: atraso, feedbacks: fbRes.count ?? 0, mentoriasPendentes: mentRes.count ?? 0 })
    })
  }, [])

  return (
    <div className="dashboard-grid">
      <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--info-soft)' }}><Target size={22} color="var(--info)" /></div><div><span className="stat-value">{stats.pdisAtivos}</span><span className="stat-label">PDIs ativos</span></div></div>
      <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--good-soft)' }}><TrendingUp size={22} color="var(--good)" /></div><div><span className="stat-value">{stats.pctMedio}%</span><span className="stat-label">Conclusão média</span></div></div>
      <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--error-soft)' }}><Target size={22} color="var(--error)" /></div><div><span className="stat-value">{stats.acoesAtraso}</span><span className="stat-label">Ações em atraso</span></div></div>
      <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--purple-soft)' }}><MessageSquare size={22} color="var(--primary-2)" /></div><div><span className="stat-value">{stats.feedbacks}</span><span className="stat-label">Feedbacks registrados</span></div></div>
      <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--warn-soft)' }}><Users size={22} color="var(--warn)" /></div><div><span className="stat-value">{stats.mentoriasPendentes}</span><span className="stat-label">Mentorias pendentes</span></div></div>
    </div>
  )
}

function CompetenciasTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    const { data: colabsData } = await supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')
    const { data: allSkills } = await supabase.from('colaborador_skills').select('colaborador_id')
    const counts: Record<string, number> = {}
    for (const s of allSkills || []) counts[s.colaborador_id] = (counts[s.colaborador_id] || 0) + 1
    setColaboradores(colabsData || [])
    setSkillCounts(counts)
  }

  const filtrados = colaboradores.filter(c =>
    `${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) || (c.cargo || '').toLowerCase().includes(busca.toLowerCase())
  )
  const ini = (c: any) => `${c.nome?.[0] || ''}${c.sobrenome?.[0] || ''}`

  return (
    <section className="section-card">
      <p className="text-muted" style={{ fontSize: 13, marginTop: -4, marginBottom: 16 }}>Clique num colaborador e marque as competências que se aplicam a ele — a partir de um conjunto padrão, sem nota.</p>

      <div className="input-icon search-bar" style={{ marginBottom: 18, maxWidth: 420 }}>
        <Search size={18} /><input placeholder="Buscar colaborador..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="cargo-icon-grid">
        {filtrados.map(c => (
          <button key={c.id} className="cargo-icon-card" onClick={() => setSelecionado(c)}>
            <div className="cargo-icon-badge colab-badge">{ini(c)}</div>
            <b>{c.nome} {c.sobrenome}</b>
            <span className="cargo-icon-hint">{skillCounts[c.id] || 0} competência(s)</span>
          </button>
        ))}
      </div>

      {selecionado && <SkillsColaboradorModal colaborador={selecionado} onClose={() => { setSelecionado(null); load() }} />}
    </section>
  )
}

function SkillsColaboradorModal({ colaborador, onClose }: { colaborador: any; onClose: () => void }) {
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('colaborador_skills').select('*').eq('colaborador_id', colaborador.id)
    setSkills(data || [])
    setLoading(false)
  }

  const isMarcado = (nome: string, tipo: string) => skills.some(s => s.nome === nome && s.tipo === tipo)
  const idDaSkill = (nome: string, tipo: string) => skills.find(s => s.nome === nome && s.tipo === tipo)?.id

  const toggle = async (nome: string, tipo: 'tecnica' | 'comportamental') => {
    if (isMarcado(nome, tipo)) {
      const id = idDaSkill(nome, tipo)
      if (id) await supabase.from('colaborador_skills').delete().eq('id', id)
    } else {
      await supabase.from('colaborador_skills').insert({ colaborador_id: colaborador.id, nome, tipo })
    }
    load()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <h3>{colaborador.nome} {colaborador.sobrenome}</h3>
        <p className="text-muted" style={{ fontSize: 13, marginTop: -4, marginBottom: 18 }}>{colaborador.cargo || 'Cargo não definido'}</p>

        {loading ? <p className="empty">Carregando...</p> : (
          <>
            <div className="skill-editor-block">
              <label><Wrench size={14} /> Hard Skills</label>
              <div className="skill-toggle-grid">
                {HARD_SKILLS_PADRAO.map(nome => (
                  <button key={nome} type="button" className={`skill-toggle ${isMarcado(nome, 'tecnica') ? 'checked' : ''}`} onClick={() => toggle(nome, 'tecnica')}>
                    {isMarcado(nome, 'tecnica') && <Check size={13} />} {nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="skill-editor-block" style={{ marginTop: 20 }}>
              <label><Heart size={14} /> Soft Skills</label>
              <div className="skill-toggle-grid">
                {SOFT_SKILLS_PADRAO.map(nome => (
                  <button key={nome} type="button" className={`skill-toggle soft ${isMarcado(nome, 'comportamental') ? 'checked' : ''}`} onClick={() => toggle(nome, 'comportamental')}>
                    {isMarcado(nome, 'comportamental') && <Check size={13} />} {nome}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="modal-actions" style={{ marginTop: 22 }}>
          <button type="button" className="btn-primary" onClick={onClose}>Concluído</button>
        </div>
      </div>
    </div>
  )
}

function MentoriasTab() {
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('mentoria_solicitacoes')
      .select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome), mentor:mentores(nome)')
      .order('created_at', { ascending: false })
    setSolicitacoes(data || [])
    setLoading(false)
  }

  const atualizarStatus = async (id: string, status: string) => {
    await supabase.from('mentoria_solicitacoes').update({ status }).eq('id', id)
    load()
  }

  const statusLabel: Record<string, string> = { pendente: 'Pendente', aceita: 'Aceita', recusada: 'Recusada', reagendada: 'Reagendada', concluida: 'Concluída' }
  const statusColor: Record<string, string> = { pendente: 'var(--warn)', aceita: 'var(--info)', recusada: 'var(--error)', reagendada: 'var(--muted)', concluida: 'var(--good)' }

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <section className="section-card">
      {solicitacoes.length === 0 ? <p className="empty">Nenhuma solicitação de mentoria ainda.</p> : (
        <div className="approval-list">
          {solicitacoes.map(s => (
            <div key={s.id} className="approval-card">
              <div className="approval-header">
                <strong>{s.colaborador?.nome} {s.colaborador?.sobrenome} → {s.mentor?.nome}</strong>
                <span style={{ color: statusColor[s.status] }}>{statusLabel[s.status]}</span>
              </div>
              <p style={{ fontSize: 13.5, margin: '4px 0 10px' }}><b>Tema:</b> {s.tema}</p>
              {s.objetivo && <p className="text-muted" style={{ fontSize: 13, margin: '2px 0' }}>{s.objetivo}</p>}
              <div className="pdi-acao-meta" style={{ margin: '8px 0' }}>
                {s.data_preferida && <span><Calendar size={12} style={{ marginRight: 4 }} />{new Date(s.data_preferida).toLocaleDateString('pt-BR')}</span>}
                {s.formato && <span style={{ textTransform: 'capitalize' }}>{s.formato}</span>}
              </div>
              {s.status === 'pendente' && (
                <div className="approval-actions">
                  <button className="btn-approve" onClick={() => atualizarStatus(s.id, 'aceita')}>Aceitar</button>
                  <button className="btn-reject" onClick={() => atualizarStatus(s.id, 'recusada')}>Recusar</button>
                </div>
              )}
              {s.status === 'aceita' && (
                <div className="approval-actions">
                  <button className="btn-approve" onClick={() => atualizarStatus(s.id, 'concluida')}>Marcar concluída</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function FeedbacksTab() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('feedbacks')
      .select('*, autor:colaboradores!autor_id(nome, sobrenome), destinatario:colaboradores!destinatario_id(nome, sobrenome)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setFeedbacks(data || []); setLoading(false) })
  }, [])

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <section className="section-card">
      {feedbacks.length === 0 ? <p className="empty">Nenhum feedback registrado ainda.</p> : (
        <table className="data-table">
          <thead><tr><th>De</th><th>Para</th><th>Categoria</th><th>Confidencial</th><th>Data</th></tr></thead>
          <tbody>
            {feedbacks.map(f => (
              <tr key={f.id}>
                <td>{f.autor?.nome} {f.autor?.sobrenome}</td>
                <td>{f.destinatario?.nome} {f.destinatario?.sobrenome}</td>
                <td style={{ textTransform: 'capitalize' }}>{f.categoria}</td>
                <td>{f.confidencial ? 'Sim' : 'Não'}</td>
                <td>{new Date(f.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}