import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Plus, Upload } from 'lucide-react'

const cores = ['#1C6DD0', '#2C5282', '#0B2545', '#3B7DD8', '#7C3AED', '#4C1D95']

export function Reconhecimentos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('reconhecimentos').select('*').order('created_at', { ascending: false })
    setLista(data || [])
    setLoading(false)
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
                {r.foto_url ? (
                  <img src={r.foto_url} alt={nome} className="rec-foto" />
                ) : (
                  <div className="rec-avatar" style={{ background: cores[i % cores.length] }}>{ini}</div>
                )}
                <div className="rec-info">
                  <b>{nome}</b>
                  <div className="rec-move">
                    {de && <span className="rec-from">{de}</span>}
                    {de && <span className="rec-arrow">→</span>}
                    <span className="rec-to">{para}</span>
                  </div>
                  <span className="rec-date">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="rec-medal"><Award size={22} /></div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <LancarReconhecimentoModal onClose={() => setShowModal(false)} onCreated={load} profile={profile} />}
    </div>
  )
}

function LancarReconhecimentoModal({ onClose, onCreated, profile }: { onClose: () => void; onCreated: () => void; profile: any }) {
  const [nome, setNome] = useState('')
  const [cargoDe, setCargoDe] = useState(''); const [cargoPara, setCargoPara] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !cargoPara.trim() || !profile) return
    setSalvando(true); setErro('')

    let foto_url: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('reconhecimentos').upload(path, file)
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
    const { error } = await supabase.from('reconhecimentos').insert({
      nome_colaborador: nome.trim(), tipo: 'Promoção', descricao, foto_url, autor_id: profile.id,
    })
    setSalvando(false)
    if (error) {
      console.error('Erro ao publicar reconhecimento:', error)
      setErro(`Não foi possível publicar: ${error.message}`)
      return
    }
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Lançar reconhecimento</h3>
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
            <label>Foto (opcional)</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{file ? file.name : 'Clique para escolher uma foto'}</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}