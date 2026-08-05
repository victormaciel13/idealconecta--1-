import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ExternalLink, Plus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

type Treinamento = {
  titulo: string; cat: string; desc: string; obrigatorio: boolean
  tipo: 'link' | 'conteudo'
  url?: string
  conteudo?: string
}

const treinamentosReais: Treinamento[] = [
  {
    titulo: 'NR-1 — Transporte, Movimentação e Armazenagem de Materiais',
    cat: 'Compliance', obrigatorio: true, tipo: 'link',
    desc: 'Norma oficial do Ministério do Trabalho para operação segura de empilhadeiras e movimentação de cargas.',
    url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs',
  },
  {
    titulo: 'LGPD na prática — Lei nº 13.709/2018',
    cat: 'Compliance', obrigatorio: true, tipo: 'link',
    desc: 'Texto oficial da Lei Geral de Proteção de Dados, publicado no Portal da Presidência da República.',
    url: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  },
  {
    titulo: 'Excel para o dia a dia',
    cat: 'Ferramentas', obrigatorio: false, tipo: 'link',
    desc: 'Central de suporte oficial da Microsoft com tutoriais de fórmulas, tabelas dinâmicas e gráficos no Excel.',
    url: 'https://support.microsoft.com/pt-br/excel',
  },
  {
    titulo: 'Integração — Novos Colaboradores',
    cat: 'Onboarding', obrigatorio: true, tipo: 'conteudo',
    desc: 'Conteúdo de boas-vindas com o essencial sobre a Ideal Empregos.',
    conteudo: `Bem-vindo(a) à Ideal Empregos!

A Ideal Empregos conecta pessoas e oportunidades, atuando na gestão de mão de obra operacional e logística para empresas parceiras em todo o Brasil.

Nos primeiros dias, é importante que você:
1. Registre seu ponto eletrônico desde o primeiro dia de trabalho.
2. Confira e complete seus dados pessoais na aba "Meus Dados" do IdealConecta.
3. Leia o Manual do Colaborador, disponível em "Políticas e Documentos".
4. Conheça seu gestor direto e os colegas de equipe.
5. Fique atento aos comunicados publicados no portal — é o canal oficial de avisos da empresa.

Em caso de dúvidas sobre benefícios, holerite ou férias, use os módulos correspondentes no menu lateral. Para dúvidas que não encontrar no portal, procure o RH.

Estamos felizes em ter você no time!`,
  },
  {
    titulo: 'Atendimento ao Cliente — Fundamentos',
    cat: 'Soft skills', obrigatorio: false, tipo: 'conteudo',
    desc: 'Técnicas essenciais de comunicação e resolução de conflitos no atendimento.',
    conteudo: `Um bom atendimento começa com escuta ativa: ouça completamente antes de responder, e demonstre que compreendeu o que a pessoa disse antes de propor uma solução.

Princípios básicos:
1. Empatia — reconheça o sentimento da pessoa antes de tratar o problema técnico ("Entendo que isso é frustrante...").
2. Clareza — explique próximos passos e prazos de forma objetiva, evitando jargões internos.
3. Proatividade — antecipe dúvidas comuns e ofereça soluções antes de ser perguntado.
4. Gestão de reclamações — mantenha a calma, não leve para o lado pessoal, e escale para o gestor quando o problema estiver fora da sua alçada.
5. Follow-up — sempre que prometer um retorno, cumpra o prazo combinado, mesmo que seja para dizer que ainda está em andamento.

Praticar esses princípios reduz reclamações recorrentes e aumenta a satisfação de clientes internos e externos.`,
  },
  {
    titulo: 'Liderança de Equipes Operacionais',
    cat: 'Gestão', obrigatorio: false, tipo: 'conteudo',
    desc: 'Fundamentos de delegação, feedback e gestão de conflitos para líderes de turno.',
    conteudo: `Liderar uma equipe operacional exige equilíbrio entre produtividade, segurança e desenvolvimento das pessoas.

1. Delegação eficaz: distribua tarefas considerando a capacidade e o desenvolvimento de cada colaborador, sendo claro sobre prazo, qualidade esperada e critério de conclusão.

2. Feedback contínuo: elogie comportamentos específicos publicamente quando apropriado, e trate correções de forma privada, objetiva e o mais próximo possível do fato observado.

3. Gestão de conflitos: ouça as partes separadamente antes de mediar, foque no comportamento e no impacto (não na pessoa), e busque um acordo prático para seguir em frente.

4. Segurança em primeiro lugar: nenhuma meta de produtividade justifica ignorar uma condição insegura. Pare a atividade, corrija o risco, e só então retome o ritmo.

5. Desenvolvimento da equipe: identifique quem está pronto para mais responsabilidade e converse sobre isso — não espere a avaliação anual para reconhecer potencial.

Um bom líder de turno é medido tanto pelos resultados da equipe quanto pela retenção e segurança das pessoas que lidera.`,
  },
]

export function Treinamentos() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [dbLista, setDbLista] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState(''); const [cat, setCat] = useState(''); const [desc, setDesc] = useState(''); const [url, setUrl] = useState('')
  const [aberto, setAberto] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('treinamentos').select('*').order('created_at', { ascending: false }).then(({ data }) => setDbLista(data || []))
  }, [])

  const registrarAcesso = (titulo: string, treinamentoId?: string) => {
    if (!profile) return
    supabase.from('treinamento_acessos').insert({
      treinamento_id: treinamentoId || null,
      treinamento_titulo: titulo,
      colaborador_id: profile.id,
    }).then(() => {})
  }

  const salvar = async () => {
    if (!nome) return
    await supabase.from('treinamentos').insert({ titulo: nome, descricao: desc, link_url: url || null })
    alert('Treinamento publicado!')
    setShowModal(false); setNome(''); setCat(''); setDesc(''); setUrl('')
    const { data } = await supabase.from('treinamentos').select('*').order('created_at', { ascending: false })
    setDbLista(data || [])
  }

  const useMock = dbLista.length === 0

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Treinamentos</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Conteúdos e materiais reais para o seu desenvolvimento.</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Novo treinamento</button>}
      </div>

      <div className="card-grid trn-grid">
        {useMock ? treinamentosReais.map((t, i) => (
          <div key={i} className="section-card trn-card">
            <div className="trn-top">
              <div className="trn-icon"><BookOpen size={22} /></div>
              <div><h4>{t.titulo}</h4><span className="trn-cat">{t.cat}</span></div>
            </div>
            {t.obrigatorio && <span className="tag-required">Obrigatório</span>}
            <p className="trn-desc">{t.desc}</p>

            {t.tipo === 'link' ? (
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="btn-ghost trn-access" onClick={() => registrarAcesso(t.titulo)}>
                <ExternalLink size={14} /> Acessar conteúdo oficial
              </a>
            ) : (
              <>
                <button className="btn-ghost trn-access" onClick={() => { setAberto(aberto === i ? null : i); if (aberto !== i) registrarAcesso(t.titulo) }}>
                  {aberto === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {aberto === i ? 'Fechar' : 'Ler conteúdo'}
                </button>
                {aberto === i && <div className="trn-inline-content">{t.conteudo}</div>}
              </>
            )}
          </div>
        )) : dbLista.map(t => (
          <div key={t.id} className="section-card trn-card">
            <div className="trn-top">
              <div className="trn-icon"><BookOpen size={22} /></div>
              <div><h4>{t.titulo}</h4></div>
            </div>
            {t.obrigatorio && <span className="tag-required">Obrigatório</span>}
            <p className="trn-desc">{t.descricao}</p>
            {t.link_url && <a href={t.link_url} target="_blank" rel="noopener noreferrer" className="btn-ghost trn-access" onClick={() => registrarAcesso(t.titulo, t.id)}><ExternalLink size={14} /> Acessar</a>}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content section-card" onClick={e => e.stopPropagation()}>
            <h3>Novo treinamento</h3>
            <div className="input-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Atendimento ao cliente" /></div>
            <div className="input-group"><label>Categoria</label><input value={cat} onChange={e => setCat(e.target.value)} placeholder="Ex: Soft skills, Compliance..." /></div>
            <div className="input-group"><label>Link (opcional)</label><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="input-group"><label>Descrição</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Sobre o que é o treinamento" /></div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvar}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
