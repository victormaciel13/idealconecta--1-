import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Target, TrendingUp, Users, MessageSquare, Plus, X, Search, Wrench, Heart } from 'lucide-react'

export function AdminPDI() {
  const [stats, setStats] = useState({ pdisAtivos: 0, pctMedio: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 })
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    const { data: pdis } = await supabase.from('pdis').select('*')
    const { count: feedbacksCount } = await supabase.from('feedbacks').select('id', { count: 'exact', head: true })
    const { count: mentoriasCount } = await supabase.from('mentoria_solicitacoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
    const { data: acoes } = await supabase.from('pdi_acoes').select('prazo, status')
    const { data: colabsData } = await supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')

    const ativos = (pdis || []).filter(p => p.status !== 'concluido')
    const pctMedio = pdis && pdis.length > 0 ? Math.round(pdis.reduce((s, p) => s + p.percentual_conclusao, 0) / pdis.length) : 0
    const atraso = (acoes || []).filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido').length

    setStats({ pdisAtivos: ativos.length, pctMedio, acoesAtraso: atraso, feedbacks: feedbacksCount ?? 0, mentoriasPendentes: mentoriasCount ?? 0 })
    setColaboradores(colabsData || [])
  }

  const filtrados = colaboradores.filter(c =>
    `${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) || (c.cargo || '').toLowerCase().includes(busca.toLowerCase())
  )

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
        <div className="section-head">
          <h2>Hard & Soft Skills por colaborador</h2>
        </div>
        <p className="text-muted" style={{ fontSize: 13, marginTop: -6, marginBottom: 14 }}>Escolha um colaborador pra atribuir as competências dele. Sem nota — só a lista do que a pessoa tem.</p>

        <div className="input-icon search-bar" style={{ marginBottom: 16, maxWidth: 420 }}>
          <Search size={18} /><input placeholder="Buscar colaborador..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        <div className="colab-skill-list">
          {filtrados.map(c => (
            <button key={c.id} className="colab-skill-row" onClick={() => setSelecionado(c)}>
              <div className="colab-mini-avatar">{c.nome?.[0]}{c.sobrenome?.[0]}</div>
              <div><b>{c.nome} {c.sobrenome}</b><small>{c.cargo || 'Cargo não definido'}</small></div>
            </button>
          ))}
        </div>
      </section>

      {selecionado && <SkillsColaboradorModal colaborador={selecionado} onClose={() => setSelecionado(null)} />}
    </div>
  )
}

function SkillsColaboradorModal({ colaborador, onClose }: { colaborador: any; onClose: () => void }) {
  const [skills, setSkills] = useState<any[]>([])
  const [novaHard, setNovaHard] = useState('')
  const [novaSoft, setNovaSoft] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('colaborador_skills').select('*').eq('colaborador_id', colaborador.id).order('created_at')
    setSkills(data || [])
    setLoading(false)
  }

  const adicionar = async (nome: string, tipo: 'tecnica' | 'comportamental') => {
    if (!nome.trim()) return
    await supabase.from('colaborador_skills').insert({ colaborador_id: colaborador.id, nome: nome.trim(), tipo })
    if (tipo === 'tecnica') setNovaHard(''); else setNovaSoft('')
    load()
  }

  const remover = async (id: string) => {
    await supabase.from('colaborador_skills').delete().eq('id', id)
    load()
  }

  const hard = skills.filter(s => s.tipo === 'tecnica')
  const soft = skills.filter(s => s.tipo === 'comportamental')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3>{colaborador.nome} {colaborador.sobrenome}</h3>
        <p className="text-muted" style={{ fontSize: 13, marginTop: -4, marginBottom: 16 }}>{colaborador.cargo || 'Cargo não definido'}</p>

        {loading ? <p className="empty">Carregando...</p> : (
          <>
            <div className="skill-editor-block">
              <label><Wrench size={14} /> Hard Skills</label>
              <div className="skill-tag-list" style={{ marginBottom: 10 }}>
                {hard.length === 0 && <span className="text-muted" style={{ fontSize: 12.5 }}>Nenhuma ainda.</span>}
                {hard.map(s => (
                  <span key={s.id} className="skill-tag tecnica removable">
                    {s.nome} <button onClick={() => remover(s.id)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="skill-add-row">
                <input value={novaHard} onChange={e => setNovaHard(e.target.value)} placeholder="Ex: Excel avançado" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionar(novaHard, 'tecnica'))} />
                <button type="button" className="btn-ghost" onClick={() => adicionar(novaHard, 'tecnica')}><Plus size={14} /></button>
              </div>
            </div>

            <div className="skill-editor-block" style={{ marginTop: 18 }}>
              <label><Heart size={14} /> Soft Skills</label>
              <div className="skill-tag-list" style={{ marginBottom: 10 }}>
                {soft.length === 0 && <span className="text-muted" style={{ fontSize: 12.5 }}>Nenhuma ainda.</span>}
                {soft.map(s => (
                  <span key={s.id} className="skill-tag comportamental removable">
                    {s.nome} <button onClick={() => remover(s.id)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="skill-add-row">
                <input value={novaSoft} onChange={e => setNovaSoft(e.target.value)} placeholder="Ex: Comunicação" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionar(novaSoft, 'comportamental'))} />
                <button type="button" className="btn-ghost" onClick={() => adicionar(novaSoft, 'comportamental')}><Plus size={14} /></button>
              </div>
            </div>
          </>
        )}

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button type="button" className="btn-primary" onClick={onClose}>Concluído</button>
        </div>
      </div>
    </div>
  )
}