import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { gerarDeclaracaoPDF } from '../lib/pdfGenerator'
import { FileText, DollarSign, CreditCard, FilePlus, AlertTriangle } from 'lucide-react'

const tiposDeclaracao: { titulo: string; sub: string; icon: any; tipo: 'vinculo' | 'renda' | 'salario' }[] = [
  { titulo: 'Declaração de vínculo empregatício', sub: 'Comprova seu vínculo ativo com a empresa', icon: FileText, tipo: 'vinculo' },
  { titulo: 'Informe de rendimentos (IRPF)', sub: `Ano-base ${new Date().getFullYear() - 1}`, icon: DollarSign, tipo: 'renda' },
  { titulo: 'Comprovante de salário', sub: 'Para crédito, aluguel e financiamentos', icon: CreditCard, tipo: 'salario' },
]

export function Declaracoes() {
  const { profile } = useAuth()
  const [lista, setLista] = useState<any[]>([])
  const [tipo, setTipo] = useState<'declaracao' | 'atestado'>('atestado')
  const [desc, setDesc] = useState(''); const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [profile])
  async function load() {
    if (!profile) return
    const { data } = await supabase.from('declaracoes').select('*').eq('colaborador_id', profile.id).order('created_at', { ascending: false })
    setLista(data || [])
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    const { error } = await supabase.from('declaracoes').insert({ colaborador_id: profile.id, tipo, descricao: desc, status: 'pendente' })
    if (error) setMsg('Erro ao enviar.')
    else { setMsg('Enviado! O RH vai analisar em breve.'); setDesc(''); load() }
  }

  const gerar = (tipoDoc: 'vinculo' | 'renda' | 'salario') => {
    if (!profile) return
    if (tipoDoc === 'salario' && !profile.salario_base) {
      alert('Seu salário ainda não foi cadastrado pelo RH. Não é possível gerar este comprovante ainda.')
      return
    }
    gerarDeclaracaoPDF({
      nome: profile.nome, sobrenome: profile.sobrenome, cargo: profile.cargo, departamento: profile.departamento,
      cpf: profile.cpf, dataAdmissao: profile.data_admissao, salarioBase: profile.salario_base, tipo: tipoDoc,
    })
  }

  return (
    <div className="page">
      <h1 className="page-title">Declarações e Atestados</h1>
      <p className="page-sub">Gere documentos oficiais em PDF na hora, ou envie seus atestados médicos.</p>

      {!profile?.data_admissao && (
        <div className="alert-box">
          <AlertTriangle size={18} />
          <div><b>Data de admissão não cadastrada.</b><p>Alguns documentos podem ficar incompletos até o RH preencher essa informação.</p></div>
        </div>
      )}

      <section className="section-card">
        {tiposDeclaracao.map((d, i) => (
          <div key={i} className="decl-row">
            <div className="decl-icon"><d.icon size={20} /></div>
            <div><b>{d.titulo}</b><small>{d.sub}</small></div>
            <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => gerar(d.tipo)}>Gerar PDF</button>
          </div>
        ))}
        <div className="decl-row">
          <div className="decl-icon"><FilePlus size={20} /></div>
          <div><b>Atestados Médicos</b><small>Envie e acompanhe seus atestados</small></div>
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => document.getElementById('atestado-section')?.scrollIntoView({ behavior: 'smooth' })}>Enviar atestado</button>
        </div>
      </section>

      <section className="section-card" id="atestado-section" style={{ marginTop: 22 }}>
        <h2>Enviar Atestado / Declaração</h2>
        <form onSubmit={submit}>
          <div className="input-group"><label>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value as any)}>
              <option value="atestado">Atestado Médico</option><option value="declaracao">Declaração</option>
            </select></div>
          <div className="input-group"><label>Descrição</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Observações, período de afastamento, CID (se quiser informar)..." required /></div>
          <button type="submit" className="btn-primary">Enviar</button>
          {msg && <p className="form-msg">{msg}</p>}
        </form>
      </section>

      {lista.length > 0 && (
        <section className="section-card" style={{ marginTop: 22 }}>
          <h2>Histórico</h2>
          <table className="data-table"><thead><tr><th>Tipo</th><th>Descrição</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>{lista.map(d => (
              <tr key={d.id}>
                <td style={{ textTransform: 'capitalize' }}>{d.tipo}</td><td>{d.descricao}</td>
                <td><span className="status-badge" style={{ color: d.status === 'processada' ? 'var(--good)' : 'var(--warn)' }}>{d.status}</span></td>
                <td>{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}</tbody></table>
        </section>
      )}
    </div>
  )
}
