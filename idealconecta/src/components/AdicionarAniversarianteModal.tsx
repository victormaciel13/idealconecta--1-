import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload } from 'lucide-react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// Substitui o AdicionarAniversarianteModal que já existe dentro do
// Dashboard.tsx — cole isso no lugar dele. A diferença principal é que
// agora, se der erro, mostra a mensagem REAL do Supabase (upload ou
// banco) em vez de um texto genérico "Não foi possível salvar" — assim
// dá pra saber exatamente onde está travando.
export function AdicionarAniversarianteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nome, setNome] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [dia, setDia] = useState('')
  const [mes, setMes] = useState(String(new Date().getMonth() + 1))
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const diaNum = parseInt(dia, 10)
    if (!nome.trim()) { setErro('Preencha o nome.'); return }
    if (!diaNum || diaNum < 1 || diaNum > 31) { setErro('Informe um dia válido (1 a 31).'); return }

    setEnviando(true)

    let foto_url: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('aniversariantes').upload(path, file)
      if (uploadError) {
        console.error('Erro no upload da foto:', uploadError)
        setErro(`Erro no upload da foto: ${uploadError.message}`)
        setEnviando(false)
        return
      }
      const { data: pub } = supabase.storage.from('aniversariantes').getPublicUrl(path)
      foto_url = pub.publicUrl
    }

    const { error: insertError } = await supabase.from('aniversariantes').insert({
      nome: nome.trim(), departamento: departamento.trim() || null, dia: diaNum, mes: parseInt(mes, 10), foto_url,
    })

    setEnviando(false)
    if (insertError) {
      console.error('Erro ao salvar aniversariante:', insertError)
      setErro(`Erro ao salvar: ${insertError.message}`)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Adicionar aniversariante</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome completo" /></div>
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
            <button type="submit" className="btn-primary" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}