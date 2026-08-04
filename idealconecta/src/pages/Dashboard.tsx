import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Umbrella, UserCircle, FileText, Edit3, Heart, Megaphone, Image as ImageIcon,
  BookOpen, Briefcase, GraduationCap, Rocket, Plus, X, Upload
} from 'lucide-react'
import type { Comunicado, Ferias } from '../types'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function Dashboard() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const navigate = useNavigate()
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [proximasFerias, setProximasFerias] = useState<Ferias | null>(null)
  const [fotos, setFotos] = useState<any[]>([])
  const [aniversariantes, setAniversariantes] = useState<any[]>([])
  const [showAddAniv, setShowAddAniv] = useState(false)

  useEffect(() => { loadAll() }, [profile])

  function loadAll() {
    supabase.from('comunicados').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setComunicados(data || []))
    supabase.from('galeria').select('*').order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setFotos(data || []))
    loadAniversariantes()
    if (profile) {
      supabase.from('ferias').select('*').eq('colaborador_id', profile.id).eq('status', 'aprovada')
        .gte('data_inicio', new Date().toISOString().slice(0, 10)).order('data_inicio', { ascending: true }).limit(1)
        .then(({ data }) => setProximasFerias(data?.[0] || null))
    }
  }

  function loadAniversariantes() {
    const mesAtual = new Date().getMonth() + 1
    supabase.from('aniversariantes').select('*').eq('mes', mesAtual).order('dia')
      .then(({ data }) => setAniversariantes(data || []))
  }

  const removerAniversariante = async (id: string) => {
    if (!confirm('Remover esse aniversariante da lista?')) return
    await supabase.from('aniversariantes').delete().eq('id', id)
    loadAniversariantes()
  }

  const tempoDeEmpresa = () => {
    if (!profile?.data_admissao) return '—'
    const inicio = new Date(profile.data_admissao)
    const hoje = new Date()
    let anos = hoje.getFullYear() - inicio.getFullYear()
    let meses = hoje.getMonth() - inicio.getMonth()
    if (meses < 0) { anos--; meses += 12 }
    return `${anos} ano${anos !== 1 ? 's' : ''} e ${meses} ${meses !== 1 ? 'meses' : 'mês'}`
  }

  const ini = (n: string) => n.split(' ').map(p => p[0]).slice(0, 2).join('')

  return (
    <div className="page dash-page">
      <div className="dash-layout">
        <div className="dash-main">
          {/* Hero banner — carrossel real quando há conteúdo pra rotacionar */}
          <HeroCarousel comunicados={comunicados} aniversariantes={aniversariantes} />

          {/* Stat cards */}
          <div className="info-cards-row">
            <div className="info-mini-card">
              <div className="info-mini-icon"><Umbrella size={18} /></div>
              <div><span className="info-mini-label">Meu tempo de empresa</span>
                <b>{tempoDeEmpresa()}</b>
                <small>{profile?.data_admissao ? `Data de admissão: ${new Date(profile.data_admissao).toLocaleDateString('pt-BR')}` : 'Admissão não cadastrada'}</small>
              </div>
            </div>
            <div className="info-mini-card">
              <div className="info-mini-icon"><Umbrella size={18} /></div>
              <div><span className="info-mini-label">Próximas férias</span>
                {proximasFerias ? (
                  <>
                    <b>{new Date(proximasFerias.data_inicio).toLocaleDateString('pt-BR')}</b>
                    <small>a {new Date(proximasFerias.data_fim).toLocaleDateString('pt-BR')} ({proximasFerias.dias} dias)</small>
                  </>
                ) : (<><b>Nenhuma agendada</b><small>Solicite pelo módulo de Férias</small></>)}
              </div>
            </div>
            <div className="info-mini-card">
              <div className="info-mini-icon"><Briefcase size={18} /></div>
              <div><span className="info-mini-label">Minha área</span>
                <b>{profile?.departamento || 'Não definida'}</b>
                <small>{profile?.cargo || 'Cargo não definido'}</small>
              </div>
            </div>
          </div>

          {/* Comunicados + Galeria */}
          <div className="dash-two-col">
            <section className="section-card">
              <div className="section-head">
                <h2><Megaphone size={17} /> Comunicados recentes</h2>
                <button className="link-btn" onClick={() => navigate('/comunicados')}>Ver todos</button>
              </div>
              {comunicados.length === 0 ? (
                <p className="empty">Nenhum comunicado publicado ainda.</p>
              ) : (
                <ul className="mini-list">
                  {comunicados.map(c => (
                    <li key={c.id}><span>{c.titulo}</span><time>{new Date(c.created_at).toLocaleDateString('pt-BR')}</time></li>
                  ))}
                </ul>
              )}
              <button className="btn-outline full-w" onClick={() => navigate('/comunicados')}>Ver todos os comunicados</button>
            </section>

            <section className="section-card">
              <div className="section-head">
                <h2><ImageIcon size={17} /> O que rolou por aqui</h2>
                <button className="link-btn" onClick={() => navigate('/galeria')}>Ver galeria</button>
              </div>
              {fotos.length === 0 ? (
                <p className="empty">Nenhuma foto publicada ainda.</p>
              ) : (
                <div className="mini-gallery-grid">
                  {fotos.map(f => <img key={f.id} src={f.imagem_url} alt={f.titulo} />)}
                </div>
              )}
              <button className="btn-outline full-w" onClick={() => navigate('/galeria')}>Ver todas as fotos</button>
            </section>
          </div>

          {/* Quick links row */}
          <div className="quick-links-row">
            <button className="quick-link-card" onClick={() => navigate('/politicas')}>
              <BookOpen size={20} /><b>Políticas e Documentos</b>
              <p>Acesse todas as políticas, manuais e documentos importantes.</p>
              <span>Acessar</span>
            </button>
            <button className="quick-link-card" onClick={() => navigate('/cargos')}>
              <Briefcase size={20} /><b>Descrição de Cargos</b>
              <p>Consulte as descrições de cargos e responsabilidades.</p>
              <span>Acessar</span>
            </button>
            <button className="quick-link-card" onClick={() => navigate('/treinamentos')}>
              <GraduationCap size={20} /><b>Treinamentos</b>
              <p>Veja os treinamentos disponíveis e seu histórico.</p>
              <span>Acessar</span>
            </button>
          </div>
        </div>

        {/* Right rail */}
        <div className="dash-rail">
          <section className="section-card rail-card">
            <h2 className="rail-title">🚀 Acesso rápido</h2>
            <div className="quick-access-grid">
              <button onClick={() => navigate('/ferias')}><Umbrella size={20} /><span>Solicitar Férias</span></button>
              <button onClick={() => navigate('/meus-dados')}><UserCircle size={20} /><span>Perfil Profissional</span></button>
              <button onClick={() => navigate('/holerite')}><FileText size={20} /><span>Holerite</span></button>
              <button onClick={() => navigate('/meus-dados')}><Edit3 size={20} /><span>Atualizar Dados</span></button>
              <button onClick={() => navigate('/declaracoes')}><FileText size={20} /><span>Declarações</span></button>
              <button onClick={() => navigate('/beneficios')}><Heart size={20} /><span>Benefícios</span></button>
            </div>
          </section>

          <section className="section-card rail-card bday-rail">
            <div className="section-head">
              <h2 className="rail-title">🎉 Aniversariantes do mês</h2>
              {isAdmin && <button className="link-btn" onClick={() => setShowAddAniv(true)}><Plus size={14} /></button>}
            </div>
            {aniversariantes.length === 0 ? (
              <p className="empty" style={{ fontSize: 13 }}>Nenhum aniversariante cadastrado este mês.</p>
            ) : (
              <div className="bday-rail-list">
                {aniversariantes.map((b) => (
                  <div key={b.id} className="bday-rail-item">
                    {b.foto_url ? (
                      <img src={b.foto_url} alt={b.nome} className="bday-photo" />
                    ) : (
                      <div className="bday-av" style={{ background: 'var(--primary-2)' }}>{ini(b.nome)}</div>
                    )}
                    <div><b>{b.nome}</b><small>{b.departamento || '—'}</small></div>
                    <span className="bday-rail-date">{String(b.dia).padStart(2, '0')}/{String(b.mes).padStart(2, '0')}</span>
                    {isAdmin && <button className="bday-remove" onClick={() => removerAniversariante(b.id)}><X size={13} /></button>}
                  </div>
                ))}
              </div>
            )}
            {aniversariantes.length > 0 && <p className="bday-wish">🎉 Parabéns! Desejamos muita saúde e sucesso.</p>}
          </section>

          <div className="oportunidades-banner">
            <Rocket size={26} />
            <b>Oportunidades internas</b>
            <p>Antes de buscar lá fora, a gente cresce aqui dentro.</p>
          </div>
        </div>
      </div>

      {showAddAniv && <AdicionarAniversarianteModal onClose={() => setShowAddAniv(false)} onCreated={loadAniversariantes} />}
    </div>
  )
}

// Carrossel do banner principal — só rotaciona quando há mais de um slide com
// conteúdo real (comunicado recente, aniversariantes do mês). Com apenas o
// slide de boas-vindas, os pontinhos nem aparecem.
function HeroCarousel({ comunicados, aniversariantes }: { comunicados: Comunicado[]; aniversariantes: any[] }) {
  const navigate = useNavigate()

  const slides = useMemo(() => {
    const s: Array<{ type: 'welcome' } | { type: 'comunicado'; data: Comunicado } | { type: 'aniversario'; data: any[] }> = [
      { type: 'welcome' },
    ]
    if (comunicados.length > 0) s.push({ type: 'comunicado', data: comunicados[0] })
    if (aniversariantes.length > 0) s.push({ type: 'aniversario', data: aniversariantes })
    return s
  }, [comunicados, aniversariantes])

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= slides.length) setIdx(0)
  }, [slides.length, idx])

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])

  const slide = slides[idx] || slides[0]

  return (
    <div className="hero-banner">
      <div className="hero-banner-text">
        {slide.type === 'welcome' && (
          <>
            <span className="hero-eyebrow">Bem-vindo(a) ao</span>
            <h1>Portal do Colaborador<br />Ideal Empregos</h1>
            <p>Tudo o que você precisa, em um só lugar!</p>
            <button className="btn-accent" onClick={() => navigate('/politicas')}>Saiba mais</button>
          </>
        )}
        {slide.type === 'comunicado' && (
          <>
            <span className="hero-eyebrow">📣 Comunicado recente</span>
            <h1>{slide.data.titulo}</h1>
            <p>{slide.data.conteudo.length > 120 ? `${slide.data.conteudo.slice(0, 120)}...` : slide.data.conteudo}</p>
            <button className="btn-accent" onClick={() => navigate('/comunicados')}>Ver comunicados</button>
          </>
        )}
        {slide.type === 'aniversario' && (
          <>
            <span className="hero-eyebrow">🎉 Aniversariantes do mês</span>
            <h1>{slide.data.length === 1 ? slide.data[0].nome : `${slide.data.length} colaboradores fazem aniversário`}</h1>
            <p>Desejamos muita saúde e sucesso a quem está de aniversário!</p>
            <button className="btn-accent" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Ver na lateral →</button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button key={i} className={`dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdicionarAniversarianteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nome, setNome] = useState(''); const [departamento, setDepartamento] = useState('')
  const [dia, setDia] = useState(''); const [mes, setMes] = useState(String(new Date().getMonth() + 1))
  const [file, setFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState('')

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !dia || !mes) return
    setEnviando(true); setErro('')

    let foto_url: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error: uploadError } = await supabase.storage.from('aniversariantes').upload(path, file)
      if (uploadError) { setErro('Erro no upload da foto. Verifique se o bucket "aniversariantes" foi criado (migration_007).'); setEnviando(false); return }
      const { data: pub } = supabase.storage.from('aniversariantes').getPublicUrl(path)
      foto_url = pub.publicUrl
    }

    const { error } = await supabase.from('aniversariantes').insert({
      nome, departamento: departamento || null, dia: parseInt(dia), mes: parseInt(mes), foto_url,
    })
    setEnviando(false)
    if (error) { setErro('Não foi possível salvar.'); return }
    onCreated(); onClose()
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