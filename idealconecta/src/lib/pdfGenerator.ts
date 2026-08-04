import { jsPDF } from 'jspdf'

const BRAND = { primary: [11, 37, 69] as [number, number, number], accent: [28, 109, 208] as [number, number, number] }

function header(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...BRAND.primary)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Ideal Empregos', 14, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, 14, 20)
  doc.setTextColor(30, 30, 30)
}

function footer(doc: jsPDF) {
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('Documento gerado eletronicamente pelo IdealConecta — Ideal Empregos.', 14, 287)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 292)
}

const fmtMoney = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Simplified Brazilian INSS/IRRF approximation for a realistic-looking payslip
function calcularINSS(salario: number) {
  const faixas = [
    { ate: 1412.00, aliq: 0.075 },
    { ate: 2666.68, aliq: 0.09 },
    { ate: 4000.03, aliq: 0.12 },
    { ate: 7786.02, aliq: 0.14 },
  ]
  let inss = 0, anterior = 0
  for (const f of faixas) {
    if (salario > anterior) {
      const base = Math.min(salario, f.ate) - anterior
      inss += base * f.aliq
      anterior = f.ate
    }
  }
  return Math.round(inss * 100) / 100
}

function calcularIRRF(baseCalculo: number) {
  if (baseCalculo <= 2259.20) return 0
  if (baseCalculo <= 2826.65) return Math.max(0, baseCalculo * 0.075 - 169.44)
  if (baseCalculo <= 3751.05) return Math.max(0, baseCalculo * 0.15 - 381.44)
  if (baseCalculo <= 4664.68) return Math.max(0, baseCalculo * 0.225 - 662.77)
  return Math.max(0, baseCalculo * 0.275 - 896.00)
}

export interface HoleriteData {
  nome: string; sobrenome: string; cargo: string | null; departamento: string | null
  cpf?: string | null; competencia: string; salarioBase: number
  horasExtras?: number; valeTransporte?: number; valeRefeicao?: number
  outrosProventos?: number; outrosDescontos?: number
}

export function gerarHoleritePDF(d: HoleriteData) {
  const doc = new jsPDF()
  header(doc, 'Recibo de Pagamento de Salário')

  let y = 40
  doc.setFontSize(11); doc.setFont('helvetica', 'bold')
  doc.text(`${d.nome} ${d.sobrenome}`, 14, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  y += 6
  doc.text(`Cargo: ${d.cargo || 'Não definido'}    Departamento: ${d.departamento || 'Não definido'}`, 14, y)
  y += 5
  doc.text(`CPF: ${d.cpf || '—'}    Competência: ${d.competencia}`, 14, y)

  y += 12
  doc.setDrawColor(...BRAND.accent)
  doc.setFillColor(...BRAND.accent)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, y - 5, 182, 7, 'F')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold')
  doc.text('Descrição', 18, y)
  doc.text('Proventos', 130, y)
  doc.text('Descontos', 165, y)
  doc.setTextColor(30, 30, 30)

  const he = d.horasExtras ?? 0
  const vt = d.valeTransporte ?? Math.round(d.salarioBase * 0.06 * 100) / 100
  const vr = d.valeRefeicao ?? 0
  const outrosP = d.outrosProventos ?? 0
  const outrosD = d.outrosDescontos ?? 0
  const inss = calcularINSS(d.salarioBase)
  const irrf = calcularIRRF(d.salarioBase - inss)

  const linhas: [string, number, number][] = [
    ['Salário base', d.salarioBase, 0],
    ...(he > 0 ? [['Horas extras', he, 0] as [string, number, number]] : []),
    ...(outrosP > 0 ? [['Outros proventos', outrosP, 0] as [string, number, number]] : []),
    ['INSS', 0, inss],
    ...(irrf > 0 ? [['IRRF', 0, irrf] as [string, number, number]] : []),
    ['Vale transporte (desc.)', 0, vt],
    ...(vr > 0 ? [['Vale refeição (desc.)', 0, vr] as [string, number, number]] : []),
    ...(outrosD > 0 ? [['Outros descontos', 0, outrosD] as [string, number, number]] : []),
  ]

  y += 4
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  let totalProv = d.salarioBase + he + outrosP
  let totalDesc = inss + irrf + vt + vr + outrosD
  for (const [desc, prov, dsc] of linhas) {
    y += 7
    doc.text(desc, 18, y)
    if (prov > 0) doc.text(fmtMoney(prov), 130, y)
    if (dsc > 0) doc.text(fmtMoney(dsc), 165, y)
  }

  y += 12
  doc.setDrawColor(200, 200, 200)
  doc.line(14, y, 196, y)
  y += 8
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text(`Total de proventos: ${fmtMoney(totalProv)}`, 14, y)
  y += 6
  doc.text(`Total de descontos: ${fmtMoney(totalDesc)}`, 14, y)
  y += 8
  doc.setFontSize(12)
  doc.setTextColor(...BRAND.accent)
  doc.text(`Valor líquido: ${fmtMoney(totalProv - totalDesc)}`, 14, y)
  doc.setTextColor(30, 30, 30)

  footer(doc)
  doc.save(`holerite-${d.competencia}-${d.nome.toLowerCase()}.pdf`)
}

export interface DeclaracaoData {
  nome: string; sobrenome: string; cargo: string | null; departamento: string | null
  cpf?: string | null; dataAdmissao?: string | null; salarioBase?: number | null
  tipo: 'vinculo' | 'renda' | 'salario'
}

export function gerarDeclaracaoPDF(d: DeclaracaoData) {
  const doc = new jsPDF()
  const titulos: Record<string, string> = {
    vinculo: 'Declaração de Vínculo Empregatício',
    renda: 'Informe de Rendimentos (IRPF)',
    salario: 'Comprovante de Salário',
  }
  header(doc, titulos[d.tipo])

  let y = 45
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const admissao = d.dataAdmissao ? new Date(d.dataAdmissao).toLocaleDateString('pt-BR') : 'não informada'

  let corpo = ''
  if (d.tipo === 'vinculo') {
    corpo = `A Ideal Empregos declara, para os devidos fins, que ${d.nome} ${d.sobrenome}, portador(a) do CPF ${d.cpf || 'não informado'}, mantém vínculo empregatício ativo com esta empresa desde ${admissao}, ocupando o cargo de ${d.cargo || 'não definido'} no departamento de ${d.departamento || 'não definido'}.`
  } else if (d.tipo === 'salario') {
    corpo = `A Ideal Empregos declara que ${d.nome} ${d.sobrenome}, portador(a) do CPF ${d.cpf || 'não informado'}, ocupa o cargo de ${d.cargo || 'não definido'} desde ${admissao}, percebendo remuneração mensal de ${d.salarioBase ? d.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'não informada'}.`
  } else {
    const anoBase = new Date().getFullYear() - 1
    corpo = `Informe de Rendimentos referente ao ano-base ${anoBase}, fornecido para fins de declaração de Imposto de Renda de Pessoa Física, de ${d.nome} ${d.sobrenome}, CPF ${d.cpf || 'não informado'}, colaborador(a) da Ideal Empregos desde ${admissao}. Os valores detalhados de rendimentos e retenções constam nos holerites mensais emitidos pela empresa.`
  }

  const linhas = doc.splitTextToSize(corpo, 180)
  doc.text(linhas, 14, y)
  y += linhas.length * 6 + 16

  doc.text(`São Paulo, ${new Date().toLocaleDateString('pt-BR')}.`, 14, y)
  y += 24
  doc.line(60, y, 150, y)
  y += 6
  doc.setFontSize(9)
  doc.text('Ideal Empregos — Recursos Humanos', 65, y)

  footer(doc)
  doc.save(`${d.tipo}-${d.nome.toLowerCase()}.pdf`)
}

export function gerarPoliticaPDF(titulo: string, categoria: string, conteudo: string) {
  const doc = new jsPDF()
  header(doc, categoria)

  let y = 42
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  const tituloLinhas = doc.splitTextToSize(titulo, 180)
  doc.text(tituloLinhas, 14, y)
  y += tituloLinhas.length * 7 + 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const paragrafos = conteudo.split('\n\n')
  for (const p of paragrafos) {
    const linhas = doc.splitTextToSize(p, 180)
    if (y + linhas.length * 5.5 > 275) { doc.addPage(); y = 20 }
    doc.text(linhas, 14, y)
    y += linhas.length * 5.5 + 5
  }

  footer(doc)
  doc.save(`${titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`)
}
