import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Upload, ImagePlus, Pencil, Trash2 } from 'lucide-react'

export function Galeria() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [fotos, setFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [titulo, setTitulo] = useState(''); const [descricao, setDescricao] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false); const [msg, setMsg] = useState('')
  const [msgTipo, setMsgTipo] = useState<'ok' | 'erro'>('ok')
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('galeria').select('*').order('created_at', { ascending: false })
    setFotos(data || [])
    setLoading(false)
  }

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !file || !titulo) return
    setUploading(true); setMsg('')

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { error: uploadError } = await supabase.storage.from('galeria').upload(path, file)

    if (uploadError) {
      console.error('Erro no upload da foto (galeria):', uploadError)
      setMsgTipo('erro')
      setMsg(`Erro no upload: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: pub } = supabase.storage.from('galeria').getPublicUrl(path)
    const { error: insertError } = await supabase.from('galeria').insert({
      titulo, descricao: descricao || null, imagem_url: pub.publicUrl, autor_id: profile.id,
    })

    if (insertError) {
      console.error('Erro ao salvar registro da foto (galeria):', insertError)
      setMsgTipo('erro')
      setMsg(`Foto enviada, mas houve erro ao salvar os dados: ${insertError.message}`)
    } else {
      setMsgTipo('ok')
      setMsg('Foto publicada!')
      setTitulo(''); setDescricao(''); setFile(null); load()
    }
    setUploading(false)
  }

  const excluir = async (f: any) => {
    if (!confirm(`Excluir a foto "${f.titulo}"? Essa ação não pode ser desfeita.`)) return

    const marker = '/galeria/'
    const idx = f.imagem_url.indexOf(marker)
    if (idx !== -1) {
      const storagePath = f.imagem_url.slice(idx + marker.length)
      await supabase.storage.from('galeria').remove([storagePath])
    }

    const { error } = await supabase.from('galeria').delete().eq('id', f.id)
    if (error) alert('Não foi possível excluir. Tente novamente.')
    else load()
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Galeria de Fotos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Momentos e eventos da Ideal Empregos.</p>
        </div>
      </div>

      {isAdmin && (
        <section className="section-card" style={{ marginBottom: 22, maxWidth: 560 }}>
          <h2>Publicar nova foto</h2>
          <form onSubmit={publicar}>
            <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Confraternização de julho" /></div>
            <div className="input-group"><label>Descrição (opcional)</label><input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Uma legenda curta" /></div>
            <div className="input-group">
              <label>Imagem</label>
              <label className="file-drop">
                <Upload size={18} />
                <span>{file ? file.name : 'Clique para escolher uma imagem'}</span>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={uploading || !file}>
              <ImagePlus size={16} /> {uploading ? 'Enviando...' : 'Publicar foto'}
            </button>
            {msg && <p className={msgTipo === 'erro' ? 'form-error' : 'form-msg'}>{msg}</p>}
          </form>
        </section>
      )}

      <section className="section-card">
        {loading ? <p className="empty">Carregando...</p> : fotos.length === 0 ? (
          <p className="empty">Nenhuma foto publicada ainda.</p>
        ) : (
          <div className="gallery-grid">
            {fotos.map(f => (
              <div key={f.id} className="gallery-item">
                <img src={f.imagem_url} alt={f.titulo} />
                <div className="gallery-caption">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <strong>{f.titulo}</strong>
                      {f.descricao && <p>{f.descricao}</p>}
                    </div>
                    {isAdmin && (
                      <div className="row-actions">
                        <button className="icon-btn" title="Editar" onClick={() => setEditando(f)}><Pencil size={13} /></button>
                        <button className="icon-btn danger" title="Excluir" onClick={() => excluir(f)}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editando && <EditarFotoModal foto={editando} onClose={() => setEditando(null)} onSaved={load} />}
    </div>
  )
}

function EditarFotoModal({ foto, onClose, onSaved }: { foto: any; onClose: () => void; onSaved: () => void }) {
  const [titulo, setTitulo] = useState(foto.titulo)
  const [descricao, setDescricao] = useState(foto.descricao || '')
  const [file, setFile] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true); setErro('')

    let imagem_url = foto.imagem_url
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('galeria').upload(path, file)
      if (uploadError) {
        console.error('Erro no upload da foto:', uploadError)
        setErro(`Erro no upload: ${uploadError.message}`)
        setSalvando(false)
        return
      }
      const { data: pub } = supabase.storage.from('galeria').getPublicUrl(path)
      imagem_url = pub.publicUrl
    }

    const { error } = await supabase.from('galeria').update({ titulo, descricao: descricao || null, imagem_url }).eq('id', foto.id)
    setSalvando(false)
    if (error) {
      console.error('Erro ao salvar foto:', error)
      setErro(`Não foi possível salvar: ${error.message}`)
      return
    }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Editar foto</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required /></div>
          <div className="input-group"><label>Descrição (opcional)</label><input value={descricao} onChange={e => setDescricao(e.target.value)} /></div>
          <div className="input-group">
            <label>Substituir imagem (opcional)</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{file ? file.name : 'Já tem uma imagem — clique pra trocar'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
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