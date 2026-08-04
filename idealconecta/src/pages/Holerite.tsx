import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { gerarHoleritePDF } from '../lib/pdfGenerator'
import { Download, AlertTriangle } from 'lucide-react'

function ultimasCompetencias(n: number) {
  const out: { comp: string; label: string }[] = []
  const hoje = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    out.push({ comp: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) })
  }
  return out
}

export function Holerite() {
  const { profile } = useAuth()
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('holerite_lancamentos').select('*').eq('colaborador_id', profile.id)
      .order('competencia', { ascending: false })
      .then(({ data }) => { setLancamentos(data || []); setLoading(false) })
  }, [profile])

  const semSalario = !profile?.salario_base

  const baixar = (competenciaLabel: string, competenciaKey: string, lanc?: any) => {
    if (!profile) return
    if (!profile.salario_base && !lanc) {
      alert('Seu salário ainda não foi cadastrado pelo RH. Fale com o RH para liberar seus holerites.')
      return
    }
    gerarHoleritePDF({
      nome: profile.nome, sobrenome: profile.sobrenome, cargo: profile.cargo, departamento: profile.departamento,
      cpf: profile.cpf, competencia: competenciaLabel,
      salarioBase: lanc?.salario_base ?? profile.salario_base ?? 0,
      horasExtras: lanc?.horas_extras, valeTransporte: lanc?.vale_transporte,
      valeRefeicao: lanc?.vale_refeicao, outrosProventos: lanc?.outros_proventos, outrosDescontos: lanc?.outros_descontos,
    })
  }

  const competencias = ultimasCompetencias(6)

  return (
    <div className="page">
      <h1 className="page-title">Holerite</h1>
      <p className="page-sub">Baixe seus contracheques em PDF, mês a mês.</p>

      {semSalario && (
        <div className="alert-box">
          <AlertTriangle size={18} />
          <div>
            <b>Seu salário ainda não foi cadastrado.</b>
            <p>O RH precisa cadastrar seu salário base para que os holerites reais sejam gerados. Fale com a administração.</p>
          </div>
        </div>
      )}

      <section className="section-card">
        {loading ? <p className="empty">Carregando...</p> : (
          <table className="data-table">
            <thead><tr><th>Competência</th><th>Status</th><th style={{ textAlign: 'right' }}>Ação</th></tr></thead>
            <tbody>
              {competencias.map(c => {
                const lanc = lancamentos.find(l => l.competencia === c.comp)
                const disponivel = !!lanc || !!profile?.salario_base
                return (
                  <tr key={c.comp}>
                    <td style={{ textTransform: 'capitalize' }}><b>{c.label}</b></td>
                    <td>{disponivel ? <span className="pill-good">Disponível</span> : <span className="pill-warn">Aguardando cadastro</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-ghost" disabled={!disponivel} onClick={() => baixar(c.label, c.comp, lanc)}>
                        <Download size={14} /> Baixar PDF
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
