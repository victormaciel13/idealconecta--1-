import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { PartyPopper, Pencil, Upload } from 'lucide-react'

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export function AniversarianteDetalheModal({
  aniversariante, isAdmin, onClose, onUpdated,
}: {
  aniversariante: any
  isAdmin: boolean
  onClose: () => void
  onUpdated: () => void
}) {
  const [editando, setEditando] = useState(false)

  const ini = (n: string) => n.split(' ').map((p: string) => p[0]).slice(0, 2).join('')
  const mensagemPadrao = `A equipe Ideal Empregos deseja um feliz aniversário para ${aniversariante.nome.split(' ')[0]}! 🎉 Que seu dia seja repleto de alegria e realizações.`

  if (editando) {
    return (
      <EditarAniversarianteForm
        aniversariante={aniversariante}
        onClose={() => setEditando(false)}
        onSaved={() => { setEditando(false); onUpdated() }}
      />
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card aniv-detalhe" onClick={e => e.stopPropagation()}>
        {isAdmin && (
          <button className="aniv-edit-btn" title="Editar" onClick={() => setEditando(true)}><Pencil size={14} /></button>
        )}
        {aniversariante.foto_url ? (
          <img src={aniversariante.foto_url} alt={aniversariante.nome} className="aniv-detalhe-foto" />
        ) : (
          <div className="aniv-detalhe-avatar">{ini(aniversariante.nome)}</div>
        )}
        <div className="aniv-detalhe-badge"><PartyPopper size={14} /> Aniversário</div>
        <h3 style={{ marginTop: 10 }}>{aniversariante.nome}</h3>
        <p className="text-muted" style={{ fontSize: 13, margin: '2px 0 4px' }}>
          {aniversariante.departamento ? `${aniversariante.departamento} · ` : ''}
          {String(aniversariante.dia).padStart(2, '0')} de {meses[aniversariante.mes - 1]}
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 14 }}>
          {aniversariante.mensagem || mensagemPadrao}
        </p>
        <div className="modal-actions">
          {isAdmin && <button type="button" className="btn-ghost" onClick={() => setEditando(true)}><Pencil size={14} /> Editar</button>}
          <button type="button" className="btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function EditarAniversarianteForm({ aniversariante, onClose, onSaved }: { aniversariante: any; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(aniversariante.nome)
  const [departamento, setDepartamento] = useState(aniversariante.departamento || '')
  const [dia, setDia] = useState(String(aniversariante.dia))
  const [mes, setMes] = useState(String(aniversariante.mes))
  const [mensagem, setMensagem] = useState(aniversariante.mensagem || '')
  const [file, setFile] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    const diaNum = parseInt(dia, 10)
    if (!nome.trim()) { setErro('Preencha o nome.'); return }
    if (!diaNum || diaNum < 1 || diaNum > 31) { setErro('Informe um dia válido (1 a 31).'); return }

    setSalvando(true)

    let foto_url = aniversariante.foto_url
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('aniversariantes').upload(path, file)
      if (uploadError) {
        console.error('Erro no upload da foto:', uploadError)
        setErro(`Erro no upload da foto: ${uploadError.message}`)
        setSalvando(false)
        return
      }
      const { data: pub } = supabase.storage.from('aniversariantes').getPublicUrl(path)
      foto_url = pub.publicUrl
    }

    const { error: updateError } = await supabase.from('aniversariantes').update({
      nome: nome.trim(), departamento: departamento.trim() || null,
      dia: diaNum, mes: parseInt(mes, 10), mensagem: mensagem.trim() || null, foto_url,
    }).eq('id', aniversariante.id)

    setSalvando(false)
    if (updateError) {
      console.error('Erro ao salvar aniversariante:', updateError)
      setErro(`Erro ao salvar: ${updateError.message}`)
      return
    }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Editar aniversariante</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} required /></div>
          <div className="input-group"><label>Departamento (opcional)</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} /></div>
          <div className="form-row">
            <div className="input-group"><label>Dia</label><input type="number" min={1} max={31} value={dia} onChange={e => setDia(e.target.value)} required /></div>
            <div className="input-group"><label>Mês</label>
              <select value={mes} onChange={e => setMes(e.target.value)}>
                {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Mensagem de aniversário</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={2} placeholder="Ex: Desejamos um dia repleto de alegria! 🎉" />
          </div>
          <div className="input-group">
            <label>{aniversariante.foto_url ? 'Substituir foto' : 'Adicionar foto'}</label>
            <label className="file-drop">
              <Upload size={18} />
              <span>{file ? file.name : aniversariante.foto_url ? 'Já tem uma foto — clique pra trocar' : 'Clique para escolher uma foto'}</span>
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