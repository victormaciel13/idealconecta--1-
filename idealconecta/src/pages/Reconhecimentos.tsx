import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Plus, Upload, Pencil, Trash2 } from 'lucide-react'
import { redimensionarImagem } from '../lib/imagem'

const cores = ['#1C6DD0', '#2C5282', '#0B2545', '#3B7DD8', '#7C3AED', '#4C1D95']

export function Reconhecimentos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('reconhecimentos').select('*').order('created_at', { ascending: false })
    setLista(data || [])
    setLoading(false)
  }

  const excluir = async (r: any) => {
    if (!confirm(`Excluir o reconhecimento de "${r.nome_colaborador}"? Essa ação não pode ser desfeita.`)) return

    try {
      if (r.foto_url) {
        const marker = '/reconhecimentos/'
        const idx = r.foto_url.indexOf(marker)
        if (idx !== -1) {
          const storagePath = r.foto_url.slice(idx + marker.length)
          const { error: storageError } = await supabase.storage.from('reconhecimentos').remove([storagePath])
          if (storageError) console.error('Aviso: não removeu a foto do Storage:', storageError)
        }
      }
      const { error } = await supabase.from('reconhecimentos').delete().eq('id', r.id)
      if (error) { console.error('Erro ao excluir reconhecimento:', error); alert(`Não foi possível excluir: ${error.message}`); return }
      load()
    } catch (err: any) {
      console.error('Erro inesperado ao excluir:', err)
      alert(`Erro inesperado: ${err?.message || err}`)
    }
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Reconhecimentos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Celebre com a gente as promoções e movimentações de carreira do time.</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Lançar reconhecimento</button>
        )}
      </div>

      {loading ? <p className="empty">Carregando...</p> : lista.length === 0 ? (
        <section className="section-card">
          <p className="empty">Nenhum reconhecimento publicado ainda.{isAdmin ? ' Use o botão acima pra lançar o primeiro.' : ''}</p>
        </section>
      ) : (
        <div className="rec-list">
          {lista.map((r, i) => {
            const [de, para] = (r.descricao || '').includes('→') ? r.descricao.split('→').map((s: string) => s.trim()) : ['', r.descricao]
            const nome = r.nome_colaborador || ''
            const ini = nome.split(' ').filter(Boolean).map((p: string) => p[0]).slice(0, 2).join('')
            return (
              <div key={r.id} className="rec-card section-card">
                <div className="rec-foto-wrap">
                  {r.foto_url ? (
                    <img src={r.foto_url} alt={nome} className="rec-foto" />
                  ) : (
                    <div className="rec-avatar" style={{ background: cores[i % cores.length] }}>{ini}</div>
                  )}
                </div>
                <div className="rec-info">
                  <b>{nome}</b>
                  <div className="rec-move">
                    {de && <span className="rec-from">{de}</span>}
                    {de && <span className="rec-arrow">→</span>}
                    <span className="rec-to">{para}</span>
                  </div>
                  <span className="rec-date">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {isAdmin ? (
                  <div className="row-actions">
                    <button className="icon-btn" title="Editar" onClick={() => setEditando(r)}><Pencil size={14} /></button>
                    <button className="icon-btn danger" title="Excluir" onClick={() => excluir(r)}><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <div className="rec-medal"><Award size={22} /></div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && <ReconhecimentoModal onClose={() => setShowModal(false)} onSaved={load} profile={profile} />}
      {editando && <ReconhecimentoModal reconhecimento={editando} onClose={() => setEditando(null)} onSaved={load} profile={profile} />}
    </div>
  )
}

function ReconhecimentoModal({ reconhecimento, onClose, onSaved, profile }: { reconhecimento?: any; onClose: () => void; onSaved: () => void; profile: any }) {
  const jaTemDeCargo = reconhecimento?.descricao?.includes('→')
  const [nome, setNome] = useState(reconhecimento?.nome_colaborador || '')
  const [cargoDe, setCargoDe] = useState(jaTemDeCargo ? reconhecimento.descricao.split('→')[0].trim() : '')
  const [cargoPara, setCargoPara] = useState(
    jaTemDeCargo ? reconhecimento.descricao.split('→')[1].trim() : (reconhecimento?.descricao || '')
  )
  const [file, setFile] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !cargoPara.trim()) return
    setSalvando(true); setErro('')

    let foto_url = reconhecimento?.foto_url || null
    if (file) {
      const fileRedimensionado = await redimensionarImagem(file, 400)
      const path = `${Date.now()}-${fileRedimensionado.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('reconhecimentos').upload(path, fileRedimensionado)
      if (uploadError) {
        console.error('Erro no upload da foto:', uploadError)
        setErro(`Erro no upload da foto: ${uploadError.message}`)
        setSalvando(false)
        return
      }
      const { data: pub } = supabase.storage.from('reconhecimentos').getPublicUrl(path)
      foto_url = pub.publicUrl
    }

    const descricao = cargoDe.trim() ? `${cargoDe.trim()} → ${cargoPara.trim()}` : cargoPara.trim()

    const { error } = reconhecimento
      ? await supabase.from('reconhecimentos').update({ nome_colaborador: nome.trim(), descricao, foto_url }).eq('id', reconhecimento.id)
      : await supabase.from('reconhecimentos').insert({ nome_colaborador: nome.trim(), tipo: 'Promoção', descricao, foto_url, autor_id: profile.id })

    setSalvando(false)
    if (error) {
      console.error('Erro ao salvar reconhecimento:', error)
      setErro(`Não foi possível salvar: ${error.message}`)
      return
    }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>{reconhecimento ? 'Editar reconhecimento' : 'Lançar reconhecimento'}</h3>
        <form onSubmit={salvar}>
          <div className="input-group">
            <label>Nome do(s) colaborador(es)</label>
            <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Ana Paula Souza" />
          </div>
          <div className="form-row">
            <div className="input-group"><label>Cargo anterior (opcional)</label><input value={cargoDe} onChange={e => setCargoDe(e.target.value)} placeholder="Ex: Auxiliar de RH" /></div>
            <div className="input-group"><label>Novo cargo / motivo</label><input value={cargoPara} onChange={e => setCargoPara(e.target.value)} required placeholder="Ex: Assistente I de RH" /></div>
          </div>
          <div className="input-group">
            <label>{reconhecimento?.foto_url ? 'Substituir foto' : 'Foto (opcional)'}</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{file ? file.name : reconhecimento?.foto_url ? 'Já tem uma foto — clique pra trocar' : 'Clique para escolher uma foto'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : reconhecimento ? 'Salvar alterações' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}