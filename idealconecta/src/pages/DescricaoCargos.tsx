import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { gerarCargoPDF } from '../lib/pdfGenerator'
import { ChevronDown, ChevronUp, Search, Briefcase, Plus, Download } from 'lucide-react'

export function DescricaoCargos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [cargos, setCargos] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState<string | null>(null)
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

  // Se já existir um PDF de verdade anexado (upload manual), baixa ele.
  // Senão, gera o PDF na hora a partir do texto cadastrado — não precisa
  // converter Word pra PDF manualmente pra cada cargo.
  const baixarPDF = (c: any) => {
    if (c.arquivo_url) {
      window.open(c.arquivo_url, '_blank')
    } else {
      gerarCargoPDF(c.titulo, c.departamento || 'Geral', c.descricao || 'Descrição não cadastrada.', c.requisitos)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Descrição de cargos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Conheça as atribuições de cada cargo — clique para ver detalhes ou baixar o PDF.</p>
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
          <div className="accordion">
            {filtrados.filter(c => (c.departamento || 'Outros') === depto).map(c => (
              <div key={c.id} className={`accordion-item ${aberto === c.id ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => setAberto(aberto === c.id ? null : c.id)}>
                  <div className="acc-left"><Briefcase size={18} /><strong>{c.titulo}</strong></div>
                  {aberto === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {aberto === c.id && (
                  <div className="accordion-body">
                    {c.descricao && <p>{c.descricao}</p>}
                    {c.requisitos && <><h4>Requisitos</h4><p>{c.requisitos}</p></>}
                    <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => baixarPDF(c)}>
                      <Download size={14} /> Abrir descrição em PDF
                    </button>
                  </div>
                )}
              </div>
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
  const [descricao, setDescricao] = useState(''); const [requisitos, setRequisitos] = useState('')
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !departamento || !descricao) return
    setEnviando(true); setErro('')

    const { error } = await supabase.from('cargos').insert({ titulo, departamento, descricao, requisitos: requisitos || null })
    setEnviando(false)
    if (error) { setErro('Não foi possível salvar o cargo.'); return }
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Novo cargo</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="input-group"><label>Título do cargo</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Assistente I de RH" /></div>
            <div className="input-group"><label>Departamento</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} required placeholder="Ex: RH" /></div>
          </div>
          <div className="input-group"><label>Descrição das atividades</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={5} required placeholder="Cole aqui o texto completo (pode copiar direto do Word)" /></div>
          <div className="input-group"><label>Requisitos (opcional)</label><textarea value={requisitos} onChange={e => setRequisitos(e.target.value)} rows={3} /></div>
          <p className="text-muted" style={{ fontSize: 12.5, marginTop: -6, marginBottom: 12 }}>Não precisa anexar PDF — o sistema gera o PDF automaticamente a partir desse texto quando o colaborador clicar em "Abrir descrição em PDF".</p>
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