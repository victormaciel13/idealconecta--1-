import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { calcularSaldoFerias } from '../lib/ferias'
import type { Ferias as TFerias } from '../types'

export function Ferias() {
  const { profile } = useAuth()
  const [lista, setLista] = useState<TFerias[]>([])
  const [faltas, setFaltas] = useState<{ data: string }[]>([])
  const [inicio, setInicio] = useState(''); const [fim, setFim] = useState('')
  const [dias, setDias] = useState(0); const [obs, setObs] = useState(''); const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [profile])
  async function load() {
    if (!profile) return
    setLoading(true)
    const [feriasRes, faltasRes] = await Promise.all([
      supabase.from('ferias').select('*').eq('colaborador_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('faltas').select('data').eq('colaborador_id', profile.id).eq('tipo', 'injustificada'),
    ])
    setLista(feriasRes.data || [])
    setFaltas(faltasRes.data || [])
    setLoading(false)
  }
  useEffect(() => {
    if (inicio && fim) { const d = Math.ceil((new Date(fim).getTime() - new Date(inicio).getTime()) / 86400000); setDias(d > 0 ? d : 0) }
  }, [inicio, fim])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || dias <= 0) return
    if (!saldo) { setMsg('Não foi possível calcular seu saldo de férias. Confira se sua data de admissão está cadastrada.'); return }
    if (dias > saldo.saldoDisponivel) {
      setMsg(`Você só tem ${saldo.saldoDisponivel} dia(s) disponível(is) — não é possível solicitar ${dias} dias.`)
      return
    }
    const { error } = await supabase.from('ferias').insert({ colaborador_id: profile.id, data_inicio: inicio, data_fim: fim, dias })
    if (error) setMsg('Erro ao solicitar férias.')
    else { setMsg('Solicitação enviada!'); setInicio(''); setFim(''); setDias(0); load() }
  }

  const statusColor = (s: string) => s === 'aprovada' ? 'var(--good)' : s === 'rejeitada' ? 'var(--warn)' : 'var(--muted)'

  // Cálculo real do saldo — segue a regra da CLT, incluindo a tabela de
  // proporcionalidade por faltas injustificadas (Art. 130).
  const aprovadas = lista.filter(f => f.status === 'aprovada')
  const saldo = profile?.data_admissao
    ? calcularSaldoFerias(profile.data_admissao, aprovadas, faltas)
    : null

  const fmtData = (d: Date) => d.toLocaleDateString('pt-BR')
  // O "fim" calculado internamente é o 1º dia do período seguinte (limite
  // exclusivo, bom pra comparações). Pra EXIBIR pro colaborador, mostramos
  // o último dia de fato daquele período — um dia antes disso.
  const fmtDataFim = (d: Date) => new Date(d.getTime() - 86400000).toLocaleDateString('pt-BR')

  return (
    <div className="page">
      <h1 className="page-title">Minhas Férias</h1>

      {!profile?.data_admissao ? (
        <div className="alert-box">
          <div><b>Data de admissão não cadastrada.</b><p>O RH precisa preencher sua data de admissão pra calcularmos seu saldo de férias corretamente. Fale com o RH.</p></div>
        </div>
      ) : loading || !saldo ? (
        <p className="empty">Calculando seu saldo...</p>
      ) : (
        <>
          {saldo.temReducaoPorFaltas && (
            <div className="alert-box">
              <div>
                <b>Seu saldo foi reduzido por faltas injustificadas.</b>
                <p>Pela regra da CLT (Art. 130), faltas injustificadas dentro de um período aquisitivo reduzem os dias de férias daquele período. Veja o detalhe abaixo, por período.</p>
              </div>
            </div>
          )}

          <div className="info-grid-3">
            <div className="section-card">
              <p className="eyebrow">Saldo disponível</p>
              <div className="big-number">{saldo.saldoDisponivel} <span>dias</span></div>
              <small className="text-muted">{saldo.diasDireitoAcumulados} adquiridos − {saldo.diasGozados} já usados</small>
            </div>
            <div className="section-card">
              <p className="eyebrow">Período aquisitivo atual</p>
              <div className="info-value">{fmtData(saldo.inicioPeriodoAquisitivoAtual)} – {fmtDataFim(saldo.fimPeriodoAquisitivoAtual)}</div>
              <small className="text-muted">Vence em {fmtData(saldo.dataLimiteGozo)}</small>
            </div>
            <div className="section-card">
              <p className="eyebrow">Proporcional acumulado</p>
              <div className="info-value">{saldo.diasProporcionaisPeriodoAtual} dias</div>
              <small className="text-muted">No período em andamento (ainda não liberado)</small>
            </div>
          </div>

          {saldo.periodos.length > 0 && (
            <section className="section-card" style={{ marginTop: 16 }}>
              <h2>Detalhe por período aquisitivo</h2>
              <table className="data-table">
                <thead><tr><th>Período</th><th>Faltas injustificadas</th><th>Dias de direito</th></tr></thead>
                <tbody>
                  {saldo.periodos.map((p, i) => (
                    <tr key={i}>
                      <td>{fmtData(p.inicio)} – {fmtDataFim(p.fim)}</td>
                      <td>{p.faltasInjustificadas}</td>
                      <td style={{ color: p.diasDireito < 30 ? 'var(--warn)' : undefined, fontWeight: p.diasDireito < 30 ? 700 : undefined }}>{p.diasDireito} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

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
                <button type="submit" className="btn-primary" disabled={dias <= 0}>Enviar solicitação</button>
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
        </>
      )}
    </div>
  )
}