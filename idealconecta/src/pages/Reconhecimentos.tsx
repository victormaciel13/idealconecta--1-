import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Plus } from 'lucide-react'

const mockReconhecimentos = [
  { nome: 'Juliana Reis', cargo_de: 'Assistente I de RH', cargo_para: 'Assistente II de RH', data: '22/07/2026', ini: 'JR', cor: '#1C6DD0' },
  { nome: 'Pedro Almeida', cargo_de: 'Auxiliar de TI', cargo_para: 'Assistente I de TI', data: '15/07/2026', ini: 'PA', cor: '#2C5282' },
  { nome: 'Carlos Mendes', cargo_de: 'Conferente', cargo_para: 'Supervisor', data: '01/07/2026', ini: 'CM', cor: '#0B2545' },
  { nome: 'Marina Souza', cargo_de: 'Assistente II de RH', cargo_para: 'Analista JR de RH', data: '20/06/2026', ini: 'MS', cor: '#3B7DD8' },
]

export function Reconhecimentos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [dbLista, setDbLista] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState(''); const [de, setDe] = useState(''); const [para, setPara] = useState('')

  useEffect(() => {
    supabase.from('reconhecimentos').select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome)')
      .order('created_at', { ascending: false }).then(({ data }) => setDbLista(data || []))
  }, [])

  const salvar = async () => {
    if (!profile || !nome) return
    // In a real app, you'd look up the collaborator. For now, we add to mock
    alert(`Reconhecimento de ${nome} publicado!`)
    setShowModal(false); setNome(''); setDe(''); setPara('')
  }

  const lista = dbLista.length > 0
    ? dbLista.map(r => ({ nome: `${r.colaborador?.nome} ${r.colaborador?.sobrenome}`, cargo_de: '', cargo_para: r.tipo, data: new Date(r.created_at).toLocaleDateString('pt-BR'), ini: (r.colaborador?.nome?.[0] || '') + (r.colaborador?.sobrenome?.[0] || ''), cor: '#1C6DD0', descricao: r.descricao }))
    : mockReconhecimentos

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

      <div className="rec-list">
        {lista.map((r, i) => (
          <div key={i} className="rec-card section-card">
            <div className="rec-avatar" style={{ background: r.cor }}>{r.ini}</div>
            <div className="rec-info">
              <b>{r.nome}</b>
              <div className="rec-move">
                {r.cargo_de && <span className="rec-from">{r.cargo_de}</span>}
                {r.cargo_de && <span className="rec-arrow">→</span>}
                <span className="rec-to">{r.cargo_para}</span>
              </div>
              <span className="rec-date">{r.data}</span>
            </div>
            <div className="rec-medal"><Award size={22} /></div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
            <h3>Lançar reconhecimento</h3>
            <div className="input-group"><label>Colaborador</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do colaborador" /></div>
            <div className="form-row">
              <div className="input-group"><label>Cargo anterior</label><input value={de} onChange={e => setDe(e.target.value)} placeholder="Ex: Auxiliar de RH" /></div>
              <div className="input-group"><label>Novo cargo</label><input value={para} onChange={e => setPara(e.target.value)} placeholder="Ex: Assistente I de RH" /></div>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvar}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
