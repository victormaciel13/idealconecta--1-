import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Bus, Utensils, Heart, BookOpen } from 'lucide-react'

const mockBeneficios = [
  { nome: 'Vale Transporte', desc: 'Desconto de até 6% sobre o salário base.', icon: Bus, cor: 'var(--info-soft)', icoCor: 'var(--info)' },
  { nome: 'Vale Refeição', desc: 'Crédito mensal no cartão de benefícios.', icon: Utensils, cor: 'var(--warn-soft)', icoCor: 'var(--warn)' },
  { nome: 'Plano de Saúde', desc: 'Cobertura médica para o colaborador e dependentes.', icon: Heart, cor: 'var(--good-soft)', icoCor: 'var(--good)' },
  { nome: 'Auxílio Educação', desc: 'Reembolso parcial para cursos e capacitações.', icon: BookOpen, cor: 'var(--accent-soft)', icoCor: 'var(--accent)' },
]

export function Beneficios() {
  const [dbLista, setDbLista] = useState<any[]>([])
  useEffect(() => { supabase.from('beneficios').select('*').eq('ativo', true).then(({ data }) => setDbLista(data || [])) }, [])

  const lista = dbLista.length > 0 ? dbLista : null

  return (
    <div className="page">
      <h1 className="page-title">Benefícios</h1>
      <p className="page-sub">Conheça os benefícios oferecidos pela Ideal Empregos.</p>
      <div className="card-grid">
        {lista ? lista.map((b: any) => (
          <div key={b.id} className="section-card ben-card">
            <h3>{b.nome}</h3><p>{b.descricao}</p>
          </div>
        )) : mockBeneficios.map((b, i) => (
          <div key={i} className="section-card ben-card">
            <div className="ben-icon" style={{ background: b.cor }}><b.icon size={22} color={b.icoCor} /></div>
            <b>{b.nome}</b>
            <p className="ben-desc">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
