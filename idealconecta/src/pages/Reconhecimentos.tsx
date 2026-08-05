import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Plus } from 'lucide-react'

const cores = ['#1C6DD0', '#2C5282', '#0B2545', '#3B7DD8', '#7C3AED', '#4C1D95']

export function Reconhecimentos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('reconhecimentos')
      .select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome)')
      .order('created_at', { ascending: false })
    setLista(data || [])
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Reconhecimentos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Celebre com a gente as promoções e movimentações de carreira do time.</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Lançar reconhecimento</button>
        )}
      </div>

      {loading ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <section className="section-card">
          <p className="empty">Nenhum reconhecimento publicado ainda.{isAdmin ? ' Use o botão acima pra lançar o primeiro.' : ''}</p>
        </section>
      ) : (
        <div className="rec-list">
          {lista.map((r, i) => {
            const [de, para] = (r.descricao || '').includes('→') ? r.descricao.split('→').map((s: string) => s.trim()) : ['', r.descricao]
            const nome = `${r.colaborador?.nome || ''} ${r.colaborador?.sobrenome || ''}`.trim()
            const ini = (r.colaborador?.nome?.[0] || '') + (r.colaborador?.sobrenome?.[0] || '')
            return (
              <div key={r.id} className="rec-card section-card">
                <div className="rec-avatar" style={{ background: cores[i % cores.length] }}>{ini}</div>
                <div className="rec-info">
                  <b>{nome}</b>
                  <div className="rec-move">
                    {de && <span className="rec-from">{de}</span>}
                    {de && <span className="rec-arrow">→</span>}
                    <span className="rec-to">{para}</span>
                  </div>
                  <span className="rec-date">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="rec-medal"><Award size={22} /></div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <LancarReconhecimentoModal onClose={() => setShowModal(false)} onCreated={load} profile={profile} />}
    </div>
  )
}

function LancarReconhecimentoModal({ onClose, onCreated, profile }: { onClose: () => void; onCreated: () => void; profile: any }) {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [colaboradorId, setColaboradorId] = useState('')
  const [cargoDe, setCargoDe] = useState(''); const [cargoPara, setCargoPara] = useState('')
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('')

  useEffect(() => {
    supabase.from('colaboradores').select('id, nome, sobrenome, cargo').eq('ativo', true).order('nome')
      .then(({ data }) => setColaboradores(data || []))
  }, [])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!colaboradorId || !cargoPara || !profile) return
    setSalvando(true); setErro('')
    const descricao = cargoDe ? `${cargoDe} → ${cargoPara}` : cargoPara
    const { error } = await supabase.from('reconhecimentos').insert({
      colaborador_id: colaboradorId, tipo: 'Promoção', descricao, autor_id: profile.id,
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível publicar. Tente novamente.'); return }
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Lançar reconhecimento</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Colaborador</label>
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required>
              <option value="">Selecione...</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome} {c.sobrenome}{c.cargo ? ` · ${c.cargo}` : ''}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Cargo anterior (opcional)</label><input value={cargoDe} onChange={e => setCargoDe(e.target.value)} placeholder="Ex: Auxiliar de RH" /></div>
            <div className="input-group"><label>Novo cargo / motivo</label><input value={cargoPara} onChange={e => setCargoPara(e.target.value)} required placeholder="Ex: Assistente I de RH" /></div>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}