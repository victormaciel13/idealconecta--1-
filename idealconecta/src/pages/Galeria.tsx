import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Upload, ImagePlus } from 'lucide-react'

export function Galeria() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [fotos, setFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [titulo, setTitulo] = useState(''); const [descricao, setDescricao] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false); const [msg, setMsg] = useState('')

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
      setMsg('Erro no upload. Verifique se o bucket "galeria" foi criado no Storage do Supabase (veja migration_003).')
      setUploading(false)
      return
    }

    const { data: pub } = supabase.storage.from('galeria').getPublicUrl(path)
    const { error: insertError } = await supabase.from('galeria').insert({
      titulo, descricao, imagem_url: pub.publicUrl, autor_id: profile.id,
    })

    if (insertError) setMsg('Foto enviada, mas houve erro ao salvar os dados.')
    else { setMsg('Foto publicada!'); setTitulo(''); setDescricao(''); setFile(null); load() }
    setUploading(false)
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
            {msg && <p className="form-msg">{msg}</p>}
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
                <div className="gallery-caption"><strong>{f.titulo}</strong>{f.descricao && <p>{f.descricao}</p>}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
