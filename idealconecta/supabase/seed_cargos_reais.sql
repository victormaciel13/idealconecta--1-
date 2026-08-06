-- ============================================================
-- Seed: Descrições de cargo REAIS, estruturadas (Missão, Responsabilidades,
-- Hard/Soft Skills viram competências, Indicadores) — conectado ao PDI
-- Execute no SQL Editor do Supabase, DEPOIS da migration_011
--
-- ATENÇÃO: como você já rodou uma versão anterior desse seed, os comandos
-- abaixo apagam os cargos e competências cadastrados antes, pra evitar
-- duplicar tudo. Se algum colaborador já tiver nível atual preenchido em
-- alguma competência (colaborador_competencias), isso também é limpo —
-- é seguro, porque os dados de nível atual eram baseados nas competências
-- antigas/incompletas mesmo.
-- ============================================================

delete from public.colaborador_competencias;
delete from public.competencias;
delete from public.cargos;

-- Analista de RH JR (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista de RH JR', 'RH', 'Conduzir processos de recrutamento e seleção de baixa e média complexidade, assegurando prazos, qualidade, padronização dos registros e experiência positiva para candidatos e clientes.
Foco: Execução do processo com organização, qualidade e cumprimento de SLA.', 'Conduzir processos seletivos de ponta a ponta para vagas operacionais e administrativas, desde o alinhamento de perfil até o encaminhamento de finalistas
Realizar alinhamento inicial de perfil com clientes e requisitantes, validando requisitos técnicos, comportamentais, volume e prazo
Definir, em conjunto com os Assistentes, os canais de divulgação e o volume de captação necessário por vaga
Conduzir entrevistas individuais e coletivas, aplicando roteiro por competências e registrando evidências no sistema
Avaliar candidatos considerando critérios técnicos, comportamentais e aderência à cultura do cliente
Encaminhar candidatos finalistas, organizar agendas de entrevistas e acompanhar feedbacks
Atualizar e manter o funil de seleção no sistema, garantindo rastreabilidade e conformidade
Monitorar indicadores operacionais (tempo de fechamento, comparecimento, taxa de aprovação)
Apoiar na organização de processos e no cumprimento de SLAs', '% convocação de candidatos
% comparecimento de candidatos
% de cadastros completos no sistema
Taxa de aprovação do cliente
Cumprimento do SLA');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Alinhamento de perfil de vaga', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Uso de sistema de R&S (ATS)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Triagem e avaliação curricular', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Noções de indicadores de recrutamento', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Pacote Office / Google Workspace', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Organização e atenção a detalhes', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Comunicação clara', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Gestão do tempo', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Senso de urgência', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH JR' order by created_at desc limit 1), 'Ética e confidencialidade', 'comportamental', 3);

-- Analista de RH PL (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista de RH PL', 'RH', 'Garantir excelência em processos de média e alta complexidade, com autonomia, priorização e relacionamento com clientes.
Foco: Otimização do funil, qualidade das entregas e apoio técnico ao time.', 'Conduzir processos seletivos de média e alta complexidade, incluindo vagas técnicas, administrativas e de maior criticidade
Realizar alinhamento aprofundado de perfil com clientes, mapeando competências, cenários de contratação e indicadores de sucesso
Definir estratégias de captação, priorização de vagas e gestão de pipeline
Atuar como referência técnica para Assistentes e Analistas I, orientando boas práticas
Conduzir entrevistas estruturadas por competências e dinâmicas de grupo
Analisar indicadores do funil, identificar gargalos e propor ajustes
Acompanhar SLAs, tempo de fechamento, taxa de conversão e qualidade das contratações
Atuar na resolução de desvios operacionais, retrabalhos e não conformidades
Apoiar o cliente com análises e sugestões de melhoria no processo', '% Satisfação do cliente
Qualidade das contratações (feedback 30/60 dias)
% comparecimento de candidatos
Taxa de aprovação do cliente');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Entrevistas estruturadas por competências', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Análise de indicadores de funil', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Estratégias de captação e pipeline', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Gestão de prioridades e volume', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Interface com clientes', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Dinâmicas de grupo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Pensamento analítico', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Negociação e influência', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Tomada de decisão', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Resolução de problemas', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH PL' order by created_at desc limit 1), 'Feedback e orientação', 'comportamental', 3);

-- Analista de RH SR (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista de RH SR', 'RH', 'Atuar de forma estratégica na condução e melhoria contínua dos processos de R&S, garantindo alta performance, inovação e relacionamento com clientes.
Foco: Governança, melhoria contínua e geração de valor ao cliente.', 'Conduzir vagas estratégicas, técnicas e de alta criticidade, com gestão de risco e impacto
Atuar como ponto focal entre agência e clientes, participando de reuniões de alinhamento e revisão de resultados
Mapear gargalos, redesenhar fluxos e propor melhorias contínuas nos processos e ferramentas
Desenvolver, revisar e padronizar roteiros de entrevistas, critérios de avaliação e indicadores
Apoiar a formação do time por meio de treinamentos e acompanhamento on the job
Analisar dados e gerar relatórios gerenciais com insights para tomada de decisão
Apoiar a liderança na definição de metas, indicadores e modelo de operação
Participar de projetos de melhoria, automação e inovação', 'SLA global da operação
Produtividade por vaga
Retenção dos contratados
NPS do cliente
Performance do time');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Ensino médio completo (desejável superior)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Pacote Office avançado', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Análise avançada de dados', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Desenho e melhoria de processos', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Gestão de indicadores', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Metodologias de seleção', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Apresentação de resultados', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Visão sistêmica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Liderança técnica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Comunicação estratégica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Tomada de decisão em cenários complexos', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista de RH SR' order by created_at desc limit 1), 'Influência e desenvolvimento de pessoas', 'comportamental', 3);

-- Assistente de RH I (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente de RH I', 'RH', 'Atuar na execução das rotinas operacionais de recrutamento e seleção, oferecendo suporte ao time na organização dos processos, convocação e atendimento inicial de candidatos, assegurando eficiência e conformidade com os padrões da agência.
Foco: execução, apoio e aprendizado do processo.', 'Divulgar oportunidades nos canais oficiais da agência (plataformas de vagas, redes sociais, parcerias e banco interno), garantindo padronização e alcance do público-alvo
Realizar triagem inicial de currículos, analisando requisitos mínimos, perfil comportamental e aderência à vaga
Enviar links de cadastro e orientações ao candidato, assegurando que todas as informações estejam completas antes do atendimento presencial
Agendar, confirmar e organizar a agenda de candidatos, controlando horários, volumes e prioridades conforme demanda do cliente
Realizar o check-in presencial na agência, validando dados, orientando sobre o processo e garantindo o fluxo correto de atendimento
Apoiar o atendimento e a organização do fluxo de candidatos, direcionando para as etapas corretas (roteirização, provas, entrevistas, etc.)
Atualizar e manter o status dos candidatos no sistema, garantindo rastreabilidade, confiabilidade das informações e controle do funil de seleção', '% convocação de candidatos
% comparecimento de candidatos
% de cadastros completos no sistema
Volume de atendimentos');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Informática básica', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Noções de recrutamento e seleção', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Comunicação', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH I' order by created_at desc limit 1), 'Agilidade/ Dinamismo', 'comportamental', 3);

-- Assistente de RH II (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente de RH II', 'RH', 'Garantir a qualidade e a fluidez do processo de R&S, atuando com autonomia na triagem, organização de agendas, validação de dados e condução do fluxo de candidatos, assegurando o cumprimento dos padrões e prazos.
Foco: Organização e controle', 'Divulgar oportunidades nos canais oficiais e estratégicos da agência, apoiando na definição de onde e como publicar cada vaga para aumentar a taxa de candidatos aderentes
Realizar triagem de currículos com análise mais aprofundada de perfil técnico, comportamental e histórico profissional, priorizando candidatos com maior potencial de aderência
Validar e revisar cadastros recebidos, identificando inconsistências, orientando correções e garantindo a qualidade das informações antes do avanço no processo
Gerenciar e organizar a agenda de candidatos, distribuindo horários, equilibrando volumes e respeitando SLAs definidos com os clientes
Conduzir o check-in presencial, conferindo documentos, validando dados no sistema e direcionando corretamente os candidatos dentro do fluxo da agência
Apoiar a aplicação de provas, etapas presenciais e entrevistas, garantindo organização, cumprimento de prazos e padronização do processo
Monitorar o andamento dos candidatos no sistema, garantindo atualização em tempo real, sinalizando gargalos e apoiando na tomada de decisão
Apoiar a melhoria contínua dos fluxos, sugerindo ajustes para reduzir tempo de espera e retrabalho', '% convocação de candidatos
% comparecimento de candidatos
% de cadastros completos no sistema
Volume de atendimentos');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Ter atuado com sistemas e plataformas de R&S', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Excel básico', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Proatividade', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Gestão de tempo', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Comunicação clara', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH II' order by created_at desc limit 1), 'Foco em resultado', 'comportamental', 3);

-- Assistente de RH III (RH)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente de RH III', 'RH', 'Atuar como referência operacional do processo de recrutamento e seleção, assegurando a padronização, a eficiência e a melhoria contínua do fluxo de atendimento, apoiando o time na tomada de decisão, na organização de grandes volumes e na análise de indicadores, contribuindo diretamente para os resultados da agência.
Foco: Referência técnica, eficiência e melhoria contínua.', 'Planejar e estruturar a divulgação das vagas em alto volume, definindo canais prioritários, ajustando estratégias e acompanhando indicadores de atração
Realizar triagem técnica e comportamental avançada, apoiando os analistas na priorização dos candidatos mais alinhados às vagas e aos clientes
Garantir a integridade e padronização dos cadastros, auditando informações, corrigindo desvios e assegurando conformidade com os processos da agência
Organizar e priorizar agendas complexas, gerenciando picos de demanda, remanejamentos e convocação em massa
Supervisionar o check-in e a roteirização, garantindo que o fluxo seja cumprido, orientando o time e corrigindo desvios em tempo real
Coordenar a execução das etapas presenciais (provas, entrevistas e validações), garantindo ritmo, qualidade e experiência do candidato
Controlar indicadores operacionais (tempo de atendimento, faltas, conversão por etapa), gerando dados para análise e melhoria do processo
Atuar como referência técnica do time, apoiando treinamentos, padronizações e otimização dos fluxos', '% convocação de candidatos
% comparecimento de candidatos
% de cadastros completos no sistema
Volume de atendimentos');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Ter atuado com sistemas e plataformas de R&S', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Excel básico', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Proatividade', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Gestão de tempo', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Comunicação clara', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente de RH III' order by created_at desc limit 1), 'Foco em resultado', 'comportamental', 3);

-- Analista Comercial JR (Comercial)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista Comercial JR', 'Comercial', 'Prospectar e desenvolver novos clientes para a Ideal Empregos, apoiando o time comercial na geração de propostas, acompanhamento de negociações e manutenção do relacionamento com clientes ativos.

Foco: Prospecção | Relacionamento | Apoio comercial | Volume | Aprendizado.', 'Prospectar novos clientes por telefone, e-mail e visitas, identificando oportunidades de negócio
Elaborar propostas comerciais básicas com apoio do time sênior
Atualizar o CRM com informações de leads, negociações e follow-ups
Acompanhar o relacionamento com clientes ativos de menor complexidade
Apoiar a área comercial na organização de reuniões, materiais e apresentações
Monitorar indicadores simples de prospecção e conversão
Atender dúvidas iniciais de clientes, direcionando para o time responsável quando necessário', 'Número de leads prospectados
Taxa de conversão de propostas
Tempo de resposta ao cliente
Qualidade do CRM atualizado
Satisfação do cliente');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Ensino médio completo (cursando ou concluído em Administração, Marketing ou áreas afins é um diferencial)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Noções de vendas e prospecção', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Uso de CRM e ferramentas de e-mail', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Pacote Office / Google Workspace', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Comunicação escrita para propostas simples', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Comunicação e persuasão', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Organização e gestão do tempo', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Proatividade', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Resiliência a não', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Comercial JR' order by created_at desc limit 1), 'Capacidade de aprendizado', 'comportamental', 3);

-- Analista Depto. Pessoal JR (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista Depto. Pessoal JR', 'Depto Pessoal', 'Executar rotinas de DP com precisão e dentro do prazo, garantindo base correta para o fechamento da folha e cumprimento das obrigações trabalhistas.
Foco: Execução | Conferência | Apoio | Volume | Prazo.', 'Apoio no fechamento da folha de pagamento
Conferência de ponto e tratativa básica de inconsistências
Cálculo de rescisões simples
Apoio na geração de encargos (FGTS, INSS)
Emissão de documentos (holerites, DS, etc.)
Apoio no envio de informações ao cliente
Atendimento básico a colaboradores', 'Erro de folha (%)
Multas/penalidades
SLA de fechamento
Nº de retrabalhos
Satisfação do cliente');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'CLT (básico/intermediário)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Noções de folha de pagamento', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Excel intermediário', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Sistemas de folha / ponto', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Ensino médio', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Atenção a detalhes', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Senso de urgência', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal JR' order by created_at desc limit 1), 'Capacidade de aprendizado', 'comportamental', 3);

-- Analista Depto. Pessoal PL (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista Depto. Pessoal PL', 'Depto Pessoal', 'Executar rotinas de DP com precisão e dentro do prazo, garantindo base correta para o fechamento da folha e cumprimento das obrigações trabalhistas.
Foco: Execução | Conferência | Apoio | Volume | Prazo.', 'Apoio no fechamento da folha de pagamento
Conferência de ponto e tratativa básica de inconsistências
Cálculo de rescisões simples
Apoio na geração de encargos (FGTS, INSS)
Emissão de documentos (holerites, DS, etc.)
Apoio no envio de informações ao cliente
Atendimento básico a colaboradores', 'Erro de folha (%)
Multas/penalidades
SLA de fechamento
Nº de retrabalhos
Satisfação do cliente');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Ensino médio completo', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'CLT (básico/intermediário)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Noções de folha de pagamento', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Excel intermediário', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Sistemas de folha / ponto', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Ensino médio', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Atenção a detalhes', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Senso de urgência', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal PL' order by created_at desc limit 1), 'Capacidade de aprendizado', 'comportamental', 3);

-- Analista Depto. Pessoal SR (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Analista Depto. Pessoal SR', 'Depto Pessoal', 'Assegurar a excelência dos processos de DP, mitigando riscos trabalhistas, garantindo conformidade e atuando como referência técnica da área..
Foco: Estratégia | Compliance | Risco | Liderança técnica | Melhoria contínua.', 'Fechamento, Revisão e validação final da folha
Cálculo de rescisões complexas
Análise de riscos trabalhistas
Interface estratégica com clientes
Gestão de prazos críticos e auditorias
Revisão de encargos e obrigações legais
Suporte técnico ao time (JR/PL/assistentes)
Melhoria de processos e indicadores
Apoio em fiscalizações e auditorias', 'Nº de erros críticos (multas / riscos)
SLA de fechamento
Redução de retrabalho
Eficiência do time
Satisfação do cliente');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Ensino técnico ou superior', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'CLT avançado', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Legislação trabalhista e previdenciária', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Encargos e obrigações acessórias avançadas', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Excel avançado', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Sistemas de folha (nível especialista)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Liderança técnica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Tomada de decisão', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Visão sistêmica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Comunicação estratégica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Analista Depto. Pessoal SR' order by created_at desc limit 1), 'Resolução de problemas', 'comportamental', 3);

-- Assistente Depto. Pessoal I (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente Depto. Pessoal I', 'Depto Pessoal', 'Executar admissões com precisão e agilidade, garantindo contratos corretos e início de vínculo sem riscos trabalhistas.
Foco: Admissão | Contratos | Volume | Prazo | Execução', 'Emissão de contratos de trabalho
Cadastro em sistema (eSocial / folha)
Conferência final de documentação
Agendamento de exames admissionais
Interface com seleção e cliente
Controle de admissões por data
Apoio em benefícios (inclusão inicial)', 'Tempo médio de admissão
% admissões no prazo
Erro em contratos');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Ensino médio', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'CLT (básico – admissão)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'eSocial (básico)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Sistemas de folha', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Excel básico', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Agilidade', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Comunicação clara', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal I' order by created_at desc limit 1), 'Proatividade', 'comportamental', 3);

-- Assistente Depto. Pessoal II (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente Depto. Pessoal II', 'Depto Pessoal', 'Garantir a correta gestão de benefícios e movimentações contratuais, assegurando precisão financeira e satisfação do colaborador.
Foco: Benefícios | Controle | Conferência | Relacionamento | Precisão', 'Emissão de contratos
Cálculo e lançamento de benefícios (VT, VR, VA, etc.)
Inclusão/exclusão em operadoras
Controle de custos e rateios
Apoio em movimentações (transferências, alterações salariais)
Atendimento ao colaborador
Interface com fornecedores
Conferência de faturamento de benefícios', 'Erro em benefícios (% desconto incorreto)
SLA de inclusão/exclusão
Custo por colaborador
Nº de chamados resolvidos');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Ensino médio', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Excel intermediário', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Cálculo de benefícios', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Noções de folha', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Sistemas de benefícios', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Comunicação', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Resolução de problemas', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal II' order by created_at desc limit 1), 'Atenção a detalhes', 'comportamental', 3);

-- Assistente Depto. Pessoal III (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Assistente Depto. Pessoal III', 'Depto Pessoal', 'Apoiar os processos críticos de folha e ponto, garantindo dados confiáveis para fechamento sem inconsistências.
Foco: Ponto | Conferência | Pré-folha | Base de dados | Consistência', 'Conferência de ponto eletrônico
Tratativa de divergências (faltas, horas extras)
Apoio no fechamento da folha
Controle de banco de horas
Apoio em férias e afastamentos
Geração de relatórios para analistas
Atendimento a gestores', 'Nº de inconsistências no ponto
Tempo de tratativa de divergências
Erros enviados para folha
SLA de fechamento pré-folha');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Ensino médio', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Excel intermediário/avançado', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Sistema de ponto', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Noções de folha de pagamento', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'CLT intermediário', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Análise crítica', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Organização', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Comunicação com operação', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Assistente Depto. Pessoal III' order by created_at desc limit 1), 'Responsabilidade', 'comportamental', 3);

-- Auxiliar de DP. Pessoal (Depto Pessoal)
insert into public.cargos (titulo, departamento, descricao, responsabilidades, indicadores) values ('Auxiliar de DP. Pessoal', 'Depto Pessoal', 'Garantir que toda a documentação trabalhista dos colaboradores esteja completa, organizada e em conformidade, assegurando fluidez nos processos de admissão e contratos.
Foco: Organização | Agilidade | Conferência documental | Compliance | Volume', 'Conferência de documentos admissionais
Organização e digitalização de arquivos (físico e sistema)
Apoio na emissão de contratos (pré-preenchimento)
Controle de pendências documentais
Follow-up com candidatos e seleção
Atualização cadastral em sistema
Apoio no envio de documentos para clientes
Arquivamento conforme LGPD e auditorias', '% de documentos completos na admissão
Tempo de conclusão de cadastro
Nº de retrabalho por erro documental
SLA de envio de documentação
Pendências por colaborador');
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Pacote Office (básico/intermediário)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Sistemas de RH / ATS', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Noções de CLT (documentação obrigatória)', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Organização de arquivos digitais', 'tecnica', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Organização extrema', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Atenção a detalhes', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Senso de urgência', 'comportamental', 3);
insert into public.competencias (cargo_id, nome, tipo, nivel_esperado) values ((select id from public.cargos where titulo = 'Auxiliar de DP. Pessoal' order by created_at desc limit 1), 'Disciplina operacional', 'comportamental', 3);