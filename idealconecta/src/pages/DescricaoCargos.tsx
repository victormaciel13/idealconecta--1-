import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { gerarCargoPDF } from '../lib/pdfGenerator'
import { Search, Briefcase, Plus, FileText } from 'lucide-react'

export function DescricaoCargos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [cargos, setCargos] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('cargos').select('*').order('departamento').order('titulo')
    setCargos(data || [])
    setLoading(false)
  }

  const filtrados = cargos.filter(c =>
    c.titulo.toLowerCase().includes(busca.toLowerCase()) || (c.departamento || '').toLowerCase().includes(busca.toLowerCase())
  )
  const deptos = [...new Set(filtrados.map(c => c.departamento || 'Outros'))]

  // Se já existir um PDF de verdade anexado (upload manual), abre ele.
  // Senão, monta o PDF na hora com a Missão, Responsabilidades e as
  // competências (Hard/Soft Skills) que estão vinculadas a esse cargo —
  // as mesmas que aparecem no PDI do colaborador.
  const abrirPDF = async (c: any) => {
    if (c.arquivo_url) { window.open(c.arquivo_url, '_blank'); return }

    const { data: competencias } = await supabase.from('competencias').select('nome, tipo').eq('cargo_id', c.id)
    const hardSkills = (competencias || []).filter(k => k.tipo === 'tecnica').map(k => k.nome)
    const softSkills = (competencias || []).filter(k => k.tipo === 'comportamental').map(k => k.nome)

    gerarCargoPDF({
      titulo: c.titulo, departamento: c.departamento || 'Geral',
      missao: c.descricao || 'Missão não cadastrada.',
      responsabilidades: c.responsabilidades, hardSkills, softSkills, indicadores: c.indicadores,
    })
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Descrição de cargos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Clique num cargo pra abrir o PDF com as atribuições completas.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Novo cargo</button>}
      </div>

      <div className="input-icon search-bar" style={{ margin: '18px 0 20px' }}>
        <Search size={18} /><input placeholder="Buscar cargo ou departamento..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {loading ? <p className="empty">Carregando...</p> : filtrados.length === 0 ? (
        <p className="empty">Nenhum cargo cadastrado ainda.</p>
      ) : deptos.map(depto => (
        <div key={depto}>
          <p className="eyebrow" style={{ marginTop: 24 }}>{depto}</p>
          <div className="cargo-icon-grid">
            {filtrados.filter(c => (c.departamento || 'Outros') === depto).map(c => (
              <button key={c.id} className="cargo-icon-card" onClick={() => abrirPDF(c)}>
                <div className="cargo-icon-badge"><Briefcase size={22} /></div>
                <b>{c.titulo}</b>
                <span className="cargo-icon-hint"><FileText size={12} /> Abrir PDF</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {showModal && <NovoCargoModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  )
}

function NovoCargoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [titulo, setTitulo] = useState(''); const [departamento, setDepartamento] = useState('')
  const [missao, setMissao] = useState(''); const [responsabilidades, setResponsabilidades] = useState('')
  const [hardSkills, setHardSkills] = useState(''); const [softSkills, setSoftSkills] = useState('')
  const [indicadores, setIndicadores] = useState('')
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !departamento || !missao) return
    setEnviando(true); setErro('')

    const { data: cargo, error } = await supabase.from('cargos').insert({
      titulo, departamento, descricao: missao, responsabilidades: responsabilidades || null, indicadores: indicadores || null,
    }).select().single()

    if (error || !cargo) { setErro('Não foi possível salvar o cargo.'); setEnviando(false); return }

    // Cada linha digitada em Hard/Soft Skills vira uma competência vinculada
    // a esse cargo — é isso que alimenta o comparativo no PDI do colaborador.
    const competenciasParaInserir = [
      ...hardSkills.split('\n').filter(l => l.trim()).map(nome => ({ cargo_id: cargo.id, nome: nome.trim(), tipo: 'tecnica', nivel_esperado: 3 })),
      ...softSkills.split('\n').filter(l => l.trim()).map(nome => ({ cargo_id: cargo.id, nome: nome.trim(), tipo: 'comportamental', nivel_esperado: 3 })),
    ]
    if (competenciasParaInserir.length > 0) {
      await supabase.from('competencias').insert(competenciasParaInserir)
    }

    setEnviando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <h3>Novo cargo</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="input-group"><label>Título do cargo</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Analista Comercial JR" /></div>
            <div className="input-group"><label>Departamento</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} required placeholder="Ex: Comercial" /></div>
          </div>
          <div className="input-group"><label>Missão</label><textarea value={missao} onChange={e => setMissao(e.target.value)} rows={3} required /></div>
          <div className="input-group"><label>Responsabilidades (uma por linha)</label><textarea value={responsabilidades} onChange={e => setResponsabilidades(e.target.value)} rows={4} /></div>
          <div className="form-row">
            <div className="input-group"><label>Hard Skills (uma por linha)</label><textarea value={hardSkills} onChange={e => setHardSkills(e.target.value)} rows={4} /></div>
            <div className="input-group"><label>Soft Skills (uma por linha)</label><textarea value={softSkills} onChange={e => setSoftSkills(e.target.value)} rows={4} /></div>
          </div>
          <div className="input-group"><label>Indicadores (um por linha)</label><textarea value={indicadores} onChange={e => setIndicadores(e.target.value)} rows={3} /></div>
          <p className="text-muted" style={{ fontSize: 12.5, marginTop: -6, marginBottom: 12 }}>Hard e Soft Skills viram competências no PDI dos colaboradores desse cargo automaticamente.</p>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar cargo'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}