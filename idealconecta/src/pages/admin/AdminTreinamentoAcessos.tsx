import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search } from 'lucide-react'

export function AdminTreinamentoAcessos() {
  const [acessos, setAcessos] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('treinamento_acessos')
      .select('*, colaborador:colaboradores!colaborador_id(nome, sobrenome, departamento)')
      .order('acessado_em', { ascending: false })
      .then(({ data }) => { setAcessos(data || []); setLoading(false) })
  }, [])

  const filtrados = acessos.filter(a =>
    a.treinamento_titulo.toLowerCase().includes(busca.toLowerCase()) ||
    `${a.colaborador?.nome} ${a.colaborador?.sobrenome}`.toLowerCase().includes(busca.toLowerCase())
  )

  // Group by training for a summary view
  const porTreinamento: Record<string, number> = {}
  acessos.forEach(a => { porTreinamento[a.treinamento_titulo] = (porTreinamento[a.treinamento_titulo] || 0) + 1 })

  return (
    <div className="admin-page">
      <h1 className="page-title">Acessos aos Treinamentos</h1>
      <p className="page-sub">Veja quais colaboradores acessaram cada treinamento.</p>

      {Object.keys(porTreinamento).length > 0 && (
        <div className="card-grid" style={{ marginBottom: 22 }}>
          {Object.entries(porTreinamento).map(([titulo, count]) => (
            <div key={titulo} className="info-card">
              <h3 style={{ fontSize: 13.5 }}>{titulo}</h3>
              <p><b style={{ fontSize: 20, color: 'var(--primary-2)' }}>{count}</b> acesso{count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}

      <div className="input-icon search-bar" style={{ marginBottom: 18, maxWidth: 420 }}>
        <Search size={18} /><input placeholder="Buscar por treinamento ou colaborador..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <section className="section-card" style={{ padding: 0 }}>
        {loading ? <p className="empty" style={{ padding: 24 }}>Carregando...</p> : filtrados.length === 0 ? (
          <p className="empty" style={{ padding: 24 }}>Nenhum acesso registrado ainda.</p>
        ) : (
          <table className="data-table" style={{ margin: 0 }}>
            <thead><tr><th style={{ paddingLeft: 20 }}>Colaborador</th><th>Departamento</th><th>Treinamento</th><th>Data do acesso</th></tr></thead>
            <tbody>
              {filtrados.map(a => (
                <tr key={a.id}>
                  <td style={{ paddingLeft: 20 }}>{a.colaborador?.nome} {a.colaborador?.sobrenome}</td>
                  <td>{a.colaborador?.departamento || '—'}</td>
                  <td>{a.treinamento_titulo}</td>
                  <td>{new Date(a.acessado_em).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
