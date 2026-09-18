import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Umbrella, FileText, Edit3, Heart, Megaphone, Image as ImageIcon,
  BookOpen, Briefcase, GraduationCap, Rocket
} from 'lucide-react'
import type { Comunicado, Ferias } from '../types'
import { parseDataLocal } from '../lib/ferias'

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [proximasFerias, setProximasFerias] = useState<Ferias | null>(null)
  const [fotos, setFotos] = useState<any[]>([])
  const [aniversariantes, setAniversariantes] = useState<any[]>([])
  const [anivDetalhe, setAnivDetalhe] = useState<any>(null)

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

  // Aniversariantes agora vem direto do cadastro de cada colaborador
  // (campo "Data de nascimento") — não precisa mais recadastrar nada
  // todo mês. Basta o RH preencher essa data uma vez na tela de
  // Colaboradores, e a pessoa aparece automaticamente no mês certo,
  // todo ano, pra sempre.
  function loadAniversariantes() {
    const mesAtual = new Date().getMonth() + 1
    supabase.from('colaboradores').select('id, nome, sobrenome, departamento, avatar_url, data_nascimento').eq('ativo', true).not('data_nascimento', 'is', null)
      .then(({ data }) => {
        const doMes = (data || []).filter(c => {
          const d = parseDataLocal(c.data_nascimento)
          return d.getMonth() + 1 === mesAtual
        }).sort((a, b) => parseDataLocal(a.data_nascimento).getDate() - parseDataLocal(b.data_nascimento).getDate())
        setAniversariantes(doMes)
      })
  }

  const tempoDeEmpresa = () => {
    if (!profile?.data_admissao) return '—'
    const inicio = parseDataLocal(profile.data_admissao)
    const hoje = new Date()
    let anos = hoje.getFullYear() - inicio.getFullYear()
    let meses = hoje.getMonth() - inicio.getMonth()
    if (meses < 0) { anos--; meses += 12 }
    return `${anos} ano${anos !== 1 ? 's' : ''} e ${meses} ${meses !== 1 ? 'meses' : 'mês'}`
  }

  const ini = (n: string) => n.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('')

  return (
    <div className="page dash-page">
      <div className="dash-layout">
        <div className="dash-main">
          <HeroCarousel comunicados={comunicados} aniversariantes={aniversariantes} />

          <div className="info-cards-row">
            <div className="info-mini-card">
              <div className="info-mini-icon"><Umbrella size={18} /></div>
              <div><span className="info-mini-label">Meu tempo de empresa</span>
                <b>{tempoDeEmpresa()}</b>
                <small>{profile?.data_admissao ? `Data de admissão: ${parseDataLocal(profile.data_admissao).toLocaleDateString('pt-BR')}` : 'Admissão não cadastrada'}</small>
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

        <div className="dash-rail">
          <section className="section-card rail-card">
            <h2 className="rail-title">🚀 Acesso rápido</h2>
            <div className="quick-access-grid">
              <button onClick={() => navigate('/ferias')}><Umbrella size={20} /><span>Solicitar Férias</span></button>
              <button onClick={() => navigate('/holerite')}><FileText size={20} /><span>Holerite</span></button>
              <button onClick={() => navigate('/meus-dados')}><Edit3 size={20} /><span>Atualizar Dados</span></button>
              <button onClick={() => navigate('/declaracoes')}><FileText size={20} /><span>Declarações</span></button>
              <button onClick={() => navigate('/beneficios')}><Heart size={20} /><span>Benefícios</span></button>
            </div>
          </section>

          <section className="section-card rail-card bday-rail">
            <h2 className="rail-title">🎉 Aniversariantes do mês</h2>
            {aniversariantes.length === 0 ? (
              <p className="empty" style={{ fontSize: 13 }}>Ninguém com data de nascimento cadastrada faz aniversário esse mês.</p>
            ) : (
              <div className="bday-rail-list">
                {aniversariantes.map((b) => {
                  const nomeCompleto = `${b.nome} ${b.sobrenome}`
                  const dataNasc = parseDataLocal(b.data_nascimento)
                  return (
                    <div key={b.id} className="bday-rail-item" onClick={() => setAnivDetalhe(b)} style={{ cursor: 'pointer' }}>
                      {b.avatar_url ? (
                        <img src={b.avatar_url} alt={nomeCompleto} className="bday-photo" />
                      ) : (
                        <div className="bday-av" style={{ background: 'var(--primary-2)' }}>{ini(nomeCompleto)}</div>
                      )}
                      <div><b>{nomeCompleto}</b><small>{b.departamento || '—'}</small></div>
                      <span className="bday-rail-date">{String(dataNasc.getDate()).padStart(2, '0')}/{String(dataNasc.getMonth() + 1).padStart(2, '0')}</span>
                    </div>
                  )
                })}
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

      {anivDetalhe && (
        <div className="modal-overlay" onClick={() => setAnivDetalhe(null)}>
          <div className="modal-content section-card aniv-detalhe" onClick={e => e.stopPropagation()}>
            {anivDetalhe.avatar_url ? (
              <img src={anivDetalhe.avatar_url} alt={anivDetalhe.nome} className="aniv-detalhe-foto" />
            ) : (
              <div className="aniv-detalhe-avatar">{ini(`${anivDetalhe.nome} ${anivDetalhe.sobrenome}`)}</div>
            )}
            <div className="aniv-detalhe-badge">🎉 Aniversário</div>
            <h3 style={{ marginTop: 10 }}>{anivDetalhe.nome} {anivDetalhe.sobrenome}</h3>
            <p className="text-muted" style={{ fontSize: 13, margin: '2px 0 4px' }}>{anivDetalhe.departamento || '—'}</p>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 14 }}>
              A equipe Ideal Empregos deseja um feliz aniversário para {anivDetalhe.nome}! 🎉 Que seu dia seja repleto de alegria e realizações.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={() => setAnivDetalhe(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

  useEffect(() => { if (idx >= slides.length) setIdx(0) }, [slides.length, idx])
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
            <h1>{slide.data.length === 1 ? `${slide.data[0].nome} ${slide.data[0].sobrenome}` : `${slide.data.length} colaboradores fazem aniversário`}</h1>
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