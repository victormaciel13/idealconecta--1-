import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Ferias as TFerias } from '../types'

export function Ferias() {
  const { profile } = useAuth()
  const [lista, setLista] = useState<TFerias[]>([])
  const [inicio, setInicio] = useState(''); const [fim, setFim] = useState('')
  const [dias, setDias] = useState(0); const [obs, setObs] = useState(''); const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [profile])
  async function load() {
    if (!profile) return
    const { data } = await supabase.from('ferias').select('*').eq('colaborador_id', profile.id).order('created_at', { ascending: false })
    setLista(data || [])
  }
  useEffect(() => {
    if (inicio && fim) { const d = Math.ceil((new Date(fim).getTime() - new Date(inicio).getTime()) / 86400000); setDias(d > 0 ? d : 0) }
  }, [inicio, fim])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || dias <= 0) return
    const { error } = await supabase.from('ferias').insert({ colaborador_id: profile.id, data_inicio: inicio, data_fim: fim, dias })
    if (error) setMsg('Erro ao solicitar férias.')
    else { setMsg('Solicitação enviada!'); setInicio(''); setFim(''); setDias(0); setObs(''); load() }
  }

  const pendentes = lista.filter(f => f.status === 'pendente').length
  const statusColor = (s: string) => s === 'aprovada' ? 'var(--good)' : s === 'rejeitada' ? '#C4413A' : 'var(--warn)'

  return (
    <div className="page">
      <h1 className="page-title">Minhas férias</h1>
      <p className="page-sub">Acompanhe seu saldo, solicite novos períodos e veja o histórico.</p>

      <div className="info-grid-3">
        <div className="section-card"><p className="eyebrow">Saldo disponível</p><div className="big-number">30 <span>dias</span></div></div>
        <div className="section-card"><p className="eyebrow">Período aquisitivo</p><div className="info-value">jul/2025 – jun/2026</div><small className="text-muted">Vence em jun/2027</small></div>
        <div className="section-card"><p className="eyebrow">Próximas férias</p><div className="info-value">{pendentes > 0 ? 'Aguardando aprovação' : 'A definir'}</div>
          {pendentes > 0 && <span className="pill-warn">{pendentes} pendente(s)</span>}
        </div>
      </div>

      <div className="dash-two-col" style={{ marginTop: 22 }}>
        <section className="section-card">
          <h2>Solicitar período</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="input-group"><label>Início</label><input type="date" value={inicio} onChange={e => setInicio(e.target.value)} required /></div>
              <div className="input-group"><label>Fim</label><input type="date" value={fim} onChange={e => setFim(e.target.value)} required /></div>
            </div>
            <div className="input-group"><label>Dias calculados</label><input type="number" value={dias} readOnly className="readonly" /></div>
            <div className="input-group"><label>Observações para o gestor</label><textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Opcional" /></div>
            <button type="submit" className="btn-primary">Enviar solicitação</button>
            {msg && <p className="form-msg">{msg}</p>}
          </form>
        </section>

        <section className="section-card">
          <h2>Histórico</h2>
          {lista.length === 0 ? <p className="empty">Nenhuma solicitação registrada.</p> : (
            <table className="data-table"><thead><tr><th>Período</th><th>Dias</th><th>Status</th></tr></thead>
              <tbody>{lista.map(f => (
                <tr key={f.id}>
                  <td>{new Date(f.data_inicio).toLocaleDateString('pt-BR')} – {new Date(f.data_fim).toLocaleDateString('pt-BR')}</td>
                  <td>{f.dias}</td>
                  <td><span className="status-badge" style={{ color: statusColor(f.status) }}>{f.status}</span></td>
                </tr>
              ))}</tbody></table>
          )}
        </section>
      </div>
    </div>
  )
}
