import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CheckCircle2 } from 'lucide-react'

export function MeusDados() {
  const { profile, refreshProfile } = useAuth()
  const [nome, setNome] = useState(''); const [sobrenome, setSobrenome] = useState('')
  const [telefone, setTelefone] = useState(''); const [cpf, setCpf] = useState('')
  const [msg, setMsg] = useState(''); const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setNome(profile.nome); setSobrenome(profile.sobrenome)
      setTelefone(profile.telefone || ''); setCpf((profile as any).cpf || '')
    }
  }, [profile])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true); setMsg(''); setErro('')

    const { error } = await supabase
      .from('colaboradores')
      .update({ nome, sobrenome, telefone, cpf })
      .eq('id', profile.id)

    if (error) {
      setErro('Não foi possível salvar. Tente novamente em instantes.')
    } else {
      // Recarrega o perfil no contexto global — assim sidebar, dashboard
      // e qualquer outra tela já mostram os dados atualizados na hora,
      // e o dado persiste de fato no banco (não é só estado local).
      await refreshProfile()
      setMsg('Dados salvos com sucesso!')
      setTimeout(() => setMsg(''), 4000)
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <h1 className="page-title">Meus dados</h1>
      <p className="page-sub">Mantenha suas informações sempre atualizadas. As alterações são salvas direto no seu cadastro.</p>
      <section className="section-card">
        <form onSubmit={save}>
          <div className="form-row">
            <div className="input-group"><label>Nome</label><input autoComplete="given-name" value={nome} onChange={e => setNome(e.target.value)} required /></div>
            <div className="input-group"><label>Sobrenome</label><input autoComplete="family-name" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Telefone</label><input autoComplete="tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" /></div>
            <div className="input-group"><label>CPF</label><input autoComplete="off" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Cargo</label><input value={profile?.cargo || 'Não definido'} readOnly className="readonly" /></div>
            <div className="input-group"><label>Departamento</label><input value={profile?.departamento || 'Não definido'} readOnly className="readonly" /></div>
          </div>
          <div className="input-group"><label>Data de admissão</label><input value={profile?.data_admissao ? new Date(profile.data_admissao).toLocaleDateString('pt-BR') : 'Não definida'} readOnly className="readonly" /></div>
          <small className="text-muted">Cargo, departamento e data de admissão são cadastrados pelo RH e não podem ser editados por aqui.</small>

          <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          {msg && <p className="form-msg save-ok"><CheckCircle2 size={16} /> {msg}</p>}
          {erro && <p className="form-error">{erro}</p>}
        </form>
      </section>
    </div>
  )
}
