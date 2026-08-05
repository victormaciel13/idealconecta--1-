import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ThumbsUp, MessageCircle, Send, Megaphone, Upload } from 'lucide-react'

const tagColors: Record<string, { bg: string; color: string }> = {
  rh: { bg: 'var(--info-soft)', color: 'var(--info)' },
  ev: { bg: 'var(--warn-soft)', color: 'var(--warn)' },
  ti: { bg: 'var(--good-soft)', color: 'var(--good)' },
}
const tagLabels: Record<string, string> = { rh: 'RH', ev: 'Evento', ti: 'TI' }

export function Comunicados() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [dbLista, setDbLista] = useState<any[]>([])
  const [titulo, setTitulo] = useState(''); const [conteudo, setConteudo] = useState('')
  const [tag, setTag] = useState('rh'); const [msg, setMsg] = useState('')
  const [file, setFile] = useState<File | null>(null); const [enviando, setEnviando] = useState(false)
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [commenting, setCommenting] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('comunicados').select('*').order('created_at', { ascending: false })
    setDbLista(data || [])
  }

  const publish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setEnviando(true); setMsg('')

    let imagem_url: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('comunicados').upload(path, file)
      if (uploadError) {
        setMsg('Erro no upload da imagem. Verifique se o bucket "comunicados" foi criado (migration_009).')
        setEnviando(false)
        return
      }
      const { data: pub } = supabase.storage.from('comunicados').getPublicUrl(path)
      imagem_url = pub.publicUrl
    }

    const { error } = await supabase.from('comunicados').insert({ titulo, conteudo, categoria: tag, imagem_url, autor_id: profile.id })
    setEnviando(false)
    if (error) setMsg('Erro ao publicar.')
    else { setMsg('Publicado!'); setTitulo(''); setConteudo(''); setFile(null); load() }
  }

  const feed = dbLista.map(c => ({
    id: c.id, tag: c.categoria || 'rh', autor: 'Administração', ini: 'AD', cor: '#1C6DD0',
    titulo: c.titulo, texto: c.conteudo, imagem: c.imagem_url, data: new Date(c.created_at).toLocaleDateString('pt-BR'),
  }))

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Comunicados</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Fique por dentro de tudo o que acontece na Ideal Empregos.</p>
        </div>
        {isAdmin && (
          <div className="pub-bar">
            <span className="pill-info">Você pode publicar</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <section className="section-card" style={{ marginBottom: 22, maxWidth: 720 }}>
          <h2>Novo comunicado</h2>
          <form onSubmit={publish}>
            <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Confraternização de fim de ano" /></div>
            <div className="input-group"><label>Categoria</label>
              <select value={tag} onChange={e => setTag(e.target.value)}>
                <option value="rh">RH</option><option value="ev">Evento</option><option value="ti">TI</option>
              </select></div>
            <div className="input-group"><label>Mensagem</label><textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={3} required placeholder="Conte o que aconteceu..." /></div>
            <div className="input-group">
              <label>Imagem (opcional)</label>
              <label className="file-drop">
                <Upload size={18} />
                <span>{file ? file.name : 'Clique para anexar uma imagem'}</span>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="pub-actions">
              <button type="submit" className="btn-primary" disabled={enviando}><Send size={16} /> {enviando ? 'Publicando...' : 'Publicar'}</button>
            </div>
            {msg && <p className="form-msg">{msg}</p>}
          </form>
        </section>
      )}

      <div className="feed">
        {feed.length === 0 ? (
          <div className="empty-state">
            <Megaphone size={32} />
            <p>Nenhum comunicado publicado ainda.</p>
            <small>{isAdmin ? 'Use o formulário acima para publicar o primeiro.' : 'Quando o RH publicar algo, aparece aqui.'}</small>
          </div>
        ) : feed.map(c => {
          const tc = tagColors[c.tag] || tagColors.rh
          const label = tagLabels[c.tag] || 'RH'
          return (
            <article key={c.id} className="post section-card">
              <div className="post-head">
                <div className="post-avatar" style={{ background: c.cor }}>{c.ini}</div>
                <div className="post-who"><b>{c.autor}</b><small>{label} · {c.data}</small></div>
                <span className="com-tag" style={{ background: tc.bg, color: tc.color }}>{label}</span>
              </div>
              <h3 className="post-title">{c.titulo}</h3>
              <p className="post-text">{c.texto}</p>
              {c.imagem && <img src={c.imagem} alt={c.titulo} className="post-image" />}
              <div className="post-foot">
                <button className={`react-btn ${likes[c.id] ? 'liked' : ''}`} onClick={() => setLikes(l => ({ ...l, [c.id]: !l[c.id] }))}>
                  <ThumbsUp size={17} /> {likes[c.id] ? 'Curtiu' : 'Curtir'}
                </button>
                <button className="react-btn" onClick={() => setCommenting(commenting === c.id ? null : c.id)}>
                  <MessageCircle size={17} /> Comentar
                </button>
              </div>
              {commenting === c.id && (
                <div className="comment-box">
                  <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Escreva um comentário..." />
                  <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => { setComment(''); setCommenting(null); alert('Comentário enviado!') }}>Enviar</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}