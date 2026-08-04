# IdealConecta — Portal do Colaborador

Portal de intranet para a Ideal Empregos. Acesso restrito a colaboradores.

## Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel

## Setup rápido

### 1. Criar projeto no Supabase
- Acesse [supabase.com](https://supabase.com) e crie um projeto
- No **SQL Editor**, cole e execute o conteúdo de `supabase/schema.sql`
- Em seguida, execute também `supabase/migration_002_dados_reais.sql` (adiciona salário, CPF e outros campos necessários para holerite e declarações reais)
- Depois, execute `supabase/migration_003_admin_features.sql` (cria o rastreamento de acessos a treinamentos e o bucket de Storage "galeria" para upload real de fotos pelo admin)
- Em **Authentication > Providers**, habilite:
  - **Email** (já vem habilitado)
  - **Google** (configure com Client ID e Secret do Google Cloud Console — veja seção abaixo)

### Cadastrando o salário de um colaborador (necessário para holerite/declarações)
Sem o salário cadastrado, o colaborador não consegue baixar holerite nem comprovante de salário. Por enquanto, cadastre manualmente:
- No Supabase → **Table Editor > colaboradores**
- Edite o registro do colaborador e preencha o campo `salario_base` (ex: `6240.18`)
- Preencha também `cpf` e `data_admissao` se ainda não estiverem preenchidos

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Preencha com a URL e anon key do seu projeto Supabase (Settings > API).

### 3. Instalar e rodar
```bash
npm install
npm run dev
```

### 4. Criar primeiro usuário admin
- Acesse a tela de login e crie uma conta com "Primeiro Acesso"
- No painel do Supabase, vá em **Table Editor > colaboradores**
- Altere o campo `role` do seu usuário para `admin`

### 5. Deploy no Vercel
```bash
# Conectar ao GitHub
git init && git add . && git commit -m "initial commit"
# Criar repo no GitHub e fazer push
git remote add origin https://github.com/SEU-USER/idealconecta.git
git push -u origin main
```
- Importe o repo no [vercel.com](https://vercel.com)
- Adicione as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
- Em **Settings > Domains**, adicione `conecta.idealempregos.com.br`
- Peça para quem gerencia o DNS criar o CNAME apontando para o Vercel

## Módulos
- **Início** — Dashboard com comunicados, stats, notificações
- **Minhas Férias** — Solicitar e acompanhar férias
- **Holerite** — Download de contracheques
- **Meus Dados** — Editar perfil
- **Benefícios** — Lista de benefícios ativos
- **Declarações** — Solicitar declarações e enviar atestados
- **Comunicados** — Feed de comunicados (gestão publica)
- **Galeria de Fotos** — Fotos de eventos (gestão publica)
- **Treinamentos** — Treinamentos disponíveis
- **Reconhecimentos** — Feed de promoções e destaques
- **Descrição de Cargos** — Lista expandível com busca
- **Políticas e Documentos** — Download de documentos
- **Aprovação de Férias** — (somente gestão) Aprovar/rejeitar

## Papéis
- `colaborador` — acesso padrão
- `gerente` — acesso colaborador + módulos de gestão
- `admin` — acesso total + cadastro de colaboradores
