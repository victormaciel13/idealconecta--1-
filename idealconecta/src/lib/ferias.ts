// Cálculo de saldo de férias seguindo a regra da CLT:
// a cada 12 meses trabalhados (período aquisitivo completo), o
// colaborador adquire 30 dias de férias. Esses 30 dias precisam ser
// usados dentro dos 12 meses seguintes (período concessivo) — depois
// disso, a lei considera a férias "vencida" (a empresa deve indenizar
// em dobro, mas o saldo por aqui continua contando normalmente).
//
// Simplificação assumida: não há desconto por faltas injustificadas
// (a tabela de proporcionalidade da CLT por faltas não é aplicada
// aqui — se isso for necessário, precisa de um controle de frequência
// que o sistema ainda não tem).

export interface FeriasAprovada {
  data_inicio: string
  data_fim: string
  dias: number
}

export interface SaldoFerias {
  periodosCompletos: number
  diasDireitoAcumulados: number
  diasGozados: number
  saldoDisponivel: number
  inicioPeriodoAquisitivoAtual: Date
  fimPeriodoAquisitivoAtual: Date
  dataLimiteGozo: Date
  diasProporcionaisPeriodoAtual: number
  periodoAquisitivoCompleto: boolean
}

export function calcularSaldoFerias(dataAdmissao: string | Date, feriasAprovadas: FeriasAprovada[]): SaldoFerias {
  const hoje = new Date()
  const admissao = new Date(dataAdmissao)

  let periodosCompletos = 0
  let cursor = new Date(admissao)
  while (true) {
    const proximo = new Date(cursor)
    proximo.setFullYear(proximo.getFullYear() + 1)
    if (proximo <= hoje) {
      periodosCompletos++
      cursor = proximo
    } else break
  }

  const inicioPeriodoAtual = new Date(cursor)
  const fimPeriodoAtual = new Date(cursor)
  fimPeriodoAtual.setFullYear(fimPeriodoAtual.getFullYear() + 1)

  const dataLimiteGozo = new Date(fimPeriodoAtual)
  dataLimiteGozo.setFullYear(dataLimiteGozo.getFullYear() + 1)

  const diasDireitoAcumulados = periodosCompletos * 30
  const diasGozados = feriasAprovadas.reduce((soma, f) => soma + (f.dias || 0), 0)
  const saldoDisponivel = Math.max(0, diasDireitoAcumulados - diasGozados)

  // Dias proporcionais já "ganhos" dentro do período aquisitivo em
  // andamento (2,5 dias por mês completo) — informativo, ainda não
  // pode ser tirado até completar o período.
  const mesesNoPeriodoAtual = Math.max(0,
    (hoje.getFullYear() - inicioPeriodoAtual.getFullYear()) * 12 + (hoje.getMonth() - inicioPeriodoAtual.getMonth())
  )
  const diasProporcionaisPeriodoAtual = Math.min(30, Math.floor(mesesNoPeriodoAtual * 2.5))

  return {
    periodosCompletos, diasDireitoAcumulados, diasGozados, saldoDisponivel,
    inicioPeriodoAquisitivoAtual: inicioPeriodoAtual, fimPeriodoAquisitivoAtual: fimPeriodoAtual,
    dataLimiteGozo, diasProporcionaisPeriodoAtual,
    periodoAquisitivoCompleto: periodosCompletos > 0,
  }
}