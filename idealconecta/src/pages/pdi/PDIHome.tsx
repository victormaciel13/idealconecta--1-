import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  Target, Users, MessageSquare, Award, TrendingUp, Calendar,
  ThumbsUp, Send, Plus, X, ChevronRight, Wrench, Heart
} from 'lucide-react'

const statusLabel: Record<string, string> = {
  nao_iniciado: 'Não iniciado', em_andamento: 'Em andamento', aguardando_validacao: 'Aguardando validação',
  concluido: 'Concluído', reprogramado: 'Reprogramado',
}
const statusColor: Record<string, string> = {
  nao_iniciado: 'var(--muted)', em_andamento: 'var(--info)', aguardando_validacao: 'var(--warn)',
  concluido: 'var(--good)', reprogramado: 'var(--error)',
}

type Tab = 'painel' | 'competencias' | 'feedbacks' | 'mentorias' | 'historico'

export function PDIHome() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('painel')
  const [pdi, setPdi] = useState<any>(null)
  const [acoes, setAcoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    setLoading(true)
    let { data: pdiData } = await supabase.from('pdis').select('*').eq('colaborador_id', profile!.id).order('created_at', { ascending: false }).limit(1).maybeSingle()

    if (!pdiData) {
      const { data: created } = await supabase.from('pdis').insert({
        colaborador_id: profile!.id, status: 'nao_iniciado', percentual_conclusao: 0,
      }).select().single()
      pdiData = created
    }
    setPdi(pdiData)

    if (pdiData) {
      const { data: acoesData } = await supabase.from('pdi_acoes').select('*').eq('pdi_id', pdiData.id).order('prazo', { ascending: true })
      setAcoes(acoesData || [])
    }
    setLoading(false)
  }

  if (loading) return <div className="page"><p className="empty">Carregando seu PDI...</p></div>

  const proximaAcao = acoes.find(a => a.status !== 'concluido')
  const atrasadas = acoes.filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluido')

  return (
    <div className="page">
      <h1 className="page-title">Meu PDI</h1>
      <p className="page-sub">Plano de Desenvolvimento Individual — acompanhe sua evolução, competências e mentorias.</p>

      <div className="pdi-tabs">
        <button className={tab === 'painel' ? 'active' : ''} onClick={() => setTab('painel')}><Target size={15} /> Painel</button>
        <button className={tab === 'competencias' ? 'active' : ''} onClick={() => setTab('competencias')}><TrendingUp size={15} /> Competências</button>
        <button className={tab === 'feedbacks' ? 'active' : ''} onClick={() => setTab('feedbacks')}><MessageSquare size={15} /> Feedbacks</button>
        <button className={tab === 'mentorias' ? 'active' : ''} onClick={() => setTab('mentorias')}><Users size={15} /> Mentorias</button>
        <button className={tab === 'historico' ? 'active' : ''} onClick={() => setTab('historico')}><Calendar size={15} /> Histórico</button>
      </div>

      {tab === 'painel' && (
        <PainelTab profile={profile} pdi={pdi} acoes={acoes} proximaAcao={proximaAcao} atrasadas={atrasadas} onReload={load} />
      )}
      {tab === 'competencias' && <CompetenciasTab profile={profile} />}
      {tab === 'feedbacks' && <FeedbacksTab profile={profile} />}
      {tab === 'mentorias' && <MentoriasTab profile={profile} />}
      {tab === 'historico' && <HistoricoTab pdi={pdi} acoes={acoes} />}
    </div>
  )
}

function PainelTab({ profile, pdi, acoes, proximaAcao, atrasadas, onReload }: any) {
  const [showNovaAcao, setShowNovaAcao] = useState(false)
  const isGestao = profile?.role === 'gerente' || profile?.role === 'admin'

  const marcarConcluida = async (acaoId: string) => {
    await supabase.from('pdi_acoes').update({ status: 'concluido' }).eq('id', acaoId)
    onReload()
  }

  const concluidas = acoes.filter((a: any) => a.status === 'concluido').length
  const pct = acoes.length > 0 ? Math.round((concluidas / acoes.length) * 100) : 0

  return (
    <>
      <div className="pdi-header-card section-card">
        <div className="pdi-avatar-big">{profile?.nome?.[0]}{profile?.sobrenome?.[0]}</div>
        <div className="pdi-header-info">
          <b>{profile?.nome} {profile?.sobrenome}</b>
          <span>{profile?.cargo || 'Cargo não definido'} · {profile?.departamento || 'Departamento não definido'}</span>
          <span className="text-muted">Admissão: {profile?.data_admissao ? new Date(profile.data_admissao).toLocaleDateString('pt-BR') : '—'}</span>
        </div>
        <div className="pdi-status-badge" style={{ color: statusColor[pdi?.status || 'nao_iniciado'] }}>
          {statusLabel[pdi?.status || 'nao_iniciado']}
        </div>
      </div>

      <div className="info-cards-row" style={{ marginTop: 16 }}>
        <div className="info-mini-card">
          <div className="info-mini-icon"><TrendingUp size={18} /></div>
          <div><span className="info-mini-label">Evolução do ciclo</span><b>{pct}%</b><small>{concluidas} de {acoes.length} ações concluídas</small></div>
        </div>
        <div className="info-mini-card">
          <div className="info-mini-icon"><Target size={18} /></div>
          <div><span className="info-mini-label">Próxima ação</span><b>{proximaAcao ? proximaAcao.titulo : 'Nenhuma pendente'}</b>
            <small>{proximaAcao?.prazo ? `Prazo: ${new Date(proximaAcao.prazo).toLocaleDateString('pt-BR')}` : '—'}</small></div>
        </div>
        <div className="info-mini-card">
          <div className="info-mini-icon" style={{ background: atrasadas.length ? 'var(--error-soft)' : 'var(--good-soft)' }}>
            <Calendar size={18} color={atrasadas.length ? 'var(--error)' : 'var(--good)'} />
          </div>
          <div><span className="info-mini-label">Ações em atraso</span><b>{atrasadas.length}</b><small>{atrasadas.length > 0 ? 'Requer atenção' : 'Tudo em dia'}</small></div>
        </div>
      </div>

      <section className="section-card" style={{ marginTop: 20 }}>
        <div className="section-head">
          <h2>Plano de ação</h2>
          <button className="link-btn" onClick={() => setShowNovaAcao(true)}><Plus size={14} /> Nova ação</button>
        </div>
        {acoes.length === 0 ? (
          <p className="empty">Nenhuma ação cadastrada ainda. {isGestao ? 'Adicione a primeira ação de desenvolvimento.' : 'Peça ao seu gestor para definir as primeiras ações, ou adicione a sua.'}</p>
        ) : (
          <div className="pdi-acoes-list">
            {acoes.map((a: any) => (
              <div key={a.id} className="pdi-acao-item">
                <div className="pdi-acao-check">
                  <input type="checkbox" checked={a.status === 'concluido'} onChange={() => a.status !== 'concluido' && marcarConcluida(a.id)} />
                </div>
                <div className="pdi-acao-info">
                  <b style={{ textDecoration: a.status === 'concluido' ? 'line-through' : 'none' }}>{a.titulo}</b>
                  {a.descricao && <p>{a.descricao}</p>}
                  <div className="pdi-acao-meta">
                    {a.prazo && <span>Prazo: {new Date(a.prazo).toLocaleDateString('pt-BR')}</span>}
                    {a.responsavel && <span>Responsável: {a.responsavel}</span>}
                  </div>
                </div>
                <span className="status-badge" style={{ color: statusColor[a.status] }}>{statusLabel[a.status]}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {showNovaAcao && <NovaAcaoModal pdiId={pdi?.id} onClose={() => setShowNovaAcao(false)} onCreated={onReload} />}
    </>
  )
}

function NovaAcaoModal({ pdiId, onClose, onCreated }: { pdiId: string; onClose: () => void; onCreated: () => void }) {
  const [titulo, setTitulo] = useState(''); const [descricao, setDescricao] = useState('')
  const [prazo, setPrazo] = useState(''); const [responsavel, setResponsavel] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    await supabase.from('pdi_acoes').insert({ pdi_id: pdiId, titulo, descricao, prazo: prazo || null, responsavel: responsavel || null })
    setSalvando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Nova ação de desenvolvimento</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Título</label><input value={titulo} onChange={e => setTitulo(e.target.value)} required placeholder="Ex: Concluir curso de liderança" /></div>
          <div className="input-group"><label>Descrição</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} /></div>
          <div className="form-row">
            <div className="input-group"><label>Prazo</label><input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} /></div>
            <div className="input-group"><label>Responsável</label><input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Ex: Eu mesmo, Gestor..." /></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Lista simples de Hard Skills e Soft Skills atribuídas pelo admin a esse
// colaborador especificamente — sem nota, sem comparação, só a lista.
function CompetenciasTab({ profile }: any) {
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [profile])
  async function load() {
    setLoading(true)
    const { data } = await supabase.from('colaborador_skills').select('*').eq('colaborador_id', profile.id).order('created_at')
    setSkills(data || [])
    setLoading(false)
  }

  if (loading) return <p className="empty">Carregando...</p>

  const hard = skills.filter(s => s.tipo === 'tecnica')
  const soft = skills.filter(s => s.tipo === 'comportamental')

  if (skills.length === 0) return (
    <section className="section-card">
      <p className="empty">Suas Hard e Soft Skills ainda não foram cadastradas. Isso é feito pelo seu gestor ou pelo RH.</p>
    </section>
  )

  return (
    <>
      <section className="section-card">
        <div className="section-head"><h2><Wrench size={16} /> Hard Skills</h2></div>
        {hard.length === 0 ? <p className="empty">Nenhuma cadastrada ainda.</p> : (
          <div className="skill-tag-list">
            {hard.map(s => <span key={s.id} className="skill-tag tecnica">{s.nome}</span>)}
          </div>
        )}
      </section>
      <section className="section-card" style={{ marginTop: 16 }}>
        <div className="section-head"><h2><Heart size={16} /> Soft Skills</h2></div>
        {soft.length === 0 ? <p className="empty">Nenhuma cadastrada ainda.</p> : (
          <div className="skill-tag-list">
            {soft.map(s => <span key={s.id} className="skill-tag comportamental">{s.nome}</span>)}
          </div>
        )}
      </section>
    </>
  )
}

function FeedbacksTab({ profile }: any) {
  const [recebidos, setRecebidos] = useState<any[]>([])
  const [enviados, setEnviados] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [showForm, setShowForm] = useState<'dar' | 'solicitar' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [profile])
  async function load() {
    setLoading(true)
    const { data: rec } = await supabase.from('feedbacks').select('*, autor:colaboradores!autor_id(nome, sobrenome)').eq('destinatario_id', profile.id).order('created_at', { ascending: false })
    const { data: env } = await supabase.from('feedbacks').select('*, destinatario:colaboradores!destinatario_id(nome, sobrenome)').eq('autor_id', profile.id).order('created_at', { ascending: false })
    const { data: colabs } = await supabase.from('colaboradores').select('id, nome, sobrenome, cargo').eq('ativo', true).neq('id', profile.id)
    setRecebidos(rec || []); setEnviados(env || []); setColaboradores(colabs || [])
    setLoading(false)
  }

  if (loading) return <p className="empty">Carregando...</p>

  return (
    <>
      <div className="pdi-header-row">
        <button className="btn-primary" onClick={() => setShowForm('dar')}><Send size={15} /> Dar feedback</button>
        <button className="btn-ghost" onClick={() => setShowForm('solicitar')}><MessageSquare size={15} /> Solicitar feedback</button>
      </div>

      <section className="section-card" style={{ marginTop: 16 }}>
        <h2>Feedbacks recebidos</h2>
        {recebidos.length === 0 ? <p className="empty">Nenhum feedback recebido ainda.</p> : (
          <div className="feedback-list">
            {recebidos.map(f => (
              <div key={f.id} className="feedback-item">
                <div className="feedback-item-head">
                  <b>{f.autor?.nome} {f.autor?.sobrenome}</b>
                  <span className="tag">{f.categoria}</span>
                  <time>{new Date(f.created_at).toLocaleDateString('pt-BR')}</time>
                </div>
                {f.pontos_positivos && <p><ThumbsUp size={13} style={{ marginRight: 4 }} />{f.pontos_positivos}</p>}
                {f.sugestao && <p className="text-muted">Sugestão: {f.sugestao}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-card" style={{ marginTop: 16 }}>
        <h2>Feedbacks enviados</h2>
        {enviados.length === 0 ? <p className="empty">Você ainda não enviou nenhum feedback.</p> : (
          <div className="feedback-list">
            {enviados.map(f => (
              <div key={f.id} className="feedback-item">
                <div className="feedback-item-head">
                  <b>Para: {f.destinatario?.nome} {f.destinatario?.sobrenome}</b>
                  <span className="tag">{f.categoria}</span>
                  <time>{new Date(f.created_at).toLocaleDateString('pt-BR')}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && <FeedbackModal mode={showForm} profile={profile} colaboradores={colaboradores} onClose={() => setShowForm(null)} onCreated={load} />}
    </>
  )
}

function FeedbackModal({ mode, profile, colaboradores, onClose, onCreated }: any) {
  const [destinatarioId, setDestinatarioId] = useState('')
  const [relacao, setRelacao] = useState('par')
  const [categoria, setCategoria] = useState('desenvolvimento')
  const [contexto, setContexto] = useState(''); const [comportamento, setComportamento] = useState('')
  const [impacto, setImpacto] = useState(''); const [sugestao, setSugestao] = useState('')
  const [pontosPositivos, setPontosPositivos] = useState('')
  const [confidencial, setConfidencial] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destinatarioId) return
    setSalvando(true)
    if (mode === 'dar') {
      await supabase.from('feedbacks').insert({
        autor_id: profile.id, destinatario_id: destinatarioId, relacao, categoria,
        contexto, comportamento, impacto, sugestao, pontos_positivos: pontosPositivos, confidencial,
      })
    } else {
      await supabase.from('feedbacks').insert({
        autor_id: profile.id, destinatario_id: destinatarioId, relacao, categoria: 'acompanhamento',
        contexto: `Solicitação de feedback: ${contexto}`, status: 'pendente',
      })
    }
    setSalvando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>{mode === 'dar' ? 'Dar feedback' : 'Solicitar feedback'}</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>{mode === 'dar' ? 'Para quem' : 'De quem'}</label>
            <select value={destinatarioId} onChange={e => setDestinatarioId(e.target.value)} required>
              <option value="">Selecione...</option>
              {colaboradores.map((c: any) => <option key={c.id} value={c.id}>{c.nome} {c.sobrenome}{c.cargo ? ` · ${c.cargo}` : ''}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="input-group"><label>Relação</label>
              <select value={relacao} onChange={e => setRelacao(e.target.value)}>
                <option value="gestor">Gestor</option><option value="par">Par</option><option value="liderado">Liderado</option><option value="outra_area">Outra área</option>
              </select></div>
            <div className="input-group"><label>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="reconhecimento">Reconhecimento</option><option value="desenvolvimento">Desenvolvimento</option>
                <option value="acompanhamento">Acompanhamento</option><option value="projeto">Projeto</option>
                <option value="pares">Entre pares</option><option value="lideranca">Para liderança</option>
              </select></div>
          </div>
          <div className="input-group"><label>{mode === 'dar' ? 'Contexto / situação observada' : 'Sobre o que você quer feedback'}</label>
            <textarea value={contexto} onChange={e => setContexto(e.target.value)} rows={2} required /></div>
          {mode === 'dar' && (
            <>
              <div className="input-group"><label>Pontos positivos</label><textarea value={pontosPositivos} onChange={e => setPontosPositivos(e.target.value)} rows={2} /></div>
              <div className="input-group"><label>Sugestão de desenvolvimento</label><textarea value={sugestao} onChange={e => setSugestao(e.target.value)} rows={2} /></div>
              <label className="checkbox-line"><input type="checkbox" checked={confidencial} onChange={e => setConfidencial(e.target.checked)} /> Feedback confidencial (só visível pra gestão)</label>
            </>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MentoriasTab({ profile }: any) {
  const [mentores, setMentores] = useState<any[]>([])
  const [minhas, setMinhas] = useState<any[]>([])
  const [mentorSelecionado, setMentorSelecionado] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [profile])
  async function load() {
    setLoading(true)
    const { data: ment } = await supabase.from('mentores').select('*').eq('ativo', true).order('nome')
    const { data: sol } = await supabase.from('mentoria_solicitacoes').select('*, mentor:mentores(nome)').eq('colaborador_id', profile.id).order('created_at', { ascending: false })
    setMentores(ment || []); setMinhas(sol || [])
    setLoading(false)
  }

  if (loading) return <p className="empty">Carregando...</p>

  const statusMentoriaLabel: Record<string, string> = { pendente: 'Pendente', aceita: 'Aceita', recusada: 'Recusada', reagendada: 'Reagendada', concluida: 'Concluída' }

  return (
    <>
      <section className="section-card">
        <h2>Mentores disponíveis</h2>
        <div className="card-grid">
          {mentores.map(m => (
            <div key={m.id} className="mentor-card">
              <div className="mentor-avatar">{m.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>
              <b>{m.nome}</b>
              <span className="text-muted">{m.cargo}</span>
              {m.areas && <p className="mentor-detail"><b>Áreas:</b> {m.areas}</p>}
              {m.temas && <p className="mentor-detail"><b>Temas:</b> {m.temas}</p>}
              <button className="btn-primary" style={{ marginTop: 10, width: '100%' }} onClick={() => setMentorSelecionado(m)}>Solicitar mentoria</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card" style={{ marginTop: 16 }}>
        <h2>Minhas solicitações</h2>
        {minhas.length === 0 ? <p className="empty">Nenhuma mentoria solicitada ainda.</p> : (
          <table className="data-table"><thead><tr><th>Mentor</th><th>Tema</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>{minhas.map(s => (
              <tr key={s.id}><td>{s.mentor?.nome}</td><td>{s.tema}</td>
                <td><span className="status-badge">{statusMentoriaLabel[s.status]}</span></td>
                <td>{new Date(s.created_at).toLocaleDateString('pt-BR')}</td></tr>
            ))}</tbody></table>
        )}
      </section>

      {mentorSelecionado && (
        <SolicitarMentoriaModal profile={profile} mentor={mentorSelecionado} onClose={() => setMentorSelecionado(null)} onCreated={load} />
      )}
    </>
  )
}

function SolicitarMentoriaModal({ profile, mentor, onClose, onCreated }: any) {
  const [tema, setTema] = useState(''); const [objetivo, setObjetivo] = useState('')
  const [desafio, setDesafio] = useState(''); const [dataPreferida, setDataPreferida] = useState('')
  const [horario, setHorario] = useState(''); const [formato, setFormato] = useState('videochamada')
  const [observacoes, setObservacoes] = useState(''); const [salvando, setSalvando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    await supabase.from('mentoria_solicitacoes').insert({
      colaborador_id: profile.id, mentor_id: mentor.id, tema, objetivo, desafio_atual: desafio,
      data_preferida: dataPreferida || null, horario_preferido: horario || null, formato, observacoes,
    })
    setSalvando(false)
    onCreated(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
        <h3>Solicitar mentoria com {mentor.nome}</h3>
        <form onSubmit={salvar}>
          <div className="input-group"><label>Tema da mentoria</label><input value={tema} onChange={e => setTema(e.target.value)} required /></div>
          <div className="input-group"><label>Objetivo da conversa</label><textarea value={objetivo} onChange={e => setObjetivo(e.target.value)} rows={2} /></div>
          <div className="input-group"><label>Desafio atual</label><textarea value={desafio} onChange={e => setDesafio(e.target.value)} rows={2} /></div>
          <div className="form-row">
            <div className="input-group"><label>Data preferida</label><input type="date" value={dataPreferida} onChange={e => setDataPreferida(e.target.value)} /></div>
            <div className="input-group"><label>Horário preferido</label><input value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ex: manhã, 14h..." /></div>
          </div>
          <div className="input-group"><label>Formato</label>
            <select value={formato} onChange={e => setFormato(e.target.value)}>
              <option value="videochamada">Videochamada</option><option value="presencial">Presencial</option><option value="telefone">Telefone</option>
            </select></div>
          <div className="input-group"><label>Observações</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Enviando...' : 'Solicitar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function HistoricoTab({ pdi, acoes }: any) {
  const eventos = [
    ...(pdi ? [{ data: pdi.created_at, texto: 'PDI criado', icon: Target }] : []),
    ...acoes.map((a: any) => ({ data: a.created_at, texto: `Ação criada: ${a.titulo}`, icon: ChevronRight })),
    ...acoes.filter((a: any) => a.status === 'concluido').map((a: any) => ({ data: a.created_at, texto: `Ação concluída: ${a.titulo}`, icon: Award })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return (
    <section className="section-card">
      <h2>Linha do tempo</h2>
      {eventos.length === 0 ? <p className="empty">Nenhum evento registrado ainda.</p> : (
        <div className="timeline">
          {eventos.map((e, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"><e.icon size={13} /></div>
              <div><span>{e.texto}</span><time>{new Date(e.data).toLocaleDateString('pt-BR')}</time></div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}