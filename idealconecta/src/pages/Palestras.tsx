import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Video, Upload, Trash2, Pencil } from 'lucide-react'

export function Palestras() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('palestras').select('*').order('created_at', { ascending: false })
    setLista(data || [])
    setLoading(false)
  }

  const excluir = async (p: any) => {
    if (!confirm(`Excluir "${p.titulo}"? Essa ação não pode ser desfeita.`)) return
    try {
      const marker = '/palestras/'
      const idx = p.video_url.indexOf(marker)
      if (idx !== -1) {
        const storagePath = p.video_url.slice(idx + marker.length)
        await supabase.storage.from('palestras').remove([storagePath])
      }
      const { error } = await supabase.from('palestras').delete().eq('id', p.id)
      if (error) { alert(`Não foi possível excluir: ${error.message}`); return }
      load()
    } catch (err: any) {
      alert(`Erro inesperado: ${err?.message || err}`)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Palestras e Treinamentos Internos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Vídeos de palestras, campanhas e treinamentos realizados na Ideal Empregos.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}><Upload size={16} /> Subir vídeo</button>}
      </div>

      {loading ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <section className="section-card">
          <p className="empty">Nenhum vídeo publicado ainda.{isAdmin ? ' Use o botão acima pra subir o primeiro.' : ''}</p>
        </section>
      ) : (
        <div className="palestras-grid">
          {lista.map(p => (
            <div key={p.id} className="section-card palestra-card">
              <video src={p.video_url} controls className="palestra-video" preload="metadata" />
              <div className="palestra-info">
                <div style={{ flex: 1 }}>
                  <b>{p.titulo}</b>
                  {p.categoria && <span className="tag" style={{ marginLeft: 8 }}>{p.categoria}</span>}
                  {p.descricao && <p className="text-muted" style={{ fontSize: 13, margin: '6px 0 0' }}>{p.descricao}</p>}
                </div>
                {isAdmin && (
                  <div className="row-actions">
                    <button className="icon-btn" title="Editar" onClick={() => setEditando(p)}><Pencil size={13} /></button>
                    <button className="icon-btn danger" title="Excluir" onClick={() => excluir(p)}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <PalestraModal onClose={() => setShowModal(false)} onSaved={load} profile={profile} />}
      {editando && <PalestraModal palestra={editando} onClose={() => setEditando(null)} onSaved={load} profile={profile} />}
    </div>
  )
}

function PalestraModal({ palestra, onClose, onSaved, profile }: { palestra?: any; onClose: () => void; onSaved: () => void; profile: any }) {
  const [titulo, setTitulo] = useState(palestra?.titulo || '')
  const [descricao, setDescricao] = useState(palestra?.descricao || '')
  const [categoria, setCategoria] = useState(palestra?.categoria || '')
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) return
    if (!palestra && !file) { setErro('Selecione um arquivo de vídeo.'); return }
    setEnviando(true); setErro('')

    let video_url = palestra?.video_url
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('palestras').upload(path, file)
      if (uploadError) {
        console.error('Erro no upload do vídeo:', uploadError)
        setErro(`Erro no upload: ${uploadError.message}`)
        setEnviando(false)
        return
      }
      const { data: pub } = supabase.storage.from('palestras').getPublicUrl(path)
      video_url = pub.publicUrl
    }

    const { error } = palestra
      ? await supabase.from('palestras').update({ titulo: titulo.trim(), descricao: descricao.trim() || null, categoria: categoria.trim() || null, video_url }).eq('id', palestra.id)
      : await supabase.from('palestras').insert({ titulo: titulo.trim(), descricao: descricao.trim() || null, categoria: categoria.trim() || null, video_url, autor_id: profile.id })

    setEnviando(false)
    if (error) {
      console.error('Erro ao salvar palestra:', error)
      setErro(`Não foi possível salvar: ${error.message}`)
      return
    }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>{palestra ? 'Editar vídeo' : 'Subir novo vídeo'}</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Palestra Setembro Amarelo" /></div>
          <div className="input-group"><label>Categoria (opcional)</label><input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Saúde mental, Treinamento, Campanha" /></div>
          <div className="input-group"><label>Descrição (opcional)</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} /></div>
          <div className="input-group">
            <label>{palestra ? 'Substituir vídeo (opcional)' : 'Arquivo de vídeo'}</label>
            <label className="file-drop">
              <Video size={18} />
              <span>{file ? file.name : palestra ? 'Manter o vídeo atual' : 'Clique para escolher o vídeo'}</span>
              <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
            <small className="text-muted" style={{ fontSize: 12 }}>Vídeos grandes podem demorar alguns minutos pra enviar, dependendo da conexão.</small>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={enviando}>{enviando ? 'Enviando...' : palestra ? 'Salvar alterações' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}