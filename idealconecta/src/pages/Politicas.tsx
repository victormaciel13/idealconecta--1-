import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Download, FileText, Upload, Pencil, Trash2 } from 'lucide-react'

export function Politicas() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [titulo, setTitulo] = useState(''); const [categoria, setCategoria] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false); const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('politicas').select('*').order('titulo')
    setLista(data || [])
    setLoading(false)
  }

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !titulo) return
    setEnviando(true); setMsg('')

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { error: uploadError } = await supabase.storage.from('politicas').upload(path, file)
    if (uploadError) {
      setMsg('Erro no upload. Verifique se o bucket "politicas" foi criado (migration_006).')
      setEnviando(false)
      return
    }

    const { data: pub } = supabase.storage.from('politicas').getPublicUrl(path)
    const { error: insertError } = await supabase.from('politicas').insert({
      titulo, categoria: categoria || null, arquivo_url: pub.publicUrl,
    })

    if (insertError) setMsg('Arquivo enviado, mas houve erro ao salvar o registro.')
    else { setMsg('Documento publicado!'); setTitulo(''); setCategoria(''); setFile(null); load() }
    setEnviando(false)
  }

  const excluir = async (item: any) => {
    if (!confirm(`Excluir o documento "${item.titulo}"? Essa ação não pode ser desfeita.`)) return

    // Remove o arquivo do Storage também, extraindo o caminho a partir da URL pública
    const marker = '/politicas/'
    const idx = item.arquivo_url.indexOf(marker)
    if (idx !== -1) {
      const storagePath = item.arquivo_url.slice(idx + marker.length)
      await supabase.storage.from('politicas').remove([storagePath])
    }

    const { error } = await supabase.from('politicas').delete().eq('id', item.id)
    if (error) alert('Não foi possível excluir. Tente novamente.')
    else load()
  }

  return (
    <div className="page">
      <h1 className="page-title">Políticas e documentos</h1>
      <p className="page-sub">Documentos oficiais, políticas internas e manuais da empresa.</p>

      {isAdmin && (
        <section className="section-card" style={{ marginBottom: 22, maxWidth: 560 }}>
          <h2>Publicar novo documento</h2>
          <form onSubmit={publicar}>
            <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Código de Conduta e Ética" /></div>
            <div className="input-group"><label>Categoria (opcional)</label><input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: RH, Compliance, Institucional..." /></div>
            <div className="input-group">
              <label>Arquivo (PDF ou Word)</label>
              <label className="file-drop">
                <Upload size={18} />
                <span>{file ? file.name : 'Clique para escolher um PDF ou Word'}</span>
                <input type="file" accept="application/pdf,.docx" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={enviando || !file}>
              {enviando ? 'Enviando...' : 'Publicar documento'}
            </button>
            {msg && <p className="form-msg">{msg}</p>}
          </form>
        </section>
      )}

      <section className="section-card">
        {loading ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
          <p className="empty">Nenhum documento publicado ainda.</p>
        ) : (
          lista.map(p => (
            <div key={p.id} className="decl-row">
              <div className="decl-icon"><FileText size={20} /></div>
              <div><b>{p.titulo}</b><small>{p.categoria || '—'}</small></div>
              <div className="row-actions" style={{ marginLeft: 'auto' }}>
                <a href={p.arquivo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Download size={14} /> Baixar
                </a>
                {isAdmin && (
                  <>
                    <button className="icon-btn" title="Editar" onClick={() => setEditando(p)}><Pencil size={15} /></button>
                    <button className="icon-btn danger" title="Excluir" onClick={() => excluir(p)}><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {editando && <EditarPoliticaModal item={editando} onClose={() => setEditando(null)} onSaved={load} />}
    </div>
  )
}

function EditarPoliticaModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const [titulo, setTitulo] = useState(item.titulo)
  const [categoria, setCategoria] = useState(item.categoria || '')
  const [novoFile, setNovoFile] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true); setErro('')

    let arquivo_url = item.arquivo_url
    if (novoFile) {
      const path = `${Date.now()}-${novoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('politicas').upload(path, novoFile)
      if (uploadError) { setErro('Erro ao enviar o novo arquivo.'); setSalvando(false); return }
      const { data: pub } = supabase.storage.from('politicas').getPublicUrl(path)
      arquivo_url = pub.publicUrl
    }

    const { error } = await supabase.from('politicas').update({ titulo, categoria: categoria || null, arquivo_url }).eq('id', item.id)
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar as alterações.'); return }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Editar documento</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required /></div>
          <div className="input-group"><label>Categoria</label><input value={categoria} onChange={e => setCategoria(e.target.value)} /></div>
          <div className="input-group">
            <label>Substituir arquivo (opcional)</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{novoFile ? novoFile.name : 'Manter o arquivo atual'}</span>
              <input type="file" accept="application/pdf,.docx" onChange={e => setNovoFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}