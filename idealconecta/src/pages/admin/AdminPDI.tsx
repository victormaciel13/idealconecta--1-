import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  Target, TrendingUp, Users, MessageSquare, Check, Search, Wrench, Heart, Calendar,
  BookOpen, Plus, Trash2, Filter
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

type Tab = 'painel' | 'competencias' | 'mentorias' | 'feedbacks' | 'trilhas'

export function AdminPDI() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('painel')
  const [equipe, setEquipe] = useState<any[]>([]) // colaboradores visíveis: todos (admin) ou só a equipe (gerente)
  const [loadingEquipe, setLoadingEquipe] = useState(true)
  const isSoGestor = profile?.role === 'gerente'

  useEffect(() => { if (profile) loadEquipe() }, [profile])

  async function loadEquipe() {
    setLoadingEquipe(true)
    let query = supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')
    if (isSoGestor) query = query.eq('gestor_id', profile!.id)
    const { data } = await query
    setEquipe(data || [])
    setLoadingEquipe(false)
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">PDI — Visão geral</h1>
      <p className="page-sub">{isSoGestor ? 'Acompanhamento de desenvolvimento da sua equipe.' : 'Acompanhamento de desenvolvimento de todos os colaboradores.'}</p>

      <div className="pdi-tabs">
        <button className={tab === 'painel' ? 'active' : ''} onClick={() => setTab('painel')}><Target size={15} /> Painel</button>
        <button className={tab === 'competencias' ? 'active' : ''} onClick={() => setTab('competencias')}><TrendingUp size={15} /> Competências</button>
        <button className={tab === 'mentorias' ? 'active' : ''} onClick={() => setTab('mentorias')}><Users size={15} /> Mentorias</button>
        <button className={tab === 'feedbacks' ? 'active' : ''} onClick={() => setTab('feedbacks')}><MessageSquare size={15} /> Feedbacks</button>
        <button className={tab === 'trilhas' ? 'active' : ''} onClick={() => setTab('trilhas')}><BookOpen size={15} /> Trilhas</button>
      </div>

      {loadingEquipe ? <p className="empty">Carregando...</p> : (
        <>
          {tab === 'painel' && <PainelTab equipe={equipe} />}
          {tab === 'competencias' && <CompetenciasTab equipe={equipe} isSoGestor={isSoGestor} />}
          {tab === 'mentorias' && <MentoriasTab equipe={equipe} isSoGestor={isSoGestor} />}
          {tab === 'feedbacks' && <FeedbacksTab equipe={equipe} isSoGestor={isSoGestor} />}
          {tab === 'trilhas' && <TrilhasTab />}
        </>
      )}
    </div>
  )
}

function PainelTab({ equipe }: { equipe: any[] }) {
  const [stats, setStats] = useState({ pdisAtivos: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 })
  const [evolucao, setEvolucao] = useState<any[]>([])
  const equipeIds = equipe.map(c => c.id)

  useEffect(() => {
    if (equipeIds.length === 0) { setEvolucao([]); setStats({ pdisAtivos: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 }); return }
    Promise.all([
      supabase.from('pdis').select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome)').in('colaborador_id', equipeIds),
      supabase.from('feedbacks').select('id', { count: 'exact', head: true }).in('destinatario_id', equipeIds),
      supabase.from('mentoria_solicitacoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente').in('colaborador_id', equipeIds),
    ]).then(async ([pdisRes, fbRes, mentRes]) => {
      const pdis = pdisRes.data || []
      const ativos = pdis.filter(p => p.status !== 'concluido')
      const pdiIds = pdis.map(p => p.id)
      let atraso = 0
      if (pdiIds.length > 0) {
        const { data: acoes } = await supabase.from('pdi_acoes').select('prazo, status').in('pdi_id', pdiIds)
        atraso = (acoes || []).filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido').length
      }
      setStats({ pdisAtivos: ativos.length, acoesAtraso: atraso, feedbacks: fbRes.count ?? 0, mentoriasPendentes: mentRes.count ?? 0 })
      setEvolucao(pdis.map((p: any) => ({ nome: `${p.colaborador?.nome} ${p.colaborador?.sobrenome}`, pct: p.percentual_conclusao })).sort((a, b) => b.pct - a.pct))
    })
  }, [equipe.length])

  return (
    <>
      <div className="dashboard-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--info-soft)' }}><Target size={22} color="var(--info)" /></div><div><span className="stat-value">{stats.pdisAtivos}</span><span className="stat-label">PDIs ativos</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--error-soft)' }}><Target size={22} color="var(--error)" /></div><div><span className="stat-value">{stats.acoesAtraso}</span><span className="stat-label">Ações em atraso</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--purple-soft)' }}><MessageSquare size={22} color="var(--primary-2)" /></div><div><span className="stat-value">{stats.feedbacks}</span><span className="stat-label">Feedbacks registrados</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--warn-soft)' }}><Users size={22} color="var(--warn)" /></div><div><span className="stat-value">{stats.mentoriasPendentes}</span><span className="stat-label">Mentorias pendentes</span></div></div>
      </div>

      <section className="section-card" style={{ marginTop: 20 }}>
        <h2>Evolução do PDI por colaborador</h2>
        <p className="text-muted" style={{ fontSize: 12.5, marginTop: -10, marginBottom: 16 }}>Percentual de conclusão do ciclo atual — sem nota, só o quanto já foi feito.</p>
        {evolucao.length === 0 ? <p className="empty">Nenhum PDI encontrado ainda.</p> : (
          <div className="evo-list">
            {evolucao.map((e, i) => (
              <div key={i} className="evo-row">
                <span className="evo-nome">{e.nome}</span>
                <div className="comp-bar-track" style={{ flex: 1 }}><div className="comp-bar-atual" style={{ width: `${e.pct}%` }} /></div>
                <span className="evo-pct">{e.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function CompetenciasTab({ equipe, isSoGestor }: { equipe: any[]; isSoGestor: boolean }) {
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  const [filtroDepto, setFiltroDepto] = useState('')
  const [filtroCargo, setFiltroCargo] = useState('')
  const [selecionado, setSelecionado] = useState<any>(null)

  useEffect(() => { loadCounts() }, [equipe.length])
  async function loadCounts() {
    const ids = equipe.map(c => c.id)
    if (ids.length === 0) { setSkillCounts({}); return }
    const { data } = await supabase.from('colaborador_skills').select('colaborador_id').in('colaborador_id', ids)
    const counts: Record<string, number> = {}
    for (const s of data || []) counts[s.colaborador_id] = (counts[s.colaborador_id] || 0) + 1
    setSkillCounts(counts)
  }

  const deptos = [...new Set(equipe.map(c => c.departamento).filter(Boolean))]
  const cargos = [...new Set(equipe.map(c => c.cargo).filter(Boolean))]

  const filtrados = equipe.filter(c =>
    (`${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) || (c.cargo || '').toLowerCase().includes(busca.toLowerCase())) &&
    (!filtroDepto || c.departamento === filtroDepto) &&
    (!filtroCargo || c.cargo === filtroCargo)
  )
  const ini = (c: any) => `${c.nome?.[0] || ''}${c.sobrenome?.[0] || ''}`

  return (
    <section className="section-card">
      <p className="text-muted" style={{ fontSize: 13, marginTop: -4, marginBottom: 16 }}>Clique num colaborador e marque as competências que se aplicam a ele — a partir de um conjunto padrão, sem nota.</p>

      <div className="filter-row">
        <div className="input-icon search-bar" style={{ margin: 0, maxWidth: 320 }}>
          <Search size={18} /><input placeholder="Buscar colaborador..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        {!isSoGestor && (
          <select value={filtroDepto} onChange={e => setFiltroDepto(e.target.value)} className="role-select">
            <option value="">Todas as áreas</option>
            {deptos.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <select value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)} className="role-select">
          <option value="">Todos os cargos</option>
          {cargos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="empty">{equipe.length === 0 ? 'Nenhum colaborador na sua equipe ainda — peça ao admin pra te definir como gestor de alguém.' : 'Nenhum colaborador encontrado com esse filtro.'}</p>
      ) : (
        <div className="cargo-icon-grid">
          {filtrados.map(c => (
            <button key={c.id} className="cargo-icon-card" onClick={() => setSelecionado(c)}>
              <div className="cargo-icon-badge colab-badge">{ini(c)}</div>
              <b>{c.nome} {c.sobrenome}</b>
              <span className="cargo-icon-hint">{skillCounts[c.id] || 0} competência(s)</span>
            </button>
          ))}
        </div>
      )}

      {selecionado && <SkillsColaboradorModal colaborador={selecionado} onClose={() => { setSelecionado(null); loadCounts() }} />}
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

function MentoriasTab({ equipe, isSoGestor }: { equipe: any[]; isSoGestor: boolean }) {
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  useEffect(() => { load() }, [equipe.length])
  async function load() {
    setLoading(true)
    const ids = equipe.map(c => c.id)
    if (ids.length === 0) { setSolicitacoes([]); setLoading(false); return }
    const { data } = await supabase.from('mentoria_solicitacoes')
      .select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome), mentor:mentores(nome)')
      .in('colaborador_id', ids)
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

  const filtradas = solicitacoes.filter(s => {
    if (periodoInicio && s.created_at < periodoInicio) return false
    if (periodoFim && s.created_at > periodoFim + 'T23:59:59') return false
    return true
  })

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <section className="section-card">
      <div className="filter-row">
        <Filter size={15} style={{ color: 'var(--muted)' }} />
        <label className="text-muted" style={{ fontSize: 12.5 }}>Período:</label>
        <input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} className="role-select" style={{ padding: '6px 10px' }} />
        <span className="text-muted" style={{ fontSize: 12.5 }}>até</span>
        <input type="date" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} className="role-select" style={{ padding: '6px 10px' }} />
      </div>

      {filtradas.length === 0 ? <p className="empty">{isSoGestor && equipe.length === 0 ? 'Você ainda não tem colaboradores na sua equipe.' : 'Nenhuma solicitação de mentoria nesse período.'}</p> : (
        <div className="approval-list">
          {filtradas.map(s => (
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

function FeedbacksTab({ equipe, isSoGestor }: { equipe: any[]; isSoGestor: boolean }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  useEffect(() => {
    const ids = equipe.map(c => c.id)
    if (ids.length === 0) { setFeedbacks([]); setLoading(false); return }
    setLoading(true)
    supabase.from('feedbacks')
      .select('*, autor:colaboradores!autor_id(nome, sobrenome), destinatario:colaboradores!destinatario_id(nome, sobrenome)')
      .in('destinatario_id', ids)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setFeedbacks(data || []); setLoading(false) })
  }, [equipe.length])

  const filtrados = feedbacks.filter(f => {
    if (periodoInicio && f.created_at < periodoInicio) return false
    if (periodoFim && f.created_at > periodoFim + 'T23:59:59') return false
    return true
  })

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <section className="section-card">
      <div className="filter-row">
        <Filter size={15} style={{ color: 'var(--muted)' }} />
        <label className="text-muted" style={{ fontSize: 12.5 }}>Período:</label>
        <input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} className="role-select" style={{ padding: '6px 10px' }} />
        <span className="text-muted" style={{ fontSize: 12.5 }}>até</span>
        <input type="date" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} className="role-select" style={{ padding: '6px 10px' }} />
      </div>

      {filtrados.length === 0 ? <p className="empty">{isSoGestor && equipe.length === 0 ? 'Você ainda não tem colaboradores na sua equipe.' : 'Nenhum feedback nesse período.'}</p> : (
        <table className="data-table">
          <thead><tr><th>De</th><th>Para</th><th>Categoria</th><th>Confidencial</th><th>Data</th></tr></thead>
          <tbody>
            {filtrados.map(f => (
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

function TrilhasTab() {
  const [trilhas, setTrilhas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('trilhas_desenvolvimento').select('*').order('titulo')
    setTrilhas(data || [])
    setLoading(false)
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir essa trilha de desenvolvimento?')) return
    await supabase.from('trilhas_desenvolvimento').delete().eq('id', id)
    load()
  }

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <section className="section-card">
      <div className="section-head">
        <h2>Trilhas de desenvolvimento</h2>
        <button className="link-btn" onClick={() => setShowModal(true)}><Plus size={14} /> Nova trilha</button>
      </div>
      {trilhas.length === 0 ? <p className="empty">Nenhuma trilha cadastrada ainda.</p> : (
        <div className="trilha-list">
          {trilhas.map(t => (
            <div key={t.id} className="trilha-card">
              <div style={{ flex: 1 }}>
                <b>{t.titulo}</b>
                {t.competencia_relacionada && <span className="tag" style={{ marginLeft: 8 }}>{t.competencia_relacionada}</span>}
                {t.descricao && <p className="text-muted" style={{ fontSize: 13, margin: '6px 0' }}>{t.descricao}</p>}
                {t.cursos && (
                  <ul className="trilha-cursos">
                    {t.cursos.split('\n').filter((l: string) => l.trim()).map((curso: string, i: number) => <li key={i}>{curso}</li>)}
                  </ul>
                )}
              </div>
              <button className="icon-btn danger" onClick={() => excluir(t.id)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {showModal && <NovaTrilhaModal onClose={() => setShowModal(false)} onCreated={load} />}
    </section>
  )
}

function NovaTrilhaModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [titulo, setTitulo] = useState(''); const [descricao, setDescricao] = useState('')
  const [competencia, setCompetencia] = useState(''); const [cursos, setCursos] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo) return
    setSalvando(true)
    await supabase.from('trilhas_desenvolvimento').insert({
      titulo, descricao: descricao || null, competencia_relacionada: competencia || null, cursos: cursos || null,
    })
    setSalvando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Nova trilha de desenvolvimento</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Trilha de Excel avançado" /></div>
          <div className="input-group"><label>Competência relacionada (opcional)</label><input value={competencia} onChange={e => setCompetencia(e.target.value)} placeholder="Ex: Excel" /></div>
          <div className="input-group"><label>Descrição</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} /></div>
          <div className="input-group"><label>Cursos / recursos recomendados (um por linha)</label><textarea value={cursos} onChange={e => setCursos(e.target.value)} rows={4} placeholder={'Ex:\nCurso de Excel Intermediário - Alura\nPlaylist Excel na Prática - YouTube'} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar trilha'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}