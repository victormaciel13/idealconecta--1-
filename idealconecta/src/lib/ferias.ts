// Cálculo de saldo de férias seguindo a regra da CLT (Art. 130):
// a cada 12 meses trabalhados (período aquisitivo completo), o
// colaborador adquire direito a férias — mas a QUANTIDADE de dias
// depende de quantas faltas injustificadas ele teve DENTRO daquele
// período específico, segundo a tabela oficial:
//
//   0 a 5 faltas   → 30 dias corridos
//   6 a 14 faltas  → 24 dias corridos
//   15 a 23 faltas → 18 dias corridos
//   24 a 32 faltas → 12 dias corridos
//   mais de 32     → perde o direito a férias naquele período
//
// Os 30 dias usados no período seguinte (concessivo) precisam ser
// usados dentro dos 12 meses seguintes ao fim do período aquisitivo.

export interface FeriasAprovada {
  data_inicio: string
  data_fim: string
  dias: number
}

export interface FaltaInjustificada {
  data: string
}

export interface PeriodoAquisitivoCalculado {
  inicio: Date
  fim: Date
  faltasInjustificadas: number
  diasDireito: number
}

export interface SaldoFerias {
  periodos: PeriodoAquisitivoCalculado[]
  diasDireitoAcumulados: number
  diasGozados: number
  saldoDisponivel: number
  inicioPeriodoAquisitivoAtual: Date
  fimPeriodoAquisitivoAtual: Date
  dataLimiteGozo: Date
  diasProporcionaisPeriodoAtual: number
  periodoAquisitivoCompleto: boolean
  temReducaoPorFaltas: boolean
}

// Tabela de proporcionalidade — Art. 130 da CLT
function diasPorFaltas(faltasInjustificadas: number): number {
  if (faltasInjustificadas <= 5) return 30
  if (faltasInjustificadas <= 14) return 24
  if (faltasInjustificadas <= 23) return 18
  if (faltasInjustificadas <= 32) return 12
  return 0
}

// Datas do Postgres chegam como texto "YYYY-MM-DD". Se a gente usar
// `new Date("YYYY-MM-DD")` direto, o JavaScript interpreta isso como
// meia-noite em UTC — e em qualquer navegador no fuso do Brasil
// (UTC-3), isso VOLTA um dia na hora de exibir (28/08 vira 27/08).
// Por isso, sempre construímos a data a partir dos números soltos,
// o que cria a data à meia-noite no fuso LOCAL, sem esse deslocamento.
export function parseDataLocal(valor: string | Date): Date {
  if (valor instanceof Date) return valor
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function calcularSaldoFerias(
  dataAdmissao: string | Date,
  feriasAprovadas: FeriasAprovada[],
  faltasInjustificadas: FaltaInjustificada[] = []
): SaldoFerias {
  const hoje = new Date()
  const admissao = parseDataLocal(dataAdmissao)
  const faltasDatas = faltasInjustificadas.map(f => parseDataLocal(f.data))

  const contarFaltasNoIntervalo = (inicio: Date, fim: Date) =>
    faltasDatas.filter(d => d >= inicio && d < fim).length

  const periodos: PeriodoAquisitivoCalculado[] = []
  let cursor = new Date(admissao)
  while (true) {
    const proximo = new Date(cursor)
    proximo.setFullYear(proximo.getFullYear() + 1)
    if (proximo > hoje) break
    const faltas = contarFaltasNoIntervalo(cursor, proximo)
    periodos.push({ inicio: new Date(cursor), fim: new Date(proximo), faltasInjustificadas: faltas, diasDireito: diasPorFaltas(faltas) })
    cursor = proximo
  }

  const inicioPeriodoAtual = new Date(cursor)
  const fimPeriodoAtual = new Date(cursor)
  fimPeriodoAtual.setFullYear(fimPeriodoAtual.getFullYear() + 1)

  const dataLimiteGozo = new Date(fimPeriodoAtual)
  dataLimiteGozo.setFullYear(dataLimiteGozo.getFullYear() + 1)

  const diasDireitoAcumulados = periodos.reduce((s, p) => s + p.diasDireito, 0)
  const diasGozados = feriasAprovadas.reduce((soma, f) => soma + (f.dias || 0), 0)
  const saldoDisponivel = Math.max(0, diasDireitoAcumulados - diasGozados)

  const mesesNoPeriodoAtual = Math.max(0,
    (hoje.getFullYear() - inicioPeriodoAtual.getFullYear()) * 12 + (hoje.getMonth() - inicioPeriodoAtual.getMonth())
  )
  const faltasPeriodoAtual = contarFaltasNoIntervalo(inicioPeriodoAtual, fimPeriodoAtual)
  const tetoProporcional = diasPorFaltas(faltasPeriodoAtual)
  const diasProporcionaisPeriodoAtual = Math.min(tetoProporcional, Math.floor(mesesNoPeriodoAtual * (tetoProporcional / 12)))

  return {
    periodos, diasDireitoAcumulados, diasGozados, saldoDisponivel,
    inicioPeriodoAquisitivoAtual: inicioPeriodoAtual, fimPeriodoAquisitivoAtual: fimPeriodoAtual,
    dataLimiteGozo, diasProporcionaisPeriodoAtual,
    periodoAquisitivoCompleto: periodos.length > 0,
    temReducaoPorFaltas: periodos.some(p => p.diasDireito < 30),
  }
}