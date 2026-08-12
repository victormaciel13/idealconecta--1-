export type UserRole = 'colaborador' | 'gerente' | 'admin'

export interface Colaborador {
  id: string; nome: string; sobrenome: string; cargo: string | null
  departamento: string | null; data_admissao: string | null; telefone: string | null
  cpf?: string | null; pis?: string | null; salario_base?: number | null
  gestor_id?: string | null
  role: UserRole; ativo: boolean; avatar_url: string | null
  created_at: string; updated_at: string
}

export interface Comunicado {
  id: string; titulo: string; conteudo: string; imagem_url: string | null
  autor_id: string; created_at: string; autor?: Colaborador
}

export interface Ferias {
  id: string; colaborador_id: string; data_inicio: string; data_fim: string
  dias: number; status: 'pendente' | 'aprovada' | 'rejeitada'
  comentario_gestor: string | null; aprovador_id: string | null
  created_at: string; colaborador?: Colaborador
}

export interface Notificacao {
  id: string; destinatario_id: string; titulo: string
  mensagem: string | null; lida: boolean; created_at: string
}