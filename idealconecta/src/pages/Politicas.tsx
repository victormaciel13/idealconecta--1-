import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Download, FileText, Upload } from 'lucide-react'

export function Politicas() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [titulo, setTitulo] = useState(''); const [categoria, setCategoria] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false); const [msg, setMsg] = useState('')

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
              <a href={p.arquivo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ marginLeft: 'auto' }}>
                <Download size={14} /> Baixar PDF
              </a>
            </div>
          ))
        )}
      </section>
    </div>
  )
}