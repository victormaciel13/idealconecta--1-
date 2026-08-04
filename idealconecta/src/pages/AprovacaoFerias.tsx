import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Ferias } from '../types'

export function AprovacaoFerias() {
  const { profile } = useAuth()
  const [lista, setLista] = useState<(Ferias & { colaborador: { nome: string; sobrenome: string } })[]>([])
  const [comentario, setComentario] = useState<Record<string, string>>({})

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('ferias')
      .select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome)')
      .eq('status', 'pendente').order('created_at', { ascending: true })
    setLista((data as any) || [])
  }

  const decidir = async (id: string, status: 'aprovada' | 'rejeitada') => {
    if (status === 'rejeitada' && !comentario[id]?.trim()) { alert('Comentário obrigatório ao rejeitar.'); return }
    await supabase.from('ferias').update({ status, comentario_gestor: comentario[id] || null, aprovador_id: profile?.id }).eq('id', id)
    load()
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Aprovação de Férias</h1></header>
      <section className="section-card">
        {lista.length === 0 ? <p className="empty">Nenhuma solicitação pendente.</p> : (
          <div className="approval-list">{lista.map(f => (
            <div key={f.id} className="approval-card">
              <div className="approval-header">
                <strong>{f.colaborador.nome} {f.colaborador.sobrenome}</strong>
                <span>{new Date(f.data_inicio).toLocaleDateString('pt-BR')} — {new Date(f.data_fim).toLocaleDateString('pt-BR')} ({f.dias} dias)</span>
              </div>
              <textarea placeholder="Comentário (obrigatório para rejeitar)" value={comentario[f.id] || ''} onChange={e => setComentario(c => ({ ...c, [f.id]: e.target.value }))} rows={2} />
              <div className="approval-actions">
                <button className="btn-approve" onClick={() => decidir(f.id, 'aprovada')}>Aprovar</button>
                <button className="btn-reject" onClick={() => decidir(f.id, 'rejeitada')}>Rejeitar</button>
              </div>
            </div>
          ))}</div>
        )}
      </section>
    </div>
  )
}
