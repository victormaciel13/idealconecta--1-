import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Heart, Plus, Pencil, Trash2 } from 'lucide-react'

export function Beneficios() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('beneficios').select('*').eq('ativo', true).order('nome')
    setLista(data || [])
    setLoading(false)
  }

  const excluir = async (b: any) => {
    if (!confirm(`Remover o benefício "${b.nome}"?`)) return
    const { error } = await supabase.from('beneficios').delete().eq('id', b.id)
    if (error) { console.error('Erro ao remover benefício:', error); alert(`Não foi possível remover: ${error.message}`); return }
    load()
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Benefícios</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Conheça os benefícios oferecidos pela Ideal Empregos.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Novo benefício</button>}
      </div>

      <div className="card-grid" style={{ marginTop: 18 }}>
        {loading ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
          <p className="empty">Nenhum benefício cadastrado ainda.{isAdmin ? ' Use o botão acima pra adicionar o primeiro.' : ''}</p>
        ) : lista.map((b) => (
          <div key={b.id} className="section-card ben-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div className="ben-icon" style={{ background: 'var(--purple-soft)' }}><Heart size={22} color="var(--primary-2)" /></div>
              {isAdmin && (
                <div className="row-actions" style={{ marginLeft: 'auto' }}>
                  <button className="icon-btn" title="Editar" onClick={() => setEditando(b)}><Pencil size={13} /></button>
                  <button className="icon-btn danger" title="Remover" onClick={() => excluir(b)}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
            <b>{b.nome}</b>
            <p className="ben-desc">{b.descricao}</p>
          </div>
        ))}
      </div>

      {showModal && <BeneficioModal onClose={() => setShowModal(false)} onSaved={load} />}
      {editando && <BeneficioModal beneficio={editando} onClose={() => setEditando(null)} onSaved={load} />}
    </div>
  )
}

function BeneficioModal({ beneficio, onClose, onSaved }: { beneficio?: any; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(beneficio?.nome || '')
  const [descricao, setDescricao] = useState(beneficio?.descricao || '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true); setErro('')

    const { error } = beneficio
      ? await supabase.from('beneficios').update({ nome: nome.trim(), descricao: descricao.trim() || null }).eq('id', beneficio.id)
      : await supabase.from('beneficios').insert({ nome: nome.trim(), descricao: descricao.trim() || null, ativo: true })

    setSalvando(false)
    if (error) {
      console.error('Erro ao salvar benefício:', error)
      setErro(`Não foi possível salvar: ${error.message}`)
      return
    }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>{beneficio ? 'Editar benefício' : 'Novo benefício'}</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Vale Transporte" /></div>
          <div className="input-group"><label>Descrição</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Explique como funciona esse benefício" /></div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}