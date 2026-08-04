import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, ShieldCheck, UserPlus, Pencil, UserX } from 'lucide-react'
import type { Colaborador } from '../../types'

export function AdminColaboradores() {
  const [lista, setLista] = useState<Colaborador[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [erroRole, setErroRole] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [editando, setEditando] = useState<Colaborador | null>(null)

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('colaboradores').select('*').eq('ativo', true).order('nome')
    setLista(data || [])
    setLoading(false)
  }

  const alterarRole = async (id: string, role: string) => {
    setErroRole('')
    const { error, data } = await supabase.from('colaboradores').update({ role }).eq('id', id).select()
    if (error || !data || data.length === 0) {
      setErroRole('Não foi possível alterar o perfil desse colaborador. Verifique se a migração 005 foi aplicada no Supabase.')
      load()
      return
    }
    load()
  }

  const desativar = async (c: Colaborador) => {
    if (!confirm(`Remover ${c.nome} ${c.sobrenome} da lista de colaboradores ativos?\n\nO histórico dele é mantido, mas ele deixa de aparecer aqui e perde acesso ao portal.`)) return
    const { error } = await supabase.from('colaboradores').update({ ativo: false }).eq('id', c.id)
    if (error) alert('Não foi possível remover. Tente novamente.')
    else load()
  }

  const filtrados = lista.filter(c =>
    `${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cargo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (c.departamento || '').toLowerCase().includes(busca.toLowerCase())
  )

  const roleColor = (r: string) => r === 'admin' ? 'var(--primary-2)' : r === 'gerente' ? 'var(--accent)' : 'var(--muted)'

  return (
    <div className="admin-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Colaboradores ativos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>{lista.length} colaborador(es) ativo(s) hoje.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><UserPlus size={16} /> Adicionar colaborador</button>
      </div>

      <div className="input-icon search-bar" style={{ marginBottom: 18, maxWidth: 420 }}>
        <Search size={18} /><input placeholder="Buscar por nome, cargo ou departamento..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {erroRole && <p className="form-error" style={{ marginBottom: 14 }}>{erroRole}</p>}

      <section className="section-card" style={{ padding: 0 }}>
        {loading ? <p className="empty" style={{ padding: 24 }}>Carregando...</p> : filtrados.length === 0 ? (
          <p className="empty" style={{ padding: 24 }}>Nenhum colaborador encontrado.</p>
        ) : (
          <table className="data-table" style={{ margin: 0 }}>
            <thead><tr><th style={{ paddingLeft: 20 }}>Nome</th><th>Cargo</th><th>Departamento</th><th>Admissão</th><th>Perfil de acesso</th><th></th></tr></thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="colab-row-name">
                      <div className="colab-mini-avatar">{c.nome?.[0]}{c.sobrenome?.[0]}</div>
                      <div><b>{c.nome} {c.sobrenome}</b>{c.telefone && <small>{c.telefone}</small>}</div>
                    </div>
                  </td>
                  <td>{c.cargo || '—'}</td>
                  <td>{c.departamento || '—'}</td>
                  <td>{c.data_admissao ? new Date(c.data_admissao).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <select value={c.role} onChange={e => alterarRole(c.id, e.target.value)} className="role-select" style={{ color: roleColor(c.role) }}>
                      <option value="colaborador">Colaborador</option>
                      <option value="gerente">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Editar cargo e dados" onClick={() => setEditando(c)}><Pencil size={15} /></button>
                      <button className="icon-btn danger" title="Remover" onClick={() => desativar(c)}><UserX size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <p className="admin-hint"><ShieldCheck size={14} /> Alterar o perfil de acesso aqui muda imediatamente o que o colaborador enxerga no portal.</p>

      {showAddModal && <AdicionarColaboradorModal onClose={() => setShowAddModal(false)} onCreated={load} />}
      {editando && <EditarColaboradorModal colaborador={editando} onClose={() => setEditando(null)} onSaved={load} />}
    </div>
  )
}

function AdicionarColaboradorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState(''); const [nome, setNome] = useState(''); const [sobrenome, setSobrenome] = useState('')
  const [cargo, setCargo] = useState(''); const [departamento, setDepartamento] = useState(''); const [dataAdmissao, setDataAdmissao] = useState('')
  const [role, setRole] = useState('colaborador')
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true); setErro('')
    const { data, error } = await supabase.functions.invoke('create-colaborador', {
      body: { email, nome, sobrenome, cargo, departamento, data_admissao: dataAdmissao || null, role },
    })
    setEnviando(false)
    if (error || (data && data.error)) {
      setErro((data && data.error) || 'Não foi possível criar o colaborador. Confira se a Edge Function foi implantada.')
      return
    }
    alert(`Convite enviado para ${email}! A pessoa vai receber um e-mail para definir a própria senha.`)
    onCreated()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Adicionar colaborador</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="input-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} required /></div>
            <div className="input-group"><label>Sobrenome</label><input value={sobrenome} onChange={e => setSobrenome(e.target.value)} required /></div>
          </div>
          <div className="input-group"><label>E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="pessoal@email.com" /></div>
          <div className="form-row">
            <div className="input-group"><label>Cargo</label><input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Assistente de RH" /></div>
            <div className="input-group"><label>Departamento</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} placeholder="Ex: RH" /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Data de admissão</label><input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} /></div>
            <div className="input-group"><label>Perfil de acesso</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="colaborador">Colaborador</option><option value="gerente">Gerente</option><option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <p className="text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>A pessoa recebe um convite por e-mail e define a própria senha no primeiro acesso.</p>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar convite'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditarColaboradorModal({ colaborador, onClose, onSaved }: { colaborador: Colaborador; onClose: () => void; onSaved: () => void }) {
  const [cargo, setCargo] = useState(colaborador.cargo || '')
  const [departamento, setDepartamento] = useState(colaborador.departamento || '')
  const [dataAdmissao, setDataAdmissao] = useState(colaborador.data_admissao || '')
  const [salario, setSalario] = useState(colaborador.salario_base?.toString() || '')
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true); setErro('')
    const { error } = await supabase.from('colaboradores').update({
      cargo: cargo || null, departamento: departamento || null,
      data_admissao: dataAdmissao || null, salario_base: salario ? parseFloat(salario) : null,
    }).eq('id', colaborador.id)
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar.'); return }
    onSaved(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Editar {colaborador.nome} {colaborador.sobrenome}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="input-group"><label>Cargo</label><input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Assistente de RH" /></div>
            <div className="input-group"><label>Departamento</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} placeholder="Ex: RH" /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Data de admissão</label><input type="date" value={dataAdmissao || ''} onChange={e => setDataAdmissao(e.target.value)} /></div>
            <div className="input-group"><label>Salário base (R$)</label><input type="number" step="0.01" value={salario} onChange={e => setSalario(e.target.value)} placeholder="Ex: 4500.00" /></div>
          </div>
          {erro && <p className="form-error">{erro}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}