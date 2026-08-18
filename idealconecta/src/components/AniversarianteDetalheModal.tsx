import { PartyPopper } from 'lucide-react'

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function AniversarianteDetalheModal({ aniversariante, onClose }: { aniversariante: any; onClose: () => void }) {
  const ini = (n: string) => n.split(' ').map((p: string) => p[0]).slice(0, 2).join('')
  const mensagemPadrao = `A equipe Ideal Empregos deseja um feliz aniversário para ${aniversariante.nome.split(' ')[0]}! 🎉 Que seu dia seja repleto de alegria e realizações.`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content section-card aniv-detalhe" onClick={e => e.stopPropagation()}>
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
          <button type="button" className="btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}