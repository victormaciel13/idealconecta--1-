import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Target, TrendingUp, Users, MessageSquare, Check, Search, Wrench, Heart } from 'lucide-react'

// Conjunto padrão de competências — cobre a maior parte dos cargos de
// assistente, auxiliar e analista da empresa. O admin só marca quais se
// aplicam a cada colaborador, sem digitar nada nem dar nota.
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

export function AdminPDI() {
  const [stats, setStats] = useState({ pdisAtivos: 0, pctMedio: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 })
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    const { data: pdis } = await supabase.from('pdis').select('*')
    const { count: feedbacksCount } = await supabase.from('feedbacks').select('id', { count: 'exact', head: true })
    const { count: mentoriasCount } = await supabase.from('mentoria_solicitacoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
    const { data: acoes } = await supabase.from('pdi_acoes').select('prazo, status')
    const { data: colabsData } = await supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')
    const { data: allSkills } = await supabase.from('colaborador_skills').select('colaborador_id')

    const ativos = (pdis || []).filter(p => p.status !== 'concluido')
    const pctMedio = pdis && pdis.length > 0 ? Math.round(pdis.reduce((s, p) => s + p.percentual_conclusao, 0) / pdis.length) : 0
    const atraso = (acoes || []).filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido').length

    const counts: Record<string, number> = {}
    for (const s of allSkills || []) counts[s.colaborador_id] = (counts[s.colaborador_id] || 0) + 1

    setStats({ pdisAtivos: ativos.length, pctMedio, acoesAtraso: atraso, feedbacks: feedbacksCount ?? 0, mentoriasPendentes: mentoriasCount ?? 0 })
    setColaboradores(colabsData || [])
    setSkillCounts(counts)
  }

  const filtrados = colaboradores.filter(c =>
    `${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) || (c.cargo || '').toLowerCase().includes(busca.toLowerCase())
  )

  const ini = (c: any) => `${c.nome?.[0] || ''}${c.sobrenome?.[0] || ''}`

  return (
    <div className="admin-page">
      <h1 className="page-title">PDI — Visão geral</h1>
      <p className="page-sub">Acompanhamento de desenvolvimento de todos os colaboradores.</p>

      <div className="dashboard-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--info-soft)' }}><Target size={22} color="var(--info)" /></div><div><span className="stat-value">{stats.pdisAtivos}</span><span className="stat-label">PDIs ativos</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--good-soft)' }}><TrendingUp size={22} color="var(--good)" /></div><div><span className="stat-value">{stats.pctMedio}%</span><span className="stat-label">Conclusão média</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--error-soft)' }}><Target size={22} color="var(--error)" /></div><div><span className="stat-value">{stats.acoesAtraso}</span><span className="stat-label">Ações em atraso</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--purple-soft)' }}><MessageSquare size={22} color="var(--primary-2)" /></div><div><span className="stat-value">{stats.feedbacks}</span><span className="stat-label">Feedbacks registrados</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--warn-soft)' }}><Users size={22} color="var(--warn)" /></div><div><span className="stat-value">{stats.mentoriasPendentes}</span><span className="stat-label">Mentorias pendentes</span></div></div>
      </div>

      <section className="section-card" style={{ marginTop: 20 }}>
        <div className="section-head"><h2>Hard & Soft Skills por colaborador</h2></div>
        <p className="text-muted" style={{ fontSize: 13, marginTop: -6, marginBottom: 16 }}>Clique num colaborador e marque as competências que se aplicam a ele — a partir de um conjunto padrão, sem nota.</p>

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
      </section>

      {selecionado && <SkillsColaboradorModal colaborador={selecionado} onClose={() => { setSelecionado(null); load() }} />}
    </div>
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