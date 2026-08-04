import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Target, TrendingUp, Users, MessageSquare, Plus } from 'lucide-react'

export function AdminPDI() {
  const [stats, setStats] = useState({ pdisAtivos: 0, pctMedio: 0, acoesAtraso: 0, feedbacks: 0, mentoriasPendentes: 0 })
  const [cargos, setCargos] = useState<any[]>([])
  const [competencias, setCompetencias] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const { data: pdis } = await supabase.from('pdis').select('*')
    const { count: feedbacksCount } = await supabase.from('feedbacks').select('id', { count: 'exact', head: true })
    const { count: mentoriasCount } = await supabase.from('mentoria_solicitacoes').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
    const { data: acoes } = await supabase.from('pdi_acoes').select('prazo, status')
    const { data: cargosData } = await supabase.from('cargos').select('*').order('titulo')
    const { data: compData } = await supabase.from('competencias').select('*, cargo:cargos(titulo)').order('created_at', { ascending: false })

    const ativos = (pdis || []).filter(p => p.status !== 'concluido')
    const pctMedio = pdis && pdis.length > 0 ? Math.round(pdis.reduce((s, p) => s + p.percentual_conclusao, 0) / pdis.length) : 0
    const atraso = (acoes || []).filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido').length

    setStats({ pdisAtivos: ativos.length, pctMedio, acoesAtraso: atraso, feedbacks: feedbacksCount ?? 0, mentoriasPendentes: mentoriasCount ?? 0 })
    setCargos(cargosData || [])
    setCompetencias(compData || [])
  }

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
          <h2>Competências cadastradas por cargo</h2>
          <button className="link-btn" onClick={() => setShowModal(true)}><Plus size={14} /> Nova competência</button>
        </div>
        {competencias.length === 0 ? (
          <p className="empty">Nenhuma competência cadastrada. Cadastre as competências técnicas e comportamentais de cada cargo pra habilitar o comparativo de nível no PDI dos colaboradores.</p>
        ) : (
          <table className="data-table"><thead><tr><th>Competência</th><th>Cargo</th><th>Tipo</th><th>Nível esperado</th></tr></thead>
            <tbody>{competencias.map(c => (
              <tr key={c.id}>
                <td>{c.nome}</td><td>{c.cargo?.titulo || '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.tipo}</td><td>{c.nivel_esperado}/5</td>
              </tr>
            ))}</tbody></table>
        )}
      </section>

      {showModal && <NovaCompetenciaModal cargos={cargos} onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  )
}

function NovaCompetenciaModal({ cargos, onClose, onCreated }: { cargos: any[]; onClose: () => void; onCreated: () => void }) {
  const [nome, setNome] = useState(''); const [cargoId, setCargoId] = useState('')
  const [tipo, setTipo] = useState('tecnica'); const [nivelEsperado, setNivelEsperado] = useState('3')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    await supabase.from('competencias').insert({
      nome, cargo_id: cargoId || null, tipo, nivel_esperado: parseInt(nivelEsperado),
    })
    setSalvando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Nova competência</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Nome da competência</label><input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Gestão de indicadores" /></div>
          <div className="input-group"><label>Cargo vinculado</label>
            <select value={cargoId} onChange={e => setCargoId(e.target.value)}>
              <option value="">Geral (todos os cargos)</option>
              {cargos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Tipo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="tecnica">Técnica</option><option value="comportamental">Comportamental</option>
              </select></div>
            <div className="input-group"><label>Nível esperado (1-5)</label>
              <select value={nivelEsperado} onChange={e => setNivelEsperado(e.target.value)}>
                <option value="1">1 — Necessita desenvolvimento</option><option value="2">2 — Básico</option>
                <option value="3">3 — Atende ao esperado</option><option value="4">4 — Acima do esperado</option>
                <option value="5">5 — Referência</option>
              </select></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}