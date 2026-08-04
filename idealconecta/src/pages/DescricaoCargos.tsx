import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ChevronDown, ChevronUp, Search, Briefcase, Plus, Download, Upload } from 'lucide-react'

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
                    {c.arquivo_url ? (
                      <a href={c.arquivo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ marginTop: 10 }}>
                        <Download size={14} /> Baixar descrição em PDF
                      </a>
                    ) : (
                      !c.descricao && <p className="text-muted">Descrição ainda não cadastrada.</p>
                    )}
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
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !departamento) return
    setEnviando(true); setErro('')

    let arquivo_url: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('cargos').upload(path, file)
      if (uploadError) { setErro('Erro no upload do PDF. Verifique se o bucket "cargos" foi criado (migration_006).'); setEnviando(false); return }
      const { data: pub } = supabase.storage.from('cargos').getPublicUrl(path)
      arquivo_url = pub.publicUrl
    }

    const { error } = await supabase.from('cargos').insert({
      titulo, departamento, descricao: descricao || 'Descrição disponível no PDF anexado.', requisitos: requisitos || null, arquivo_url,
    })
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
          <div className="input-group"><label>Descrição resumida (opcional se anexar PDF)</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} /></div>
          <div className="input-group"><label>Requisitos (opcional)</label><textarea value={requisitos} onChange={e => setRequisitos(e.target.value)} rows={2} /></div>
          <div className="input-group">
            <label>PDF com a descrição completa do cargo (opcional)</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{file ? file.name : 'Clique para escolher um PDF'}</span>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
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